# products/serializers.py
from rest_framework import serializers
from django.db.models import Avg
from .models import Product, ProductRating

class ProductRatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductRating
        fields = ['id', 'rating', 'comment', 'reviewer_name', 'created_at']
        read_only_fields = ['id', 'created_at']


class ProductSerializer(serializers.ModelSerializer):
    vendor_name = serializers.SerializerMethodField()
    vendor_type = serializers.SerializerMethodField()
    category = serializers.CharField(required=False, allow_null=True, write_only=True)
    category_name = serializers.SerializerMethodField()
    is_farm_product = serializers.SerializerMethodField()
    avg_rating = serializers.SerializerMethodField()
    rating_count = serializers.SerializerMethodField()

    # Accept 'price' from frontend (maps to vendor-specific price)
    price = serializers.DecimalField(max_digits=10, decimal_places=2, write_only=True, required=False)

    # Accept 'stock' from frontend (maps to quantity_kg in model)
    stock = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description',
            'price', 'stock',  # Frontend fields
            'farmer_price', 'wholesaler_price', 'retailer_price',
            'quantity_kg', 'image', 'approved',
            'vendor_name', 'vendor_type', 'category', 'category_name',
            'visible_to', 'is_farm_product', 'avg_rating', 'rating_count',
        ]
        read_only_fields = ['id', 'vendor', 'approved', 'vendor_name', 'vendor_type', 'visible_to',
                            'category_name', 'is_farm_product', 'avg_rating', 'rating_count']

    def get_vendor_name(self, obj):
        return obj.vendor.first_name or obj.vendor.username if obj.vendor else None

    def get_vendor_type(self, obj):
        return obj.vendor.vendor_type if obj.vendor else None

    def get_category_name(self, obj):
        return obj.category.name if obj.category else None

    def get_is_farm_product(self, obj):
        return obj.is_farm_product()

    def get_avg_rating(self, obj):
        result = obj.ratings.aggregate(avg=Avg('rating'))['avg']
        return round(result, 1) if result else None

    def get_rating_count(self, obj):
        return obj.ratings.count()

    def validate(self, data):
        user = self.context['request'].user

        if user.role != 'vendor':
            raise serializers.ValidationError("Only vendors can create or update products.")
        
        vendor_type = user.vendor_type
        
        # Map 'stock' to both 'quantity_kg' (farm products) and 'stock' (non-farm products)
        if 'stock' in data:
            stock_value = data.pop('stock')
            data['quantity_kg'] = stock_value
            data['stock'] = stock_value
        
        # Map 'price' to the appropriate vendor price field
        if 'price' in data:
            price_value = data.pop('price')
            
            if vendor_type == 'farmer':
                data['farmer_price'] = price_value
                data['wholesaler_price'] = 0
                data['retailer_price'] = 0
            elif vendor_type == 'wholesaler':
                data['wholesaler_price'] = price_value
                data['farmer_price'] = 0
                data['retailer_price'] = 0
            elif vendor_type == 'retailer':
                data['retailer_price'] = price_value
                data['farmer_price'] = 0
                data['wholesaler_price'] = 0

        # ✅ Only validate prices on CREATE, not UPDATE
        if not self.instance:
            # Set defaults if not provided
            data.setdefault('farmer_price', 0)
            data.setdefault('wholesaler_price', 0)
            data.setdefault('retailer_price', 0)
            
            # Validate based on vendor type
            if vendor_type == 'farmer':
                if not data.get('farmer_price'):
                    raise serializers.ValidationError("Farmer must set a price")
            elif vendor_type == 'wholesaler':
                if not data.get('wholesaler_price'):
                    raise serializers.ValidationError("Wholesaler must set a price")
            elif vendor_type == 'retailer':
                if not data.get('retailer_price'):
                    raise serializers.ValidationError("Retailer must set a price")
            else:
                raise serializers.ValidationError("Invalid vendor type.")
        
        return data
    
    def create(self, validated_data):
        # Handle category lookup by name
        category_name = validated_data.pop('category', None)
        if category_name:
            from category.models import Category
            try:
                category = Category.objects.get(name=category_name)
                validated_data['category'] = category
            except Category.DoesNotExist:
                # If category doesn't exist, set to None
                validated_data['category'] = None
        
        validated_data['vendor'] = self.context['request'].user
        return super().create(validated_data)


class OrderItemDataSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField()
    price = serializers.DecimalField(max_digits=10, decimal_places=2)


class GuestCheckoutSerializer(serializers.Serializer):
    name = serializers.CharField()
    email = serializers.EmailField()
    phone = serializers.CharField()
    items = OrderItemDataSerializer(many=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2)
