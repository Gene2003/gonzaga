from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
    ('orders', '0008_remove_paymentsplit_mpesa_conversation_id'),
]

    operations = [
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
    ]