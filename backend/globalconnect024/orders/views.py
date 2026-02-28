# orders/views.py
import requests
from datetime import datetime
from base64 import b64encode
from decimal import Decimal

from services.views import get_nearest_transporters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.db import transaction
from django.utils import timezone

from products.models import Product
from users.models import CustomUser
from orders.models import Order
from orders.models import PaymentSplit, Referral, VendorPayout
from rest_framework.permissions import AllowAny
from django.utils.decorators import method_decorator
from django.http import JsonResponse




def get_mpesa_token():
    """Get M-Pesa OAuth token"""
    url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    r = requests.get(url, auth=(settings.MPESA_CONSUMER_KEY, settings.MPESA_CONSUMER_SECRET))
    r.raise_for_status()
    return r.json().get("access_token")


def initiate_stk_push(phone, amount):
    """Initiate M-Pesa STK Push (Customer pays to company)"""
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    password_str = settings.MPESA_SHORTCODE + settings.MPESA_PASSKEY + timestamp
    password = b64encode(password_str.encode()).decode()

    access_token = get_mpesa_token()

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    payload = {
        "BusinessShortCode": settings.MPESA_SHORTCODE,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": int(amount),  # Ensure it's an integer
        "PartyA": phone,
        "PartyB": settings.MPESA_SHORTCODE,
        "Phone": phone,
        "CallBackURL": settings.MPESA_CALLBACK_URL,
        "AccountReference": "GlobalConnect",
        "TransactionDesc": "Product purchase"
    }

    response = requests.post(
        "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
        headers=headers,
        json=payload
    )

    return response.json()


def send_b2c_payment(phone, amount, recipient_type, order_id):
    """Send B2C payment to vendor or affiliate"""
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    access_token = get_mpesa_token()

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    # Format phone number (remove + and ensure it starts with 254)
    phone = phone.replace('+', '').replace(' ', '')
    if phone.startswith('0'):
        phone = '254' + phone[1:]

    payload = {
        "InitiatorName": settings.MPESA_INITIATOR_NAME,
        "SecurityCredential": settings.MPESA_SECURITY_CREDENTIAL,
        "CommandID": "BusinessPayment",
        "Amount": int(amount),
        "PartyA": settings.MPESA_SHORTCODE,
        "PartyB": phone,
        "Remarks": f"{recipient_type} payment for Order #{order_id}",
        "QueueTimeOutURL": f"{settings.BACKEND_URL}/api/orders/mpesa-b2c-timeout/",
        "ResultURL": f"{settings.BACKEND_URL}/api/orders/mpesa-b2c-result/",
        "Occasion": f"ORD{order_id}{recipient_type[:3].upper()}"
    }

    response = requests.post(
        "https://sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest",
        headers=headers,
        json=payload
    )

    return response.json()


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def buy_now(request):
    """Get available transporters for product delivery"""
    product = Product.objects.get(id=request.data['product_id'])
    vendor = product.vendor

    transporters = get_nearest_transporters(vendor)

    return Response({
        "transporters": [
            {
                "id": t.id,
                "name": t.username,
                "price_per_km": t.transporterprofile.price_per_km,
                "rating": t.rating
            }
            for t in transporters
        ]
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def checkout(request):
    """
    Initiate checkout with automatic payment splitting
    Customer pays full amount to company via M-Pesa STK Push
    """
    product_id = request.data.get("product")
    quantity = request.data.get("quantity", 1)
    phone = request.data.get("phone")
    affiliate_code = request.data.get("affiliate_code")  # Affiliate code instead of ID

    if not all([product_id, phone]):
        return Response({"error": "Missing required fields."}, status=400)

    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response({"error": "Product not found."}, status=404)

    buyer = request.user
    vendor = product.vendor
    
    # Get affiliate if code provided
    affiliate = None
    if affiliate_code:
        try:
            affiliate = CustomUser.objects.get(
                vendor_code=affiliate_code,
                role='affiliate'
            )
        except CustomUser.DoesNotExist:
            pass

    # Calculate total amount
    amount = product.price * quantity

    # Create order with payment splits
    with transaction.atomic():
        order = Order.objects.create(
            product=product,
            buyer=buyer,
            vendor=vendor,
            affiliate=affiliate,
            quantity=quantity,
            amount=amount,
            status="pending"
        )

        # Calculate splits (5% company, 90-95% vendor, 5% affiliate if present)
        splits = order.calculate_splits()

        # Create payment split records
        PaymentSplit.objects.create(
            order=order,
            recipient_type='company',
            recipient=None,
            amount=order.company_amount,
            status='pending'
        )

        PaymentSplit.objects.create(
            order=order,
            recipient_type='vendor',
            recipient=vendor,
            recipient_phone=vendor.phone,
            amount=order.vendor_amount,
            status='pending'
        )

        if affiliate:
            PaymentSplit.objects.create(
                order=order,
                recipient_type='affiliate',
                recipient=affiliate,
                recipient_phone=affiliate.phone,
                amount=order.affiliate_amount,
                status='pending'
            )

            # Create referral record
            Referral.objects.create(
                affiliate=affiliate,
                order=order,
                product=product,
                commission_earned=order.affiliate_amount,
                commission_rate=Decimal('5.00'),
                is_approved=True
            )

    # Initiate STK Push (customer pays full amount to company)
    try:
        stk_response = initiate_stk_push(phone, amount)

        if stk_response.get("ResponseCode") != "0":
            order.status = "failed"
            order.save()
            return Response({
                "error": "STK Push failed.",
                "details": stk_response
            }, status=400)

        # Save M-Pesa STK identifiers
        order.checkout_request_id = stk_response.get("CheckoutRequestID")
        order.merchant_request_id = stk_response.get("MerchantRequestID")
        order.save()

        return Response({
            "message": stk_response.get("CustomerMessage", "STK push sent. Please enter your PIN."),
            "order_id": order.id,
            "merchant_request_id": stk_response.get("MerchantRequestID"),
            "checkout_request_id": stk_response.get("CheckoutRequestID"),
            "payment_breakdown": {
                "total": float(amount),
                "company_fee": float(order.company_amount),
                "vendor_receives": float(order.vendor_amount),
                "affiliate_commission": float(order.affiliate_amount) if affiliate else 0
            }
        }, status=200)

    except Exception as e:
        order.status = "failed"
        order.save()
        return Response({"error": str(e)}, status=500)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def mpesa_callback(request):
    """
    Handle M-Pesa STK Push callback (customer payment to company)
    When payment succeeds, automatically send splits to vendor and affiliate
    """
    data = request.data

    try:
        body = data.get("Body", {})
        stk_callback = body.get("stkCallback", {})

        checkout_request_id = stk_callback.get("CheckoutRequestID")
        result_code = stk_callback.get("ResultCode")
        result_desc = stk_callback.get("ResultDesc")

        # Find the order
        order = Order.objects.filter(checkout_request_id=checkout_request_id).first()

        if not order:
            return JsonResponse({"error": "Order not found"}, status=404)

        if result_code == 0:
            # Payment successful - Company received money
            with transaction.atomic():
                order.status = "processing"
                order.company_paid = True
                order.save()

                # Mark company split as completed
                company_split = order.splits.filter(recipient_type='company').first()
                if company_split:
                    company_split.status = 'completed'
                    company_split.completed_at = timezone.now()
                    company_split.save()

                # Initiate B2C payments to vendor and affiliate
                process_payment_splits(order)

        else:
            # Payment failed
            order.status = "failed"
            order.save()

            # Mark all splits as failed
            order.splits.all().update(status='failed')

        return JsonResponse({
            "ResultCode": 0,
            "ResultDesc": "Callback processed successfully"
        }, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


def process_payment_splits(order):
    """Send B2C payments to vendor and affiliate"""
    pending_splits = order.splits.filter(status='pending').exclude(recipient_type='company')

    for split in pending_splits:
        if split.recipient_type == 'vendor':
            # Send to vendor
            split.status = 'processing'
            split.processed_at = timezone.now()
            split.save()

            try:
                b2c_response = send_b2c_payment(
                    phone=split.recipient_phone,
                    amount=split.amount,
                    recipient_type='vendor',
                    order_id=order.id
                )

                if b2c_response.get('ResponseCode') == '0':
                    split.mpesa_conversation_id = b2c_response.get('ConversationID')
                    split.mpesa_originator_conversation_id = b2c_response.get('OriginatorConversationID')
                    split.save()
                else:
                    split.status = 'failed'
                    split.mpesa_response_description = b2c_response.get('ResponseDescription')
                    split.save()

            except Exception as e:
                split.status = 'failed'
                split.mpesa_response_description = str(e)
                split.save()

        elif split.recipient_type == 'affiliate':
            # Send to affiliate
            split.status = 'processing'
            split.processed_at = timezone.now()
            split.save()

            try:
                b2c_response = send_b2c_payment(
                    phone=split.recipient_phone,
                    amount=split.amount,
                    recipient_type='affiliate',
                    order_id=order.id
                )

                if b2c_response.get('ResponseCode') == '0':
                    split.mpesa_conversation_id = b2c_response.get('ConversationID')
                    split.mpesa_originator_conversation_id = b2c_response.get('OriginatorConversationID')
                    split.save()
                else:
                    split.status = 'failed'
                    split.mpesa_response_description = b2c_response.get('ResponseDescription')
                    split.save()

            except Exception as e:
                split.status = 'failed'
                split.mpesa_response_description = str(e)
                split.save()


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def mpesa_b2c_result(request):
    """Handle M-Pesa B2C result callback (vendor/affiliate payment confirmation)"""
    data = request.data

    try:
        result = data.get('Result', {})
        result_code = result.get('ResultCode')
        conversation_id = result.get('ConversationID')
        transaction_id = result.get('TransactionID')
        result_desc = result.get('ResultDesc')

        # Find the payment split
        split = PaymentSplit.objects.filter(mpesa_conversation_id=conversation_id).first()

        if not split:
            return JsonResponse({"ResultCode": 0, "ResultDesc": "Accepted"}, status=200)

        if result_code == 0:
            # Payment successful
            split.status = 'completed'
            split.completed_at = timezone.now()
            split.mpesa_transaction_id = transaction_id
            split.mpesa_response_code = str(result_code)
            split.mpesa_response_description = result_desc
            split.save()

            # Update order payment flags
            order = split.order
            if split.recipient_type == 'vendor':
                order.vendor_paid = True
                
                # Create vendor payout record
                VendorPayout.objects.create(
                    vendor=split.recipient,
                    order=order,
                    amount=split.amount,
                    payment_split=split,
                    is_paid=True,
                    paid_at=timezone.now()
                )

            elif split.recipient_type == 'affiliate':
                order.affiliate_paid = True
                
                # Update referral as paid
                referral = order.referral
                referral.mark_paid(split)

            order.save()

            # Check if order is complete
            order.mark_completed()

        else:
            # Payment failed
            split.status = 'failed'
            split.mpesa_response_code = str(result_code)
            split.mpesa_response_description = result_desc
            split.save()

            # Retry if under max retries
            if split.retry_count < split.max_retries:
                split.retry_count += 1
                split.status = 'pending'
                split.save()
                # TODO: Implement retry logic (e.g., Celery task)

        return JsonResponse({"ResultCode": 0, "ResultDesc": "Accepted"}, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def mpesa_b2c_timeout(request):
    """Handle M-Pesa B2C timeout"""
    return JsonResponse({"ResultCode": 0, "ResultDesc": "Timeout received"}, status=200)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def check_payment_status(request, order_id):
    """Check order payment status"""
    try:
        order = Order.objects.get(id=order_id)
        
        # Get split statuses
        splits_status = []
        for split in order.splits.all():
            splits_status.append({
                "recipient_type": split.recipient_type,
                "amount": float(split.amount),
                "status": split.status,
                "recipient": split.recipient.email if split.recipient else "Company"
            })

        return Response({
            "order_id": order.id,
            "status": order.status,
            "amount": float(order.amount),
            "company_paid": order.company_paid,
            "vendor_paid": order.vendor_paid,
            "affiliate_paid": order.affiliate_paid,
            "splits": splits_status,
            "created_at": order.created_at,
            "completed_at": order.completed_at
        })
    except Order.DoesNotExist:
        return Response({"error": "Order not found."}, status=404)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_orders(request):
    """Get user's orders based on role"""
    user = request.user
    
    if user.role == 'vendor':
        orders = Order.objects.filter(vendor=user)
    elif user.role == 'affiliate':
        orders = Order.objects.filter(affiliate=user)
    else:
        orders = Order.objects.filter(buyer=user)
    
    orders_data = []
    for order in orders:
        orders_data.append({
            "id": order.id,
            "product": order.product.name,
            "amount": float(order.amount),
            "status": order.status,
            "created_at": order.created_at,
            "my_earnings": float(
                order.vendor_amount if user.role == 'vendor' 
                else order.affiliate_amount if user.role == 'affiliate'
                else 0
            ),
            "paid": (
                order.vendor_paid if user.role == 'vendor'
                else order.affiliate_paid if user.role == 'affiliate'
                else order.company_paid
            )
        })
    
    return Response(orders_data)