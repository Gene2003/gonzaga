import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'globalconnect024.settings')
django.setup()

from users.models import CustomUser

if not CustomUser.objects.filter(username='gene').exists():
    CustomUser.objects.create_superuser(
        username='gene',
        email='gonzagagene80@gmail.com',
        password='gene2003'
    )
    print("Superuser created successfully!")
else:
    print("Superuser already exists!")