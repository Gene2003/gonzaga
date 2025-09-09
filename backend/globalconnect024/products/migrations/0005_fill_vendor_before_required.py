from django.db import migrations

def assign_default_vendor(apps, schema_editor):
    Product = apps.get_model('products', 'Product')
    User = apps.get_model('users', 'CustomUser')  # Use your actual custom user model name

    try:
        default_vendor = User.objects.filter(is_staff=True).first()  # Or adjust to match your 'vendor' logic
        if default_vendor:
            Product.objects.filter(vendor__isnull=True).update(vendor=default_vendor)
    except Exception as e:
        print(f"Error while assigning default vendor: {e}")

class Migration(migrations.Migration):

    dependencies = [
        ('products', '0004_alter_product_approved'),
    ]

    operations = [
        migrations.RunPython(assign_default_vendor),
    ]
