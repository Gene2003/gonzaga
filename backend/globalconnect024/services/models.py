from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model

User = get_user_model()


# =========================
# COMMON STATUS CHOICES
# =========================
STATUS_CHOICES = (
    ('pending', 'Pending'),
    ('matched', 'Matched'),
    ('accepted', 'Accepted'),
    ('completed', 'Completed'),
    ('cancelled', 'Cancelled'),
)


# =========================
# SERVICE PROVIDER PROFILE
# =========================
class ServiceProviderProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="service_profile"
    )

    business_name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    description = models.TextField()

    price_per_unit = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )

    available = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.username} ({self.user.service_provider_type})"


# =========================
# TRANSPORTER PROFILE
# =========================
class TransporterProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="transporter_profile"
    )

    price_per_km = models.DecimalField(max_digits=10, decimal_places=2)
    max_capacity_kg = models.PositiveIntegerField()
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.username} - {self.price_per_km}/km"


# =========================
# TRANSPORT REQUEST (VENDOR → TRANSPORTER)
# =========================
class TransportRequest(models.Model):
    vendor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="transport_requests"
    )

    transporter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="assigned_transports",
        null=True,
        blank=True
    )

    product = models.ForeignKey(
        'products.Product',
        on_delete=models.CASCADE
    )

    quantity_kg = models.PositiveIntegerField()
    pickup_location = models.CharField(max_length=255)
    delivery_location = models.CharField(max_length=255)

    price_per_km = models.DecimalField(max_digits=10, decimal_places=2)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def auto_assign_transporter(self):
        transporter = User.objects.filter(
            role='service_provider',
            service_provider_type='transport',
            transporter_profile__is_available=True
        ).first()

        if transporter:
            self.transporter = transporter
            self.status = 'accepted'
            self.save()

    def __str__(self):
        return f"Transport request by {self.vendor.username}"


# =========================
# SERVICE (VET, STORAGE, TRANSPORT)
# =========================
class Service(models.Model):
    PROVIDER_TYPE_CHOICES = (
        ('veterinary', 'Veterinary Services'),
        ('transport', 'Transporter'),
        ('storage', 'Storage Provider'),
    )

    provider = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='services'
    )

    service_type = models.CharField(
        max_length=30,
        choices=PROVIDER_TYPE_CHOICES
    )

    title = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        if self.provider.role != 'service_provider':
            raise ValidationError("Only service providers can create services")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} ({self.service_type})"


# =========================
# SERVICE BOOKING
# =========================
class ServiceBooking(models.Model):
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='service_requests'
    )

    service_provider = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_services'
    )

    service = models.ForeignKey(
        Service,
        on_delete=models.CASCADE
    )

    pickup_location = models.CharField(max_length=255)
    dropoff_location = models.CharField(max_length=255, blank=True)

    quantity_kg = models.PositiveIntegerField(null=True, blank=True)
    distance_km = models.DecimalField(max_digits=6, decimal_places=2)

    agreed_price = models.DecimalField(max_digits=10, decimal_places=2)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.service.service_type} booking by {self.customer.username}"
