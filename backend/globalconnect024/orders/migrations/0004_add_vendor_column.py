from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0003_alter_paymentsplit_recipient_phone'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='vendor',
            field=models.ForeignKey(
                blank=True,
                help_text='Product vendor',
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='sales',
                to=settings.AUTH_USER_MODEL,
            ),
        ),
    ]