from django.urls import re_path
from .consumers import TransporterConsumer

websocket_urlpatterns = [
    re_path(r"ws/transporter/$", TransporterConsumer.as_asgi()),
]
