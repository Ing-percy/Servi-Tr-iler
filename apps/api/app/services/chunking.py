from typing import List, Tuple


def chunk_text(pages: List[Tuple[str, str]], chunk_size: int = 800, overlap: int = 100) -> List[Tuple[str, str]]:
    chunks: List[Tuple[str, str]] = []
    for text, location in pages:
        start = 0
        text = text.strip()
        while start < len(text):
            end = min(start + chunk_size, len(text))
            chunk = text[start:end].strip()
            if chunk:
                chunks.append((chunk, location))
            start = end - overlap if end - overlap > 0 else end
    return chunks
