# orders/urls.py

from django.urls import path
from .views import  buy_now, checkout, check_payment_status, mpesa_callback, mpesa_b2c_result, mpesa_b2c_timeout, my_orders

urlpatterns = [
    path("buy-now/", buy_now, name="buy_now"),
    path("checkout/", checkout, name="checkout"),
    path("check-status/<int:order_id>/", check_payment_status, name="check_status"),
    path("mpesa/callback/", mpesa_callback), # STK Push callback URL
    path("mpesa/b2c-result/", mpesa_b2c_result, name="mpesa_b2c_result"),
    path("mpesa/b2c-timeout/", mpesa_b2c_timeout, name="mpesa_b2c_timeout"),
    path("my-orders/", my_orders, name="my_orders"),
]