from django.db import models 
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError 
import random


class AffiliateCertificate(models.Model):
    certificate_number = models.CharField(max_length=50, unique=True)
    full_name = models.CharField(max_length=150)
    issued_date = models.DateField(auto_now_add=True)
    is_valid = models.BooleanField(default=True)
    used_by = models.ForeignKey(
        'users.CustomUser',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='used_certificate'
    )

    def __str__(self):
        return f"{self.certificate_number} ({'Valid' if self.is_valid else 'Used'})"


class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('user', 'Affiliate'),
        ('vendor', 'Vendor'),
        ('admin', 'Admin'),  # optional
        ('customer', 'Customer'),  # optional

    )

    VENDOR_TYPE_CHOICES = (
        ('farmer', 'Farmer'),
        ('wholesaler', 'Wholesaler'),
        ('transporter', 'Transporter'),
        ('retailer', 'Retailer'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')
    country = models.CharField(max_length=100, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    promotion_methods = models.TextField(blank=True, null=True)
    certificate_number = models.CharField(max_length=100, blank=True, null=True)
    vendor_code = models.CharField(max_length=100, blank=True, null=True ,unique=True)
    vendor_type = models.CharField(max_length=20, choices=VENDOR_TYPE_CHOICES, blank=True, null=True)

    def save (self, *args, **kwargs):
        #auto generate the 5 digit code for vendors
        if self.role == "vendor" and not self.vendor_code:
            self.vendor_code =self.generate_unique_vendor_code()
        super().save(*args, **kwargs)
        
    def generate_unique_vendor_code(self):
        """Generate a unique 5-digit vendor code."""
        while True:
            code = str(random.randint(10000, 99999))
            if not CustomUser.objects.filter(vendor_code=code).exists():
                return code        

    def clean(self):
        """Ensure certificate_number is required only for affiliates."""
        super().clean()
        if self.role == 'user' and not self.certificate_number:
            raise ValidationError({'certificate_number': 'Certificate Number is required for affiliates.'})


    def __str__(self):
        return self.username

    class Meta:
        verbose_name = 'Global User'
        verbose_name_plural = 'Global Users'
