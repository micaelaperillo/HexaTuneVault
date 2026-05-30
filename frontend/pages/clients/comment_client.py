from . import api_client

# --- placeholders until the user/auth API exists -------------------------
CURRENT_USERNAME = 'anonymous'
CURRENT_USER_ID = '1'  # the like endpoint parses user_id as an integer
PLACEHOLDER_AVATAR = '/static/resources/default_profile.jpg'

TYPE_REVIEW = 'review'


def _placeholder_user() -> dict:
    # commentBox.html reads user.profileimg.url and user.isArtist.
    return {'profileimg': {'url': PLACEHOLDER_AVATAR}, 'isArtist': False}


def list_for(associated_to, associated_type: str = TYPE_REVIEW, request=None) -> list[dict]:
    data = api_client.get_json(
        '/comments', request=request,
        params={'associatedType': associated_type}, default=[],
    )
    if not isinstance(data, list):
        return []
    return [
        _to_comment(c) for c in data
        if str(c.get('associatedTo')) == str(associated_to)
    ]


def create(content, associated_to, associated_type: str = TYPE_REVIEW,
           created_by=None, request=None):
    return api_client.post('/comments', request=request, json={
        'content': content,
        'createdBy': created_by or CURRENT_USERNAME,
        'associatedTo': str(associated_to),
        'associatedType': associated_type,
    })


def toggle_like(comment_id, user_id=None, request=None):
    uid = user_id or CURRENT_USER_ID
    response = api_client.patch(
        f'/comments/{comment_id}/like', request=request, json={'user_id': uid}
    )
    if response is not None and response.status_code == 409:
        return api_client.patch(
            f'/comments/{comment_id}/unlike', request=request, json={'user_id': uid}
        )
    return response


def _to_comment(c: dict, viewer_id: str = CURRENT_USER_ID) -> dict:
    liked_by = c.get('likedBy') or []
    return {
        'comment': {
            'id': c.get('id'),
            'user': c.get('createdBy', ''),
            'content': c.get('content', ''),
            'date': c.get('createdAt', ''),
        },
        'user': _placeholder_user(),                
        'likes': len(liked_by),
        'is_liked': str(viewer_id) in [str(u) for u in liked_by],
        'replies': [],                              
        'replies_count': 0,
    }
