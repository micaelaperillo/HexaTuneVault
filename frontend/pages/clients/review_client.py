from urllib.parse import unquote

from . import api_client
from . import user_client
from . import artist_client
from . import album_client
from . import podcast_client
from .image_client import DEFAULT_PROFILE_IMAGE

BASE = '/api/reviews'


def _items(data) -> list:
    """Review search now returns a paginated page ({items, page, total})."""
    if isinstance(data, list):
        return data
    if isinstance(data, dict) and isinstance(data.get('items'), list):
        return data['items']
    return []


def _id_from(link: str, default: str = '') -> str:
    if not link:
        return default
    return unquote(link.rstrip('/').rsplit('/', 1)[-1])


def _subject_ref(link: str) -> tuple[str, str]:
    """'/api/albums/Abbey Road' -> ('album', 'Abbey Road')."""
    if not link:
        return '', ''
    parts = link.strip('/').split('/', 2)
    if len(parts) < 3:
        return '', ''
    plural = parts[1]
    subject_type = plural[:-1] if plural.endswith('s') else plural
    return subject_type, unquote(parts[2])


def list_for(subject_type, subject_id, request=None) -> list[dict]:
    data = api_client.get_json(
        BASE, request=request,
        params={'subject_type': subject_type, 'subject_id': str(subject_id),
                'page': 1, 'page_size': 10},
        default=[],
    )
    author_cache: dict[str, tuple[str, dict]] = {}
    return [_to_post(r, request, author_cache) for r in _items(data)]


def get(review_id, request=None) -> dict | None:
    data = api_client.get_json(f'{BASE}/{review_id}', request=request, default=None)
    if not isinstance(data, dict):
        return None
    return _to_post(data, request, {})


def create(content, rating, subject_type, subject_id, request=None):
    return api_client.post(BASE, request=request, json={
        'content': content,
        'rating': _as_int(rating),
        'subject': {subject_type: str(subject_id)},
    })


def toggle_like(review_id, request=None):
    response = api_client.put(f'{BASE}/{review_id}/likes', request=request)
    if response is not None and response.status_code == 409:
        return api_client.delete(f'{BASE}/{review_id}/likes', request=request)
    return response


def like_count(review_id, request=None) -> int:
    data = api_client.get_json(
        f'{BASE}/{review_id}/likes/count', request=request, default={},
    )
    if isinstance(data, dict):
        return data.get('count') or 0
    return 0


def list_by_author(author_id, request=None) -> list[dict]:
    data = api_client.get_json(
        BASE, request=request,
        params={'author_id': str(author_id), 'page': 1, 'page_size': 10}, default=[],
    )
    subject_cache: dict[tuple[str, str], tuple[str, str]] = {}
    return [_to_profile_post(r, request, subject_cache) for r in _items(data)]


def feed(authors, request=None, limit=20) -> list[dict]:
    subject_cache: dict[tuple[str, str], tuple[str, str]] = {}
    items: list[dict] = []
    for author in authors:
        data = api_client.get_json(
            BASE, request=request,
            params={'author_id': str(author['id']), 'page': 1, 'page_size': 10},
            default=[],)
        for r in _items(data):
            item = _to_profile_post(r, request, subject_cache)
            item['user'] = author.get('username', '')
            items.append(item)
    return items[:limit]

def _subject(subject_type, subject_id, request, cache) -> tuple[str, str]:
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
    subject_type, subject_id = _subject_ref(r.get('subject'))
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
    author_id = _id_from(r.get('author'))
    _subject_type, subject_id = _subject_ref(r.get('subject'))
    username, user_info = _author(author_id, request, cache)
    review_id = r.get('id')
    likes = like_count(review_id, request=request)
    return {
        'author_id': author_id,
        'post': {
            'id': review_id,
            'user': username,
            'title': r.get('content', ''),
            'date': r.get('created_at', ''),
            'rating': r.get('rating', 0),
            'vault_id': subject_id,
            'likes': likes,
        },
        'user': user_info,
        'likes': likes,
        'is_liked': False,
        'comment_count': 0,
    }
