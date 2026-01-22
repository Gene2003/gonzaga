from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from channels .generics.websocket import AsyncWebsocketConsumer

channel_layer = get_channel_layer()
async_to_sync(channel_layer.group_send)(
    f"transporter_{transporter.id}",
    {
        "type": "transport_request",
        "data": {
            "order_id": order.id,
            "pickup": vendor.city,
            "destination": user.city
        }
    }
)
# services/consumers.py
class TransporterConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        if self.user.is_anonymous or self.user.role != "service_provider" or self.user.service_provider_type != "transport":
            await self.close()
        else:
            self.group_name = f"transporter_{self.user.id}"
            await self.channel_layer.group_add(
                self.group_name,
                self.channel_name
            )
            await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def transport_request(self, event):
        await self.send_json({
            "type": "NEW_REQUEST",
            "order_id": event["order_id"]
        })