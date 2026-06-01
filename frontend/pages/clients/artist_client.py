from . import api_client


def search(query: str, genre: str = '', request=None) -> list[dict]:

    params = {'q': query}
    if genre:
        params['genre'] = genre
    data = api_client.get_json(
        '/api/artists', request=request, params=params, default=[]
    )
    if not isinstance(data, list):
        return []
    return [_to_vault(a) for a in data]


def get(name: str, request=None) -> dict | None:
    data = api_client.get_json(f'/api/artists/{name}', request=request, default=None)
    return _to_vault(data) if isinstance(data, dict) else None


def _to_vault(artist: dict) -> dict:
    name = artist.get('name', '')
    return {
        'id': name,                      # artist detail is keyed by name, not an id
        'artist': name,                  # title shown in previewVault
        'image': artist.get('avatar', ''),
        # Passthrough HATEOAS links for when the album/review APIs are wired.
        'self': artist.get('self'),
        'albums': artist.get('albums'),
        'reviews': artist.get('reviews'),
    }
