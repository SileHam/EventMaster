from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from apps.accounts.permissions import IsOrganizerOrAdmin
from apps.events.models import Event
from apps.registrations.models import Registration
from .pdf_service import generate_attendance_pdf, generate_badge_pdf


class AttendancePDFView(APIView):
    permission_classes = [IsOrganizerOrAdmin]

    def get(self, request, event_id):
        try:
            event = Event.objects.get(pk=event_id)
        except Event.DoesNotExist:
            return Response({'detail': 'Event not found.'}, status=status.HTTP_404_NOT_FOUND)
        if event.organizer != request.user and request.user.role != 'admin':
            return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)
        # Export de la liste de présence pour l'organisateur EMSI.
        buf = generate_attendance_pdf(event)
        response = HttpResponse(buf, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="attendance_{event_id}.pdf"'
        return response


class BadgePDFView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, registration_id):
        try:
            registration = Registration.objects.select_related('event', 'participant').get(pk=registration_id)
        except Registration.DoesNotExist:
            return Response({'detail': 'Registration not found.'}, status=status.HTTP_404_NOT_FOUND)

        is_admin = request.user.role == 'admin'
        is_organizer = request.user.role == 'organizer' and registration.event.organizer == request.user
        is_confirmed_participant = registration.participant == request.user and registration.status == 'confirmed'
        if not (is_admin or is_organizer or is_confirmed_participant):
            return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)

        buf = generate_badge_pdf(registration)
        response = HttpResponse(buf, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="badge_{registration_id}.pdf"'
        return response
