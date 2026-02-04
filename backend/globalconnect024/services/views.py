from warnings import filters
from services.utils import auto_match_service_provider
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated      
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, filters
from rest_framework.decorators import api_view
from .models import TransportRequest, TransporterProfile
from products.models import Product
from .models import Service
from.models import ServiceBooking
from .serializers import ServiceBookingSerializer, ServiceSerializer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import math



def notify_transporter(transporter, order, vendor, user):
    channel_layer = get_channel_layer()

    async_to_sync(channel_layer.group_send)(
        f"transporter_{transporter.id}",
    {
        "type": "transport_request",    
        "order_id": order.id
    }
)

@api_view(['GET'])
def find_transporters(request, product_id):
    product = Product.objects.get(id=product_id)
    vendor = product.vendor

    transporters = TransporterProfile.objects.filter(
        is_available=True,
        max_capacity_kg__gte=product.stock,
        user__service_type='transporter'
    )

    results = []

    for t in transporters:
        distance = calculate_distance(
            vendor.latitude, vendor.longitude,
            t.user.latitude, t.user.longitude
        )

        transport_cost = distance * float(t.price_per_km)

        score = (
            distance * 0.5 +
            transport_cost * 0.3 -
            t.user.rating * 0.2
        )

        results.append({
            "id": t.id,
            "name": t.user.username,
            "distance_km": round(distance, 2),
            "price": round(transport_cost, 2),
            "rating": t.user.rating,
            "score": score
        })

    results.sort(key=lambda x: x["score"])

    return Response(results)
@api_view(['POST'])
def request_transporter(request):
    TransportRequest.objects.create(
        order_id=request.data['order_id'],
        transporter_id=request.data['transporter_id'],
        vendor=request.user,
        distance_km=request.data['distance'],
        price=request.data['price']
    )
    return Response({"message": "Request sent to transporter"})

@api_view(['POST'])
def respond_to_request(request, pk):
    tr = TransportRequest.objects.get(pk=pk, transporter=request.user)
    tr.status = request.data['status']  # accepted / declined
    tr.save()
    return Response({"status": tr.status})



def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2) ** 2 + \
        math.cos(phi1) * math.cos(phi2) *  math.sin(delta_lambda / 2) ** 2
    

    return R *(2 * math.atan2(math.sqrt(a), math.sqrt(1 - a)))

@api_view(['POST'])
def respond_transport(request, pk):
    tr = TransportRequest.objects.get(id=pk)

    if request.data['action'] == 'accept':
        tr.status = 'accepted'
        tr.save()
        return Response({"status": "accepted"})

    tr.status = 'declined'
    tr.save()
    return Response({"status": "declined"})


def create_service_booking(data):
    return ServiceBooking.objects.create(**data)

def match_service_provider(booking):
    provider = auto_match_service_provider(booking)
    if provider:
        booking.service_provider = provider
        booking.status = 'matched'
        booking.save()

def get_nearest_transporters(vendor):
    transporters = User.objects.filter(
        role='service_provider',
        service_type='transporter',
        transporterprofile__available=True
    )

    scored = []
    for t in transporters:
        distance = calculate_distance(
            vendor.latitude, vendor.longitude,
            t.latitude, t.longitude
        )
        score = (distance * 0.5) + (float(t.transporterprofile.price_per_km) * 0.3) - (t.rating * 0.2)
        scored.append((score, t))

    scored.sort(key=lambda x: x[0])
    return [t for _, t in scored[:5]]  # top 5


class ServiceViewSet(ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['service_type', 'is_active']
    search_fields = ['title', 'description']
    ordering_fields = ['price_per_hour', 'created_at', 'title']
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]  # Public read access
        return [IsAuthenticated()]  # Authenticated write access
    def get_queryset(self):
        user = self.request.user

        if not user.is_authenticated or user.role not in ['service_provider', 'admin']:
            return Service.objects.filter(is_active=True)
        
        #service_providers
        if user.role == 'service_provider':
            return Service.objects.filter(provider=user)
        
        #admins
        if user.role == 'admin' or user.is_superuser:
            return Service.objects.all()
        
        return Service.objects.filter(is_active=True)

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != 'service_provider':
            raise PermissionDenied(
                "Only service providers can add services")
        serializer.save(provider=user)

    def perform_update(self, serializer):
        user = self.request.user
        instance = serializer.instance

        if user.role == 'service_provider' and instance.provider != user:
            raise PermissionDenied("You can only edit your own services.")

        if user.role == 'service_provider':
            serializer.validated_data.pop('approved', None)

        serializer.save()

class ServiceBookingViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceBookingSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'service__service_type']
    ordering_fields = ['created_at', 'agreed_price']
    
    def get_queryset(self):
        user = self.request.user
        
        # Customers see their own bookings
        if user.role in ['user', 'vendor', 'customer']:
            return ServiceBooking.objects.filter(customer=user)
        
        # Service providers see bookings assigned to them
        if user.role == 'service_provider':
            return ServiceBooking.objects.filter(service_provider=user)
        
        # Admins see everything
        if user.role == 'admin' or user.is_superuser:
            return ServiceBooking.objects.all()
        
        return ServiceBooking.objects.none()
    
    def perform_create(self, serializer):
        serializer.save(customer=self.request.user)