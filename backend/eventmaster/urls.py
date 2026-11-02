from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/events/', include('apps.events.urls')),
    path('api/registrations/', include('apps.registrations.urls')),
    path('api/exports/', include('apps.exports.urls')),
    path('api/admin/', include('apps.accounts.admin_urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
