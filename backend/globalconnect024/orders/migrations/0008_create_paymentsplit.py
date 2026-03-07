from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0007_remove_order_updated_at'),
        ('products', '__first__'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='PaymentSplit',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('recipient_type', models.CharField(choices=[('company', 'Company'), ('vendor', 'Vendor'), ('affiliate', 'Affiliate')], max_length=20)),
                ('recipient_phone', models.CharField(blank=True, help_text='M-Pesa phone number', max_length=15)),
                ('amount', models.DecimalField(decimal_places=2, max_digits=10)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('processing', 'Processing'), ('completed', 'Completed'), ('failed', 'Failed')], default='pending', max_length=20)),
                ('paystack_reference', models.CharField(blank=True, help_text='Paystack reference for company payment', max_length=100, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('processed_at', models.DateTimeField(blank=True, null=True)),
                ('completed_at', models.DateTimeField(blank=True, null=True)),
                ('retry_count', models.IntegerField(default=0)),
                ('max_retries', models.IntegerField(default=3)),
                ('order', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='splits', to='orders.order')),
                ('recipient', models.ForeignKey(blank=True, help_text='Recipient user (null for company)', null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={'ordering': ['-created_at']},
        ),
        migrations.CreateModel(
            name='Referral',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('commission_earned', models.DecimalField(decimal_places=2, max_digits=10)),
                ('commission_rate', models.DecimalField(decimal_places=2, default=5.0, help_text='Commission percentage (default 5%)', max_digits=5)),
                ('is_approved', models.BooleanField(default=True, help_text='Auto-approved by default')),
                ('is_paid', models.BooleanField(default=False, help_text='Payment sent to affiliate')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('approved_at', models.DateTimeField(blank=True, null=True)),
                ('paid_at', models.DateTimeField(blank=True, null=True)),
                ('affiliate', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='referrals', to=settings.AUTH_USER_MODEL)),
                ('order', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='referral', to='orders.order')),
                ('payment_split', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='referral', to='orders.paymentsplit')),
                ('product', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='products.product')),
            ],
            options={'ordering': ['-created_at']},
        ),
        migrations.CreateModel(
            name='VendorPayout',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('amount', models.DecimalField(decimal_places=2, max_digits=10)),
                ('is_paid', models.BooleanField(default=False)),
                ('paid_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('order', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='vendor_payouts', to='orders.order')),
                ('payment_split', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='vendor_payout', to='orders.paymentsplit')),
                ('vendor', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='payouts', to=settings.AUTH_USER_MODEL)),
            ],
            options={'ordering': ['-created_at']},
        ),
    ]