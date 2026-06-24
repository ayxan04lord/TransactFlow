from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Transaction, Profile


class RegisterSerializer(serializers.ModelSerializer):
    password  = serializers.CharField(write_only=True, min_length=6)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model  = User
        fields = ('username', 'email', 'password', 'password2')

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        Profile.objects.create(user=user)
        return user


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Profile
        fields = ('avatar', 'bio')


class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Profile
        fields = ('bio',)


class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model  = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'profile')


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User
        fields = ('first_name', 'last_name', 'email')


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=6)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Old password is incorrect.')
        return value


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Transaction
        fields = ('id', 'from_account', 'to_account', 'amount',
                  'category', 'status', 'note', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')
