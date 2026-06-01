
from . import api_client

def search(query: str = '', artist: str = '', request=None) -> list[dict]:
    params = {}
    if query:
        params['q'] = query
    if artist:
        params['artist'] = artist
    if not params:
        return []
    data = api_client.get_json('/api/albums', request=request, params=params, default=[])
    if not isinstance(data, list):
        return []
    return [_to_vault(a) for a in data]


def get(name: str, request=None) -> dict | None:
    data = api_client.get_json(f'/api/albums/{name}', request=request, default=None)
    return _to_vault(data) if isinstance(data, dict) else None


def _to_vault(album: dict) -> dict:
    name = album.get('name', '')
    external_urls = album.get('external_urls') or {}
    return {
        'id': name,
        'album': name,
        'image': album.get('cover', ''),
        'date': album.get('releaseDate', ''),
        'total_tracks': album.get('totalTracks', ''),
        'external_url': external_urls.get('spotify', ''),
        'artists': album.get('artists') or [],
        'self': album.get('self'),
        'reviews': album.get('reviews'),
    }
