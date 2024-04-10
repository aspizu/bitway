"""Endpoints for startups."""

from __future__ import annotations

import contextlib
import sqlite3
from typing import TYPE_CHECKING

from . import service
from .db import db
from .misc import seconds_since_1970
from .models import BIO, NAME, URL, Follower, Followers, Founder, Startup, UserSession

if TYPE_CHECKING:
    from sqlite3 import Cursor


def is_startup_founded_by(cur: Cursor, startup_id: int, founder_id: int) -> bool:
    """Check if startup is founded by user."""
    cur.execute(
        "SELECT ID FROM Founder WHERE Startup = ? AND Founder = ?",
        [startup_id, founder_id],
    )
    return cur.fetchone() is not None


@service.method
async def create_startup(
    session: UserSession, name: str, description: str, banner: str, founded_at: int
) -> int | None:
    """Create a startup."""
    if NAME.is_invalid(name) or BIO.is_invalid(description) or URL.is_invalid(banner):
        return None
    con, cur = db()
    cur.execute(
        """
        INSERT INTO Startup (Name, Description, Banner, FoundedAt, CreatedAt)
        VALUES (?, ?, ?, ?, ?)
        """,
        [name, description, banner, founded_at, seconds_since_1970()],
    )
    startup_id = cur.lastrowid
    if startup_id is None:
        return None
    cur.execute(
        """
        INSERT INTO Founder (Startup, Founder, FoundedAt, CreatedAt) VALUES (?, ?, ?, ?)
        """,
        [startup_id, session.id, founded_at, seconds_since_1970()],
    )
    con.commit()
    return startup_id


@service.method
async def delete_startup(session: UserSession, startup_id: int) -> None:
    """Only founders can delete startups."""
    con, cur = db()
    if not is_startup_founded_by(cur, startup_id, session.id):
        return
    cur.execute("DELETE FROM Startup WHERE ID = ?", [startup_id])
    con.commit()


@service.method
async def update_startup(
    session: UserSession,
    startup_id: int,
    name: str,
    description: str,
    banner: str,
    founded_at: int,
) -> None:
    """Only founders can edit startups."""
    if NAME.is_invalid(name) or BIO.is_invalid(description) or URL.is_invalid(banner):
        return
    con, cur = db()
    if not is_startup_founded_by(cur, startup_id, session.id):
        return
    cur.execute(
        """
        UPDATE Startup
        SET Name = ?, Description = ?, Banner = ?, FoundedAt = ?
        WHERE ID = ?
        """,
        [name, description, banner, founded_at, startup_id],
    )
    con.commit()


@service.method
async def get_startup(session: UserSession | None, startup_id: int) -> Startup | None:
    """Get a startup."""
    _con, cur = db()
    cur.execute(
        """
        SELECT
            Name,
            Description,
            Banner,
            FoundedAt,
            CreatedAt,
            (SELECT COUNT(ID) FROM StartupFollower WHERE Following = Startup.ID)
            FollowerCount,
            (
                SELECT TRUE FROM StartupFollower
                WHERE Following = Startup.ID AND Follower = ?
            )
            IsFollowing
        FROM Startup WHERE ID = ?
        """,
        [session and session.id, startup_id],
    )
    startup = cur.fetchone()
    if startup is None:
        return None
    cur.execute(
        """
        SELECT User.ID, Username, Name, Avatar, StartupFollower.CreatedAt
        FROM StartupFollower
        INNER JOIN User ON User.ID = Follower
        WHERE
            Following = ?
            AND Follower IN (SELECT Following FROM UserFollower WHERE Follower = ?)
        LIMIT 4
        """,
        [startup_id, session and session.id],
    )
    followers = cur.fetchall()
    cur.execute(
        """
        SELECT
            User.ID,
            Username,
            Name,
            Avatar,
            Keynote,
            FoundedAt,
            (SELECT COUNT(ID) FROM UserFollower WHERE Following = User.ID)
            FollowerCount
        FROM Founder
        INNER JOIN User ON Founder = User.ID
        WHERE Startup = ?
        """,
        [startup_id],
    )
    founders = cur.fetchall()
    return Startup(
        id=startup_id,
        name=startup.Name,
        description=startup.Description,
        banner=startup.Banner,
        founded_at=startup.FoundedAt,
        created_at=startup.CreatedAt,
        founders=[
            Founder(
                id=founder.ID,
                username=founder.Username,
                name=founder.Name,
                avatar=founder.Avatar,
                keynote=founder.Keynote,
                founded_at=founder.FoundedAt,
                follower_count=founder.FollowerCount,
            )
            for founder in founders
        ],
        followers=Followers(
            mutuals=[
                Follower(
                    id=follower.ID,
                    username=follower.Username,
                    name=follower.Name,
                    avatar=follower.Avatar,
                    created_at=follower.CreatedAt,
                )
                for follower in followers
            ],
            follower_count=startup.FollowerCount,
            is_following=bool(startup.IsFollowing),
        ),
    )


@service.method
async def follow_startup(session: UserSession, startup_id: int) -> None:
    """Follow a startup."""
    con, cur = db()
    with contextlib.suppress(sqlite3.IntegrityError):
        cur.execute(
            """
            INSERT INTO StartupFollower (Follower, Following, CreatedAt)
            VALUES (?, ?, ?)
            """,
            [session.id, startup_id, seconds_since_1970()],
        )
    con.commit()


@service.method
async def unfollow_startup(session: UserSession, startup_id: int) -> None:
    """Unfollow a startup."""
    con, cur = db()
    cur.execute(
        "DELETE FROM StartupFollower WHERE Follower = ? AND Following = ?",
        [session.id, startup_id],
    )
    con.commit()
