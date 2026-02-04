# Dimmel Knowledge Hub (MVP)

Plataforma interna para cargar documentación técnica y consultar con chat RAG, con control de permisos por rol.

## Stack
- Backend: FastAPI + SQLAlchemy + pgvector
- Frontend: React (Vite)
- DB: Postgres + pgvector
- Embeddings y generación: OpenAI Responses API

## Requisitos
- Docker + Docker Compose
- OpenAI API key (para embeddings y chat)

## Setup rápido

```bash
cd infra
OPENAI_API_KEY=tu_key docker compose up --build
```

Servicios:
- API: http://localhost:8000
- Web: http://localhost:5173

## Usuarios demo
- admin@dimmel.com / admin123
- planner@dimmel.com / planner123

## Flujo principal
1. Ingresa con usuario demo.
2. Subir documento con metadatos obligatorios.
3. Preguntar en el chat y ver fuentes.
4. Filtrar biblioteca por tipo, área y vigencia.

## Variables de entorno
| Variable | Descripción | Default |
| --- | --- | --- |
| DATABASE_URL | URL de Postgres | `postgresql+psycopg2://dimmel:password@db:5432/dimmel` |
| JWT_SECRET | Secreto JWT | `change-me` |
| OPENAI_API_KEY | API key OpenAI | - |
| OPENAI_MODEL | Modelo de respuestas | `gpt-4o-mini` |
| OPENAI_EMBEDDING_MODEL | Modelo embeddings | `text-embedding-3-small` |
| MAX_UPLOAD_MB | Límite de subida | `25` |
| UPLOAD_DIR | Directorio de uploads | `/data/uploads` |

## Endpoints principales
- `POST /auth/register`
- `POST /auth/login`
- `POST /documents/upload`
- `GET /documents`
- `GET /documents/{id}`
- `POST /chat`
- `GET /chat/{thread_id}`

## Testing
```bash
cd apps/api
pytest
```

## Integración futura con SAP/BEAS
- Implementar servicios en `app/services/sap_connector.py` para consumir APIs reales (OData/REST).
- Recomendado: exponer endpoints internos tipo `/sap/open-orders` y `/sap/material-blocks`.
- Para SAP ECC/BEAS: evaluar OData o exportaciones planificadas a CSV/XLSX con ingestión automática.

## Documentación adicional
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- [`docs/SECURITY.md`](docs/SECURITY.md)
