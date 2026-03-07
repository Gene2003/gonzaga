from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0008_remove_paymentsplit_mpesa_conversation_id_and_more'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.CreateModel(
                    name='Referral',
                    fields=[
                        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('commission_earned', models.DecimalField(decimal_places=2, max_digits=10)),
                        ('commission_rate', models.DecimalField(decimal_places=2, default=5.0, max_digits=5)),
                        ('is_approved', models.BooleanField(default=True)),
                        ('is_paid', models.BooleanField(default=False)),
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
            ],
            state_operations=[],
        ),
    ]