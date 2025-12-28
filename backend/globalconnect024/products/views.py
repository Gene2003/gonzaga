from rest_framework.generics import ListCreateAPIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view
from django.conf import settings
import requests
from rest_framework.exceptions import PermissionDenied
from .models import Product
from .serializers import ProductSerializer
from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import GuestCheckoutSerializer



@api_view(['POST'])
def initialize_paystack_payment(request):
    data = request.data

    headers = {
        "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "email": data.get("email"),
        "amount": int(float(data.get("amount")) * 100),  # Convert to kobo
        "callback_url": settings.PAYSTACK_CALLBACK_URL
    }
    

    response = requests.post("https://api.paystack.co/transaction/initialize", json=payload, headers=headers)
    return Response(response.json())


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated, AllowAny]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['stock', 'approved']  # ✅ Allows ?stock=... & ?approved=...
    ordering_fields = ['price', 'stock', 'name']  # ✅ Allows ?ordering=price


    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]  # Public read access

        else:
                return [IsAuthenticated()]  # Authenticated write access
            

    def get_queryset(self):
        user = self.request.user

        if not user.is_authenticated:
            return Product.objects.filter(approved=True, stock__gt=0)

        if user.role == 'vendor':
            return Product.objects.filter(vendor=user)
        elif user.role == 'admin' or user.is_superuser:
            return Product.objects.all()
        else:
            return Product.objects.filter(approved=True, stock__gt=0)

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != 'vendor':
            raise PermissionDenied("Only approved vendors can add products.")
        serializer.save(vendor=user, approved=True)  # Auto-approve for now

    def perform_update(self, serializer):
        user = self.request.user
        instance = serializer.instance

        if user.role == 'vendor' and instance.vendor != user:
            raise PermissionDenied("You can only edit your own products.")

        if user.role == 'vendor':
            serializer.validated_data.pop('approved', None)

        serializer.save()


class GuestCheckoutAPIView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = GuestCheckoutSerializer(data=request.data)
        if serializer.is_valid():
            guest_data = serializer.validated_data

            # Create a guest order (customize for your models)
            order = Order.objects.create(
                guest_email=guest_data['email'],
                guest_name=guest_data['name'],
                total_price=guest_data['total_price'],
                is_guest=True
            )

            for item in guest_data['items']:
                product = Product.objects.get(id=item['product_id'])
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=item['quantity'],
                    price=item['price']
                )

            return Response({"message": "Guest checkout data received."}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# class ProductViewSet(viewsets.ModelViewSet):
#     serializer_class = ProductSerializer
#     permission_classes = [IsAuthenticated]

#     def get_queryset(self):
#         user = self.request.user

#         if user.role == 'vendor':
#             return Product.objects.filter(vendor=user)
#         elif user.role == 'admin' or user.is_superuser:
#             return Product.objects.all()
#         else:
#             return Product.objects.none()

#     def perform_create(self, serializer):
#         user = self.request.user
#         if user.role != 'vendor':
#             raise PermissionDenied("Only approved vendors can add products.")
#         serializer.save(vendor=user, approved=False)  # ✅ new products are unapproved by default

#     def perform_update(self, serializer):
#         user = self.request.user
#         instance = serializer.instance

#         if user.role == 'vendor' and instance.vendor != user:
#             raise PermissionDenied("You can only edit your own products.")
        
#         # Prevent vendors from modifying `approved` status
#         if user.role == 'vendor':
#             serializer.validated_data.pop('approved', None)
        
#         serializer.save()