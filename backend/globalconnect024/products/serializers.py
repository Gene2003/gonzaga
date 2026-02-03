# products/serializers.py
from rest_framework import serializers
from .models import Product

class ProductSerializer(serializers.ModelSerializer):
    vendor_name = serializers.SerializerMethodField()  # ✅ new field

    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'farmer_price','wholesaler_price', 'retailer_price','quantity_kg', 'image', 'stock', 'approved', 'vendor_name','category','visible_to']
        read_only_fields = ['id', 'vendor', 'approved', 'vendor_name','visible_to']

        def get_vendor_name(self, obj):
            return obj.vendor.first_name or obj.vendor.username if obj.vendor else None
        
        def create(self, validated_data):
            validated_data.pop('category', None)  # Remove category if present
            validated_data['vendor'] = self.context['request'].user
            return super().create(validated_data)
        

        
    def validate(self, data):
        user = self.context['request'].user

        if user.role != 'vendor':
            raise serializers.ValidationError("Only vendors can create or update products.")
        
        vendor_type = user.vendor_type
        #farmer
        if vendor_type =='farmer':
            if not data.get('farmer_price'):
                raise serializers.ValidationError("Farmer must set farmer_price")
            data['wholesaler_price'] = data.get('wholesaler_price',0)
            data['retail_price'] = data.get('retail_price',0)
        #wholesaler
        elif vendor_type =='wholesaler':
            if not data.get('wholesaler_price'):
                raise serializers.ValidationError("Wholesaler must set wholesaler_price")
            data['farmer_price'] = data.get('farmer_price',0)
            data['retailer_price'] = data.get('retailer_price',0)
        #retailer
        elif vendor_type =='retailer':
            if not data.get('retailer_price'):
                raise serializers.ValidationError("Retailer must set retail_price")
            data['farmer_price'] = data.get('farmer_price',0)
            data['wholesaler_price'] = data.get('wholesaler_price',0)
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
