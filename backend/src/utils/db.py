from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from src.utils.settings import settings

Base = declarative_base()
engine = create_engine(url=settings.DB_CONNECTION)

LocalSession = sessionmaker(bind=engine)


def get_db():
    session = LocalSession()
    try:
        yield session
    finally:
        session.close()


def init_db():
    import src.utils.models  # Register all models with Base metadata

    Base.metadata.create_all(engine)

    # Automatically patch existing tables for missing columns in development
    with engine.connect() as conn:
        conn.execute(
            text("ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);")
        )
        conn.execute(
            text("CREATE UNIQUE INDEX IF NOT EXISTS ix_users_phone ON users (phone);")
        )
        conn.commit()
