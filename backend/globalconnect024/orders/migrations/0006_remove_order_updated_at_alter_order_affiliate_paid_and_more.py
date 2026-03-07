from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0005_add_missing_order_columns'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[],  # skip DB changes since column doesn't exist
            state_operations=[
                migrations.RemoveField(
                    model_name='order',
                    name='updated_at',
                ),
            ]
        ),
    ]