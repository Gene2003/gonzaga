# users/admin_views.py
import random
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from users.permissions import IsAdminUser

User = get_user_model()

from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from users.permissions import IsAdminUser

User = get_user_model()

class AdminResetPassword(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        new_password = request.data.get("password")

        if not new_password or len(new_password) < 8:
            return Response(
                {"error": "Password must be at least 8 characters"},
                status=400
            )

        user = User.objects.get(pk=pk)
        user.set_password(new_password)
        user.save()

        return Response({"message": "Password reset successful"})

class AdminUserList(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        users = User.objects.all().values("id", "username", "email", "role")
        return Response(users)

class AdminCreateUser(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        data = request.data
        user = User.objects.create_user(
            username=data["username"],
            email=data["email"],
            password=data["password"],
            role=data["role"]
        )
        return Response({"message": "User created"}, status=201)

class AdminDeleteUser(APIView):
    permission_classes = [IsAdminUser]

    def delete(self, request, pk):
        User.objects.get(pk=pk).delete()
        return Response({"message": "User deleted"})
class AdminUpdateUserRole(APIView):
    permission_classes = [IsAdminUser]

    def put(self, request, pk):
        data = request.data
        user = User.objects.get(pk=pk)
        user.role = data["role"]
        user.save()
        return Response({"message": "User role updated"})
    
    def generate_unique_vendor_code(self):
        while True:
            code = str(random.randint(10000, 99999))
            if not CustomUser.objects.filter(vendor_code=code).exists():
                return code