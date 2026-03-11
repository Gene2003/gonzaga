from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0014_remove_paymentsplit_mpesa_conversation_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='guest_name',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='order',
            name='guest_email',
            field=models.EmailField(blank=True, max_length=254, null=True),
        ),
        migrations.AddField(
            model_name='order',
            name='guest_phone',
            field=models.CharField(blank=True, max_length=20, null=True),
        ),
        migrations.AddField(
            model_name='order',
            name='guest_address',
            field=models.TextField(blank=True, null=True),
        ),
    ]