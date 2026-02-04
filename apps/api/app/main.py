import os
import uuid
from datetime import datetime
from typing import List

from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import text

from .auth import (
    create_access_token,
    get_current_user,
    get_password_hash,
    verify_password,
    ensure_role_access,
)
from .config import settings
from .db import Base, engine, get_db
from .models import User, Document, DocumentChunk, ChatThread, ChatMessage, QueryLog
from .schemas import (
    Token,
    UserCreate,
    UserOut,
    DocumentOut,
    DocumentDetail,
    ChatRequest,
    ChatResponse,
    SourceCitation,
    ChatThreadDetail,
    ChatThreadOut,
)
from .services.parsing import parse_document
from .services.chunking import chunk_text
from .services.embeddings import embed_texts
from .services.chat import generate_answer, search_chunks, rate_limit
from .services.vector_search import vector_search

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    os.makedirs(settings.upload_dir, exist_ok=True)
    if engine.dialect.name == "postgresql":
        with engine.begin() as conn:
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
    Base.metadata.create_all(bind=engine)
    seed_demo_data()


def seed_demo_data() -> None:
    db = next(get_db())
    try:
        if db.query(User).count() == 0:
            admin = User(
                email="admin@dimmel.com",
                password_hash=get_password_hash("admin123"),
                role="admin",
            )
            planner = User(
                email="planner@dimmel.com",
                password_hash=get_password_hash("planner123"),
                role="planner",
            )
            db.add_all([admin, planner])
            db.commit()
        if db.query(Document).count() == 0:
            seed_dir = os.path.join(os.path.dirname(__file__), "..", "seed_data")
            seed_files = [
                ("procedimiento_curado_fibra.txt", "procedimiento"),
                ("reporte_produccion_ots.csv", "reporte_produccion"),
                ("bom_poste_acero.txt", "BOM"),
            ]
            uploader = db.query(User).filter(User.email == "admin@dimmel.com").first()
            for filename, doc_type in seed_files:
                file_path = os.path.join(seed_dir, filename)
                if not os.path.exists(file_path):
                    continue
                with open(file_path, "rb") as file_handle:
                    content = file_handle.read()
                document = Document(
                    title=filename.replace("_", " ").split(".")[0].title(),
                    type_document=doc_type,
                    product_family="general",
                    area="produccion",
                    version="1.0",
                    effective_date=datetime.utcnow().date(),
                    tags=["seed"],
                    current_version=True,
                    file_path=file_path,
                    file_name=filename,
                    mime_type="text/plain",
                    uploaded_by=uploader.id if uploader else None,
                )
                db.add(document)
                db.flush()
                pages = parse_document(content, filename)
                chunks = chunk_text(pages)
                embeddings = embed_texts([c[0] for c in chunks])
                for idx, ((chunk, location), embedding) in enumerate(zip(chunks, embeddings)):
                    db.add(
                        DocumentChunk(
                            document_id=document.id,
                            chunk_index=idx,
                            content=chunk,
                            page=location,
                            embedding=embedding,
                        )
                    )
            db.commit()
    finally:
        db.close()


@app.post("/auth/register", response_model=UserOut)
def register(user: UserCreate, db: Session = Depends(get_db)) -> UserOut:
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    new_user = User(
        email=user.email,
        password_hash=get_password_hash(user.password),
        role=user.role,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@app.post("/auth/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)) -> Token:
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": user.id})
    return Token(access_token=token)


@app.post("/documents/upload", response_model=DocumentOut)
def upload_document(
    title: str = Form(...),
    type_document: str = Form(...),
    product_family: str = Form(...),
    area: str = Form(...),
    version: str = Form(...),
    effective_date: datetime = Form(...),
    tags: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DocumentOut:
    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing filename")
    safe_ext = os.path.splitext(file.filename)[1].lower()
    if safe_ext not in {".pdf", ".docx", ".txt", ".csv", ".xlsx"}:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    ensure_role_access(current_user, area)

    content = file.file.read()
    if len(content) > settings.max_upload_mb * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large")
    if not content:
        raise HTTPException(status_code=400, detail="Empty file")

    filename = f"{uuid.uuid4()}{safe_ext}"
    stored_path = os.path.join(settings.upload_dir, filename)
    with open(stored_path, "wb") as out_file:
        out_file.write(content)

    existing = (
        db.query(Document)
        .filter(Document.title == title, Document.type_document == type_document)
        .all()
    )
    for doc in existing:
        doc.current_version = False

    document = Document(
        title=title,
        type_document=type_document,
        product_family=product_family,
        area=area,
        version=version,
        effective_date=effective_date.date(),
        tags=[t.strip() for t in tags.split(",") if t.strip()],
        current_version=True,
        file_path=stored_path,
        file_name=file.filename,
        mime_type=file.content_type or "application/octet-stream",
        uploaded_by=current_user.id,
    )
    db.add(document)
    db.flush()

    try:
        pages = parse_document(content, file.filename)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    chunks = chunk_text(pages)
    embeddings = embed_texts([c[0] for c in chunks])
    for idx, ((chunk, location), embedding) in enumerate(zip(chunks, embeddings)):
        db.add(
            DocumentChunk(
                document_id=document.id,
                chunk_index=idx,
                content=chunk,
                page=location,
                embedding=embedding,
            )
        )

    db.commit()
    db.refresh(document)
    return document


@app.get("/documents", response_model=List[DocumentOut])
def list_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[DocumentOut]:
    allowed = ["produccion", "compras", "calidad", "comercial", "ingenieria", "gerencia"]
    if current_user.role != "admin":
        allowed = [area for area in allowed if area in ensure_allowed(current_user.role)]
    return db.query(Document).filter(Document.area.in_(allowed)).all()


def ensure_allowed(role: str) -> List[str]:
    from .auth import ROLE_PERMISSIONS

    if role == "admin":
        return ["produccion", "compras", "calidad", "comercial", "ingenieria", "gerencia"]
    return list(ROLE_PERMISSIONS.get(role, set()))


@app.get("/documents/{document_id}", response_model=DocumentDetail)
def get_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DocumentDetail:
    document = db.get(Document, document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    ensure_role_access(current_user, document.area)
    return document


@app.post("/chat", response_model=ChatResponse)
def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ChatResponse:
    try:
        rate_limit(current_user.id)
    except ValueError as exc:
        raise HTTPException(status_code=429, detail=str(exc)) from exc

    thread = None
    if request.thread_id:
        thread = db.get(ChatThread, request.thread_id)
    if thread is None:
        thread = ChatThread(user_id=current_user.id, title=request.question[:50])
        db.add(thread)
        db.flush()

    vector_hits = vector_search(db, request.question, current_user.role)
    keyword_hits = search_chunks(db, request.question, current_user.role)
    all_hits = {chunk.id: (chunk, doc) for chunk, doc in vector_hits + keyword_hits}

    context_blocks = []
    citations: List[SourceCitation] = []
    for chunk, doc in all_hits.values():
        context_blocks.append(
            f"[{doc.title} v{doc.version} {chunk.page or ''}] {chunk.content}"
        )
        citations.append(
            SourceCitation(
                document_id=doc.id,
                title=doc.title,
                version=doc.version,
                location=chunk.page or "texto",
            )
        )

    answer = generate_answer(request.question, context_blocks) if context_blocks else (
        "No encontré evidencia en la base documental. Por favor sube el documento correcto."
    )

    message = ChatMessage(
        thread_id=thread.id,
        role="assistant",
        content=answer,
        cited_sources=[c.dict() for c in citations],
    )
    user_message = ChatMessage(
        thread_id=thread.id,
        role="user",
        content=request.question,
        cited_sources=[],
    )
    db.add_all([user_message, message])

    log = QueryLog(
        user_id=current_user.id,
        question=request.question,
        document_ids=[c.document_id for c in citations],
    )
    db.add(log)
    db.commit()

    return ChatResponse(thread_id=thread.id, answer=answer, sources=citations)


@app.get("/chat/{thread_id}", response_model=ChatThreadDetail)
def get_chat_thread(
    thread_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ChatThreadDetail:
    thread = db.get(ChatThread, thread_id)
    if not thread or thread.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Thread not found")
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.thread_id == thread_id)
        .order_by(ChatMessage.created_at)
        .all()
    )
    return ChatThreadDetail(thread=thread, messages=messages)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}
