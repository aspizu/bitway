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
from starlette.responses import FileResponse
from starlette.routing import Mount, Route
from starlette.staticfiles import StaticFiles

if TYPE_CHECKING:
    from starlette.requests import Request
    from vald import StringType

    from .models import UserSession

config = Config(".env")
DEBUG = config("DEBUG", cast=bool, default=False)
ALLOW_ORIGINS = config("ALLOW_ORIGINS", cast=CommaSeparatedStrings)
DATABASE = config("DATABASE")
code_generator = CodeGenerator(Path("src/frontend/api.ts").open("w"))  # noqa: SIM115
code_generator.write(
    'import {type MethodResponse, Service} from "~/reproca"\n',
    'import {StringType} from "vald/src/index"\n',  # noqa: RUF027
    'const service = new Service(import.meta.env["VITE_BACKEND"])\n',
)


def export_string_type(name: str, string_type: StringType) -> StringType:
    code_generator.write(f"export const {name} = ", string_type.to_typescript(), "\n")
    return string_type


sessions: Sessions[int, UserSession] = Sessions()
service = Service(sessions, debug=DEBUG, code_generator=code_generator)


def load_modules(*modules: str) -> None:
    """Load the modules."""
    for module in modules:
        __import__(__name__ + "." + module, globals(), locals())


load_modules("user", "blog", "startup", "founder")


async def root(request: Request):
    """Serve the index.html file."""
    return FileResponse("dist/index.html")


code_generator.resolve()
code_generator.file.close()
app = Starlette(
    routes=[
        *service.routes,
        Route("/", root, methods=["GET"]),
        Mount("/", app=StaticFiles(directory="dist")),
        Route("/{path:path}", root, methods=["GET"]),
    ],
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
