from backend.globalconnect024.services.utils import auto_match_service_provider
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated      
from rest_framework.exceptions import PermissionDenied
from .models import Service
from .serializers import ServiceSerializer

booking = ServiceBooking.objects.create(**data)

provider = auto_match_service_provider(booking)
if provider:
    booking.service_provider = provider
    booking.status = 'matched'
    booking.save()


class ServiceViewSet(ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        if self.request.user.role != 'service_provider':
            raise PermissionDenied(
                "Only service providers can add services"
            )

        serializer.save(provider=self.request.user)
    def perform_update(self, serializer):
        user = self.request.user
        instance = serializer.instance

        if user.role == 'service_provider' and instance.provider != user:
            raise PermissionDenied("You can only edit your own services.")

        if user.role == 'service_provider':
            serializer.validated_data.pop('approved', None)

        serializer.save()