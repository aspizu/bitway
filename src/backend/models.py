"""Data structures used by the API."""

from __future__ import annotations

from msgspec import Struct


class UserSession(Struct):
    """Reproca session store."""

    id: int
    username: str
    name: str
    email: str
    avatar: str
    link: str
    created_at: int
    last_seen_at: int


class User(Struct):
    """User."""

    id: int
    username: str
    name: str
    email: str
    avatar: str
    link: str
    created_at: int
    last_seen_at: int

    followers: list[Follower]
    following: list[Follower]


class Follower(Struct):
    """Follower or following."""

    id: int
    username: str
    name: str
    avatar: str
    created_at: int


class UserBlog(Struct):
    """Blog posted by user."""

    id: int
    title: str
    content: str
    created_at: int
