# products/serializers.py
from rest_framework import serializers
from .models import Product

class ProductSerializer(serializers.ModelSerializer):
    vendor_name = serializers.SerializerMethodField()  # ✅ new field

    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'image', 'stock', 'approved', 'vendor_name']
        read_only_fields = ['id', 'vendor', 'approved']

        
    def validate(self, data):
        user = self.context['request'].user

        if user.role != 'vendor':
            raise serializers.ValidationError("Only vendors can create or update products.")
        
        vendor_type = user.vendor_type
        #farmer
        if vendor_type =='farmer':
            if not data.get('farmer_price'):
                raise serializers.ValidationError("Farmer must set farmer_price")
            data['wholesale_price'] = None
            data['retail_price'] = None
        #wholesaler
        elif vendor_type =='wholesaler':
            if not data.get('wholesaler_price'):
                raise serializers.ValidationError("Wholesaler must set wholesaler_price")
            data['farmer_price'] = None
            data['retail_price'] = None
        #retailer
        elif vendor_type =='retailer':
            if not data.get('retailer_price'):
                raise serializers.ValidationError("Retailer must set retailer_price")
            data['farmer_price'] = None
            data['wholesale_price'] = None
            data['retail_price'] = None
        #retailer
        elif vendor_type =='retailer':
            if not data.get('retailer_price'):
                raise serializers.ValidationError("Retailer must set retailer_price")
            data['farmer_price'] = None
            data['wholesale_price'] = None
        else:
            raise serializers.ValidationError("Invalid vendor type.")
        return data


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
