"""Tests for field-level encryption."""
import os
import pytest

# Ensure a deterministic key for tests
os.environ.setdefault("JWT_SECRET", "test-secret-key-for-ci")

from app.core.encryption import (
    decrypt_dict_fields,
    decrypt_field,
    encrypt_dict_fields,
    encrypt_field,
)


def test_encrypt_decrypt_roundtrip():
    plaintext = "sensitive-data-12345"
    ciphertext = encrypt_field(plaintext)
    assert ciphertext != plaintext
    assert decrypt_field(ciphertext) == plaintext


def test_encrypt_decrypt_with_custom_key():
    key = "my-custom-encryption-key"
    plaintext = "hello world"
    ciphertext = encrypt_field(plaintext, key=key)
    assert decrypt_field(ciphertext, key=key) == plaintext


def test_different_plaintexts_produce_different_ciphertexts():
    a = encrypt_field("alpha")
    b = encrypt_field("beta")
    assert a != b


def test_encrypt_dict_fields():
    data = {"name": "Alice", "ssn": "123-45-6789", "age": "30"}
    encrypted = encrypt_dict_fields(data, ["ssn", "name"])
    assert encrypted["ssn"] != "123-45-6789"
    assert encrypted["name"] != "Alice"
    assert encrypted["age"] == "30"  # untouched

    decrypted = decrypt_dict_fields(encrypted, ["ssn", "name"])
    assert decrypted["ssn"] == "123-45-6789"
    assert decrypted["name"] == "Alice"


def test_encrypt_dict_fields_missing_field_ignored():
    data = {"email": "a@b.com"}
    result = encrypt_dict_fields(data, ["nonexistent"])
    assert result == data
