from rest_framework.permissions import BasePermission


class IsOrganizerOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['organizer', 'admin']


class IsOwnerOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, resource):
        if request.user.role == 'admin':
            return True
        if hasattr(resource, 'organizer'):
            return resource.organizer == request.user
        if hasattr(resource, 'participant'):
            return resource.participant == request.user
        if hasattr(resource, 'event') and hasattr(resource.event, 'organizer'):
            return resource.event.organizer == request.user
        return False
