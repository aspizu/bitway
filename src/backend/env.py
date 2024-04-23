from __future__ import annotations

import os
from pathlib import Path

variables = dict(os.environ)

file = Path(".env")


if file.is_file():
    with file.open() as file:
        for line in file:
            line = line[:-1]  # noqa: PLW2901
            line = line.lstrip()  # noqa: PLW2901
            if line.startswith("#"):
                continue
            key, value = line.split("=", 1)
            key = key.strip()
            variables[key] = value
