from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings
from decimal import Decimal


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0004_add_vendor_column'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='quantity',
            field=models.PositiveIntegerField(default=1),
        ),
        migrations.AddField(
            model_name='order',
            name='company_amount',
            field=models.DecimalField(decimal_places=2, default=0, help_text='5% company fee', max_digits=10),
        ),
        migrations.AddField(
            model_name='order',
            name='vendor_amount',
            field=models.DecimalField(decimal_places=2, default=0, help_text='90-95% to vendor', max_digits=10),
        ),
        migrations.AddField(
            model_name='order',
            name='affiliate_amount',
            field=models.DecimalField(decimal_places=2, default=0, help_text='5% affiliate commission', max_digits=10),
        ),
        migrations.AddField(
            model_name='order',
            name='payment_reference',
            field=models.CharField(blank=True, help_text='Paystack reference', max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='order',
            name='company_paid',
            field=models.BooleanField(default=False, help_text='Company received payment via Paystack'),
        ),
        migrations.AddField(
            model_name='order',
            name='vendor_paid',
            field=models.BooleanField(default=False, help_text='Vendor received payment'),
        ),
        migrations.AddField(
            model_name='order',
            name='affiliate_paid',
            field=models.BooleanField(default=False, help_text='Affiliate received payment'),
        ),
        migrations.AddField(
            model_name='order',
            name='completed_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        
    ]