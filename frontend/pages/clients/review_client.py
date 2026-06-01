from . import api_client
from . import user_client
from . import artist_client
from . import album_client
from . import podcast_client
from .image_client import DEFAULT_PROFILE_IMAGE

BASE = '/api/reviews'


def list_for(subject_type, subject_id, request=None) -> list[dict]:
    data = api_client.get_json(
        BASE, request=request,
        params={'subject_type': subject_type, 'subject_id': str(subject_id)},
        default=[],
    )
    if not isinstance(data, list):
        return []
    author_cache: dict[str, tuple[str, dict]] = {}
    return [_to_post(r, request, author_cache) for r in data]


def get(review_id, request=None) -> dict | None:
    data = api_client.get_json(f'{BASE}/{review_id}', request=request, default=None)
    if not isinstance(data, dict):
        return None
    return _to_post(data, request, {})


def create(content, rating, subject_type, subject_id, request=None):
    return api_client.post(BASE, request=request, json={
        'content': content,
        'rating': _as_int(rating),
        'subject_type': subject_type,
        'subject_id': str(subject_id),
    })


def list_by_author(author_id, request=None) -> list[dict]:
    data = api_client.get_json(
        BASE, request=request, params={'author_id': str(author_id)}, default=[],
    )
    if not isinstance(data, list):
        return []
    subject_cache: dict[tuple[str, str], tuple[str, str]] = {}
    return [_to_profile_post(r, request, subject_cache) for r in data]


def _subject(subject_type, subject_id, request, cache) -> tuple[str, str]:
    """Resolve a review's subject to (display_name, image_url)."""
    key = (subject_type, subject_id)
    if key in cache:
        return cache[key]
    name, image = str(subject_id), ''
    if subject_type == 'artist':
        vault = artist_client.get(subject_id, request=request)
        if vault:
            name, image = vault['artist'], vault['image']
    elif subject_type == 'album':
        vault = album_client.get(subject_id, request=request)
        if vault:
            name, image = vault['album'], vault['image']
    elif subject_type == 'podcast':
        vault = podcast_client.get(subject_id, request=request)
        if vault:
            name, image = vault['show'], vault['image']
    cache[key] = (name, image)
    return name, image


def _to_profile_post(r: dict, request, cache) -> dict:
    """Shape a review for profile.html's commentBox include."""
    subject_type = r.get('subject_type', '')
    subject_id = r.get('subject_id', '')
    name, image = _subject(subject_type, subject_id, request, cache)
    return {
        'post_id': r.get('id'),
        'content': r.get('content', ''),
        'rating': r.get('rating', 0),
        'date': r.get('created_at', ''),
        'vault_vtype': subject_type,
        'vault_id': subject_id,
        'vault_name': name,
        'vault_image': image,
    }


def _as_int(value, default=0) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def _author(author_id, request, cache) -> tuple[str, dict]:
    if author_id in cache:
        return cache[author_id]
    profile = user_client.get(author_id, request=request) if author_id else None
    if profile:
        username = profile.get('user') or author_id
        info = {
            'profileimg': {'url': profile.get('profileimg') or DEFAULT_PROFILE_IMAGE},
        }
    else:
        username = author_id or ''
        info = {'profileimg': {'url': DEFAULT_PROFILE_IMAGE}}
    cache[author_id] = (username, info)
    return username, info


def _to_post(r: dict, request, cache) -> dict:
    author_id = str(r.get('author_id') or '')
    username, user_info = _author(author_id, request, cache)
    return {
        'author_id': author_id,
        'post': {
            'id': r.get('id'),
            'user': username,
            'title': r.get('content', ''),
            'date': r.get('created_at', ''),
            'rating': r.get('rating', 0),
            'vault_id': r.get('subject_id', ''),
        },
        'user': user_info,
        'likes': 0,
        'is_liked': False,
        'comment_count': 0,
    }
