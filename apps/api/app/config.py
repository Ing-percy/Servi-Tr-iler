from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Dimmel Knowledge Hub"
    environment: str = "development"
    database_url: str = Field(
        default="postgresql+psycopg2://dimmel:password@db:5432/dimmel"
    )
    jwt_secret: str = Field(default="change-me")
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24
    upload_dir: str = "/data/uploads"
    max_upload_mb: int = 25
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    openai_embedding_model: str = "text-embedding-3-small"
    rate_limit_per_minute: int = 30

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
