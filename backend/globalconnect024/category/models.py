from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Category(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, default="Tags")
    vendor = models.ForeignKey(User, on_delete=models.CASCADE, related_name="categories")

    def __str__(self):
        return self.name

class ServiceType(models.Model):
        name = models.CharField(max_length=100)
        description = models.TextField(blank=True)
        category = models.ForeignKey('Category', on_delete=models.CASCADE, related_name="service_types")
        service_provider = models.ForeignKey(User, on_delete=models.CASCADE, related_name="service_types")

        def __str__(self):
            return f"{self.name} ({self.category.name})"