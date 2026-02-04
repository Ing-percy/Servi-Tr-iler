from datetime import datetime


def get_token(client):
    response = client.post(
        "/auth/login",
        data={"username": "admin@dimmel.com", "password": "admin123"},
    )
    assert response.status_code == 200
    return response.json()["access_token"]


def test_upload_document(test_client):
    token = get_token(test_client)
    data = {
        "title": "Procedimiento Curado",
        "type_document": "procedimiento",
        "product_family": "poste_fibra",
        "area": "produccion",
        "version": "1.0",
        "effective_date": datetime.utcnow().isoformat(),
        "tags": "curado, fibra",
    }
    files = {
        "file": ("procedimiento.txt", b"Procedimiento de curado de fibra de vidrio.", "text/plain")
    }
    response = test_client.post(
        "/documents/upload",
        data=data,
        files=files,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["title"] == "Procedimiento Curado"


def test_chat_endpoint(test_client):
    token = get_token(test_client)
    response = test_client.post(
        "/chat",
        json={"question": "curado de fibra"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    payload = response.json()
    assert "thread_id" in payload
    assert "answer" in payload
