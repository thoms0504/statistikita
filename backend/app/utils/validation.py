import os
import re
from typing import Iterable, Tuple

from werkzeug.datastructures import FileStorage

EMAIL_RE = re.compile(r'^[^@\s]+@[^@\s]+\.[^@\s]+$')
USERNAME_RE = re.compile(r'^[a-zA-Z0-9._-]{3,30}$')
TAG_RE = re.compile(r'^[a-z0-9][a-z0-9_-]{0,29}$')


def clean_text(value, field_name: str, *, min_len: int = 0, max_len: int | None = None, allow_empty: bool = False) -> Tuple[str | None, str | None]:
    if value is None:
        return (None, None) if allow_empty else (None, f'Field {field_name} wajib diisi')
    text = str(value).strip()
    if not text:
        return (None, None) if allow_empty else (None, f'Field {field_name} wajib diisi')
    if min_len and len(text) < min_len:
        return None, f'{field_name} minimal {min_len} karakter'
    if max_len and len(text) > max_len:
        return None, f'{field_name} maksimal {max_len} karakter'
    return text, None


def validate_username(value) -> Tuple[str | None, str | None]:
    text, err = clean_text(value, 'username', min_len=3, max_len=30)
    if err:
        return None, err
    if not USERNAME_RE.match(text):
        return None, 'Username hanya boleh huruf, angka, titik, garis bawah, atau minus'
    return text, None


def validate_email(value) -> Tuple[str | None, str | None]:
    if value is None:
        return None, None
    text = str(value).strip()
    if not text:
        return None, None
    if len(text) > 120:
        return None, 'Email maksimal 120 karakter'
    if not EMAIL_RE.match(text):
        return None, 'Format email tidak valid'
    return text, None


def validate_password(value, *, min_len: int = 6, max_len: int = 128) -> Tuple[str | None, str | None]:
    text, err = clean_text(value, 'password', min_len=min_len, max_len=max_len)
    if err:
        return None, err
    return text, None


def validate_enum(value, allowed: Iterable[str], field_name: str, *, allow_empty: bool = True) -> Tuple[str | None, str | None]:
    if value is None:
        return (None, None) if allow_empty else (None, f'{field_name} tidak boleh kosong')
    text = str(value).strip()
    if not text:
        return (None, None) if allow_empty else (None, f'{field_name} tidak boleh kosong')
    if text not in allowed:
        return None, f'{field_name} tidak valid'
    return text, None


def normalize_tags(values: Iterable[str], *, max_tags: int = 10) -> Tuple[list[str], str | None]:
    tags: list[str] = []
    for raw in values:
        if raw is None:
            continue
        tag = str(raw).strip().lower()
        if not tag:
            continue
        if not TAG_RE.match(tag):
            return [], 'Tag hanya boleh huruf kecil, angka, garis bawah, atau minus (maks 30 karakter)'
        if tag not in tags:
            tags.append(tag)
        if len(tags) > max_tags:
            return [], f'Maksimal {max_tags} tag'
    return tags, None


def _get_file_size(file: FileStorage) -> int | None:
    if getattr(file, 'content_length', None):
        return file.content_length
    try:
        pos = file.stream.tell()
        file.stream.seek(0, os.SEEK_END)
        size = file.stream.tell()
        file.stream.seek(pos)
        return size
    except Exception:
        return None


def validate_file(file: FileStorage, *, allowed_exts: set[str], allowed_mimes: set[str] | None, max_bytes: int | None) -> Tuple[str | None, str | None]:
    if not file or not file.filename:
        return None, 'File tidak valid'
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed_exts:
        return None, 'Format file tidak didukung'
    if allowed_mimes and file.mimetype not in allowed_mimes:
        return None, 'Tipe file tidak didukung'
    size = _get_file_size(file)
    if size is not None and max_bytes and size > max_bytes:
        return None, f'Ukuran file maksimal {int(max_bytes / 1024 / 1024)} MB'
    return ext, None
