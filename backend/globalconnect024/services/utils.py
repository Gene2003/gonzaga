from math import sqrt
from users.models import CustomUser
from category.models import ServiceType
from django.db import models
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.utils import timezone
import africastalking


User = get_user_model()
def send_sms(phone_number, message):
    sms.send(
        message="New delivary request. please accept or decline.",
        recipients=[transporter.phone_number]
    )

def calculate_distance(lat1, lon1, lat2, lon2):
    return sqrt((lat1-lat2)**2 + (lon1-lon2)**2)

def auto_match_service_provider(booking):
    providers = User.objects.filter(
        role='service_provider',
        service_type=booking.service.name.lower(),
        is_available=True
    )

    scored = []

    for provider in providers:
        if not provider.latitude or not provider.longitude:
            continue

        distance = calculate_distance(
            booking.customer.latitude,
            booking.customer.longitude,
            provider.latitude,
            provider.longitude
        )

        score = (distance * 0.5) + (provider.rating * -2)
        scored.append((score, provider))

    scored.sort(key=lambda x: x[0])

    if scored:
        return scored[0][1]

    return None
