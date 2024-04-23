"""Endpoints for user management."""

from __future__ import annotations

import contextlib
import sqlite3

from reproca.credentials import Credentials  # noqa: TCH002
from reproca.method import method

from . import sessions
from .blog import get_poll
from .db import Row, db
from .misc import seconds_since_1970
from .models import (
    BIO,
    EMAIL,
    NAME,
    PASSWORD,
    URL,
    USERNAME,
    Follower,
    Followers,
    Session,
    User,
    UserBlog,
    UserHandle,
    UserStartup,
)
from .password import (
    hash_password,
    is_password_matching,
    password_needs_rehash,
)


@method
async def get_session(session: Session | None) -> Session | None:
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


@method
async def login(credentials: Credentials, username: str, password: str) -> bool:
    """Login to account."""
    if USERNAME.is_invalid(username) or PASSWORD.is_invalid(password):
        return False
    con, cur = db()
    cur.execute(
        """
        SELECT ID, Password, Name, Email, Avatar, Link, Bio, CreatedAt, LastSeenAt
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
    credentials.set_session(
        sessions.create(
            row.ID,
            Session(
                id=row.ID,
                username=username,
                name=row.Name,
                email=row.Email,
                avatar=row.Avatar,
                link=row.Link,
                bio=row.Bio,
                created_at=row.CreatedAt,
                last_seen_at=row.LastSeenAt,
            ),
        ),
    )
    return True


@method
async def logout(credentials: Credentials) -> None:
    """Logout from account."""
    if sessionid := credentials.get_session():
        sessions.remove_by_sessionid(sessionid)
    credentials.set_session(None)


@method
async def register(
    username: str,
    password: str,
    name: str,
    email: str,
    avatar: str,
    bio: str,
    link: str,
) -> bool:
    """Register new user."""
    if (
        USERNAME.is_invalid(username)
        or PASSWORD.is_invalid(password)
        or NAME.is_invalid(name)
        or EMAIL.is_invalid(email)
        or URL.is_invalid(avatar)
        or BIO.is_invalid(bio)
        or URL.is_invalid(link)
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
        User (Username, Password, Name, Email, Avatar, Bio, Link, CreatedAt, LastSeenAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        [
            username,
            hash_password(password, created_at),
            name,
            email,
            avatar,
            bio,
            link,
            created_at,
            created_at,
        ],
    )
    con.commit()
    return True


@method
async def set_password(
    session: Session,
    credentials: Credentials,
    old_password: str,
    new_password: str,
) -> bool:
    """Change password if old password is given, requires user be logged-in."""
    if PASSWORD.is_invalid(old_password) or PASSWORD.is_invalid(new_password):
        return False
    con, cur = db()
    cur.execute("SELECT Password FROM User WHERE ID = ?", [session.id])
    user: Row | None = cur.fetchone()
    if user is None:
        msg = "User deleted while logged-in."
        raise ValueError(msg)
    if not is_password_matching(user.Password, old_password, session.created_at):
        return False
    cur.execute(
        "UPDATE User SET Password = ? WHERE ID = ?",
        [hash_password(new_password, session.created_at), session.id],
    )
    if sessionid := credentials.get_session():
        sessions.remove_by_sessionid(sessionid)
    credentials.set_session(None)
    con.commit()
    return True


@method
async def update_user(
    session: Session,
    name: str,
    email: str,
    avatar: str,
    bio: str,
    link: str,
) -> None:
    """Change given details for user."""
    if (
        NAME.is_invalid(name)
        or EMAIL.is_invalid(email)
        or URL.is_invalid(avatar)
        or URL.is_invalid(link)
        or BIO.is_invalid(bio)
    ):
        return
    con, cur = db()
    cur.execute(
        """
        UPDATE User SET Name = ?, Email = ?, Avatar = ?, Bio = ?, Link = ? WHERE ID = ?
        """,
        [name, email, avatar, bio, link, session.id],
    )
    con.commit()


@method
async def follow_user(session: Session, user_id: int) -> None:
    """Follow a user."""
    con, cur = db()
    with contextlib.suppress(sqlite3.IntegrityError):
        cur.execute(
            """
            INSERT INTO UserFollower (Follower, Following, CreatedAt) VALUES (?, ?, ?)
            """,
            [session.id, user_id, seconds_since_1970()],
        )
    con.commit()


@method
async def unfollow_user(session: Session, user_id: int) -> None:
    """Unfollow a user."""
    con, cur = db()
    cur.execute(
        "DELETE FROM UserFollower WHERE Follower = ? AND Following = ?",
        [session.id, user_id],
    )
    con.commit()


@method
async def get_user(session: Session | None, username: str) -> User | None:
    """Get all information about user."""
    _, cur = db()
    cur.execute(
        """
        SELECT
            ID,
            Name,
            Email,
            Link,
            Avatar,
            Bio,
            CreatedAt,
            LastSeenAt,
            (SELECT COUNT(ID) FROM UserFollower WHERE Following = User.ID)
            FollowerCount,
            (SELECT TRUE FROM UserFollower WHERE Follower = ? AND Following = User.ID)
            IsFollowing
        FROM User
        WHERE Username = ?
        """,
        [session and session.id, username],
    )
    user: Row | None = cur.fetchone()
    if user is None:
        return None
    cur.execute(
        """
        SELECT User.ID, Username, Name, Avatar, UserFollower.CreatedAt
        FROM UserFollower
        INNER JOIN User ON User.ID = Follower
        WHERE
            Following = ?
            AND Follower IN (SELECT Following FROM UserFollower WHERE Follower = ?)
        LIMIT 4
        """,
        [user.ID, session and session.id],
    )
    followers = cur.fetchall()
    cur.execute(
        """
        SELECT ID, Title, Content, IsPoll, CreatedAt
        FROM Blog
        WHERE Author = ?
        ORDER BY CreatedAt DESC
        """,
        [user.ID],
    )
    blogs = cur.fetchall()
    cur.execute(
        """
        SELECT
            Startup.ID,
            Name,
            Description,
            Keynote,
            Banner,
            Founder.FoundedAt,
            Startup.CreatedAt,
            (SELECT COUNT(ID) FROM StartupFollower WHERE Startup = Startup.ID)
            FollowerCount
        FROM Startup
        JOIN Founder
        ON Startup = Startup.ID
        WHERE Founder = ?
        ORDER BY Founder.FoundedAt DESC
        """,
        [user.ID],
    )
    startups = cur.fetchall()
    return User(
        id=user.ID,
        username=username,
        name=user.Name,
        email=user.Email,
        avatar=user.Avatar,
        link=user.Link,
        bio=user.Bio,
        created_at=user.CreatedAt,
        last_seen_at=user.LastSeenAt,
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
            follower_count=user.FollowerCount,
            is_following=bool(user.IsFollowing),
        ),
        blogs=[
            UserBlog(
                id=blog.ID,
                title=blog.Title,
                content=blog.Content,
                created_at=blog.CreatedAt,
                poll=get_poll(blog.ID, session, cur) if blog.IsPoll else None,
            )
            for blog in blogs
        ],
        startups=[
            UserStartup(
                id=startup.ID,
                name=startup.Name,
                description=startup.Description,
                keynote=startup.Keynote,
                banner=startup.Banner,
                created_at=startup.CreatedAt,
                founded_at=startup.FoundedAt,
                follower_count=startup.FollowerCount,
            )
            for startup in startups
        ],
    )


@method
async def find_user(username: str) -> UserHandle | None:
    """Find user by username."""
    _, cur = db()
    cur.execute(
        """
        SELECT
            ID,
            Name,
            Avatar,
            (SELECT COUNT(ID) FROM UserFollower WHERE Following = User.ID)
            FollowerCount
        FROM User
        WHERE Username = ?
        """,
        [username],
    )
    row: Row | None = cur.fetchone()
    if row is None:
        return None
    return UserHandle(
        id=row.ID,
        username=username,
        name=row.Name,
        avatar=row.Avatar,
        follower_count=row.FollowerCount,
    )


@method
async def top_users() -> list[UserHandle]:
    """Return top users."""
    _, cur = db()
    cur.execute(
        """
        SELECT
            ID,
            Username,
            Name,
            Avatar,
            (SELECT COUNT(ID) FROM UserFollower WHERE Following = User.ID)
            FollowerCount
        FROM User
        ORDER BY FollowerCount DESC
        LIMIT 5
        """
    )
    return [
        UserHandle(
            id=user.ID,
            username=user.Username,
            name=user.Name,
            avatar=user.Avatar,
            follower_count=user.FollowerCount,
        )
        for user in cur.fetchall()
    ]
