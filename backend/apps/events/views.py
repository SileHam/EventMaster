from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db.models import Q
from .models import Event
from .serializers import EventSerializer, EventCreateSerializer
from apps.accounts.permissions import IsOrganizerOrAdmin, IsOwnerOrAdmin
from apps.notifications.email_service import send_cancellation_email


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()

    # Réalisé par : Hamza Zniber & Youssef Sebsab
    # EMSI Casablanca - 3IIR - 2025/2026

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return EventCreateSerializer
        return EventSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        if self.action in ['create']:
            return [IsOrganizerOrAdmin()]
        if self.action in ['update', 'partial_update', 'destroy', 'cancel']:
            return [IsAuthenticated(), IsOwnerOrAdmin()]
        if self.action in ['my_events', 'stats']:
            return [IsOrganizerOrAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):
        evenements = Event.objects.all()
        user = self.request.user

        if self.action == 'list':
            if not user.is_authenticated or user.role == 'participant':
                evenements = evenements.filter(is_public=True)
            elif user.role == 'organizer':
                evenements = evenements.filter(Q(is_public=True) | Q(organizer=user))
        elif self.action == 'retrieve':
            if not user.is_authenticated or user.role == 'participant':
                evenements = evenements.filter(is_public=True)
            elif user.role == 'organizer':
                evenements = evenements.filter(Q(is_public=True) | Q(organizer=user))
        elif self.action in ['update', 'partial_update', 'destroy', 'cancel']:
            if user.is_authenticated and user.role == 'organizer':
                evenements = evenements.filter(organizer=user)

        recherche = self.request.query_params.get('search')
        if recherche:
            evenements = evenements.filter(Q(title__icontains=recherche) | Q(location__icontains=recherche))
        date_from = self.request.query_params.get('date_from')
        if date_from:
            evenements = evenements.filter(date__gte=date_from)
        date_to = self.request.query_params.get('date_to')
        if date_to:
            evenements = evenements.filter(date__lte=date_to)
        location = self.request.query_params.get('location')
        if location:
            evenements = evenements.filter(location__icontains=location)
        return evenements

    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user)

    @action(detail=False, methods=['get'], permission_classes=[IsOrganizerOrAdmin])
    def my_events(self, request):
        # Récupération des événements selon le rôle connecté.
        events = Event.objects.all() if request.user.role == 'admin' else Event.objects.filter(organizer=request.user)
        serializer = EventSerializer(events, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def cancel(self, request, pk=None):
        event = self.get_object()
        self.check_object_permissions(request, event)
        event.status = 'cancelled'
        event.save()
        confirmed = event.registrations.filter(status='confirmed')
        for reg in confirmed:
            try:
                send_cancellation_email(reg, reason='Event has been cancelled by the organizer.')
            except Exception:
                pass
        return Response({'detail': 'Event cancelled and participants notified.'})

    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        event = self.get_object()
        if event.organizer != request.user and request.user.role != 'admin':
            return Response({'detail': 'Forbidden.'}, status=403)

        registrations = event.registrations.all()
        total_registered = registrations.count()
        confirmed = registrations.filter(status='confirmed').count()
        pending = registrations.filter(status='pending').count()
        cancelled = registrations.filter(status='cancelled').count()
        fill_rate = round((confirmed / event.capacity * 100), 2) if event.capacity else 0

        return Response({
            'total_registered': total_registered,
            'confirmed': confirmed,
            'pending': pending,
            'cancelled': cancelled,
            'fill_rate': fill_rate,
            'available_spots': event.available_spots,
            'capacity': event.capacity,
        })
