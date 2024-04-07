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
    bio: str
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
    bio: str
    created_at: int
    last_seen_at: int
    followers: list[Follower]
    following: list[Follower]
    blogs: list[UserBlog]


class Follower(Struct):
    """Follower or following."""

    id: int
    username: str
    name: str
    avatar: str
    created_at: int


class PollOption(Struct):
    """Poll Option."""

    id: int
    option: str
    votes: int


class Poll(Struct):
    """Poll."""

    options: list[PollOption]
    my_vote_id: int | None


class UserBlog(Struct):
    """Blog posted by user."""

    id: int
    title: str
    content: str
    poll: Poll | None
    created_at: int


class Blog(Struct):
    """Blog post."""

    author_id: int
    username: str
    name: str
    avatar: str
    follower_count: int
    blog_id: int
    title: str
    content: str
    poll: Poll | None
    created_at: int


class UserHandle(Struct):
    """User handle."""

    id: int
    username: str
    name: str
    avatar: str
    follower_count: int
    following_count: int


class Startup(Struct):
    """Startup."""

    id: int
    name: str
    description: str
    banner: str
    founded_at: int
    created_at: int
    founders: list[Founder]


class Founder(Struct):
    """Startup founder."""

    id: int
    username: str
    name: str
    avatar: str
    founded_at: int
    follower_count: int


class FoundUser(Struct):
    """Found User."""

    id: int
    name: str
    avatar: str
