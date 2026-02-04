# Security Notes

## MVP scope
- Autenticación local con JWT (email + password).
- Control de acceso por rol y área documental.
- Sanitización básica: validación de extensiones permitidas, límite de tamaño configurable.

## Uploads
- Directorio de uploads aislado en volumen Docker.
- Validación de extensiones: PDF/DOCX/TXT/CSV/XLSX.
- Tamaño máximo configurable con `MAX_UPLOAD_MB`.

## Antivirus hook
- No se incluye antivirus en MVP.
- Punto de integración recomendado: al recibir un archivo, ejecutar un servicio externo de escaneo y bloquear el upload si falla.

## Secrets
- `OPENAI_API_KEY` se lee de entorno y nunca se imprime en logs.
- Cambiar `JWT_SECRET` para ambientes reales.

## Logging y auditoría
- Se registra `user_id`, pregunta y documentos consultados en `query_logs`.
