from django.db import models
from django.conf import settings


class Product(models.Model):
    VISIBILITY_CHOICES = (
        ('wholesaler', 'Wholesaler'),
        ('retailer', 'Retailer'),
        ('consumers', 'Consumers'),
    )
    vendor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="products")
    name = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='products/', null=True, blank=True)
    stock = models.PositiveIntegerField(default=0)
    visible_to = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default='consumers')

    def save (self, *args, **kwargs):
        #visibility based on vendor type
        if self .vendor.vendor_type =='farmer':
            self.visible_to ='wholesaler'
        elif self.vendor.vendor_type =='wholesaler':
            self.visible_to ='retailer'
        elif self.vendor.vendor_type =='retailer':
            self.visible_to ='consumers'
        super().save(*args, **kwargs)
    
    # ✅ Control visibility and admin approval
    approved = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    
    # ✅ Track when product was added
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
