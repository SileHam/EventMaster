from django.contrib import admin
from .models import Registration

@admin.register(Registration)
class RegistrationAdmin(admin.ModelAdmin):
    list_display = ['participant', 'event', 'status', 'registered_at']
    list_filter = ['status']
    search_fields = ['participant__email', 'event__title']
    ordering = ['-registered_at']
