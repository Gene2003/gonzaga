from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet  # ✅ Make sure this is imported
from .views import GuestCheckoutAPIView  # ✅ Import the guest checkout view
from .views import initialize_paystack_payment


router = DefaultRouter()
router.register('products', ProductViewSet, basename='products')

urlpatterns = [
    path('', include(router.urls)),  # ✅ Enables /products/, /products/<id>/ etc.
    path('guest-checkout/', GuestCheckoutAPIView.as_view(), name='guest_checkout'),  # ✅ Guest checkout endpoint
    path('paystack/initialize/', initialize_paystack_payment, name='initialize-paystack'),
]
