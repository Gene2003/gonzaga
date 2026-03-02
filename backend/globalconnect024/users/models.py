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
        ('service_provider', 'Service Provider'),  # optional

    )

    VENDOR_TYPE_CHOICES = (
        ('farmer', 'Farmer'),
        ('wholesaler', 'Wholesaler'),
        ('retailer', 'Retailer'),
    )

    SERVICE_PROVIDER_CHOICES = (
        ('veterinary', 'Veterinary Services'),
        ('transport', 'Transporter'),
        ('storage', 'Storage provider'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')
    country = models.CharField(max_length=100, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    promotion_methods = models.TextField(blank=True, null=True)
    certificate_number = models.CharField(max_length=100, blank=True, null=True)
    vendor_code = models.CharField(max_length=100, blank=True, null=True ,unique=True)
    vendor_type = models.CharField(max_length=20, choices=VENDOR_TYPE_CHOICES, blank=True, null=True)
    service_provider_type = models.CharField(max_length=20, choices=SERVICE_PROVIDER_CHOICES, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    mpesa_number = models.CharField(max_length=20, blank=True, null=True, help_text="Required for vendors to receive payments.")
    
    registration_paid = models.BooleanField(default=False, help_text="Indicates if the vendor has paid the registration fee.")
    registration_fee_amount = models.DecimalField(max_digits=10, decimal_places=2, default=200.00)
    registered_by_affiliate = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='referred_users', help_text="The affiliate who referred this user, if applicable.")
    paystack_subaccount_code = models.CharField(max_length=100, blank=True, null=True, help_text="Paystack subaccount code for vendors to receive payments.")


    def save (self, *args, **kwargs):
        #auto generate the 5 digit code for vendors
        if self.role == "vendor" and not self.vendor_code:
            self.vendor_code =self.generate_unique_vendor_code()

        if self.role == "affiliate" and not self.vendor_code:
                self.vendor_code = self.generate_unique_vendor_code()

        if not self.mpesa_number and self.phone:
                    self.mpesa_number = self.phone
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
        
        if self.role in ['vendor', 'service_provider', 'affiliate'] and not self.mpesa_number:
            raise ValidationError({'mpesa_number': 'Mpesa Number is required for vendors, service providers, and affiliates to receive payments.'})


    def __str__(self):
        return self.username

    class Meta:
        verbose_name = 'Global User'
        verbose_name_plural = 'Global Users'

class VendorRegistration(models.Model):
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending Payment'),
        ('completed', 'Payment Completed'),
        ('failed', 'Payment Failed'),
    ]
    
    vendor = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='registration')
    affiliate = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='vendor_registrations')
    
    registration_fee = models.DecimalField(max_digits=10, decimal_places=2, default=200.00)
    company_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    affiliate_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Paystack fields
    paystack_reference = models.CharField(max_length=100, blank=True, null=True)
    paystack_transaction_id = models.CharField(max_length=100, blank=True, null=True)
    
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    def calculate_splits(self):
        from decimal import Decimal
        if self.affiliate:
            self.company_amount = self.registration_fee * Decimal('0.5')
            self.affiliate_amount = self.registration_fee * Decimal('0.5')
        else:
            self.company_amount = self.registration_fee
            self.affiliate_amount = Decimal('0')
        self.save()