from rest_framework import serializers
from .models import Event
from apps.accounts.serializers import UserSerializer


class EventSerializer(serializers.ModelSerializer):
    organizer = UserSerializer(read_only=True)
    registrations_count = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'date', 'location', 'is_online',
            'capacity', 'available_spots', 'banner_image', 'is_public',
            'status', 'organizer', 'created_at', 'registrations_count'
        ]
        read_only_fields = ['id', 'created_at', 'organizer', 'available_spots']

    def get_registrations_count(self, obj):
        return obj.registrations.filter(status__in=['pending', 'confirmed']).count()


class EventCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'date', 'location', 'is_online',
            'capacity', 'banner_image', 'is_public', 'status'
        ]

    def create(self, validated_data):
        validated_data['available_spots'] = validated_data['capacity']
        return super().create(validated_data)
