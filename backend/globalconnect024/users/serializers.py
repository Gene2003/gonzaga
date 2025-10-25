from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from rest_framework.validators import UniqueValidator
from rest_framework_simplejwt.tokens import RefreshToken
from users.utils import send_activation_email  # ✅ import this

User = get_user_model()

class RegistrationSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())]
    )
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )
    confirm_password = serializers.CharField(write_only=True, required=True)

    country = serializers.CharField(required=False)
    city = serializers.CharField(required=False)
    promotion_methods = serializers.ListField(
        child=serializers.CharField(), required=False
    )
    role = serializers.ChoiceField(choices=[('user', 'Affiliate'), ('vendor', 'Vendor')], default='user')
    certificate_number = serializers.CharField(required=False, allow_blank=True,allow_null=True)

    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'username', 'email',
            'password', 'confirm_password', 'certificate_number',
            'country', 'city', 'promotion_methods', 'role'
        ]

    def validate(self, attrs):
        role = attrs.get('role')
        certificate_number = attrs.get('certificate_number')
           
           #certificate only for affiliates 

        if role == 'user' and not (certificate_number and certificate_number.strip()):
            raise serializers.ValidationError({"certificate_number": "Certificate Number is required for affiliates."})

        if attrs.get('password') != attrs('confirm_password'):
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password', None)  # Exclude confirm_password
        request = self.context.get('request')

        user = User.objects.create_user(
            first_name=validated_data.get('first_name'),
            last_name=validated_data.get('last_name'),
            username=validated_data.get('username'),
            email=validated_data.get('email'),
            password=validated_data.get('password'),
            country=validated_data.get('country', ''),
            city=validated_data.get('city', ''),
            certificate_number=validated_data.get('certificate_number', ''),
            promotion_methods=validated_data.get('promotion_methods', []),
            role=validated_data.get('role', 'user'),
            is_active=False  # 🔒 Require email activation
        )

        send_activation_email(request, user)  # ✅ Send activation email
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'first_name', 'last_name', 'email',
            'is_active', 'date_joined', 'role', 'country', 'city', 'certificate_number', 'promotion_methods'
        ]
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
class EmailOrUsernameTokenObtainSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        login = attrs.get("username")
        password = attrs.get("password")

        user = User.objects.filter(username=login).first() or User.objects.filter(email=login).first()
        if not user or not user.check_password(password):
            raise serializers.ValidationError({"detail": "No active account found with the given credentials"})
        if not user.is_active:
            raise serializers.ValidationError({"detail": "Account is inactive"})
    def validate_certificate(self, value):
        if not value:
            raise serializers.ValidationError("Certificate Number is required")    

        refresh = RefreshToken.for_user(user)
        access = str(refresh.access_token)

        return {
            "refresh": str(refresh),
            "access": access,
            "user": {
                "id": user.id,
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "role": user.role,
                "country": user.country,
                "city": user.city,
                "certificate_Number": user.certificate_number,
                "promotion_methods": user.promotion_methods,
            }
        }
