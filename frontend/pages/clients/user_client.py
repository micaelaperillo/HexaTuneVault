
import base64
import json

from . import api_client
from .image_client import DEFAULT_PROFILE_IMAGE


def decode_token(token: str) -> dict | None:
    try:
        payload = token.split('.')[1]
        payload += '=' * (-len(payload) % 4)
        return json.loads(base64.urlsafe_b64decode(payload))
    except (ValueError, IndexError, TypeError):
        return None


def authenticate(username, password):
    return api_client.post('/api/sessions', json={
        'username': username,
        'password': password,
    })


def create(username, password, email, first_name='', last_name='',
           biography='',location='' ,profile_picture_url=DEFAULT_PROFILE_IMAGE):
    return api_client.post('/api/users', json={
        'username': username,
        'password': password,
        'email': email,
        'first_name': first_name or username,
        'last_name': last_name or username,
        'biography': biography,
        'location':location,
        'profile_picture_url': profile_picture_url,
    })


def _page_items(data) -> list:
    if isinstance(data, list):
        return data
    if isinstance(data, dict) and isinstance(data.get('items'), list):
        return data['items']
    return []


def search(username='', request=None) -> list[dict]:
    params = {'page': 1, 'page_size': 10}
    if username:
        params['username'] = username
    data = api_client.get_json('/api/users', request=request, params=params, default={})
    return [_to_member(u) for u in _page_items(data)]


def get(user_id, request=None) -> dict | None:
    data = api_client.get_json(f'/api/users/{user_id}', request=request, default=None)
    return _to_profile(data) if isinstance(data, dict) else None


def get_by_username(username, request=None) -> dict | None:
    data = api_client.get_json(
        '/api/users', request=request,
        params={'username': username, 'page': 1, 'page_size': 10}, default={},
    )
    items = _page_items(data)
    if not items:
        return None
    for u in items:
        if u.get('username') == username:
            return _to_profile(u)
    return _to_profile(items[0])


def edit(user_id, request=None, **fields):
    return api_client.patch(f'/api/users/{user_id}', request=request, json=fields)


def toggle_follow(target_id, follower_id, request=None):
    response = api_client.put(
        f'/api/users/{target_id}/followers', request=request,
    )
    if response is not None and response.status_code == 409:
        return api_client.delete(
            f'/api/users/{target_id}/followers', request=request,
        )
    return response


def followers(user_id, request=None) -> dict:
    return _follow_page(f'/api/users/{user_id}/followers', request)


def following(user_id, request=None) -> dict:
    return _follow_page(f'/api/users/{user_id}/following', request)


def _id_from_link(link: str, default: str = '') -> str:
    if not link:
        return default
    return link.rstrip('/').rsplit('/', 1)[-1]


def _follow_page(path, request) -> dict:
    data = api_client.get_json(
        path, request=request, params={'page': 1, 'page_size': 10}, default={},
    )
    if not isinstance(data, dict):
        return {'count': 0, 'users': []}
    items = data.get('items') or []
    total = data.get('total', len(items))
    cache: dict[str, dict] = {}
    users = [_follow_user(_id_from_link(i.get('self')), request, cache) for i in items]
    return {'count': total, 'users': users}


def _follow_user(user_id, request, cache) -> dict:
    if user_id in cache:
        return cache[user_id]
    profile = get(user_id, request=request) if user_id else None
    if profile:
        info = {
            'id': user_id,
            'username': profile.get('user', ''),
            'img': profile.get('profileimg', ''),
        }
    else:
        info = {'id': user_id, 'username': user_id or '', 'img': DEFAULT_PROFILE_IMAGE}
    cache[user_id] = info
    return info


def _to_member(user: dict) -> dict:
    return {
        'id': user.get('id'),
        'user': user.get('username', ''),
        'profileimg': user.get('profile_picture_url') or DEFAULT_PROFILE_IMAGE,
    }


def _to_profile(user: dict) -> dict:
    return {
        'id': user.get('id'),
        'user': user.get('username', ''),
        'profileimg': user.get('profile_picture_url') or DEFAULT_PROFILE_IMAGE,
        'bio': user.get('biography', ''),
        'location': user.get('location',''),
        'email': user.get('email', ''),
        'firstName': user.get('first_name', ''),
        'lastName': user.get('last_name', ''),
    }
