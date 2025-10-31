# products/serializers.py
from rest_framework import serializers
from .models import Product
from .models import Book

class BookSerializer(serializers.ModelSerializer):
    vendor_name = serializers.SerializerMethodField()  # ✅ new field

    class Meta:
        model = Book
        fields = ['id', 'title', 'author', 'price', 'description', 'cover_image', 'stock', 'vendor_name']
        read_only_fields = ['id', 'vendor']

    cover_image = serializers.ImageField(required=False, allow_null=True)

    def get_vendor_name(self, obj):
        return obj.vendor.first_name or obj.vendor.username if obj.vendor else None

class ProductSerializer(serializers.ModelSerializer):
    vendor_name = serializers.SerializerMethodField()  # ✅ new field

    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'image', 'stock', 'approved', 'vendor_name']
        read_only_fields = ['id', 'vendor', 'approved']

    image = serializers.ImageField(required=False, allow_null=True)

    def get_vendor_name(self, obj):
        return obj.vendor.first_name or obj.vendor.username if obj.vendor else None
    


class GuestCheckoutSerializer(serializers.Serializer):
    email = serializers.EmailField()
    phone = serializers.CharField()
    products = serializers.ListField(
        child=serializers.DictField(
            child=serializers.CharField()
        )
    )  

class OrderItemDataSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField()
    price = serializers.DecimalField(max_digits=10, decimal_places=2)

class GuestCheckoutSerializer(serializers.Serializer):
    name = serializers.CharField()
    email = serializers.EmailField()
    items = OrderItemDataSerializer(many=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2)    
