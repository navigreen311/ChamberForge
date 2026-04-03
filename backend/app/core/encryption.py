"""Field-level AES-256 encryption using Fernet (cryptography library)."""
from __future__ import annotations

import base64
import hashlib
from typing import Optional

from cryptography.fernet import Fernet

from app.core.config import settings


def _derive_key(secret: str) -> bytes:
    """Derive a 32-byte Fernet-compatible key from an arbitrary secret."""
    digest = hashlib.sha256(secret.encode()).digest()
    return base64.urlsafe_b64encode(digest)


def _get_fernet(key: Optional[str] = None) -> Fernet:
    secret = key or settings.JWT_SECRET
    return Fernet(_derive_key(secret))


def encrypt_field(plaintext: str, key: Optional[str] = None) -> str:
    """Encrypt a plaintext string and return a URL-safe base64 ciphertext."""
    fernet = _get_fernet(key)
    return fernet.encrypt(plaintext.encode()).decode()


def decrypt_field(ciphertext: str, key: Optional[str] = None) -> str:
    """Decrypt a Fernet ciphertext back to plaintext."""
    fernet = _get_fernet(key)
    return fernet.decrypt(ciphertext.encode()).decode()


def encrypt_dict_fields(data: dict, fields: list[str], key: Optional[str] = None) -> dict:
    """Return a copy of *data* with the specified *fields* encrypted."""
    result = dict(data)
    for field in fields:
        if field in result and isinstance(result[field], str):
            result[field] = encrypt_field(result[field], key)
    return result


def decrypt_dict_fields(data: dict, fields: list[str], key: Optional[str] = None) -> dict:
    """Return a copy of *data* with the specified *fields* decrypted."""
    result = dict(data)
    for field in fields:
        if field in result and isinstance(result[field], str):
            result[field] = decrypt_field(result[field], key)
    return result
