from rest_framework import serializers
from .models import Order, PaymentSplit


class PaymentSplitSerializer(serializers.ModelSerializer):
    recipient_name = serializers.SerializerMethodField()
    
    class Meta:
        model = PaymentSplit
        fields = [
            'id', 'recipient_type', 'recipient', 'recipient_name',
            'amount', 'status', 'payment_reference', 
            'created_at', 'completed_at'
        ]
    
    def get_recipient_name(self, obj):
        if obj.recipient:
            return obj.recipient.get_full_name() or obj.recipient.email
        return "Company"


class OrderSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    vendor_name = serializers.CharField(source='vendor.get_full_name', read_only=True)
    affiliate_name = serializers.CharField(source='affiliate.get_full_name', read_only=True)
    splits = PaymentSplitSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'buyer', 'product', 'product_name', 'vendor', 'vendor_name',
            'affiliate', 'affiliate_name', 'quantity', 'amount',
            'company_amount', 'vendor_amount', 'affiliate_amount',
            'payment_status', 'payment_reference',
            'vendor_paid', 'affiliate_paid', 'company_paid',
            'splits', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'company_amount', 'vendor_amount', 'affiliate_amount',
            'vendor_paid', 'affiliate_paid', 'company_paid'
        ]