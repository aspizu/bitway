"""Endpoints for startup founders."""

from __future__ import annotations

import contextlib
import sqlite3

from reproca.method import method

from .db import db
from .misc import seconds_since_1970
from .models import BIO, Session
from .startup import is_startup_founded_by


@method
async def add_founder(
    session: Session,
    startup_id: int,
    founder_id: int,
    keynote: str,
    founded_at: int,
) -> None:
    """Fails if startup is not founded by current user."""
    if BIO.is_invalid(keynote):
        return
    con, cur = db()
    if not is_startup_founded_by(cur, startup_id, session.id):
        return
    with contextlib.suppress(sqlite3.IntegrityError):
        cur.execute(
            """
        INSERT INTO Founder (Startup, Founder, Keynote, FoundedAt, CreatedAt)
        VALUES (?, ?, ?, ?, ?)
        """,
            [startup_id, founder_id, keynote, founded_at, seconds_since_1970()],
        )
    con.commit()


@method
async def edit_founder(
    session: Session,
    startup_id: int,
    founder_id: int,
    keynote: str,
    founded_at: int,
) -> None:
    """Edit a founder."""
    if BIO.is_invalid(keynote):
        return
    con, cur = db()
    if not is_startup_founded_by(cur, startup_id, session.id):
        return
    cur.execute(
        """
        UPDATE Founder SET Keynote = ?, FoundedAt = ? WHERE Startup = ? AND Founder = ?
        """,
        [keynote, founded_at, startup_id, founder_id],
    )
    con.commit()


@method
async def remove_founder(session: Session, startup_id: int, founder_id: int) -> None:
    """Remove a founder from a startup, only founders can remove other founders."""
    con, cur = db()
    if not is_startup_founded_by(cur, startup_id, session.id):
        return
    cur.execute("SELECT COUNT(ID) Count FROM Founder WHERE Startup = ?", [startup_id])
    if cur.fetchone().Count == 1:
        return
    cur.execute(
        "DELETE FROM Founder WHERE Startup = ? AND Founder = ?",
        [startup_id, founder_id],
    )
    con.commit()
