"""Data structures used by the API."""

from __future__ import annotations

from msgspec import Struct
from vald import StringType

from . import export_string_type

USERNAME = export_string_type(
    "USERNAME",
    StringType()
    .min(3, "Username must be at least $ characters long.")
    .max(32, "Username cannot be longer than $ characters.")
    .regex(
        r"[.\-_a-zA-Z][.\-_a-zA-Z0-9]*",
        "Username can only contain letters, numbers, dots, hyphens, and underscores.",
    ),
)
PASSWORD = export_string_type(
    "PASSWORD", StringType().min(8, "Password must be at least $ characters long.")
)
EMAIL = export_string_type("EMAIL", StringType().email())
NAME = export_string_type(
    "NAME",
    StringType()
    .not_empty("Name cannot be empty.")
    .max(64, "Name cannot be longer than $ characters."),
)
BIO = export_string_type(
    "BIO", StringType().empty().max(256, "Bio cannot be longer than $ characters.")
)
URL = export_string_type(
    "URL",
    StringType().empty().url().max(1024, "URL cannot be longer than $ characters."),
)
BLOG_TITLE = export_string_type(
    "BLOG_TITLE",
    StringType()
    .not_empty("Title cannot be empty.")
    .max(128, "Title cannot be longer than $ characters."),
)
BLOG_CONTENT = export_string_type(
    "BLOG_CONTENT",
    StringType()
    .not_empty("Content cannot be empty.")
    .max(4096, "Content cannot be longer than $ characters."),
)
POLL_OPTION = export_string_type(
    "POLL_OPTION",
    StringType()
    .not_empty("Option cannot be empty.")
    .max(128, "Option cannot be longer than $ characters."),
)


class Session(Struct):
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
    followers: Followers
    blogs: list[UserBlog]
    startups: list[UserStartup]


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


class Startup(Struct):
    """Startup."""

    id: int
    name: str
    description: str
    banner: str
    founded_at: int
    created_at: int
    founders: list[Founder]
    followers: Followers


class Founder(Struct):
    """Startup founder."""

    id: int
    username: str
    name: str
    avatar: str
    keynote: str
    founded_at: int
    follower_count: int


class FoundUser(Struct):
    """Found User."""

    id: int
    name: str
    avatar: str


class Followers(Struct):
    mutuals: list[Follower]
    follower_count: int
    is_following: bool


class UserStartup(Struct):
    """User startup."""

    id: int
    name: str
    description: str
    keynote: str
    banner: str
    founded_at: int
    created_at: int
    follower_count: int
