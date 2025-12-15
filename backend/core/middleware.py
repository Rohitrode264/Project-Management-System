from django.utils.deprecation import MiddlewareMixin
from management.models import Organization

class OrganizationMiddleware(MiddlewareMixin):
    def process_request(self, request):
        slug = request.headers.get('X-Organization-Slug')
        request.organization = None
        
        if slug:
            try:
                request.organization = Organization.objects.get(slug=slug)
            except Organization.DoesNotExist:
                pass
