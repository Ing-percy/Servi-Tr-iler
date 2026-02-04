from typing import List, Tuple

from sqlalchemy import text
from sqlalchemy.orm import Session

from ..models import Document, DocumentChunk
from .embeddings import embed_texts
from .chat import allowed_areas


VECTOR_SQL = """
SELECT dc.id as chunk_id, d.id as document_id
FROM document_chunks dc
JOIN documents d ON d.id = dc.document_id
WHERE d.area = ANY(:areas)
ORDER BY dc.embedding <-> :embedding
LIMIT :limit
"""


def vector_search(
    db: Session,
    question: str,
    role: str,
    limit: int = 6,
) -> List[Tuple[DocumentChunk, Document]]:
    if db.bind and db.bind.dialect.name != "postgresql":
        return []
    areas = allowed_areas(role)
    embedding = embed_texts([question])[0]
    rows = db.execute(
        text(VECTOR_SQL),
        {"areas": areas, "embedding": embedding, "limit": limit},
    ).fetchall()
    if not rows:
        return []
    chunk_ids = [row.chunk_id for row in rows]
    chunks = (
        db.query(DocumentChunk, Document)
        .join(Document, Document.id == DocumentChunk.document_id)
        .filter(DocumentChunk.id.in_(chunk_ids))
        .all()
    )
    return chunks
