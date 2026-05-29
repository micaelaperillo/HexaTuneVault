"""Resolve the current user from the auth-token cookie on every request.

Reads the ``token`` cookie, asks the REST API who it belongs to
(``GET /api/auth/me``), and attaches the result to ``request.user`` as an
``ApiUser``. Anonymous requests get an empty ``ApiUser``.
"""

from .clients import api_client
from .auth import ApiUser


class ApiAuthMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        data = None
        if request.COOKIES.get(api_client.TOKEN_COOKIE):
            data = api_client.get_json('/api/auth/me', request=request)
        request.user = ApiUser(data)
        request.user_data = data
        return self.get_response(request)
