import pytest
from fastapi import HTTPException

from app.auth import ensure_role_access
from app.models import User


def test_role_access_allows_admin():
    user = User(id=1, email="a@a.com", password_hash="x", role="admin")
    ensure_role_access(user, "compras")


def test_role_access_blocks_non_allowed():
    user = User(id=2, email="b@b.com", password_hash="x", role="purchasing")
    with pytest.raises(HTTPException):
        ensure_role_access(user, "produccion")
