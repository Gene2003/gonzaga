# orders/views.py
import requests
from datetime import datetime
from base64 import b64encode
from decimal import Decimal
import json
import hashlib
import hmac

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

PAYSTACK_SECRET_KEY = settings.PAYSTACK_SECRET_KEY




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
@permission_classes([AllowAny])
def checkout(request):
    """
    Initiate Paystack checkout with automatic split payment.
    - with affiliate: 5% company, 90% vendor, 5% affiliate
    - without affiliate: 5% company, 95% vendor
    """
    product_id = request.data.get("product")
    quantity = int(request.data.get("quantity", 1))
    affiliate_code = request.data.get("affiliate_code")
    guest_name = request.data.get("guest_name")
    guest_email = request.data.get("guest_email")
    guest_phone = request.data.get("guest_phone")
    guest_address = request.data.get("guest_address")

    if not product_id:
        return Response({"error": "Product is required."}, status=400)

    try:
        product = Product.objects.select_related('vendor').get(id=product_id)
    except Product.DoesNotExist:
        return Response({"error": "Product not found."}, status=404)

    vendor = product.vendor

    # ✅ FIX 1: Use correct price field based on vendor type
    vendor_type = product.vendor.vendor_type
    if vendor_type == 'farmer':
        unit_price = product.farmer_price
    elif vendor_type == 'wholesaler':
        unit_price = product.wholesaler_price
    else:  # retailer → consumers
        unit_price = product.retailer_price

    if not unit_price:
        return Response({"error": "Product price is not set."}, status=400)

    # ✅ FIX 2: Resolve buyer and email early, once
    buyer = request.user if request.user.is_authenticated else None
    email = buyer.email if buyer else guest_email
    if not email:
        return Response({"error": "Email is required for guest checkout."}, status=400)

    # ✅ FIX 3: Check vendor subaccount before doing anything else
    if not vendor.paystack_subaccount_code:
        return Response({
            "error": "Vendor does not have a Paystack subaccount set up."
        }, status=400)

    # ✅ FIX 4: Resolve affiliate once, cleanly
    affiliate = None
    affiliate_subaccount = None
    if affiliate_code:
        try:
            affiliate = CustomUser.objects.get(vendor_code=affiliate_code, role='user')
            affiliate_subaccount = affiliate.paystack_subaccount_code
        except CustomUser.DoesNotExist:
            pass

    # ✅ FIX 5: Build subaccounts outside nested if blocks
    subaccounts = []
    subaccounts.append({
        "subaccount": vendor.paystack_subaccount_code,
        "share": 90 if affiliate else 95
    })
    if affiliate_subaccount:
        subaccounts.append({
            "subaccount": affiliate_subaccount,
            "share": 5
        })

    # Calculate total amount
    amount = unit_price * quantity
    amount_kobo = int(amount * 100)  # Paystack uses smallest currency unit

    # Create order with payment splits
    with transaction.atomic():
        order = Order.objects.create(
            product=product,
            buyer=buyer,
            vendor=vendor,
            affiliate=affiliate,
            quantity=quantity,
            amount=amount,
            status="pending",
            guest_name=guest_name,
            guest_email=guest_email,
            guest_phone=guest_phone,
            guest_address=guest_address,
        )

        order.calculate_splits()

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
            amount=order.vendor_amount,
            status='pending'
        )
        if affiliate:
            PaymentSplit.objects.create(
                order=order,
                recipient_type='affiliate',
                recipient=affiliate,
                amount=order.affiliate_amount,
                status='pending'
            )
            Referral.objects.create(
                affiliate=affiliate,
                order=order,
                product=product,
                commission_earned=order.affiliate_amount,
                commission_rate=Decimal('5.00'),
                is_approved=True
            )

    # Build Paystack payload
    paystack_data = {
        "email": email,  # ✅ FIX 6: use resolved email, not buyer.email
        "amount": amount_kobo,
        "currency": "KES",
        "callback_url": f"{settings.FRONTEND_URL}/orders/payment-success?order_id={order.id}",
        "metadata": {
            "order_id": order.id,
            "product_id": product.id,
            "buyer_id": buyer.id if buyer else None,
            "affiliate_id": affiliate.id if affiliate else None
        },
        "split": {
            "type": "percentage",
            "bearer_type": "account",
            "subaccounts": subaccounts
        }
    }

    headers = {
        "Authorization": f"Bearer {PAYSTACK_SECRET_KEY}",
        "Content-Type": "application/json"
    }

    response = requests.post(
        "https://api.paystack.co/transaction/initialize",
        headers=headers,
        json=paystack_data
    )

    res_data = response.json()

    if not res_data.get('status'):
        order.status = 'failed'
        order.save()
        return Response({
            "error": "Failed to initialize payment.",
            "details": res_data.get('message', 'Unknown error')
        }, status=500)

    order.payment_reference = res_data['data']['reference']
    order.save()

    return Response({
        "payment_url": res_data['data']['authorization_url'],
        "reference": res_data['data']['reference'],
        "order_id": order.id,
        "payment_breakdown": {
            "total": float(amount),
            "company_fee": float(order.company_amount),
            "vendor_receives": float(order.vendor_amount),
            "affiliate_commission": float(order.affiliate_amount) if affiliate else 0
        }
    }, status=200)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def paystack_order_webhook(request):
    """
    Paystack calls this after successful payment.
    Marks order and all splits as completed.
    Paystack already sent the money to vendor/affiliate subaccounts automatically.
    """
    paystack_signature = request.headers.get('X-Paystack-Signature')
    payload = request.body

    #Verify signature
    expected_signature = hmac.new(
        PAYSTACK_SECRET_KEY.encode('utf-8'),
        payload, 
        hashlib.sha512
    ).hexdigest()

    if paystack_signature != expected_signature:
        return JsonResponse({"error": "Invalid signature"}, status=400)
    
    event = json.loads(payload)

    if event['event'] == 'charge.success':
        metadata = event['data'].get('metadata', {})
        order_id = metadata.get('order_id')
        affiliate_id = metadata.get('affiliate_id')
        paystack_reference = event['data'].get('reference')

        try:
            order = Order.objects.get(id=order_id)

            with transaction.atomic():
                order.status = 'completed'
                order.company_paid = True
                order.vendor_paid = True
                order.affiliate_paid = True if affiliate_id else False
                order.completed_at = timezone.now()
                order.payment_reference = paystack_reference
                order.save()
                order.splits.all().update(
                    status='completed',
                    completed_at=timezone.now()
                )

                # Mark referral as paid
                if affiliate_id:
                    try:
                        referral = Referral.objects.get(order=order)
                        affiliate_split = order.splits.filter(
                            recipient_type='affiliate'
                        ).first()
                        referral.mark_paid(affiliate_split)
                    except Referral.DoesNotExist:
                        pass

                    # Create vendor payout record
            vendor_split = order.splits.filter(recipient_type='vendor').first()
            if vendor_split:
                        VendorPayout.objects.create(
                            vendor=order.vendor,
                            order=order,
                            amount=order.vendor_amount,
                            payment_split=vendor_split,
                            is_paid=True,
                            paid_at=timezone.now()
                        )
        except Order.DoesNotExist:
            pass

    return JsonResponse({"status": "ok"}, status=200)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def check_payment_status(request, order_id):
    """Check order payment status"""
    try:
        order = Order.objects.get(id=order_id, buyer=request.user)
        
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
            "payment_url": None,
            "my_earnings": float(
                order.vendor_amount if user.role == 'vendor' 
                else order.affiliate_amount if user.role == 'user'
                else 0
            ),
            "paid": (
                order.vendor_paid if user.role == 'vendor'
                else order.affiliate_paid if user.role == 'user'
                else order.company_paid
            )
        })
    
    return Response(orders_data)