from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponseRedirect


from rest_framework_simplejwt.views import TokenRefreshView
from users.views import EmailOrUsernameTokenObtainPairView  # ✅ custom login view
from .views import guest_checkout




urlpatterns = [
    path('admin/', admin.site.urls),
    # ✅ Guest checkout endpoint
    path('api/guest-checkout/', guest_checkout, name='guest_checkout'),
    path('api/', include('products.urls')), 

    # ✅ Auth
    path('api/token/', EmailOrUsernameTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
     
    # ✅ Merge users and admin views here
    path('api/users/', include('users.urls')),  # 👈 this exposes /api/admin/users/ etc. correctly

    # ✅ Other apps
    path('api/', include('category.urls')),
    path("api/", include("orders.urls")),

    # 🌐 Redirect base URL `/` to your React frontend vendor dashboard
    path('', lambda request: HttpResponseRedirect(f"{settings.FRONTEND_URL}/")),
   
    

]

# ✅ Serve media in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
