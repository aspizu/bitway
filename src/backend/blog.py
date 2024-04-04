"""Endpoints for blogs."""

from __future__ import annotations

from . import service
from .db import db
from .misc import seconds_since_1970
from .models import (
    UserBlog,
    UserSession,
)


@service.method
async def post_blog(session: UserSession, title: str, content: str) -> int | None:
    """Create a blog post."""
    if len(title.strip()) == 0 or len(content.strip()) == 0:
        return None
    con, cur = db()
    cur.execute(
        "INSERT INTO Blog (Author, Title, Content, CreatedAt) VALUES (?, ?, ?)",
        [session.id, title, content, seconds_since_1970()],
    )
    con.commit()
    return cur.lastrowid


@service.method
async def get_user_blogs(user_id: int) -> list[UserBlog]:
    """Get all blogs posted by user."""
    _con, cur = db()
    cur.execute(
        "SELECT ID, Title, Content, CreatedAt FROM Blog WHERE Author = ?", [user_id]
    )
    return [
        UserBlog(
            id=row.ID,
            title=row.Title,
            content=row.Content,
            created_at=row.CreatedAt,
        )
        for row in cur.fetchall()
    ]
