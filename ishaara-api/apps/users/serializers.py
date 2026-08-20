from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from .models import User, Profile
from apps.gamification.models import Streak

class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    username = serializers.CharField(min_length=3, max_length=30)
    password = serializers.CharField(min_length=8, write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise ValidationError({'confirm_password': 'Passwords do not match'})
        if User.objects.filter(email=data['email']).exists():
            raise ValidationError({'email': 'Email already registered'})
        if User.objects.filter(username=data['username']).exists():
            raise ValidationError({'username': 'Username already taken'})
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        return User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password']
        )

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        from django.contrib.auth import authenticate
        user = authenticate(request=self.context.get('request'),
                            username=data['email'], password=data['password'])
        if not user:
            raise ValidationError({'non_field_errors': 'Invalid email or password'})
        if not user.is_active:
            raise ValidationError({'non_field_errors': 'Account is inactive'})
        data['user'] = user
        return data

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['display_name', 'avatar_url', 'xp_total', 'level']

class StreakSerializer(serializers.ModelSerializer):
    class Meta:
        model = Streak
        fields = ['current_streak', 'longest_streak', 'last_active_date']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'date_joined']

class MeSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    streak = StreakSerializer(read_only=True)
    display_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'date_joined', 'profile', 'streak', 'display_name', 'is_staff']

    def get_display_name(self, obj):
        profile = getattr(obj, 'profile', None)
        if profile and profile.display_name:
            return profile.display_name
        return obj.username

class UpdateProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['display_name', 'avatar_url']
