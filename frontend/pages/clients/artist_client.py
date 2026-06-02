from . import api_client


def _items(data) -> list:
    if isinstance(data, list):
        return data
    if isinstance(data, dict) and isinstance(data.get('items'), list):
        return data['items']
    return []


def search(query: str, genre: str = '', request=None) -> list[dict]:

    params = {'q': query, 'page': 1, 'page_size': 10}
    if genre:
        params['genre'] = genre
    data = api_client.get_json(
        '/api/artists', request=request, params=params, default={}
    )
    return [_to_vault(a) for a in _items(data)]


def get(name: str, request=None) -> dict | None:
    data = api_client.get_json(f'/api/artists/{name}', request=request, default=None)
    return _to_vault(data) if isinstance(data, dict) else None


def _to_vault(artist: dict) -> dict:
    name = artist.get('name', '')
    external_urls = artist.get('external_urls') or {}
    return {
        'id': name,
        'artist': name,
        'image': artist.get('avatar', ''),
        'external_url': external_urls.get('spotify', ''),
        'self': artist.get('self'),
        'albums': artist.get('albums'),
        'reviews': artist.get('reviews'),
    }
