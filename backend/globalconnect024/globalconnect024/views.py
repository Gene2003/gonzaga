import requests
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from products.models import Product  # or your product model
from django.core.mail import send_mail
from django.conf import settings
from products.serializers import GuestCheckoutSerializer


@api_view(["POST"])
@permission_classes([AllowAny])
def paystack_initialize_payment(request):
    email = request.data.get('email')
    amount = request.data.get('amount')  # In KES or NGN — depends on your currency

    headers = {
        "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
        "Content-Type": "application/json",
    }

    data = {
        "email": email,
        "amount": int(amount) * 100,  # Paystack expects amount in kobo/cent
        "currency": "KES",  # or "NGN", etc.
        "callback_url": settings.PAYSTACK_CALLBACK_URL
    }

    url = "https://api.paystack.co/transaction/initialize"
    response = requests.post(url, json=data, headers=headers)

    return Response(response.json())

def guest_checkout(request):
    try:
        name = request.data.get("name")
        email = request.data.get("email")
        address = request.data.get("address")
        product_id = request.data.get("product")

        if not all([name, email, address, product_id]):
            return Response({"error": "All fields are required"}, status=400)

        product = Product.objects.get(id=product_id)

        # Save guest order (customize for your models)
        # For now, just return it as a test
        return Response({
            "message": "Order received!",
            "product": product.name,
            "guest": name,
        }, status=status.HTTP_200_OK)
    except Product.DoesNotExist:
        return Response({"error": "Product not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)
    

    class GuestCheckoutAPIView(APIView):
        def post(self, request):
            serializer = GuestCheckoutSerializer(data=request.data)
            if serializer.is_valid():
                guest_data = serializer.validated_data



                order = Order.objects.create(
                    guest_email=guest_data['email'],
                    guest_name=guest_data['name'],
                    guest_phone=guest_data['phone'],
                    total_price=guest_data['total_price'],
                    is_guest=True
                )


                for item in guest_data['items']:
                    product = Product.objects.get(id=item['product_id'])
                    OrderItem.objects.create(
                        order=order,
                        product=product,
                        quantity=item['quantity'],
                        price=item['price']
                    )


                send_mail(
                    subject='Order Confirmation',
                    message=f'Thank you {guest_data["name"]} for your order! Your order ID is {order.id}.',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[guest_data['email']],
                    fail_silently=False
                )

                return REsponce({'message': 'Order placed successfully', 'order_id': order.id}, status=status.HTTP_201_CREATED) 
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST) 
       