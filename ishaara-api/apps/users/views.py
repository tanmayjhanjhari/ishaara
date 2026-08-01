from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from .models import User, Profile
from .serializers import (
    RegisterSerializer, LoginSerializer, UserSerializer, MeSerializer, UpdateProfileSerializer
)
from utils.responses import success_response, error_response

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'access': str(refresh.access_token),
        'refresh': str(refresh)
    }

class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response(serializer.errors, status=400)
        user = serializer.save()
        tokens = get_tokens_for_user(user)
        return success_response({
            'access': tokens['access'],
            'refresh': tokens['refresh'],
            'user': UserSerializer(user).data
        }, status=201)

class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            return error_response(serializer.errors, status=401)
        user = serializer.validated_data['user']
        tokens = get_tokens_for_user(user)
        return success_response({
            'access': tokens['access'],
            'refresh': tokens['refresh'],
            'user': MeSerializer(user).data
        })

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if not refresh_token:
                return error_response('Refresh token required', status=400)
            token = RefreshToken(refresh_token)
            token.blacklist()
            return success_response({}, message='Logged out successfully')
        except Exception:
            return error_response('Invalid token', status=400)

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = User.objects.select_related('profile', 'streak').get(id=request.user.id)
        return success_response(MeSerializer(user).data)

    def put(self, request):
        profile = request.user.profile
        serializer = UpdateProfileSerializer(profile, data=request.data, partial=True)
        if not serializer.is_valid():
            return error_response(serializer.errors, status=400)
        serializer.save()
        return success_response(serializer.data)
