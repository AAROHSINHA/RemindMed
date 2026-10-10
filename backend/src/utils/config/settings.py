from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    DB_CONNECTION: str
    JWT_SECRET: str
    # Path to the Google service-account JSON. Optional: falls back to the standard
    # GOOGLE_APPLICATION_CREDENTIALS environment variable.
    GOOGLE_APPLICATION_CREDENTIALS: str | None = None
    GEMINI_API_KEY: str | None = None
    GEMINI_MODEL: str | None = None

# Object
settings = Settings() # now whenever we need DB_CONNECTION, we will import object settings