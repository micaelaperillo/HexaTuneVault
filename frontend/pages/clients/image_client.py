from . import api_client

DEFAULT_PROFILE_IMAGE = '/static/resources/default_profile.jpg'


def upload(file, request=None) -> str | None:
    if not file:
        return None
    response = api_client.post(
        '/api/images', request=request,
        files={'img': (file.name, file, file.content_type)},
    )
    if response is not None and response.ok:
        return response.headers.get('Location')
    return None
