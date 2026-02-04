import os
import tempfile
import importlib

import pytest
from fastapi.testclient import TestClient


@pytest.fixture(scope="session")
def test_client():
    temp_dir = tempfile.mkdtemp()
    os.environ["DATABASE_URL"] = "sqlite:///./test.db"
    os.environ["UPLOAD_DIR"] = temp_dir
    os.environ["OPENAI_API_KEY"] = ""

    from app import main

    importlib.reload(main)
    client = TestClient(main.app)
    yield client
