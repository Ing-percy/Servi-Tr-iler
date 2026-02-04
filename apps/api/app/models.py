from datetime import datetime, date
from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Date,
    Boolean,
    ForeignKey,
    Text,
    JSON,
)
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector

from .db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    documents = relationship("Document", back_populates="uploader")
    threads = relationship("ChatThread", back_populates="user")


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    type_document = Column(String, nullable=False)
    product_family = Column(String, nullable=False)
    area = Column(String, nullable=False)
    version = Column(String, nullable=False)
    effective_date = Column(Date, nullable=False)
    tags = Column(JSON, default=list)
    current_version = Column(Boolean, default=True)
    file_path = Column(String, nullable=False)
    file_name = Column(String, nullable=False)
    mime_type = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    uploaded_by = Column(Integer, ForeignKey("users.id"))

    uploader = relationship("User", back_populates="documents")
    chunks = relationship("DocumentChunk", back_populates="document")


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(Integer, primary_key=True)
    document_id = Column(Integer, ForeignKey("documents.id"), index=True)
    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    page = Column(String, nullable=True)
    embedding = Column(Vector(1536))

    document = relationship("Document", back_populates="chunks")


class ChatThread(Base):
    __tablename__ = "chat_threads"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="threads")
    messages = relationship("ChatMessage", back_populates="thread")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True)
    thread_id = Column(Integer, ForeignKey("chat_threads.id"))
    role = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    cited_sources = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

    thread = relationship("ChatThread", back_populates="messages")


class QueryLog(Base):
    __tablename__ = "query_logs"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    question = Column(Text, nullable=False)
    document_ids = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
