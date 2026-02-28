from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from .models import Order, PaymentSplit
import requests
from django.conf import settings


class PaymentSplitService:
    """Handle payment splitting logic"""
    
    @staticmethod
    def create_order_with_splits(buyer, product, quantity, affiliate_code=None):
        """Create order and calculate splits"""
        with transaction.atomic():
            # Get vendor from product
            vendor = product.vendor
            
            # Get affiliate if code provided
            affiliate = None
            if affiliate_code:
                from users.models import CustomUser
                try:
                    affiliate = CustomUser.objects.get(
                        vendor_code=affiliate_code,
                        role='affiliate'
                    )
                except CustomUser.DoesNotExist:
                    affiliate = None
            
            # Calculate total
            amount = product.price * quantity
            
            # Create order
            order = Order.objects.create(
                buyer=buyer,
                product=product,
                vendor=vendor,
                affiliate=affiliate,
                quantity=quantity,
                amount=amount,
                payment_status='pending'
            )
            
            # Calculate splits
            splits = order.calculate_splits()
            
            # Create split records
            PaymentSplit.objects.create(
                order=order,
                recipient_type='company',
                recipient=None,  # Company account
                amount=order.company_amount,
                status='pending'
            )
            
            PaymentSplit.objects.create(
                order=order,
                recipient_type='vendor',
                recipient=vendor,
                amount=order.vendor_amount,
                status='pending'
            )
            
            if affiliate:
                PaymentSplit.objects.create(
                    order=order,
                    recipient_type='affiliate',
                    recipient=affiliate,
                    amount=order.affiliate_amount,
                    status='pending'
                )
            
            return order, splits
    
    @staticmethod
    def process_payment_callback(payment_reference, status):
        """Process payment callback from Paystack"""
        try:
            order = Order.objects.get(payment_reference=payment_reference)
            
            if status == 'success':
                with transaction.atomic():
                    order.payment_status = 'completed'
                    order.save()
                    
                    # Initiate payment splits
                    PaymentSplitService.initiate_splits(order)
                    
            else:
                order.payment_status = 'failed'
                order.save()
                
            return order
        except Order.DoesNotExist:
            return None
    
    @staticmethod
    def initiate_splits(order):
        """Initiate payment to vendor and affiliate via Paystack Transfer"""
        splits = order.splits.filter(status='pending')
        
        for split in splits:
            if split.recipient_type == 'company':
                # Company gets its cut automatically (already in account)
                split.status = 'completed'
                split.completed_at = timezone.now()
                split.save()
                order.company_paid = True
                
            elif split.recipient_type == 'vendor':
                # Transfer to vendor
                success = PaymentSplitService.transfer_to_recipient(
                    split.recipient,
                    split.amount,
                    f"Payment for Order #{order.id}"
                )
                if success:
                    split.status = 'completed'
                    split.completed_at = timezone.now()
                    order.vendor_paid = True
                else:
                    split.status = 'failed'
                split.save()
                
            elif split.recipient_type == 'affiliate':
                # Transfer to affiliate
                success = PaymentSplitService.transfer_to_recipient(
                    split.recipient,
                    split.amount,
                    f"Affiliate commission for Order #{order.id}"
                )
                if success:
                    split.status = 'completed'
                    split.completed_at = timezone.now()
                    order.affiliate_paid = True
                else:
                    split.status = 'failed'
                split.save()
        
        order.save()
    
    @staticmethod
    def transfer_to_recipient(recipient, amount, reason):
        """Transfer money via Paystack Transfer API"""
        # Convert amount to kobo (Paystack uses kobo)
        amount_in_kobo = int(float(amount) * 100)
        
        url = "https://api.paystack.co/transfer"
        headers = {
            "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "source": "balance",
            "amount": amount_in_kobo,
            "recipient": recipient.paystack_recipient_code,  # You'll need to add this field
            "reason": reason
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers)
            data = response.json()
            
            if data.get('status') and data.get('data'):
                return True
            return False
        except Exception as e:
            print(f"Transfer error: {e}")
            return False