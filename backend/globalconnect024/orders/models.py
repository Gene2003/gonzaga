from email.policy import default
from django.db import models
from django.conf import settings
from products.models import Product
from decimal import Decimal


class Order(models.Model):
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('processing', 'Processing'),
    ]

    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='purchases',
        null=True,
        blank=True
    )
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    vendor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sales',
        help_text="Product vendor",
        null=True,
        blank=True
    )
    affiliate = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='affiliate_orders'
    )
    
    # Quantities and amounts
    quantity = models.PositiveIntegerField(default=1)
    amount = models.DecimalField(max_digits=10, decimal_places=2, help_text="Total paid by customer", null=True, blank=True, default=0)
    
    # Payment splits
    company_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0, help_text="5% company fee")
    vendor_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0, help_text="90-95% to vendor")
    affiliate_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0, help_text="5% affiliate commission")
    
    # Payment status
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    
    # Paystack references (customer payment to company)
    payment_reference = models.CharField(max_length=100, blank=True, null=True, help_text="Paystack reference")
    checkout_request_id = models.CharField(max_length=100, blank=True, null=True)
    merchant_request_id = models.CharField(max_length=100, blank=True, null=True)
    
    # Split payment tracking
    company_paid = models.BooleanField(default=False, help_text="Company received payment via Paystack")
    vendor_paid = models.BooleanField(default=False, help_text="Vendor received M-Pesa payment")
    affiliate_paid = models.BooleanField(default=False, help_text="Affiliate received M-Pesa payment")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        buyer_email = self.buyer.email if self.buyer else "Guest"
        return f"Order #{self.id} - {self.product.name} - {buyer_email}"

    def calculate_splits(self):
        """
        Calculate payment splits based on affiliate presence
        Without affiliate: Company 5%, Vendor 95%
        With affiliate: Company 5%, Affiliate 5%, Vendor 90%
        """
        if self.affiliate:
            # With affiliate: 5% company, 5% affiliate, 90% vendor
            self.company_amount = self.amount * Decimal('0.05')
            self.affiliate_amount = self.amount * Decimal('0.05')
            self.vendor_amount = self.amount * Decimal('0.90')
        else:
            # Without affiliate: 5% company, 95% vendor
            self.company_amount = self.amount * Decimal('0.05')
            self.vendor_amount = self.amount * Decimal('0.95')
            self.affiliate_amount = Decimal('0')

        self.save()
        
        return {
            'company': float(self.company_amount),
            'vendor': float(self.vendor_amount),
            'affiliate': float(self.affiliate_amount),
            'total': float(self.amount)
        }

    def mark_completed(self):
        """Mark order as completed when all payments are done"""
        from django.utils import timezone
        
        if self.affiliate:
            # With affiliate: all three must be paid
            if self.company_paid and self.vendor_paid and self.affiliate_paid:
                self.status = 'completed'
                self.completed_at = timezone.now()
                self.save()
        else:
            # Without affiliate: company and vendor must be paid
            if self.company_paid and self.vendor_paid:
                self.status = 'completed'
                self.completed_at = timezone.now()
                self.save()


class PaymentSplit(models.Model):
    """Track individual payment splits and their M-Pesa transactions"""
    RECIPIENT_TYPE_CHOICES = [
        ('company', 'Company'),
        ('vendor', 'Vendor'),
        ('affiliate', 'Affiliate'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='splits')
    recipient_type = models.CharField(max_length=20, choices=RECIPIENT_TYPE_CHOICES)
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        help_text="Recipient user (null for company)"
    )
    recipient_phone = models.CharField(max_length=15, blank=True, help_text="M-Pesa phone number")
    
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # M-Pesa transaction details
    mpesa_conversation_id = models.CharField(max_length=100, blank=True, null=True)
    mpesa_originator_conversation_id = models.CharField(max_length=100, blank=True, null=True)
    mpesa_transaction_id = models.CharField(max_length=100, blank=True, null=True)
    mpesa_response_code = models.CharField(max_length=10, blank=True, null=True)
    mpesa_response_description = models.TextField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Retry mechanism
    retry_count = models.IntegerField(default=0)
    max_retries = models.IntegerField(default=3)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        recipient_name = self.recipient.email if self.recipient else "Company"
        return f"{self.recipient_type} - {recipient_name} - KSh {self.amount} - {self.status}"


class Referral(models.Model):
    """Track affiliate referrals and commissions"""
    affiliate = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="referrals"
    )
    order = models.OneToOneField(
        Order,
        on_delete=models.CASCADE,
        related_name="referral"
    )
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Commission details
    commission_earned = models.DecimalField(max_digits=10, decimal_places=2)
    commission_rate = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=5.00,
        help_text="Commission percentage (default 5%)"
    )
    
    # Approval and payment status
    is_approved = models.BooleanField(default=True, help_text="Auto-approved by default")
    is_paid = models.BooleanField(default=False, help_text="Payment sent to affiliate")
    
    # Payment tracking
    payment_split = models.ForeignKey(
        PaymentSplit,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='referral'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Referral by {self.affiliate.email} - Order #{self.order.id} - KSh {self.commission_earned}"

    def approve(self):
        """Approve referral commission"""
        from django.utils import timezone
        
        if not self.is_approved:
            self.is_approved = True
            self.approved_at = timezone.now()
            self.save()

    def mark_paid(self, payment_split):
        """Mark referral as paid"""
        from django.utils import timezone
        
        self.is_paid = True
        self.paid_at = timezone.now()
        self.payment_split = payment_split
        self.save()


class VendorPayout(models.Model):
    """Track vendor payouts"""
    vendor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='payouts'
    )
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='vendor_payouts')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    payment_split = models.ForeignKey(
        PaymentSplit,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='vendor_payout'
    )
    
    is_paid = models.BooleanField(default=False)
    paid_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Payout to {self.vendor.email} - Order #{self.order.id} - KSh {self.amount}"