"""Database related functionality."""

from __future__ import annotations

import sqlite3
from typing import Any

from . import DATABASE


class Row:
    """Represents a row in the database."""

    def __init__(
        self,
        cursor: sqlite3.Cursor,
        row: tuple[int | float | str | bytes | None, ...],
    ) -> None:
        """Initialize the Row object.

        Args:
        ----
            cursor: The database cursor.
            row: The row data.

        """
        fields = [column[0] for column in cursor.description]
        self.row = dict(zip(fields, row))

    def __getattr__(self, key: str) -> Any:  # noqa: ANN401
        """Get attribute value by key.

        Args:
        ----
            key: The attribute key.

        Returns: The attribute value.

        Raises:
        ------
            AttributeError: If the attribute key is not found.

        """
        try:
            return self.row[key]
        except KeyError:
            raise AttributeError(key) from None

    def __repr__(self) -> str:
        """Return a string representation of the Row object."""
        return repr(self.row)

    def __str__(self) -> str:
        """Return a string representation of the Row object."""
        return str(self.row)


def db() -> tuple[sqlite3.Connection, sqlite3.Cursor]:
    """Connect to the database and return the connection and cursor objects.

    Returns: The connection and cursor objects.
    """
    con = sqlite3.connect(DATABASE)
    con.row_factory = Row
    con.executescript(
        """
        PRAGMA foreign_keys = ON;
        PRAGMA journal_mode = WAL;
        PRAGMA synchronous = normal;
        PRAGMA journal_size_limit = 6144000;
        """
    )
    return con, con.cursor()
