from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.db.models import Max


class Product(models.Model):
    VISIBILITY_CHOICES = (
        ('wholesaler', 'Wholesaler'),
        ('retailer', 'Retailer'),
        ('consumers', 'Consumers'),
    )
    vendor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="products")
    name = models.CharField(max_length=255)
    description = models.TextField()
    quantity_kg = models.PositiveIntegerField(default=0)
    farmer_price = models.DecimalField(max_digits=10, decimal_places=2)
    wholesaler_price = models.DecimalField(max_digits=10, decimal_places=2)
    retailer_price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='products/', null=True, blank=True)
    stock = models.PositiveIntegerField(default=0)
    visible_to = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default='consumers')

    approved = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        vendor_type = self.vendor.vendor_type

        #farmer
        if vendor_type == 'farmer':
            if self.quantity_kg <600:
                raise ValidationError("Farmers must sell at least 600 kg.")
            
        #wholesaler
        elif vendor_type == 'wholesaler':
            if self.quantity_kg < 300:
                raise ValidationError("Wholesalers must sell at least 300 kg.")

            max_farmer_qty = Product.objects.filter(name=self.name,vendor_vendor_type='farmer').aggregate(Max('quantity_kg'))['quantity_kg__max'] 
            if max_farmer_qty and self.quantity_kg > max_farmer_qty:
                raise ValidationError("Wholesaler quantity cannot exceed the maximum quantity sold by farmers.")
        #retailer
        elif vendor_type == 'retailer':
            if self.quantity_kg < 100:
                raise ValidationError("Retailers must sell at least 100 kg.")

            max_wholesaler_qty = Product.objects.filter(name=self.name,vendor_vendor_type='wholesaler').aggregate(Max('quantity_kg'))['quantity_kg__max'] 
            if max_wholesaler_qty and self.quantity_kg > max_wholesaler_qty:
                raise ValidationError("Retailer quantity cannot exceed the maximum quantity sold by wholesalers.")

    
    def save (self, *args, **kwargs):
        self.full_clean()
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
        return f"{self.name} ({self.vendor.vendor_type})"
