from __future__ import annotations

import requests
from django.conf import settings

TOKEN_COOKIE = 'token'
DEFAULT_TIMEOUT = 10  # seconds


def _headers(request):
    headers = {}
    token = request.COOKIES.get(TOKEN_COOKIE) if request else None
    if token:
        headers['Authorization'] = f'Bearer {token}'
    return headers


def _url(path: str) -> str:
    return f"{settings.API_URL.rstrip('/')}{path}"


def get(path: str, request=None, **kwargs) -> requests.Response | None:
    """GET request to the API. Returns the Response, or None on failure."""
    try:
        return requests.get(
            _url(path), headers=_headers(request), timeout=DEFAULT_TIMEOUT, **kwargs
        )
    except requests.RequestException:
        return None


def post(path: str, request=None, **kwargs) -> requests.Response | None:
    """POST request to the API. Returns the Response, or None on failure."""
    try:
        return requests.post(
            _url(path), headers=_headers(request), timeout=DEFAULT_TIMEOUT, **kwargs
        )
    except requests.RequestException:
        return None


def get_json(path: str, request=None, default=None, **kwargs):
    """GET and parse JSON. Returns ``default`` on any failure or non-2xx."""
    response = get(path, request=request, **kwargs)
    if response is not None and response.ok:
        try:
            return response.json()
        except ValueError:
            return default
    return default
