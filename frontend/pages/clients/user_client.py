"""Thin client for the NestJS users API.

Maps a ``UserResponseDto`` (``{id, username, firstName, lastName, email,
biography, profilePictureUrl}``) to the shapes the templates expect:
  * :func:`_to_member`  -> previewProfile.html  (user / profileimg / isArtist)
  * :func:`_to_profile` -> profile.html, settingsProfile.html

Auth is ``POST /api/users/authenticate`` returning ``{accessToken}``; the JWT
payload carries ``{sub: id, username}`` (see :func:`decode_token`). The API has
no ``/me`` endpoint, so the middleware decodes the cookie locally.

NOT in the user API (rendered as empty/placeholder until other APIs land):
``isArtist``, ``location``, follower/following lists & counts, posts,
favourites. Lookups are by numeric ``id``; username lookups go through search.
"""

import base64
import json

from . import api_client


def decode_token(token: str) -> dict | None:
    try:
        payload = token.split('.')[1]
        payload += '=' * (-len(payload) % 4)  # restore base64 padding
        return json.loads(base64.urlsafe_b64decode(payload))
    except (ValueError, IndexError, TypeError):
        return None


def authenticate(username, password):
    return api_client.post('/api/users/authenticate', json={
        'username': username,
        'password': password,
    })


def create(username, password, email, first_name='', last_name='',
           biography='', profile_picture_url=''):
    return api_client.post('/api/users', json={
        'username': username,
        'password': password,
        'email': email,
        'firstName': first_name or username,
        'lastName': last_name or username,
        'biography': biography,
        'profilePictureUrl': profile_picture_url,
    })


def search(username='', request=None) -> list[dict]:
    """Search users by username (blank = all users). Returns member dicts."""
    params = {'username': username} if username else None
    data = api_client.get_json('/api/users', request=request, params=params, default=[])
    if not isinstance(data, list):
        return []
    return [_to_member(u) for u in data]


def get(user_id, request=None) -> dict | None:
    data = api_client.get_json(f'/api/users/{user_id}', request=request, default=None)
    return _to_profile(data) if isinstance(data, dict) else None


def get_by_username(username, request=None) -> dict | None:
    data = api_client.get_json(
        '/api/users', request=request, params={'username': username}, default=[]
    )
    if not isinstance(data, list) or not data:
        return None
    for u in data:
        if u.get('username') == username:
            return _to_profile(u)
    return _to_profile(data[0])


def edit(user_id, request=None, **fields):
    return api_client.patch(f'/api/users/{user_id}', request=request, json=fields)


def toggle_follow(target_id, follower_id, request=None):
    response = api_client.patch(
        f'/api/users/{target_id}/follow', request=request,
        json={'follower_id': follower_id},
    )
    if response is not None and response.status_code == 409:
        return api_client.patch(
            f'/api/users/{target_id}/unfollow', request=request,
            json={'follower_id': follower_id},
        )
    return response


def _to_member(user: dict) -> dict:
    return {
        'id': user.get('id'),
        'user': user.get('username', ''),
        'profileimg': user.get('profilePictureUrl', ''),
        'isArtist': False,  # the user API has no artist flag
    }


def _to_profile(user: dict) -> dict:
    """Shape for profile.html / settingsProfile.html."""
    return {
        'id': user.get('id'),
        'user': user.get('username', ''),
        'profileimg': user.get('profilePictureUrl', ''),
        'bio': user.get('biography', ''),
        'location': '',     # not in the user API
        'isArtist': False,  # not in the user API
        'email': user.get('email', ''),
        'firstName': user.get('firstName', ''),
        'lastName': user.get('lastName', ''),
    }
