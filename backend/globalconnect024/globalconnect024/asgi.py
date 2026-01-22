"""
ASGI config for globalconnect024 project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import services.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'globalconnect024.settings')

application = get_asgi_application()

application = ProtocolTypeRouter({
    "http": application,
    "websocket": AuthMiddlewareStack(
        URLRouter(
            services.routing.websocket_urlpatterns
        )
    ),
})