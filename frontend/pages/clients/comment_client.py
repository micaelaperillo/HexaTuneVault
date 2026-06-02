
from . import api_client
from . import user_client
from .format_utils import date_only
from .image_client import DEFAULT_PROFILE_IMAGE as DEFAULT_AVATAR

BASE = '/api/comments'


def _id_from(link: str, default: str = '') -> str:
    if not link:
        return default
    return link.rstrip('/').rsplit('/', 1)[-1]


def _viewer_id(request) -> str | None:
    user = getattr(request, 'user', None)
    if user is not None and getattr(user, 'is_authenticated', False):
        return str(user.id)
    return None


def _page_items(data) -> list:
    if isinstance(data, list):
        return data
    if isinstance(data, dict) and isinstance(data.get('items'), list):
        return data['items']
    return []


def list_for(review_id, request=None) -> list[dict]:
    data = api_client.get_json(
        BASE, request=request,
        params={'review_id': str(review_id), 'page': 1, 'page_size': 10},
        default={},
    )
    viewer_id = _viewer_id(request)
    author_cache: dict[str, tuple[str, dict]] = {}
    return [
        _to_comment(c, viewer_id, request, author_cache, with_replies=True)
        for c in _page_items(data)
    ]


def counts_by_subject(request=None) -> dict[str, int]:
    data = api_client.get_json(
        BASE, request=request, params={'page': 1, 'page_size': 10}, default={},
    )
    counts: dict[str, int] = {}
    for c in _page_items(data):
        key = _id_from(c.get('review'))
        counts[key] = counts.get(key, 0) + 1
    return counts


def create(content, review_id, created_by, parent_comment_id=None, request=None):
    body = {
        'content': content,
        'parent_review_id': int(review_id),
    }
    if parent_comment_id is not None:
        body['parent_comment_id'] = int(parent_comment_id)
    return api_client.post(BASE, request=request, json=body)


def set_like(comment_id, user_id, liked, request=None):
    if liked:
        return api_client.put(f'{BASE}/{comment_id}/likes', request=request)
    return api_client.delete(f'{BASE}/{comment_id}/likes', request=request)


def toggle_like(comment_id, user_id, request=None):
    currently_liked = has_liked(comment_id, user_id, request=request)
    return set_like(comment_id, user_id, not currently_liked, request=request)


def has_liked(comment_id, user_id, request=None) -> bool:
    response = api_client.get(f'{BASE}/{comment_id}/like', request=request)
    return response is not None and response.status_code == 204


def _replies(comment_id, viewer_id, request, cache) -> list[dict]:
    data = api_client.get_json(f'{BASE}/{comment_id}/replies', request=request, default=[])
    if not isinstance(data, list):
        return []
    return [_to_comment(c, viewer_id, request, cache, with_replies=False) for c in data]


def _author(author_id, request, cache) -> tuple[str, dict]:
    if author_id in cache:
        return cache[author_id]
    profile = user_client.get(author_id, request=request) if author_id else None
    if profile:
        username = profile.get('user') or author_id
        info = {
            'profileimg': {'url': profile.get('profileimg') or DEFAULT_AVATAR},
        }
    else:
        username = author_id
        info = {'profileimg': {'url': DEFAULT_AVATAR}}
    cache[author_id] = (username, info)
    return username, info


def _to_comment(c: dict, viewer_id, request, cache, with_replies=True) -> dict:
    comment_id = _id_from(c.get('self'))
    author_id = _id_from(c.get('author'))
    username, user_info = _author(author_id, request, cache)
    replies = _replies(comment_id, viewer_id, request, cache) if with_replies else []
    is_liked = viewer_id is not None and has_liked(comment_id, viewer_id, request=request)
    return {
        'comment': {
            'id': comment_id,
            'user': username,
            'content': c.get('content', ''),
            'date': date_only(c.get('created_at', '')),
        },
        'user': user_info,
        'likes': c.get('likes', 0),
        'is_liked': is_liked,
        'replies': replies,
        'replies_count': len(replies),
    }
