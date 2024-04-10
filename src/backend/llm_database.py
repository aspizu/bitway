# ruff: noqa
from __future__ import annotations
import random
from pathlib import Path
import msgspec.json
from reproca import SESSION_COOKIE_NAME
import requests

from .misc import seconds_since_1970

HOST = "http://127.0.0.1:8000"


def get_user_id(username: str) -> int:
    return requests.post(
        f"{HOST}/find_user",
        json={
            "username": username,
        },
    ).json()["id"]


def main() -> None:
    data = msgspec.json.decode(Path("llm_database.json").read_text())
    for user in data["users"]:
        requests.post(
            f"{HOST}/register",
            json={
                "avatar": "",
                **user,
            },
        )
    for follower in data["users"]:
        for _ in range(10):
            following = random.choice(data["users"])
            if follower["username"] == following["username"]:
                continue
            random.choice(data["users"])
            session = requests.post(
                f"{HOST}/login",
                json={
                    "username": follower["username"],
                    "password": follower["password"],
                },
            ).cookies.get(SESSION_COOKIE_NAME)
            following_id = get_user_id(following["username"])
            requests.post(
                f"{HOST}/follow_user",
                json={"user_id": following_id},
                cookies={SESSION_COOKIE_NAME: session},
            )
    for blog in data["blogs"]:
        user = random.choice(data["users"])
        session = requests.post(
            f"{HOST}/login",
            json={
                "username": user["username"],
                "password": user["password"],
            },
        ).cookies.get(SESSION_COOKIE_NAME)
        requests.post(
            f"{HOST}/post_blog",
            json={
                "poll_options": None,
                **blog,
            },
            cookies={SESSION_COOKIE_NAME: session},
        )
    for startup in data["startups"]:
        user = random.choice(data["users"])
        session = requests.post(
            f"{HOST}/login",
            json={
                "username": user["username"],
                "password": user["password"],
            },
        ).cookies.get(SESSION_COOKIE_NAME)
        founded_at = random.randint(955324320, seconds_since_1970())
        startup_id = requests.post(
            f"{HOST}/create_startup",
            json={
                "banner": "",
                "founded_at": founded_at,
                **startup,
            },
            cookies={SESSION_COOKIE_NAME: session},
        ).json()
        for _ in range(10):
            founder = random.choice(data["users"])
            founder_id = get_user_id(founder["username"])
            requests.post(
                f"{HOST}/add_founder",
                json={
                    "startup_id": startup_id,
                    "founder_id": founder_id,
                    "keynote": random.choice(data["keynotes"]),
                    "founded_at": random.randint(founded_at, seconds_since_1970()),
                },
                cookies={SESSION_COOKIE_NAME: session},
            )
