from django.urls import path
from .views import AttendancePDFView, BadgePDFView

urlpatterns = [
    path('event/<int:event_id>/pdf/', AttendancePDFView.as_view(), name='export-pdf'),
    path('badge/<int:registration_id>/', BadgePDFView.as_view(), name='export-badge'),
]
