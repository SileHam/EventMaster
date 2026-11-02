from rest_framework import serializers
from .models import Registration
from apps.accounts.serializers import UserSerializer
from apps.events.serializers import EventSerializer


class RegistrationSerializer(serializers.ModelSerializer):
    participant = UserSerializer(read_only=True)
    event = EventSerializer(read_only=True)
    event_id = serializers.PrimaryKeyRelatedField(
        queryset=__import__('apps.events.models', fromlist=['Event']).Event.objects.all(),
        source='event',
        write_only=True
    )

    class Meta:
        model = Registration
        fields = ['id', 'event', 'event_id', 'participant', 'notes', 'status', 'registered_at']
        read_only_fields = ['id', 'participant', 'status', 'registered_at']


class RegistrationStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Registration
        fields = ['id', 'status']
