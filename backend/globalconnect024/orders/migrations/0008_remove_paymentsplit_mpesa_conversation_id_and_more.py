from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0007_remove_paymentsplit_mpesa_conversation_id_and_more'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.CreateModel(
                    name='PaymentSplit',
                    fields=[
                        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('recipient_type', models.CharField(max_length=20)),
                        ('recipient_phone', models.CharField(blank=True, max_length=15)),
                        ('amount', models.DecimalField(decimal_places=2, max_digits=10)),
                        ('status', models.CharField(default='pending', max_length=20)),
                        ('paystack_reference', models.CharField(blank=True, max_length=100, null=True)),
                        ('created_at', models.DateTimeField(auto_now_add=True)),
                        ('processed_at', models.DateTimeField(blank=True, null=True)),
                        ('completed_at', models.DateTimeField(blank=True, null=True)),
                        ('retry_count', models.IntegerField(default=0)),
                        ('max_retries', models.IntegerField(default=3)),
                        ('order', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='splits', to='orders.order')),
                        ('recipient', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                    ],
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
                ),
                migrations.AddField(
                    model_name='referral',
                    name='commission_rate',
                    field=models.DecimalField(decimal_places=2, default=5.0, max_digits=5),
                ),
                migrations.AddField(
                    model_name='referral',
                    name='approved_at',
                    field=models.DateTimeField(blank=True, null=True),
                ),
                migrations.AddField(
                    model_name='referral',
                    name='paid_at',
                    field=models.DateTimeField(blank=True, null=True),
                ),
                migrations.AddField(
                    model_name='referral',
                    name='payment_split',
                    field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='referral', to='orders.paymentsplit'),
                ),
            ],
            state_operations=[],
        ),
    ]