from . import api_client


def search(query: str, request=None) -> list[dict]:
    """Search artists by name. Returns template-ready dicts (possibly empty)."""
    data = api_client.get_json(
        '/api/artists', request=request, params={'q': query}, default=[]
    )
    if not isinstance(data, list):
        return []
    return [_to_vault(a) for a in data]


def get(name: str, request=None) -> dict | None:
    """Fetch a single artist by name. Returns a template-ready dict or None."""
    data = api_client.get_json(f'/api/artists/{name}', request=request, default=None)
    return _to_vault(data) if isinstance(data, dict) else None


def _to_vault(artist: dict) -> dict:
    """Map an ArtistResponse to the { id, image, likes, artist } template shape."""
    name = artist.get('name', '')
    return {
        'id': name,                      # artist detail is keyed by name, not an id
        'artist': name,                  # title shown in previewVault
        'image': artist.get('avatar', ''),
        'likes': '',                     # the artist API exposes no like count
        # Passthrough HATEOAS links for when the album/review APIs are wired.
        'self': artist.get('self'),
        'albums': artist.get('albums'),
        'reviews': artist.get('reviews'),
    }
