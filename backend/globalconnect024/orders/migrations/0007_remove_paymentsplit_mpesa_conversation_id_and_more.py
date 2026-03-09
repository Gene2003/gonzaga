from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0006_remove_order_updated_at_alter_order_affiliate_paid_and_more'),
        ('products', '__first__'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.CreateModel(
                    name='PaymentSplit',
                    fields=[
                        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('recipient_type', models.CharField(choices=[('company', 'Company'), ('vendor', 'Vendor'), ('affiliate', 'Affiliate')], max_length=20)),
                        ('recipient_phone', models.CharField(blank=True, max_length=15)),
                        ('amount', models.DecimalField(decimal_places=2, max_digits=10)),
                        ('status', models.CharField(default='pending', max_length=20)),
                        ('created_at', models.DateTimeField(auto_now_add=True)),
                        ('processed_at', models.DateTimeField(blank=True, null=True)),
                        ('completed_at', models.DateTimeField(blank=True, null=True)),
                        ('retry_count', models.IntegerField(default=0)),
                        ('max_retries', models.IntegerField(default=3)),
                        ('order', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='splits', to='orders.order')),
                        ('recipient', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                    ],
                ),
            ],
            state_operations=[],
        ),
    ]