from django.db import models
from django.conf import settings

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
