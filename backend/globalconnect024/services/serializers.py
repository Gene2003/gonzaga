from rest_framework import serializers
from .models import Service, ServiceBooking


class ServiceSerializer(serializers.ModelSerializer):
    provider_name = serializers.SerializerMethodField(source='provider.username', read_only=True)
    provider_type = serializers.SerializerMethodField(source='provider.type', read_only=True)


    class Meta:
        model = Service
        fields = [
            'id', 'title', 'description', 'service_type', 'price', 
            'category','availability', 'provider','duration','image',
            'provider_name', 'provider_type', 'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'provider', 'provider_name', 'provider_type', 'created_at']
    def get_provider_name(self, obj):
        return obj.provider.get_full_name() or obj.provider.username 
    
    def get_provider_type(self, obj):
        return obj.provider.service_provider_type if hasattr(obj.provider, 'service_provider_type') else None
    def validate(self, data):
        user = self.context['request'].user

        if user.role != 'service_provider':
            raise serializers.ValidationError("Only service providers can create or update services.")
        
        return data
    def create(self, validated_data):
        validated_data['provider'] = self.context['request'].user
        return super().create(validated_data)

class ServiceBookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceBooking
        fields = [
            'id', 'service', 'service_title', 'scheduled_date',
            'customer', 'customer_name','notes',
            'scheduled_time', 'agreed_price', 'status', 'created_at'
        ]
        read_only_fields = ['id', 'service_title', 'customer_name', 'agreed_price', 'status', 'created_at']

        def create(self, validated_data):
            validated_data['customer'] = self.context['request'].user
            service = validated_data['service']
            validated_data['service_provider'] = service.provider
            return super().create(validated_data)