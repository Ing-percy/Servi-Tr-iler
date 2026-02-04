from typing import List

from openai import OpenAI

from ..config import settings


client = OpenAI(api_key=settings.openai_api_key) if settings.openai_api_key else None


def embed_texts(texts: List[str]) -> List[List[float]]:
    if not texts:
        return []
    if client is None:
        return [[0.0] * 1536 for _ in texts]
    response = client.embeddings.create(model=settings.openai_embedding_model, input=texts)
    return [item.embedding for item in response.data]
