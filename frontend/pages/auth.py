"""A lightweight user object backed by the REST API, not the Django ORM.

Templates use ``{% if user.is_authenticated %}`` and ``{{ user }}``. To keep
those working without Django's auth framework, the middleware attaches an
``ApiUser`` to every request and a context processor exposes it as ``user``.
"""

from __future__ import annotations


class ApiUser:
    """Wraps the JSON returned by ``GET /api/auth/me`` (or None if anonymous)."""

    def __init__(self, data: dict | None):
        # Use object.__setattr__ to avoid triggering __getattr__ during init.
        object.__setattr__(self, '_data', data or {})

    @property
    def is_authenticated(self) -> bool:
        return bool(self._data)

    @property
    def is_anonymous(self) -> bool:
        return not self._data

    @property
    def username(self) -> str:
        return self._data.get('username', '')

    def __getattr__(self, item):
        # Only called when normal attribute lookup fails.
        data = object.__getattribute__(self, '_data')
        return data.get(item, '')

    def __bool__(self) -> bool:
        return bool(self._data)

    def __str__(self) -> str:
        return self._data.get('username', '')
