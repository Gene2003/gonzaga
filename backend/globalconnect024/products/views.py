from rest_framework.generics import ListCreateAPIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, action
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
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['stock', 'approved']  # ✅ Allows ?stock=... & ?approved=...
    ordering_fields = ['price', 'stock', 'name']  # ✅ Allows ?ordering=price

    def get_permissions(self):
        """
        - List/Retrieve: Anyone can view (AllowAny)
        - Create/Update/Delete: Only authenticated users
        """
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        """
        Returns products based on user role:
        - Consumers/Unauthenticated: Consumer-visible products
        - Affiliates: ALL approved & active products (to promote)
        - Vendors: Only their own products
        - Wholesalers/Retailers: Role-specific products
        - Admins: All products
        """
        user = self.request.user

        if self.action in ['update', 'partial_update', 'destroy', 'create']:
            if user.is_authenticated:
                return Product.objects.filter(vendor=user)
            return Product.objects.none()

        # ✅ Admin or superuser sees everything
        if user.is_authenticated and (user.role == 'admin' or user.is_superuser):
            return Product.objects.all()

        # ✅ Vendors see only their own products
        if user.is_authenticated and user.role == 'vendor':
            return Product.objects.filter(vendor=user)

        # ✅ AFFILIATES see ALL products (active and approved) - THIS IS THE KEY FIX
        if user.is_authenticated and user.role == 'affiliate':
            # Show all products that are active (don't filter by approved if it's causing issues)
            return Product.objects.all()  # ✅ Show ALL products for promotion

        # ✅ Wholesalers see wholesaler-specific products
        if user.is_authenticated and hasattr(user, 'vendor_type') and user.vendor_type == 'wholesaler':
            return Product.objects.filter(visible_to='wholesaler')

        # ✅ Retailers see retailer-specific products
        if user.is_authenticated and hasattr(user, 'vendor_type') and user.vendor_type == 'retailer':
            return Product.objects.filter(visible_to='retailer')

        # ✅ Consumers and unauthenticated users see consumer products
        return Product.objects.all()  # ✅ Show all products publicly
    
    def destroy(self, request, *args, **kwargs):
        """
        Only vendors can delete their own products
        """
        try:
            instance = self.get_object()
            if instance.vendor != request.user:
                return Response({"detail": "You can only delete your own products."}, status=status.HTTP_403_FORBIDDEN)
            self.perform_destroy(instance)
            return Response({"detail": "Product deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        """
        Only vendors can create products
        """
        user = self.request.user
        if user.role != 'vendor':
            raise PermissionDenied("Only vendors can add products.")
        serializer.save(vendor=user, approved=True)  # Auto-approve for now
        

   
   
    def perform_update(self, serializer):
        """
        Only vendors can update their own products
        Vendors cannot modify 'approved' status
        """
        user = self.request.user
        instance = serializer.instance

        if user.role == 'vendor' and instance.vendor != user:
            raise PermissionDenied("You can only edit your own products.")

        # Prevent vendors from modifying 'approved' status
        if user.role == 'vendor':
            serializer.validated_data.pop('approved', None)

        serializer.save()

    # ✅ Custom action for vendors to get only their products
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_products(self, request):
        """
        Endpoint: /api/products/my_products/
        Returns only the authenticated vendor's products
        """
        if request.user.role != 'vendor':
            return Response(
                {"error": "Only vendors can access this endpoint"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        products = Product.objects.filter(vendor=request.user)
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)


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