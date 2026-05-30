
from .auth import ApiUser


def api_user(request):
    return {'user': getattr(request, 'user', ApiUser(None))}
