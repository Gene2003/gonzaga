from django.db import models
from django.conf import settings

class Book (models.Model):
    title = models.CharField (max_length=200)
    author = models.CharField (max_length=100)
    vendor = models.ForeignKey (settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="books")
    price = models.DecimalField (max_digits=10, decimal_places=2)
    description = models.TextField (blank=True)
    cover_image = models.ImageField (upload_to='book_covers/', null=True, blank=True)
    stock = models.PositiveIntegerField (default=0)
    created_at = models.DateTimeField (auto_now_add=True)

class Product(models.Model):
    vendor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="products")
    name = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='products/', null=True, blank=True)
    stock = models.PositiveIntegerField(default=0)
    
    # ✅ Control visibility and admin approval
    approved = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    
    # ✅ Track when product was added
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
