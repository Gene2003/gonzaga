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
from django.core.mail import send_mail

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

    # Resolve affiliate
    affiliate = None
    affiliate_subaccount = None
    if affiliate_code:
        try:
            affiliate = CustomUser.objects.get(username=affiliate_code, role='user')
            affiliate_subaccount = affiliate.paystack_subaccount_code
            print(f"[CHECKOUT] Affiliate found: {affiliate} | subaccount={affiliate_subaccount!r}")
            if not affiliate_subaccount:
                print(f"[CHECKOUT] WARNING: Affiliate {affiliate} has no Paystack subaccount — they won't appear in split")
        except CustomUser.DoesNotExist:
            print(f"[CHECKOUT] WARNING: affiliate_code={affiliate_code!r} not found (no user with that vendor_code and role='user')")
    else:
        print(f"[CHECKOUT] No affiliate_code received in request")

    # Build Paystack subaccounts list
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
    print(f"[CHECKOUT] Paystack subaccounts: {subaccounts}")

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
    Sends confirmation emails to buyer, vendor, and affiliate.
    """
    paystack_signature = request.headers.get('X-Paystack-Signature')
    payload = request.body

    # Verify Paystack signature
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
            order = Order.objects.select_related(
                'vendor', 'affiliate', 'buyer', 'product'
            ).get(id=order_id)

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

            # Create vendor payout record — wrapped so failures don't block emails
            try:
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
            except Exception:
                pass

            # Send vendor confirmation email
            vendor_email = order.vendor.email if order.vendor else None
            print(f"[WEBHOOK] Order #{order.id} — vendor={order.vendor}, vendor_email={vendor_email!r}")
            if vendor_email:
                try:
                    send_mail(
                        subject=f'Payment Received - Order #{order.id}',
                        message=f"""Hi {order.vendor.get_full_name()},

You have received a payment on 024Global!

Order Details
Order ID    : #{order.id}
Product     : {order.product.name}
Quantity    : {order.quantity}
Your Amount : KES {order.vendor_amount}
Customer    : {order.guest_name or (order.buyer.get_full_name() if order.buyer else 'N/A')}

Your payment will be settled to your account within 1-3 business days.

Thank you for selling on 024Global!
024Global Team
www.024global.com""",
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[vendor_email],
                        fail_silently=False,
                    )
                    print(f"[WEBHOOK] Vendor email sent to {vendor_email}")
                except Exception as e:
                    print(f"[WEBHOOK] Vendor email FAILED: {e}")
            else:
                print(f"[WEBHOOK] Skipping vendor email — vendor has no email address set")

            # Send affiliate commission email
            affiliate_email = order.affiliate.email if order.affiliate else None
            print(f"[WEBHOOK] Order #{order.id} — affiliate={order.affiliate}, affiliate_email={affiliate_email!r}")
            if affiliate_email:
                try:
                    send_mail(
                        subject=f'Commission Earned - Order #{order.id}',
                        message=f"""Hi {order.affiliate.get_full_name()},

Great news! You have earned a commission on 024Global!

Commission Details
Order ID    : #{order.id}
Product     : {order.product.name}
Sale Amount : KES {order.amount}
Commission  : KES {order.affiliate_amount} (5%)

Your commission will be settled to your account within 1-3 business days.

Keep sharing your referral link to earn more!
024Global Team
www.024global.com""",
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[affiliate_email],
                        fail_silently=False,
                    )
                    print(f"[WEBHOOK] Affiliate email sent to {affiliate_email}")
                except Exception as e:
                    print(f"[WEBHOOK] Affiliate email FAILED: {e}")

            # Send buyer confirmation email
            # Use Paystack's customer email as the primary source — it's the exact email
            # the buyer used during the transaction, regardless of guest/logged-in status.
            paystack_customer_email = event['data'].get('customer', {}).get('email')
            buyer_email = paystack_customer_email or order.guest_email or (order.buyer.email if order.buyer else None)
            buyer_name = order.guest_name or (order.buyer.get_full_name() if order.buyer else 'Customer')
            print(f"[WEBHOOK] Order #{order.id} — buyer_email={buyer_email!r}")
            if buyer_email:
                try:
                    send_mail(
                        subject=f'Payment Successful - Order #{order.id}',
                        message=f"""Hi {buyer_name},

Your order has been confirmed!

Order Summary
Order ID    : #{order.id}
Product     : {order.product.name}
Quantity    : {order.quantity}
Total Paid  : KES {order.amount}
Delivery To : {order.guest_address or 'N/A'}

Your order is being processed and will be delivered to your address soon.

For any questions, contact us at:
024globalconnect@gmail.com

Thank you for shopping on 024Global!
024Global Team
www.024global.com""",
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[buyer_email],
                        fail_silently=False,
                    )
                    print(f"[WEBHOOK] Buyer email sent to {buyer_email}")
                except Exception as e:
                    print(f"[WEBHOOK] Buyer email FAILED: {e}")

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
