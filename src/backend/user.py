"""Endpoints for user management."""

from __future__ import annotations

import re

from reproca.response import Response  # noqa: TCH002

from . import service, sessions
from .db import Row, db
from .misc import seconds_since_1970
from .models import Follower, User, UserSession
from .password import (
    hash_password,
    is_password_matching,
    is_password_ok,
    password_needs_rehash,
)

USERNAME_RE = re.compile(r"[a-zA-Z0-9\-_]{1,64}")
EMAIL_RE = re.compile(
    r"^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$",
)


def is_username_ok(username: str) -> bool:
    """Return true if username is valid."""
    return bool(USERNAME_RE.fullmatch(username))


def is_email_ok(email: str) -> bool:
    """Return true if email is valid."""
    return bool(EMAIL_RE.fullmatch(email))


def username_to_name(username: str) -> str:
    """Convert username to name."""
    parts = username.split("_")
    return " ".join(part.capitalize() for part in parts)


@service.method
async def get_session(session: UserSession | None) -> UserSession | None:
    """Return session user."""
    if session is not None:
        con, cur = db()
        session.last_seen_at = seconds_since_1970()
        cur.execute(
            "UPDATE User SET LastSeenAt = ? WHERE ID = ?",
            [session.last_seen_at, session.id],
        )
        con.commit()
    return session


@service.method
async def login(response: Response, username: str, password: str) -> bool:
    """Login to account."""
    if not (is_username_ok(username) and is_password_ok(password)):
        return False
    con, cur = db()
    cur.execute(
        """
        SELECT ID, Password, Name, Email, Avatar, Link, CreatedAt, LastSeenAt
        FROM User
        WHERE Username = ?
        """,
        [username],
    )
    row: Row | None = cur.fetchone()
    if row is None or not is_password_matching(row.Password, password, row.CreatedAt):
        return False
    if password_needs_rehash(row.Password):
        cur.execute(
            "UPDATE User SET Password = ? WHERE ID = ?",
            [hash_password(password, row.CreatedAt), row.ID],
        )
        con.commit()
    response.set_session(
        sessions.create(
            row.ID,
            UserSession(
                id=row.ID,
                username=username,
                name=row.Name,
                email=row.Email,
                avatar=row.Avatar,
                link=row.Link,
                created_at=row.CreatedAt,
                last_seen_at=row.LastSeenAt,
            ),
        ),
    )
    return True


@service.method
async def logout(response: Response) -> None:
    """Logout from account."""
    response.logout()


@service.method
async def register(
    username: str,
    password: str,
    name: str,
    email: str,
) -> bool:
    """Register new user."""
    if not (
        is_username_ok(username) and is_password_ok(password) and is_email_ok(email)
    ):
        return False
    con, cur = db()
    cur.execute("SELECT ID FROM User WHERE Username = ?", [username])
    if cur.fetchone():
        return False
    created_at = seconds_since_1970()
    cur.execute(
        """
        INSERT INTO
        User (Username, Password, Name, Email, CreatedAt, LastSeenAt)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        [
            username,
            hash_password(password, created_at),
            name,
            email,
            created_at,
            created_at,
        ],
    )
    con.commit()
    return True


@service.method
async def set_password(
    session: UserSession,
    response: Response,
    old_password: str,
    new_password: str,
) -> bool:
    """Change password if old password is given, requires user be logged-in."""
    if not (is_password_ok(old_password) and is_password_ok(new_password)):
        return False
    con, cur = db()
    cur.execute("SELECT Password FROM User WHERE ID = ?", [session.id])
    row: Row | None = cur.fetchone()
    if row is None:
        msg = "User deleted while logged-in."
        raise Exception(msg)
    if not is_password_matching(row.Password, old_password, session.created_at):
        return False
    cur.execute(
        "UPDATE User SET Password = ? WHERE ID = ?",
        [hash_password(new_password, session.created_at), session.id],
    )
    response.logout()
    con.commit()
    return True


@service.method
async def update_user(
    session: UserSession,
    avatar: str | None,
    link: str | None,
    email: str | None,
    name: str | None,
    bio: str | None,
) -> None:
    """Change given details for user."""
    params = []
    fields = []
    if avatar is not None:
        fields.append("Avatar = ?")
        params.append(avatar)
    if link is not None:
        fields.append("Link = ?")
        params.append(link)
    if email is not None and is_email_ok(email):
        fields.append("Email = ?")
        params.append(email)
    if name is not None:
        fields.append("Name = ?")
        params.append(name)
    if bio is not None:
        fields.append("Bio = ?")
        params.append(bio)
    if fields:
        con, cur = db()
        update_query = f"UPDATE User SET {', '.join(fields)} WHERE ID = ?"  # noqa: S608
        params.append(session.id)
        cur.execute(update_query, params)
        con.commit()


@service.method
async def follow_user(session: UserSession, user_id: int) -> None:
    """Follow a user."""
    con, cur = db()
    cur.execute(
        "INSERT INTO UserFollower (Follower, Following, CreatedAt) VALUES (?, ?, ?)",
        [session.id, user_id, seconds_since_1970()],
    )
    con.commit()


@service.method
async def unfollow_user(session: UserSession, user_id: int) -> None:
    """Unfollow a user."""
    con, cur = db()
    cur.execute(
        "DELETE FROM UserFollower WHERE Follower = ? AND Following = ?",
        [session.id, user_id],
    )
    con.commit()


@service.method
async def get_user(username: str) -> User | None:
    """Get all information about user."""
    _, cur = db()
    cur.execute(
        """
        SELECT ID, Name, Email, Link, Avatar, Bio, CreatedAt, LastSeenAt
        FROM User
        WHERE Username = ?
        """,
        [username],
    )
    row: Row | None = cur.fetchone()
    if row is None:
        return None
    cur.execute(
        """
        SELECT User.ID, Username, Name, Avatar, F.CreatedAt
        FROM User INNER JOIN UserFollower F
        WHERE Following = ? AND User.ID = Follower
        """,
        [row.ID],
    )
    followers = [
        Follower(
            id=row.ID,
            username=row.Username,
            name=row.Name,
            avatar=row.Avatar,
            created_at=row.CreatedAt,
        )
        for row in cur.fetchall()
    ]
    cur.execute(
        """
        SELECT User.ID, Username, Name, Avatar, F.CreatedAt
        FROM User INNER JOIN UserFollower F
        WHERE Follower = ? AND User.ID = Following
        """,
        [row.ID],
    )
    following = [
        Follower(
            id=row.ID,
            username=row.Username,
            name=row.Name,
            avatar=row.Avatar,
            created_at=row.CreatedAt,
        )
        for row in cur.fetchall()
    ]
    return User(
        id=row.ID,
        username=username,
        name=row.Name,
        email=row.Email,
        avatar=row.Avatar,
        link=row.Link,
        created_at=row.CreatedAt,
        last_seen_at=row.LastSeenAt,
        followers=followers,
        following=following,
    )
