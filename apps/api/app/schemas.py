from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: str


class UserOut(BaseModel):
    id: int
    email: EmailStr
    role: str

    class Config:
        from_attributes = True


class DocumentBase(BaseModel):
    title: str
    type_document: str
    product_family: str
    area: str
    version: str
    effective_date: date
    tags: List[str]


class DocumentOut(DocumentBase):
    id: int
    current_version: bool
    file_name: str
    mime_type: str
    created_at: datetime

    class Config:
        from_attributes = True


class DocumentDetail(DocumentOut):
    file_path: str


class ChatRequest(BaseModel):
    question: str
    thread_id: Optional[int] = None


class SourceCitation(BaseModel):
    document_id: int
    title: str
    version: str
    location: str


class ChatResponse(BaseModel):
    thread_id: int
    answer: str
    sources: List[SourceCitation]


class ChatThreadOut(BaseModel):
    id: int
    title: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class ChatMessageOut(BaseModel):
    id: int
    role: str
    content: str
    cited_sources: List[SourceCitation]
    created_at: datetime

    class Config:
        from_attributes = True


class ChatThreadDetail(BaseModel):
    thread: ChatThreadOut
    messages: List[ChatMessageOut]
