"""Miscelanous utilities."""

from __future__ import annotations

from time import time


def seconds_since_1970() -> int:
    """Return seconds since epoch."""
    return int(time())
