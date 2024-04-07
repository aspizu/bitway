"""Initialization code for the backend package."""

from __future__ import annotations

from pathlib import Path
from typing import TYPE_CHECKING

from reproca.code_generation import CodeGenerator
from reproca.service import Service
from reproca.sessions import Sessions
from starlette.applications import Starlette
from starlette.config import Config
from starlette.datastructures import CommaSeparatedStrings
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware

if TYPE_CHECKING:
    from .models import UserSession

config = Config(".env")
DEBUG = config("DEBUG", cast=bool, default=False)
ALLOW_ORIGINS = config("ALLOW_ORIGINS", cast=CommaSeparatedStrings)
DATABASE = config("DATABASE")
code_generator = CodeGenerator(Path("src/frontend/api.ts").open("w"))  # noqa: SIM115
code_generator.write(
    'import {type MethodResponse, Service} from "~/reproca"\n'
    'const service = new Service(import.meta.env["VITE_BACKEND"])\n',
)
sessions: Sessions[int, UserSession] = Sessions()
service = Service(sessions, debug=DEBUG, code_generator=code_generator)


def load(*modules: str) -> None:
    """Load the modules."""
    for module in modules:
        __import__(__name__ + "." + module, globals(), locals())


load("user", "blog", "startup")

code_generator.resolve()
code_generator.file.close()
app = Starlette(
    routes=service.routes,
    middleware=[
        Middleware(
            CORSMiddleware,
            allow_origins=ALLOW_ORIGINS,
            allow_methods=["GET", "POST"],
            allow_credentials=True,
        )
    ],
    debug=DEBUG,
)


def migrate() -> None:
    """Migrate the database."""
    from .db import db  # noqa: PLC0415

    con, cur = db()
    cur.executescript(Path("src/backend/schema.sql").read_text())
    con.commit()
