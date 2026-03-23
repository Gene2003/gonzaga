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

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if not instance.image:
            data['image'] = self._get_auto_image(instance)
        return data

    def _get_auto_image(self, instance):
        name = instance.name.lower() if instance.name else ''
        category_name = instance.category.name.lower() if instance.category else ''

        # Keyword-based lookup (product name)
        keyword_map = {
            'laptop': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
            'phone': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
            'tv': 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=400',
            'television': 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=400',
            'shirt': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
            'shoe': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
            'maize': 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400',
            'corn': 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400',
            'rice': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
            'milk': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400',
            'tomato': 'https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=400',
            'potato': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400',
            'chicken': 'https://images.unsplash.com/photo-1560717845-968823efbee1?w=400',
            'beef': 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400',
            'book': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
            'sofa': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',
            'car': 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400',
            'wheel': 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400',
        }
        for keyword, url in keyword_map.items():
            if keyword in name:
                return url

        # Category-based fallback
        if any(k in category_name for k in ('farm', 'agri')):
            return 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400'
        if any(k in category_name for k in ('food', 'groce')):
            return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'
        if 'electron' in category_name:
            return 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400'
        if any(k in category_name for k in ('fashion', 'cloth')):
            return 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400'
        if any(k in category_name for k in ('health', 'beauty')):
            return 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400'
        if any(k in category_name for k in ('home', 'kitchen')):
            return 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400'
        if 'book' in category_name:
            return 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400'
        if any(k in category_name for k in ('toy', 'game')):
            return 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400'
        if 'sport' in category_name:
            return 'https://images.unsplash.com/photo-1461897104016-0b3b00cc81ee?w=400'
        if any(k in category_name for k in ('auto', 'car')):
            return 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400'

        # Generic default
        return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'

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
