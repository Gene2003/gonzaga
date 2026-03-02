from django.db.models import Sum, Q, Count
from orders.models import Referral, Order
from products.models import Product
import random


from rest_framework.decorators import api_view, permission_classes
from rest_framework import generics, status, serializers
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from django.http import JsonResponse
import requests
import json
import hashlib
import hmac
from datetime import datetime
from base64 import b64encode
from decimal import Decimal
from rest_framework.permissions import IsAuthenticated, BasePermission, AllowAny
from rest_framework.views import APIView
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from django.utils.dateparse import parse_date
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail, BadHeaderError
from django.template.loader import render_to_string, TemplateDoesNotExist
from django.shortcuts import redirect
from django.conf import settings
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from .models import CustomUser, VendorRegistration, AffiliateCertificate
from .tokens import account_activation_token
from .utils import send_activation_email
from .serializers import RegistrationSerializer, UserSerializer
from rest_framework.serializers import ModelSerializer


from django.contrib.auth import get_user_model
User = get_user_model()

PAYSTACK_SECRET_KEY = settings.PAYSTACK_SECRET_KEY
REGISTRATION_FEE = 20000  # KES 200 in kobo (Paystack uses smallest currency unit)

# -------------------- Auth & Registration --------------------

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegistrationSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.save(is_active=False)
        print("user created:", user)

        if user.role == "vendor":
            unique_code = str(random.randint(10000, 99999))
            user.vendor_login_code = unique_code
            user.save()

            try:
                send_mail(
                    subject="Your Vendor Login Code",
                    message=f"Welcome {user.first_name}! Your unique login code is: {unique_code}",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    fail_silently=False,
                )
            except BadHeaderError:
                return Response({"error": "Invalid header found."}, status=500)

        # Create activation email
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = account_activation_token.make_token(user)
        activation_link = f"{settings.FRONTEND_URL}/activate/{uid}/{token}/"

        subject = 'Activate Your 024GlobalConnect Account'
        try:
            message = render_to_string('activation_email.html', {
                'user': user,
                'activation_link': activation_link
            })
        except TemplateDoesNotExist:
            return Response({"error": "Email template not found."}, status=500)

        try:
            send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])
        except BadHeaderError:
            return Response({"error": "Invalid header found."}, status=500)

        return Response({
            "message": "Account created successfully. Please check your email to activate your account."
        }, status=201)


class VendorLoginView(APIView):
    def post(self, request):
        vendor_code = request.data.get('vendor_code')
        password = request.data.get('password')

        try:
            user = CustomUser.objects.get(vendor_login_code=vendor_code)
            user = authenticate(username=user.username, password=password)
            if user:
                return Response({
                    "success": True,
                    "message": "login successful.",
                    "vendor_id": user.id,
                    "email": user.email,
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    "success": False,
                    "message": "Invalid password."
                }, status=status.HTTP_401_UNAUTHORIZED)
        except CustomUser.DoesNotExist:
            return Response({
                "success": False,
                "message": "Invalid vendor code."
            }, status=status.HTTP_401_UNAUTHORIZED)


class ActivateAccount(APIView):
    def get(self, request, uidb64, token):
        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = User.objects.get(pk=uid)
        except Exception:
            return redirect(f'{settings.FRONTEND_URL}/activation-error')

        if user and account_activation_token.check_token(user, token):
            user.is_active = True
            user.save()
            return redirect(f'{settings.FRONTEND_URL}/login?activated=true')

        return redirect(f'{settings.FRONTEND_URL}/activation-error')


class ResendActivationEmail(APIView):
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"detail": "Email is required."}, status=400)

        try:
            user = User.objects.get(email=email)
            if user.is_active:
                return Response({"detail": "Account is already active."}, status=400)

            send_activation_email(request, user)
            return Response({"detail": "Activation email resent."}, status=200)

        except User.DoesNotExist:
            return Response({"detail": "No account found with this email."}, status=404)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response({"error": "Refresh token is required."}, status=400)

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"detail": "Successfully logged out."}, status=200)
        except Exception:
            return Response({"error": "Invalid refresh token"}, status=400)


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class PasswordResetRequestView(APIView):
    def post(self, request):
        return Response({'message': 'Password reset link sent'})


class PasswordResetConfirmView(APIView):
    def post(self, request):
        return Response({'message': 'Password reset confirmed'})


class UpdateProfileView(RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


# -------------------- Custom JWT Login --------------------

class EmailOrUsernameTokenObtainSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        login = attrs.get("username")
        password = attrs.get("password")

        user = User.objects.filter(username=login).first() or User.objects.filter(email=login).first()
        if not user or not user.check_password(password):
            raise serializers.ValidationError({"detail": "No active account found with the given credentials"})
        if not user.is_active:
            raise serializers.ValidationError({"detail": "Account is inactive"})

        data = super().validate({
            "username": user.username,
            "password": password
        })
        data["user"] = {
            "id": user.id,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "role": user.role,
            "country": user.country,
            "city": user.city,
            "promotion_methods": user.promotion_methods,
        }
        return data


@method_decorator(csrf_exempt, name='dispatch')
class EmailOrUsernameTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailOrUsernameTokenObtainSerializer


# -------------------- Affiliate Views --------------------

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def affiliate_summary(request):
    user = request.user
    if user.role != 'user':
        return Response({"detail": "Only affiliates can access this."}, status=403)

    total_commission = Referral.objects.filter(affiliate=user).aggregate(
        total=Sum("commission_earned")
    )["total"] or 0

    total_referrals = Order.objects.filter(affiliate=user).count()
    total_purchases = Order.objects.filter(affiliate=user, status="paid").count()

    conversion_rate = round((total_purchases / total_referrals) * 100, 2) if total_referrals > 0 else 0

    return Response({
        "total_commission": total_commission,
        "total_referrals": total_referrals,
        "total_purchases": total_purchases,
        "conversion_rate": conversion_rate
    })


class ReferralSerializer(ModelSerializer):
    product_name = serializers.CharField(source="order.product.name", read_only=True)
    buyer_username = serializers.CharField(source="order.buyer.username", read_only=True)
    purchase_amount = serializers.DecimalField(source="order.amount", max_digits=10, decimal_places=2)

    class Meta:
        model = Referral
        fields = ["id", "created_at", "product_name", "buyer_username", "purchase_amount", "commission_earned"]


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def affiliate_referrals(request):
    user = request.user
    if user.role != "user":
        return Response({"detail": "Only affiliates can access this."}, status=403)

    referrals = Referral.objects.filter(affiliate=user).select_related("order__product", "order__buyer")
    start = request.GET.get("start")
    end = request.GET.get("end")
    if start:
        referrals = referrals.filter(created_at__date__gte=parse_date(start))
    if end:
        referrals = referrals.filter(created_at__date__lte=parse_date(end))

    serializer = ReferralSerializer(referrals, many=True)
    return Response(serializer.data)


# -------------------- Paystack Vendor Registration Payment --------------------

@api_view(['POST'])
@permission_classes([AllowAny])
def initiate_vendor_payment(request):
    """
    Called when a vendor submits the registration form.
    Creates an inactive user account and initializes a Paystack transaction with 50/50 split.
    """
    data = request.data.copy()

    #extract affiliate certificate number before passing to serializer
    affiliate_certificate_number = data.get('affiliate_certificate_number', '').strip()
    data = {k: v for k, v in data.items() if k != 'affiliate_certificate_number'}

    # Check for duplicate email or username
    if User.objects.filter(email=data.get('email')).exists():
        return Response({'error': 'Email already registered.'}, status=400)
    if User.objects.filter(username=data.get('username')).exists():
        return Response({'error': 'Username already taken.'}, status=400)

    # Find affiliate by certificate number (optional)
    affiliate = None
    affiliate_subaccount = None

    if affiliate_certificate_number:
        try:
            cert = AffiliateCertificate.objects.get(
                certificate_number=affiliate_certificate_number
            )
            affiliate = cert.used_by
            if affiliate:
                affiliate_subaccount = affiliate.paystack_subaccount_code
            else:
                return Response({'error': 'Affiliate certificate number is valid but not linked to any user.'}, status=400)
        except AffiliateCertificate.DoesNotExist:
            return Response({'error': 'Invalid affiliate certificate number.'}, status=400)

    # Validate and save user as inactive
    serializer = RegistrationSerializer(data=data, context={'request': request})
    if not serializer.is_valid():
        print("SERIALIZER ERRORS:", serializer.errors)
        return Response(serializer.errors, status=400)

    user = serializer.save(is_active=False, registration_paid=False)

    if affiliate:
        user.registered_by_affiliate = affiliate
        user.save()

    # Create VendorRegistration record
    vendor_reg = VendorRegistration.objects.create(
        vendor=user,
        affiliate=affiliate,
        registration_fee=Decimal('200.00'),
        payment_status='pending'
    )
    vendor_reg.calculate_splits()

    # Build Paystack transaction payload
    paystack_data = {
        "email": user.email,
        "amount": REGISTRATION_FEE,  # Amount in kobo (200 KES = 20000)
        "currency": "KES",
        "callback_url": f"{settings.FRONTEND_URL}/vendor/payment-success",
        "metadata": {
            "user_id": user.id,
            "affiliate_id": affiliate.id if affiliate else None,
            "vendor_registration_id": vendor_reg.id,
        }
    }

    # Add split only if affiliate has a Paystack subaccount
    if affiliate_subaccount:
        paystack_data["split"] = {
            "type": "percentage",
            "bearer_type": "account",
            "subaccounts": [
                {
                    "subaccount": affiliate_subaccount,
                    "share": 50  # 50% to affiliate
                }
            ]
        }

    headers = {
        "Authorization": f"Bearer {PAYSTACK_SECRET_KEY}",
        "Content-Type": "application/json"
    }

    response = requests.post(
        "https://api.paystack.co/transaction/initialize",
        json=paystack_data,
        headers=headers
    )

    res_data = response.json()

    if not res_data.get('status'):
        # Clean up the user we just created since payment init failed
        user.delete()
        return Response({'error': 'Failed to initialize payment.', 'detail': res_data}, status=500)

    # Save Paystack reference to the registration record
    vendor_reg.paystack_reference = res_data['data']['reference']
    vendor_reg.save()

    return Response({
        'payment_url': res_data['data']['authorization_url'],
        'reference': res_data['data']['reference'],
        'user_id': user.id,
    }, status=200)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def paystack_webhook(request):
    """
    Paystack calls this endpoint after a successful payment.
    Verifies the signature, then activates the vendor account.
    """
    paystack_signature = request.headers.get('x-paystack-signature')
    payload = request.body

    # Verify Paystack signature to ensure request is genuine
    expected_signature = hmac.new(
        PAYSTACK_SECRET_KEY.encode('utf-8'),
        payload,
        hashlib.sha512
    ).hexdigest()

    if paystack_signature != expected_signature:
        return Response({'error': 'Invalid signature'}, status=400)

    event = json.loads(payload)

    if event.get('event') == 'charge.success':
        metadata = event['data'].get('metadata', {})
        user_id = metadata.get('user_id')
        vendor_registration_id = metadata.get('vendor_registration_id')
        paystack_transaction_id = event['data'].get('id')

        try:
            user = User.objects.get(id=user_id)
            user.is_active = True
            user.registration_paid = True
            user.save()

            # Update VendorRegistration record
            if vendor_registration_id:
                try:
                    vendor_reg = VendorRegistration.objects.get(id=vendor_registration_id)
                    vendor_reg.payment_status = 'completed'
                    vendor_reg.paystack_transaction_id = str(paystack_transaction_id)
                    vendor_reg.paid_at = timezone.now()
                    vendor_reg.save()
                except VendorRegistration.DoesNotExist:
                    pass

            # Send welcome email to vendor
            send_mail(
                subject="Welcome to 024GlobalConnect — Account Activated!",
                message=(
                    f"Hi {user.first_name},\n\n"
                    f"Your vendor account has been activated after successful payment of KES 200.\n"
                    f"You can now log in and start uploading your products.\n\n"
                    f"Welcome aboard!"
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True,
            )

        except User.DoesNotExist:
            pass

    return Response({'status': 'ok'}, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_affiliate_subaccount(request):
    """
    Admin or affiliate uses this to register a Paystack subaccount
    so they can receive automatic 50% split on vendor registrations.
    """
    affiliate_id = request.data.get('affiliate_id')
    bank_code = request.data.get('bank_code')         # e.g. "057" for Equity Kenya
    account_number = request.data.get('account_number')

    if not all([affiliate_id, bank_code, account_number]):
        return Response({'error': 'affiliate_id, bank_code, and account_number are required.'}, status=400)

    try:
        affiliate = User.objects.get(id=affiliate_id, role='user')
    except User.DoesNotExist:
        return Response({'error': 'Affiliate not found.'}, status=404)

    payload = {
        "business_name": f"{affiliate.first_name} {affiliate.last_name}".strip() or affiliate.username,
        "settlement_bank": bank_code,
        "account_number": account_number,
        "percentage_charge": 50,
        "description": f"Affiliate subaccount for {affiliate.username}",
    }

    headers = {
        "Authorization": f"Bearer {PAYSTACK_SECRET_KEY}",
        "Content-Type": "application/json"
    }

    response = requests.post(
        "https://api.paystack.co/subaccount",
        json=payload,
        headers=headers
    )

    res_data = response.json()

    if res_data.get('status'):
        affiliate.paystack_subaccount_code = res_data['data']['subaccount_code']
        affiliate.save()
        return Response({
            'message': 'Subaccount created successfully.',
            'subaccount_code': affiliate.paystack_subaccount_code
        })

    return Response({'error': 'Failed to create subaccount.', 'detail': res_data}, status=500)


# -------------------- Admin Views --------------------

class IsCustomAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsCustomAdmin])
def get_all_users(request):
    """Get all users with filtering options"""
    role = request.GET.get('role')
    registration_status = request.GET.get('registration_status')
    search = request.GET.get('search')

    users = CustomUser.objects.all()

    if role:
        users = users.filter(role=role)

    if registration_status == 'paid':
        users = users.filter(registration_paid=True)
    elif registration_status == 'unpaid':
        users = users.filter(registration_paid=False)

    if search:
        users = users.filter(
            Q(username__icontains=search) |
            Q(email__icontains=search) |
            Q(first_name__icontains=search) |
            Q(last_name__icontains=search) |
            Q(phone__icontains=search) |
            Q(vendor_code__icontains=search)
        )

    users = users.order_by('-date_joined')

    serialized_users = []
    for user in users:
        serialized_users.append({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': user.role,
            'phone': user.phone,
            'vendor_code': user.vendor_code,
            'certificate_number': user.certificate_number,
            'registration_paid': user.registration_paid,
            'registration_fee_amount': float(user.registration_fee_amount),
            'registered_by_affiliate': user.registered_by_affiliate.email if user.registered_by_affiliate else None,
            'is_active': user.is_active,
            'date_joined': user.date_joined,
            'last_login': user.last_login,
        })

    return Response({
        'count': users.count(),
        'users': serialized_users
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsCustomAdmin])
def get_affiliates(request):
    """Get all affiliates with stats"""
    affiliates = CustomUser.objects.filter(role='user').order_by('-date_joined')

    data = []
    for affiliate in affiliates:
        referred_count = CustomUser.objects.filter(
            registered_by_affiliate=affiliate,
            role='vendor'
        ).count()

        total_commission = Referral.objects.filter(
            affiliate=affiliate,
            is_approved=True
        ).aggregate(total=Sum('commission_earned'))['total'] or 0

        # Registration commissions earned (50% of KES 200 per referred vendor)
        registration_commission = VendorRegistration.objects.filter(
            affiliate=affiliate,
            payment_status='completed'
        ).aggregate(total=Sum('affiliate_amount'))['total'] or 0

        data.append({
            'id': affiliate.id,
            'username': affiliate.username,
            'email': affiliate.email,
            'full_name': f"{affiliate.first_name} {affiliate.last_name}".strip(),
            'phone': affiliate.phone,
            'vendor_code': affiliate.vendor_code,
            'certificate_number': affiliate.certificate_number,
            'has_paystack_subaccount': bool(affiliate.paystack_subaccount_code),
            'referred_vendors_count': referred_count,
            'total_commission_earned': float(total_commission),
            'registration_commission_earned': float(registration_commission),
            'is_active': affiliate.is_active,
            'date_joined': affiliate.date_joined,
        })

    return Response({
        'count': len(data),
        'affiliates': data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsCustomAdmin])
def get_vendors(request):
    """Get all vendors with registration info"""
    vendors = CustomUser.objects.filter(role='vendor').order_by('-date_joined')

    data = []
    for vendor in vendors:
        # Get vendor registration payment details
        try:
            reg = vendor.registration
            payment_status = reg.payment_status
            paystack_reference = reg.paystack_reference
        except VendorRegistration.DoesNotExist:
            payment_status = None
            paystack_reference = None

        data.append({
            'id': vendor.id,
            'username': vendor.username,
            'email': vendor.email,
            'full_name': f"{vendor.first_name} {vendor.last_name}".strip(),
            'phone': vendor.phone,
            'vendor_code': vendor.vendor_code,
            'vendor_type': vendor.vendor_type,
            'registration_paid': vendor.registration_paid,
            'registration_fee': float(vendor.registration_fee_amount),
            'payment_status': payment_status,
            'paystack_reference': paystack_reference,
            'referred_by': vendor.registered_by_affiliate.email if vendor.registered_by_affiliate else None,
            'referred_by_code': vendor.registered_by_affiliate.vendor_code if vendor.registered_by_affiliate else None,
            'is_active': vendor.is_active,
            'date_joined': vendor.date_joined,
        })

    return Response({
        'count': len(data),
        'vendors': data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsCustomAdmin])
def get_dashboard_stats(request):
    """Get dashboard statistics"""
    total_users = CustomUser.objects.count()
    total_affiliates = CustomUser.objects.filter(role='user').count()
    total_vendors = CustomUser.objects.filter(role='vendor').count()
    total_customers = CustomUser.objects.filter(role='customer').count()

    paid_vendors = CustomUser.objects.filter(role='vendor', registration_paid=True).count()
    unpaid_vendors = CustomUser.objects.filter(role='vendor', registration_paid=False).count()

    # Registration fee revenue
    total_registration_revenue = VendorRegistration.objects.filter(
        payment_status='completed'
    ).aggregate(total=Sum('registration_fee'))['total'] or 0

    company_registration_revenue = VendorRegistration.objects.filter(
        payment_status='completed'
    ).aggregate(total=Sum('company_amount'))['total'] or 0

    affiliate_registration_payouts = VendorRegistration.objects.filter(
        payment_status='completed'
    ).aggregate(total=Sum('affiliate_amount'))['total'] or 0

    # Product sale commissions
    total_commissions = Referral.objects.filter(
        is_approved=True
    ).aggregate(total=Sum('commission_earned'))['total'] or 0

    paid_commissions = Referral.objects.filter(
        is_approved=True,
        is_paid=True
    ).aggregate(total=Sum('commission_earned'))['total'] or 0

    pending_commissions = Referral.objects.filter(
        is_approved=True,
        is_paid=False
    ).aggregate(total=Sum('commission_earned'))['total'] or 0

    return Response({
        'users': {
            'total': total_users,
            'affiliates': total_affiliates,
            'vendors': total_vendors,
            'customers': total_customers,
        },
        'vendors': {
            'total': total_vendors,
            'paid': paid_vendors,
            'unpaid': unpaid_vendors,
        },
        'registration_revenue': {
            'total': float(total_registration_revenue),
            'company_share': float(company_registration_revenue),
            'affiliate_payouts': float(affiliate_registration_payouts),
        },
        'commissions': {
            'total': float(total_commissions),
            'paid': float(paid_commissions),
            'pending': float(pending_commissions),
        }
    })


@api_view(['PATCH'])
@permission_classes([IsAuthenticated, IsCustomAdmin])
def update_user_status(request, user_id):
    """Update user active status"""
    try:
        user = CustomUser.objects.get(id=user_id)
        is_active = request.data.get('is_active')

        if is_active is not None:
            user.is_active = is_active
            user.save()

            return Response({
                'message': f'User {"activated" if is_active else "deactivated"} successfully',
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'is_active': user.is_active
                }
            })

        return Response({'error': 'is_active field required'}, status=400)

    except CustomUser.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsCustomAdmin])
def delete_user(request, user_id):
    """Delete a user"""
    try:
        user = CustomUser.objects.get(id=user_id)
        email = user.email
        user.delete()

        return Response({
            'message': f'User {email} deleted successfully'
        })

    except CustomUser.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)


@api_view(["GET"])
@permission_classes([IsCustomAdmin])
def admin_user_list(request):
    role = request.GET.get("role")
    if role in ['vendor', 'user']:
        users = User.objects.filter(role=role)
    else:
        users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)


@api_view(["PATCH"])
@permission_classes([IsCustomAdmin])
def toggle_user_status(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"detail": "User not found."}, status=404)

    is_active = request.data.get("is_active")
    if is_active is None:
        return Response({"detail": "Missing 'is_active' field."}, status=400)

    user.is_active = bool(is_active)
    user.save()
    return Response({"detail": "User status updated."})


@api_view(["GET"])
@permission_classes([IsCustomAdmin])
def admin_product_list(request):
    products = Product.objects.select_related("vendor").all()
    data = [
        {
            "id": p.id,
            "name": p.name,
            "vendor": p.vendor.username,
            "price": str(p.price),
            "stock": p.stock,
            "is_active": p.is_active,
            "created_at": p.created_at,
        }
        for p in products
    ]
    return Response(data)


@api_view(["PATCH"])
@permission_classes([IsCustomAdmin])
def toggle_product_visibility(request, product_id):
    try:
        product = Product.objects.get(id=product_id)
        product.is_active = not product.is_active
        product.save()
        return Response({
            "message": "Product visibility updated.",
            "product_id": product.id,
            "is_active": product.is_active
        }, status=200)
    except Product.DoesNotExist:
        return Response({"error": "Product not found."}, status=404)


@api_view(['GET'])
@permission_classes([IsCustomAdmin])
def admin_commission_logs(request):
    referrals = Referral.objects.select_related("affiliate", "order__product", "order__buyer")
    affiliate = request.GET.get("affiliate")
    if affiliate:
        referrals = referrals.filter(affiliate__username=affiliate) | referrals.filter(affiliate__id=affiliate)

    start = request.GET.get("start")
    end = request.GET.get("end")
    if start:
        referrals = referrals.filter(created_at__date__gte=parse_date(start))
    if end:
        referrals = referrals.filter(created_at__date__lte=parse_date(end))

    serializer = AdminReferralSerializer(referrals, many=True)
    return Response(serializer.data)


class AdminReferralSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="order.product.name", read_only=True)
    buyer_username = serializers.CharField(source="order.buyer.username", read_only=True)
    purchase_amount = serializers.DecimalField(source="order.amount", max_digits=10, decimal_places=2)

    is_approved = serializers.BooleanField()
    is_paid = serializers.BooleanField()
    affiliate = serializers.StringRelatedField()

    class Meta:
        model = Referral
        fields = [
            "id",
            "created_at",
            "affiliate",
            "product_name",
            "buyer_username",
            "purchase_amount",
            "commission_earned",
            "is_approved",
            "is_paid",
        ]


@api_view(["PATCH"])
@permission_classes([IsCustomAdmin])
def approve_commission(request, referral_id):
    try:
        ref = Referral.objects.get(id=referral_id)
        ref.is_approved = request.data.get("is_approved", True)
        ref.save()
        return Response({"detail": "Commission approval updated."})
    except Referral.DoesNotExist:
        return Response({"detail": "Referral not found."}, status=404)


@api_view(["PATCH"])
@permission_classes([IsCustomAdmin])
def mark_commission_paid(request, referral_id):
    try:
        ref = Referral.objects.get(id=referral_id)
        ref.is_paid = request.data.get("is_paid", True)
        ref.save()
        return Response({"detail": "Commission payout updated."})
    except Referral.DoesNotExist:
        return Response({"detail": "Referral not found."}, status=404)


@api_view(["GET"])
@permission_classes([IsCustomAdmin])
def system_logs(request):
    logs = [
        {"id": 1, "timestamp": "2025-07-01T14:20:00Z", "event": "User Login", "user": "Claire_m"},
        {"id": 2, "timestamp": "2025-07-01T15:05:00Z", "event": "Referral Link Clicked", "user": "Claire3"},
        {"id": 3, "timestamp": "2025-07-01T15:10:00Z", "event": "Commission Approved", "user": "admin"},
    ]
    return Response(logs)
