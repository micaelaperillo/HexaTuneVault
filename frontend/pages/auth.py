
from __future__ import annotations


class ApiUser:

    def __init__(self, data: dict | None):
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
        data = object.__getattribute__(self, '_data')
        return data.get(item, '')

    def __bool__(self) -> bool:
        return bool(self._data)

    def __str__(self) -> str:
        return self._data.get('username', '')
