

from . import api_client
from . import user_client
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


def list_for(review_id, request=None) -> list[dict]:
    data = api_client.get_json(
        BASE, request=request, params={'reviewId': str(review_id)}, default=[],
    )
    if not isinstance(data, list):
        return []
    viewer_id = _viewer_id(request)
    author_cache: dict[str, tuple[str, dict]] = {}
    return [
        _to_comment(c, viewer_id, request, author_cache, with_replies=True)
        for c in data
    ]


def counts_by_subject(request=None) -> dict[str, int]:
    data = api_client.get_json(BASE, request=request, default=[])
    counts: dict[str, int] = {}
    if isinstance(data, list):
        for c in data:
            key = _id_from(c.get('review'))
            counts[key] = counts.get(key, 0) + 1
    return counts


def create(content, review_id, created_by, parent_comment_id=None, request=None):
    body = {
        'content': content,
        'createdById': int(created_by),
        'parentReviewId': int(review_id),
    }
    if parent_comment_id is not None:
        body['parentCommentId'] = int(parent_comment_id)
    return api_client.post(BASE, request=request, json=body)


def set_like(comment_id, user_id, liked, request=None):
    return api_client.patch(f'{BASE}/{comment_id}/like', request=request, json={
        'user_id': int(user_id),
        'liked': bool(liked),
    })


def toggle_like(comment_id, user_id, request=None):
    currently_liked = str(user_id) in _likers(comment_id, request=request)
    return set_like(comment_id, user_id, not currently_liked, request=request)


def _likers(comment_id, request=None) -> list[str]:
    data = api_client.get_json(f'{BASE}/{comment_id}/likes', request=request, default=[])
    if not isinstance(data, list):
        return []
    return [_id_from(item.get('user')) for item in data]


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
            'isArtist': profile.get('isArtist', False),
        }
    else:
        username = author_id
        info = {'profileimg': {'url': DEFAULT_AVATAR}, 'isArtist': False}
    cache[author_id] = (username, info)
    return username, info


def _to_comment(c: dict, viewer_id, request, cache, with_replies=True) -> dict:
    comment_id = _id_from(c.get('self'))
    author_id = _id_from(c.get('author'))
    username, user_info = _author(author_id, request, cache)
    likers = _likers(comment_id, request=request)
    replies = _replies(comment_id, viewer_id, request, cache) if with_replies else []
    return {
        'comment': {
            'id': comment_id,
            'user': username,
            'content': c.get('content', ''),
            'date': c.get('createdAt', ''),
        },
        'user': user_info,
        'likes': len(likers),
        'is_liked': viewer_id is not None and str(viewer_id) in likers,
        'replies': replies,
        'replies_count': len(replies),
    }
