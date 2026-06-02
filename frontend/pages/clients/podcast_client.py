from urllib.parse import quote

from . import api_client


def _items(data) -> list:
    if isinstance(data, list):
        return data
    if isinstance(data, dict) and isinstance(data.get('items'), list):
        return data['items']
    return []


def search(query: str, explicit: str = '', media_type: str = '', market: str = '', request=None) -> list[dict]:
    params = {'q': query, 'page': 1, 'page_size': 10}
    if explicit:
        params['explicit'] = explicit
    if media_type:
        params['media_type'] = media_type
    if market:
        params['market'] = market
    data = api_client.get_json(
        '/api/podcasts', request=request, params=params, default={}
    )
    return [_to_vault(p) for p in _items(data)]


def get(name: str, request=None) -> dict | None:
    data = api_client.get_json(f'/api/podcasts/{quote(name, safe="")}', request=request, default=None)
    return _to_vault(data) if isinstance(data, dict) else None


def _to_vault(podcast: dict) -> dict:
    name = podcast.get('name', '')
    external_urls = podcast.get('external_urls') or {}
    return {
        'id': name,   
        'show': name,                    
        'publisher': podcast.get('publisher', ''),
        'description': podcast.get('description', ''),
        'total_episodes': podcast.get('total_episodes', ''),
        'external_url': external_urls.get('spotify', ''),
        'image': podcast.get('avatar', ''),
        'self': podcast.get('self'),
        'reviews': podcast.get('reviews'),
    }
