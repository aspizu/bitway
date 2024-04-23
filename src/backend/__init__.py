"""Initialization code for the backend package."""

from __future__ import annotations

from pathlib import Path
from typing import TYPE_CHECKING

from reproca.app import App
from reproca.code_generation import CodeGenerator
from reproca.method import methods
from reproca.sessions import Sessions

from . import env

if TYPE_CHECKING:
    from vald import StringType

    from .models import Session


DEBUG = env.variables.get("DEBUG") == "true"
DATABASE = env.variables["DATABASE"]
print(f"{DEBUG=}, {DATABASE=}")


strtypes = []


def export_string_type(name: str, string_type: StringType) -> StringType:
    strtypes.append(f"export const {name} = " + string_type.to_typescript() + "\n")
    return string_type


sessions: Sessions[int, Session] = Sessions()


from . import blog, founder, startup, user  # noqa: E402

__all__ = ["blog", "founder", "startup", "user"]


with Path("src/frontend/api.ts").open("w") as file:
    code_generator = CodeGenerator(file)
    code_generator.write(
        """
        import {type MethodResult, App} from "reproca/app"
        import {circuitBreakerMiddleware} from "~/query"
        import {StringType} from "vald/src/index"
        const app = new App(import.meta.env.VITE_BACKEND, circuitBreakerMiddleware())
        """,
    )
    for strtype in strtypes:
        code_generator.write(strtype)
    for method in methods.values():
        code_generator.method(method)
    code_generator.resolve()


app = App(sessions)


def migrate() -> None:
    """Migrate the database."""
    from .db import db  # noqa: PLC0415

    con, cur = db()
    cur.executescript(Path("src/backend/schema.sql").read_text())
    con.commit()
