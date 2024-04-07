"""Endpoints for startups."""

from __future__ import annotations

from typing import TYPE_CHECKING

from . import service
from .db import db
from .misc import seconds_since_1970
from .models import Founder, Startup, UserSession

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
async def add_founder(
    session: UserSession, startup_id: int, founder_id: int, founded_at: int
) -> None:
    """Fails if startup is not founded by current user."""
    con, cur = db()
    if not is_startup_founded_by(cur, startup_id, session.id):
        return
    cur.execute(
        """
        INSERT INTO Founder (Startup, Founder, FoundedAt, CreatedAt) VALUES (?, ?, ?, ?)
        """,
        [startup_id, founder_id, founded_at, seconds_since_1970()],
    )
    con.commit()


@service.method
async def remove_founder(
    session: UserSession, startup_id: int, founder_id: int
) -> None:
    """Remove a founder from a startup, only founders can remove other founders."""
    con, cur = db()
    if not is_startup_founded_by(cur, startup_id, session.id):
        return
    cur.execute("SELECT COUNT(ID) Count FROM Founder WHERE Startup = ?", [startup_id])
    if cur.fetchone().Count == 1:
        return
    cur.execute(
        "DELETE FROM Founder WHERE Startup = ?, Founder = ?", [startup_id, founder_id]
    )
    con.commit()


@service.method
async def delete_startup(session: UserSession, startup_id: int) -> None:
    """Only founders can delete startups."""
    con, cur = db()
    if not is_startup_founded_by(cur, startup_id, session.id):
        return
    cur.execute("DELETE FROM Startup WHERE ID = ?", [startup_id])
    con.commit()


@service.method
async def edit_startup(
    session: UserSession,
    startup_id: int,
    name: str,
    description: str,
    banner: str,
    founded_at: int,
) -> None:
    """Only founders can edit startups."""
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
async def get_startup(startup_id: int) -> Startup | None:
    """Get a startup."""
    _con, cur = db()
    cur.execute(
        """
        SELECT Name, Description, Banner, FoundedAt, CreatedAt FROM Startup WHERE ID = ?
        """,
        [startup_id],
    )
    startup = cur.fetchone()
    if startup is None:
        return None
    cur.execute(
        """
        SELECT
        User.ID, Username, Name, Avatar, FoundedAt
        FROM Founder
        INNER JOIN User ON Founder = User.ID
        WHERE Startup = ?
        """,
        [startup_id],
    )
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
                founded_at=founder.FoundedAt,
                follower_count=1,
            )
            for founder in cur.fetchall()
        ],
    )
