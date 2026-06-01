

from .clients import api_client
from .clients import user_client
from .auth import ApiUser


class ApiAuthMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        data = None
        token = request.COOKIES.get(api_client.TOKEN_COOKIE)
        if token:
            payload = user_client.decode_token(token)
            if payload:
                data = {
                    'id': payload.get('sub'),
                    'username': payload.get('username', ''),
                }
                profile = user_client.get(data['id'], request=request)
                if profile:
                    data = {**profile, **data}
        request.user = ApiUser(data)
        request.user_data = data
        return self.get_response(request)
