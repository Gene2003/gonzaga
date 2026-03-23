# orders/views.py
import requests
from datetime import datetime
from base64 import b64encode
from decimal import Decimal
import json
import hashlib
import hmac
import threading

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


def send_email_async(subject, message, recipient):
    """
    Send email via SendGrid HTTP API in a background thread.
    Uses HTTPS (port 443) — works even when Render blocks outbound SMTP.
    """
    def _send():
        api_key = getattr(settings, 'SENDGRID_API_KEY', '')
        if not api_key:
            print(f"[EMAIL] SENDGRID_API_KEY not set — cannot send '{subject}' to {recipient}")
            return

        # Parse "Name <email>" format if present
        from_raw = settings.DEFAULT_FROM_EMAIL or ''
        if '<' in from_raw:
            from_name = from_raw.split('<')[0].strip()
            from_addr = from_raw.split('<')[1].rstrip('>')
            from_field = {"email": from_addr, "name": from_name}
        else:
            from_field = {"email": from_raw}

        payload = {
            "personalizations": [{"to": [{"email": recipient}]}],
            "from": from_field,
            "subject": subject,
            "content": [{"type": "text/plain", "value": message}],
        }

        try:
            response = requests.post(
                "https://api.sendgrid.com/v3/mail/send",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json=payload,
                timeout=15,
            )
            if response.status_code == 202:
                print(f"[EMAIL] Delivered '{subject}' to {recipient}")
            else:
                print(f"[EMAIL] SendGrid error {response.status_code} for '{subject}' to {recipient}: {response.text}")
        except Exception as e:
            print(f"[EMAIL] SendGrid request failed for '{subject}' to {recipient}: {e}")

    threading.Thread(target=_send, daemon=True).start()


def send_sms_async(message, recipients):
    """
    Send SMS via Africa's Talking HTTP API in a background thread.
    recipients: list of phone numbers in international format e.g. ['+254712345678']
    """
    def _send():
        api_key = getattr(settings, 'AT_API_KEY', '')
        username = getattr(settings, 'AT_USERNAME', 'sandbox')
        if not api_key:
            print(f"[SMS] AT_API_KEY not set — cannot send SMS")
            return

        # Format phone numbers to international format (+254...)
        formatted = []
        for phone in recipients:
            if not phone:
                continue
            p = str(phone).strip().replace(' ', '').replace('-', '')
            if p.startswith('0'):
                p = '+254' + p[1:]
            elif p.startswith('254') and not p.startswith('+'):
                p = '+' + p
            elif not p.startswith('+'):
                p = '+254' + p
            formatted.append(p)

        if not formatted:
            return

        try:
            response = requests.post(
                'https://api.africastalking.com/version1/messaging',
                headers={
                    'apiKey': api_key,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json',
                },
                data={
                    'username': username,
                    'to': ','.join(formatted),
                    'message': message,
                    'from': '024Global',
                },
                timeout=15,
            )
            result = response.json()
            recipients_info = result.get('SMSMessageData', {}).get('Recipients', [])
            for r in recipients_info:
                print(f"[SMS] {r.get('status')} to {r.get('number')}: {r.get('statusCode')}")
        except Exception as e:
            print(f"[SMS] Africa's Talking request failed: {e}")

    threading.Thread(target=_send, daemon=True).start()


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

    # Use same price priority as frontend: retailer → wholesaler → farmer
    unit_price = (
        product.retailer_price if product.retailer_price and Decimal(str(product.retailer_price)) > 0
        else product.wholesaler_price if product.wholesaler_price and Decimal(str(product.wholesaler_price)) > 0
        else product.farmer_price if product.farmer_price and Decimal(str(product.farmer_price)) > 0
        else None
    )

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

                # Deduct stock from product — use .update() to bypass full_clean()
                # which raises "Stock must be at least 1" validation on save()
                product = order.product
                if product.is_farm_product():
                    new_qty = max(0, product.quantity_kg - order.quantity)
                    Product.objects.filter(id=product.id).update(
                        quantity_kg=new_qty, stock=new_qty
                    )
                else:
                    new_stock = max(0, product.stock - order.quantity)
                    Product.objects.filter(id=product.id).update(
                        stock=new_stock, quantity_kg=new_stock
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

            # Send emails asynchronously so they never block the webhook response
            vendor_email = order.vendor.email if order.vendor else None
            if vendor_email:
                send_email_async(
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
                    recipient=vendor_email,
                )

            affiliate_email = order.affiliate.email if order.affiliate else None
            if affiliate_email:
                send_email_async(
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
                    recipient=affiliate_email,
                )

            paystack_customer_email = event['data'].get('customer', {}).get('email')
            buyer_email = paystack_customer_email or order.guest_email or (order.buyer.email if order.buyer else None)
            buyer_name = order.guest_name or (order.buyer.get_full_name() if order.buyer else 'Customer')
            if buyer_email:
                send_email_async(
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
                    recipient=buyer_email,
                )

            # Send SMS notifications
            buyer_phone = order.guest_phone or (order.buyer.phone_number if order.buyer and hasattr(order.buyer, 'phone_number') else None)
            vendor_phone = order.vendor.phone_number if order.vendor and hasattr(order.vendor, 'phone_number') else None
            affiliate_phone = order.affiliate.phone_number if order.affiliate and hasattr(order.affiliate, 'phone_number') else None

            if buyer_phone:
                send_sms_async(
                    message=f"024Global: Payment confirmed! Order #{order.id} for {order.product.name} x{order.quantity}. Total: KES {order.amount}. Delivery to: {order.guest_address or 'your address'}. Thank you!",
                    recipients=[buyer_phone],
                )
            if vendor_phone:
                send_sms_async(
                    message=f"024Global: New sale! Order #{order.id} - {order.product.name} x{order.quantity}. You receive: KES {order.vendor_amount}. Customer: {order.guest_name or buyer_name}.",
                    recipients=[vendor_phone],
                )
            if affiliate_phone:
                send_sms_async(
                    message=f"024Global: Commission earned! Order #{order.id} - {order.product.name}. Your commission: KES {order.affiliate_amount}. Keep sharing your referral link!",
                    recipients=[affiliate_phone],
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


@api_view(['POST'])
@permission_classes([AllowAny])
def cart_checkout(request):
    """
    Multi-item cart checkout.
    Accepts: items=[{product_id, quantity}], guest_name, guest_email, guest_phone, guest_address, affiliate_code
    Creates one order per item. Returns list of payment_urls.
    """
    items = request.data.get('items', [])
    guest_name = request.data.get('guest_name')
    guest_email = request.data.get('guest_email')
    guest_phone = request.data.get('guest_phone')
    guest_address = request.data.get('guest_address')
    affiliate_code = request.data.get('affiliate_code')

    if not items:
        return Response({"error": "No items in cart."}, status=400)
    if not guest_email:
        return Response({"error": "Email is required."}, status=400)

    from products.models import Product as ProductModel
    payment_urls = []

    for item in items:
        product_id = item.get('product_id')
        quantity = int(item.get('quantity', 1))
        # Unit price sent by cart — this is what was displayed to the buyer
        frontend_price = item.get('unit_price')

        try:
            product = ProductModel.objects.select_related('vendor').get(id=product_id)
        except ProductModel.DoesNotExist:
            continue

        vendor = product.vendor
        if not vendor.paystack_subaccount_code:
            continue

        # Prefer the price the buyer saw in their cart; fall back to first non-zero DB price
        if frontend_price and Decimal(str(frontend_price)) > 0:
            unit_price = Decimal(str(frontend_price))
        else:
            # Same priority order as frontend getPrice: retailer → wholesaler → farmer
            unit_price = (
                product.retailer_price if product.retailer_price and Decimal(str(product.retailer_price)) > 0
                else product.wholesaler_price if product.wholesaler_price and Decimal(str(product.wholesaler_price)) > 0
                else product.farmer_price if product.farmer_price and Decimal(str(product.farmer_price)) > 0
                else None
            )

        if not unit_price:
            continue

        # Resolve affiliate
        affiliate = None
        affiliate_subaccount = None
        if affiliate_code:
            try:
                affiliate = CustomUser.objects.get(username=affiliate_code, role='user')
                affiliate_subaccount = affiliate.paystack_subaccount_code
            except CustomUser.DoesNotExist:
                pass

        buyer = request.user if request.user.is_authenticated else None
        amount = unit_price * quantity
        # Paystack uses smallest currency unit: 1 KES = 100 cents → multiply by 100
        amount_kobo = int(Decimal(str(amount)) * 100)

        subaccounts = [{"subaccount": vendor.paystack_subaccount_code, "share": 90 if affiliate else 95}]
        if affiliate_subaccount:
            subaccounts.append({"subaccount": affiliate_subaccount, "share": 5})

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
            PaymentSplit.objects.create(order=order, recipient_type='company', recipient=None, amount=order.company_amount, status='pending')
            PaymentSplit.objects.create(order=order, recipient_type='vendor', recipient=vendor, amount=order.vendor_amount, status='pending')
            if affiliate:
                PaymentSplit.objects.create(order=order, recipient_type='affiliate', recipient=affiliate, amount=order.affiliate_amount, status='pending')

        paystack_data = {
            "email": guest_email,
            "amount": amount_kobo,
            "currency": "KES",
            "callback_url": f"{settings.FRONTEND_URL}/orders/payment-success?order_id={order.id}",
            "metadata": {"order_id": order.id, "product_id": product.id},
            "split": {"type": "percentage", "bearer_type": "account", "subaccounts": subaccounts},
        }
        headers = {"Authorization": f"Bearer {PAYSTACK_SECRET_KEY}", "Content-Type": "application/json"}
        res = requests.post("https://api.paystack.co/transaction/initialize", headers=headers, json=paystack_data)
        res_data = res.json()
        if res_data.get('status'):
            order.payment_reference = res_data['data']['reference']
            order.save()
            payment_urls.append({
                "order_id": order.id,
                "product_name": product.name,
                "amount": float(amount),
                "payment_url": res_data['data']['authorization_url'],
                "reference": res_data['data']['reference'],
            })
        else:
            order.status = 'failed'
            order.save()

    if not payment_urls:
        return Response({"error": "Could not initialize payment for any items."}, status=500)

    return Response({"payment_urls": payment_urls}, status=200)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def vendor_sales(request):
    """
    Returns a per-product sales summary for the authenticated vendor.
    Includes: product name, price, units sold, total revenue collected.
    """
    if request.user.role != 'vendor':
        return Response({"error": "Only vendors can access this endpoint."}, status=403)

    from django.db.models import Sum

    completed_orders = Order.objects.filter(
        vendor=request.user,
        status='completed'
    ).select_related('product')

    # Aggregate per product
    product_ids = completed_orders.values_list('product_id', flat=True).distinct()
    summary = []
    for pid in product_ids:
        orders_for_product = completed_orders.filter(product_id=pid)
        first_order = orders_for_product.first()
        product = first_order.product
        total_qty = orders_for_product.aggregate(total=Sum('quantity'))['total'] or 0
        total_revenue = orders_for_product.aggregate(total=Sum('vendor_amount'))['total'] or 0

        vendor_type = request.user.vendor_type
        if vendor_type == 'farmer':
            price = float(product.farmer_price or 0)
        elif vendor_type == 'wholesaler':
            price = float(product.wholesaler_price or 0)
        else:
            price = float(product.retailer_price or 0)

        summary.append({
            'product_id': product.id,
            'product_name': product.name,
            'price': price,
            'units_sold': total_qty,
            'total_collected': float(total_revenue),
            'is_farm_product': product.is_farm_product(),
        })

    return Response(summary)


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
