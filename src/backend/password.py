"""Passwords hashing and verification."""

from __future__ import annotations

import argon2

argon2_hasher = argon2.PasswordHasher()


def hash_password(password: str, created_at: int) -> str:
    """Hash password."""
    return argon2_hasher.hash(f"{password}{created_at}")


def password_needs_rehash(stored_hash: str) -> bool:
    """Return true if password needs rehashing."""
    return argon2_hasher.check_needs_rehash(stored_hash)


def is_password_matching(stored_hash: str, password: str, created_at: int) -> bool:
    """Return true if password matches stored hash."""
    try:
        return argon2_hasher.verify(stored_hash, f"{password}{created_at}")
    except argon2.exceptions.Argon2Error:
        return False
