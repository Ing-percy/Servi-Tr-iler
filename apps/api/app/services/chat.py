from datetime import datetime, timedelta
from typing import List, Tuple

from openai import OpenAI
from sqlalchemy.orm import Session

from ..config import settings
from ..models import Document, DocumentChunk
from ..auth import ROLE_PERMISSIONS

client = OpenAI(api_key=settings.openai_api_key) if settings.openai_api_key else None

_rate_window: dict[int, List[datetime]] = {}


def rate_limit(user_id: int) -> None:
    now = datetime.utcnow()
    window = _rate_window.get(user_id, [])
    window = [ts for ts in window if ts > now - timedelta(minutes=1)]
    if len(window) >= settings.rate_limit_per_minute:
        raise ValueError("Rate limit exceeded")
    window.append(now)
    _rate_window[user_id] = window


def allowed_areas(role: str) -> List[str]:
    if role == "admin":
        return list({"produccion", "compras", "calidad", "comercial", "ingenieria", "gerencia"})
    return list(ROLE_PERMISSIONS.get(role, set()))


def search_chunks(
    db: Session,
    question: str,
    role: str,
    limit: int = 6,
) -> List[Tuple[DocumentChunk, Document]]:
    areas = allowed_areas(role)
    base_query = (
        db.query(DocumentChunk, Document)
        .join(Document, Document.id == DocumentChunk.document_id)
        .filter(Document.area.in_(areas))
    )
    results: List[Tuple[DocumentChunk, Document]] = []

    if question.strip():
        keyword_hits = (
            base_query.filter(DocumentChunk.content.ilike(f"%{question}%"))
            .limit(3)
            .all()
        )
        results.extend(keyword_hits)

    return results


def build_prompt(question: str, context_blocks: List[str]) -> str:
    context = "\n\n".join(context_blocks)
    return (
        "Eres un asistente interno para Dimmel. Responde en español. "
        "Solo usa la evidencia provista. Si no hay evidencia suficiente, di: "
        "'No encontré evidencia en la base documental' y pide subir el documento correcto.\n\n"
        f"EVIDENCIA:\n{context}\n\n"
        f"PREGUNTA: {question}"
    )


def generate_answer(question: str, context_blocks: List[str]) -> str:
    prompt = build_prompt(question, context_blocks)
    if client is None:
        return "No encontré evidencia en la base documental. Por favor sube el documento correcto."
    response = client.responses.create(
        model=settings.openai_model,
        input=[{"role": "user", "content": prompt}],
        temperature=0.2,
    )
    return response.output_text
