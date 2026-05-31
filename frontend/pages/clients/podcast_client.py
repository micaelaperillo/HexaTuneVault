from . import api_client


def search(query: str, explicit: str = '', media_type: str = '', market: str = '', request=None) -> list[dict]:
    params = {'q': query}
    if explicit:
        params['explicit'] = explicit
    if media_type:
        params['media_type'] = media_type
    if market:
        params['market'] = market
    data = api_client.get_json(
        '/api/podcasts', request=request, params=params, default=[]
    )
    if not isinstance(data, list):
        return []
    return [_to_vault(p) for p in data]


def get(name: str, request=None) -> dict | None:
    """Fetch a single podcast by name. Returns a template-ready dict or None."""
    data = api_client.get_json(f'/api/podcasts/{name}', request=request, default=None)
    return _to_vault(data) if isinstance(data, dict) else None


def _to_vault(podcast: dict) -> dict:
    name = podcast.get('name', '')
    external_urls = podcast.get('external_urls') or {}
    return {
        'id': name,                       # podcast detail is keyed by name, not an id
        'show': name,                    
        'publisher': podcast.get('publisher', ''),
        'description': podcast.get('description', ''),
        'total_episodes': podcast.get('total_episodes', ''),
        'external_url': external_urls.get('spotify', ''),
        'image': podcast.get('avatar', ''),
        'likes': '',                      # the podcast API exposes no like count

        'self': podcast.get('self'),
        'reviews': podcast.get('reviews'),
    }
