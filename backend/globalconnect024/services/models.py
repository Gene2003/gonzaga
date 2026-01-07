from urllib import request
from django.db import models
from django.conf import settings

from backend.globalconnect024.category.models import User


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
        return f"{self.user.username} ({self.user.service_type})"
    


class ServiceBooking(models.Model):

    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'),
    )

    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="service_bookings"
    )

    service_provider = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="received_bookings"
    )

    service_type = models.CharField(max_length=20)
    description = models.TextField()

    scheduled_date = models.DateField()
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='pending'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        if self.service_provider.role != 'service_provider':
            raise ValidationError("Selected user is not a service provider")

    def __str__(self):
        return f"{self.service_type} - {self.customer.username}"
    

class TransporterProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    price_per_km = models.DecimalField(max_digits=10, decimal_places=2)
    max_capacity_kg = models.PositiveIntegerField()
    is_available = models.BooleanField(default=True)

class TransportRequest(models.Model):

    vendor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="transport_requests"
    )

    transporter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
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
    vehicle_type = models.CharField(max_length=100, blank=True)
    capacity_kg = models.PositiveIntegerField(null=True, blank=True)
    price_per_km = models.DecimalField(max_digits=10, decimal_places=2)

    status = models.CharField(
        max_length=20,
        choices=(
            ('pending', 'Pending'),
            ('accepted', 'Accepted'),
            ('in_transit', 'In Transit'),
            ('delivered', 'Delivered'),
        ),
        default='pending'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def auto_assign_transporter(request):
     transporters = User.objects.filter(
            role='service_provider',
            service_type='transporter',
            service_profile__available=True
        )
    # Optional: filter by location later
    if transporters.exists():
        request.transporter = transporters.first()
        request.status = 'accepted'
        request.save()
        

class ServiceBooking(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('matched', 'Matched'),
        ('accepted', 'Accepted'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )

    customer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='service_requests'
    )

    service_provider = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_services'
    )

    service = models.ForeignKey(Service, on_delete=models.CASCADE)

    pickup_location = models.CharField(max_length=255)
    dropoff_location = models.CharField(max_length=255, blank=True)

    quantity_kg = models.PositiveIntegerField(null=True, blank=True)
    distance_km = models.DecimalField(max_digits=6, decimal_places=2)

    agreed_price = models.DecimalField(max_digits=10, decimal_places=2)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)



class Service(models.Model):
    PROVIDER_TYPE_CHOICES = (
        ('veterinary', 'Veterinary Services'),
        ('transport', 'Transporter'),
        ('storage', 'Storage provider'),
        
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
