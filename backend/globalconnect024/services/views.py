from services.utils import auto_match_service_provider
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated      
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import TransportRequest, TransporterProfile
from products.models import Product
from .models import Service
from.models import ServiceBooking
from .serializers import ServiceSerializer
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