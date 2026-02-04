from io import BytesIO
from typing import List, Tuple

import pandas as pd
from pypdf import PdfReader
from docx import Document


def parse_pdf(content: bytes) -> List[Tuple[str, str]]:
    reader = PdfReader(BytesIO(content))
    pages = []
    for idx, page in enumerate(reader.pages, start=1):
        text = page.extract_text() or ""
        pages.append((text, f"p.{idx}"))
    return pages


def parse_docx(content: bytes) -> List[Tuple[str, str]]:
    doc = Document(BytesIO(content))
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    text = "\n".join(paragraphs)
    return [(text, "docx")]


def parse_txt(content: bytes) -> List[Tuple[str, str]]:
    text = content.decode("utf-8", errors="ignore")
    return [(text, "texto")]


def parse_csv(content: bytes) -> List[Tuple[str, str]]:
    df = pd.read_csv(BytesIO(content))
    text = df.to_csv(index=False)
    return [(text, "csv")]


def parse_xlsx(content: bytes) -> List[Tuple[str, str]]:
    df = pd.read_excel(BytesIO(content))
    text = df.to_csv(index=False)
    return [(text, "xlsx")]


def parse_document(content: bytes, filename: str) -> List[Tuple[str, str]]:
    name = filename.lower()
    if name.endswith(".pdf"):
        return parse_pdf(content)
    if name.endswith(".docx"):
        return parse_docx(content)
    if name.endswith(".txt"):
        return parse_txt(content)
    if name.endswith(".csv"):
        return parse_csv(content)
    if name.endswith(".xlsx"):
        return parse_xlsx(content)
    raise ValueError("Unsupported file format")
