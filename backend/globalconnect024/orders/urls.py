# orders/urls.py
from django.urls import path
from .views import  buy_now, checkout, check_payment_status, my_orders, paystack_order_webhook

urlpatterns = [
    path("buy-now/", buy_now, name="buy_now"),
    path("checkout/", checkout, name="checkout"),
    path("check-status/<int:order_id>/", check_payment_status, name="check_status"),
    path("paystack-webhook/", paystack_order_webhook, name="paystack_webhook"),
    path("my-orders/", my_orders, name="my_orders"),
]