from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.shortcuts import get_object_or_404
from .models import Registration
from .serializers import RegistrationSerializer, RegistrationStatusSerializer
from apps.accounts.permissions import IsOrganizerOrAdmin, IsOwnerOrAdmin
from apps.notifications.email_service import (
    send_confirmation_email, send_cancellation_email, send_badge_ready_email
)


class RegistrationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'patch', 'delete']

    def get_permissions(self):
        if self.action == 'create':
            return [IsAuthenticated()]
        if self.action in ['event_registrations', 'update_status']:
            return [IsOrganizerOrAdmin()]
        if self.action in ['retrieve', 'destroy']:
            return [IsOwnerOrAdmin()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == 'update_status':
            return RegistrationStatusSerializer
        return RegistrationSerializer

    def get_queryset(self):
        queryset = Registration.objects.select_related('event', 'participant')
        user = self.request.user
        if not user.is_authenticated:
            return queryset.none()
        if user.role == 'admin':
            return queryset
        if user.role == 'organizer':
            return queryset.filter(event__organizer=user)
        return queryset.filter(participant=user)

    @transaction.atomic
    def create(self, request):
        if request.user.role != 'participant':
            return Response({'detail': 'Only participants can register to events.'}, status=status.HTTP_403_FORBIDDEN)

        event_id = request.data.get('event_id')
        from apps.events.models import Event
        try:
            event = Event.objects.select_for_update().get(pk=event_id)
        except Event.DoesNotExist:
            return Response({'detail': 'Event not found.'}, status=status.HTTP_404_NOT_FOUND)

        if event.available_spots <= 0:
            return Response({'detail': 'No spots available.'}, status=status.HTTP_400_BAD_REQUEST)
        if event.status != 'active':
            return Response({'detail': 'Event is not active.'}, status=status.HTTP_400_BAD_REQUEST)
        if not event.is_public:
            return Response({'detail': 'Event is not available for public registration.'}, status=status.HTTP_403_FORBIDDEN)
        if Registration.objects.filter(event=event, participant=request.user).exists():
            return Response({'detail': 'Already registered.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = RegistrationSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        registration = serializer.save(participant=request.user)

        event.available_spots -= 1
        event.save(update_fields=['available_spots'])
        send_confirmation_email(registration)

        return Response(RegistrationSerializer(registration).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def my_registrations(self, request):
        registrations = self.get_queryset().filter(participant=request.user).select_related('event')
        serializer = RegistrationSerializer(registrations, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='event/(?P<event_id>[^/.]+)')
    def event_registrations(self, request, event_id=None):
        from apps.events.models import Event
        try:
            event = Event.objects.get(pk=event_id)
        except Event.DoesNotExist:
            return Response({'detail': 'Event not found.'}, status=status.HTTP_404_NOT_FOUND)

        if event.organizer != request.user and request.user.role != 'admin':
            return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)

        registrations = Registration.objects.filter(event=event).select_related('participant')
        serializer = RegistrationSerializer(registrations, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    @transaction.atomic
    def update_status(self, request, pk=None):
        registration = get_object_or_404(self.get_queryset().select_for_update().select_related('event'), pk=pk)
        event = registration.event
        if event.organizer != request.user and request.user.role != 'admin':
            return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)

        new_status = request.data.get('status')
        if new_status == 'rejected':
            new_status = 'cancelled'
        if new_status not in ['confirmed', 'cancelled']:
            return Response({'detail': 'Invalid status.'}, status=status.HTTP_400_BAD_REQUEST)

        old_status = registration.status
        if old_status == new_status:
            return Response(RegistrationSerializer(registration).data)

        if new_status == 'cancelled' and old_status in ['pending', 'confirmed']:
            event.available_spots = min(event.capacity, event.available_spots + 1)
            event.save(update_fields=['available_spots'])
        elif old_status == 'cancelled' and new_status == 'confirmed':
            if event.available_spots <= 0:
                return Response({'detail': 'No spots available.'}, status=status.HTTP_400_BAD_REQUEST)
            event.available_spots -= 1
            event.save(update_fields=['available_spots'])

        registration.status = new_status
        registration.save(update_fields=['status'])

        if new_status == 'confirmed':
            send_badge_ready_email(registration)
        elif new_status == 'cancelled':
            send_cancellation_email(registration, reason="Registration rejected or cancelled by organizer.")

        return Response(RegistrationSerializer(registration).data)

    @transaction.atomic
    def destroy(self, request, pk=None):
        registration = self.get_object()
        if registration.participant != request.user and request.user.role != 'admin':
            return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)

        if registration.status in ['pending', 'confirmed']:
            event = registration.event
            event.available_spots = min(event.capacity, event.available_spots + 1)
            event.save(update_fields=['available_spots'])

        registration.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
