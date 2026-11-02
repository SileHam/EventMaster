from django.contrib import admin
from .models import Event

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['title', 'date', 'location', 'capacity',
                    'available_spots', 'status', 'organizer']
    list_filter = ['status', 'is_public', 'is_online']
    search_fields = ['title', 'location']
    ordering = ['-date']
