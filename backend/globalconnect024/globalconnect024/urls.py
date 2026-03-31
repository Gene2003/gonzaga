from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponseRedirect, JsonResponse

from rest_framework.routers import DefaultRouter
from services.views import ServiceViewSet, ServiceBookingViewSet, transport_near_vendor


from rest_framework_simplejwt.views import TokenRefreshView
from users.views import EmailOrUsernameTokenObtainPairView  # ✅ custom login view
from .views import guest_checkout

def health_check(request):
    return JsonResponse({'status': 'ok'})


router = DefaultRouter()
router.register(r'services', ServiceViewSet, basename='service')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),  # ✅ Services endpoints
    path('health/', health_check, name='health_check'),  # ✅ Health check endpoint
    # ✅ Guest checkout endpoint
    path('api/guest-checkout/', guest_checkout, name='guest_checkout'),
    path('api/', include('products.urls')),
    path('api/services/transport-near-vendor/', transport_near_vendor, name='transport_near_vendor'),

    # ✅ Auth
    path('api/token/', EmailOrUsernameTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
     
    # ✅ Merge users and admin views here
    path('api/users/', include('users.urls')),  # 👈 this exposes /api/admin/users/ etc. correctly

    # ✅ Other apps
    path('api/', include('category.urls')),
    path("api/orders/", include("orders.urls")),

    # 🌐 Redirect base URL `/` to your React frontend vendor dashboard
    path('', lambda request: HttpResponseRedirect(f"{settings.FRONTEND_URL}/")),
   
    

]

# ✅ Serve media in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
