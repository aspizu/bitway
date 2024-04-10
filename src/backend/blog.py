"""Endpoints for blogs."""

from __future__ import annotations

from typing import TYPE_CHECKING

from . import service
from .db import db
from .misc import seconds_since_1970
from .models import Blog, Poll, PollOption, UserSession

if TYPE_CHECKING:
    from sqlite3 import Cursor


@service.method
async def post_blog(
    session: UserSession,
    title: str,
    content: str,
    poll_options: list[str] | None,
) -> int | None:
    """Create a blog post."""
    if len(title.strip()) == 0 or len(content.strip()) == 0:
        return None
    if poll_options == []:
        poll_options = None
    con, cur = db()
    cur.execute(
        """
        INSERT INTO Blog (Author, Title, Content, IsPoll, CreatedAt)
        VALUES (?, ?, ?, ?, ?)
        """,
        [session.id, title, content, poll_options is not None, seconds_since_1970()],
    )
    if poll_options:
        blog_id = cur.lastrowid
        cur.executemany(
            """
            INSERT INTO PollOption (Blog, Option) VALUES (?, ?)
            """,
            ([blog_id, option] for option in poll_options),
        )
    con.commit()
    return cur.lastrowid


@service.method
async def delete_blog(session: UserSession, blog_id: int) -> None:
    """Delete a blog post."""
    con, cur = db()
    cur.execute("DELETE FROM Blog WHERE ID = ? AND Author = ?", [blog_id, session.id])
    con.commit()


@service.method
async def get_blogs(session: UserSession | None) -> list[Blog]:
    """Get all blog posts."""
    _, cur = db()
    cur.execute(
        """
        SELECT
            B.ID BlogID,
            B.Author AuthorID,
            U.Username,
            U.Name,
            U.Avatar,
            (SELECT COUNT(ID) FROM UserFollower WHERE Following = U.ID) FollowerCount,
            B.Title,
            B.IsPoll,
            B.Content,
            B.CreatedAt
        FROM Blog B
        INNER JOIN User U ON B.Author = U.ID
        ORDER BY B.CreatedAt DESC
        """
    )
    return [
        Blog(
            author_id=row.AuthorID,
            username=row.Username,
            name=row.Name,
            avatar=row.Avatar,
            follower_count=row.FollowerCount,
            blog_id=row.BlogID,
            title=row.Title,
            content=row.Content,
            poll=get_poll(row.BlogID, session, cur) if row.IsPoll else None,
            created_at=row.CreatedAt,
        )
        for row in cur.fetchall()
    ]


def get_poll(blog_id: int, session: UserSession | None, cur: Cursor) -> Poll | None:
    """Get poll for a blog post."""
    cur.execute(
        """
        SELECT O.ID, O.Option, COUNT(V.ID) Votes
        FROM PollOption O
        LEFT JOIN PollVote V ON V.Option = O.ID
        WHERE O.Blog = ?
        GROUP BY O.ID
        """,
        [blog_id],
    )
    options = [
        PollOption(id=row.ID, option=row.Option, votes=row.Votes)
        for row in cur.fetchall()
    ]
    my_vote_id = None
    if session:
        cur.execute(
            "SELECT Option FROM PollVote WHERE Blog = ? AND Voter = ?",
            [blog_id, session.id],
        )
        row = cur.fetchone()
        my_vote_id = row.Option if row else None
    return Poll(
        options=options,
        my_vote_id=my_vote_id,
    )


@service.method
async def vote_poll(session: UserSession, blog_id: int, option_id: int) -> None:
    """Vote in a poll."""
    con, cur = db()
    cur.execute(
        "SELECT ID FROM PollVote WHERE Blog = ? AND Voter = ?",
        [blog_id, session.id],
    )
    row = cur.fetchone()
    if row:
        cur.execute("UPDATE PollVote SET Option = ? WHERE ID = ?", [option_id, row.ID])
        con.commit()
        return
    cur.execute(
        """
        INSERT INTO PollVote (Blog, Option, Voter) VALUES (?, ?, ?)
        """,
        [blog_id, option_id, session.id],
    )
    con.commit()
