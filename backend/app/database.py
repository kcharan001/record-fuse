from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

# SQLite configuration requiring check_same_thread=False for async FastAPI usage
connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Dependency to provide a database session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initializes the database schema tables and auto-migrates missing columns."""
    Base.metadata.create_all(bind=engine)
    with engine.connect() as conn:
        from sqlalchemy import text
        for col_def in [
            "ALTER TABLE patients ADD COLUMN age VARCHAR(20)",
            "ALTER TABLE patients ADD COLUMN national_id_country VARCHAR(10) DEFAULT 'IN'",
            "ALTER TABLE patients ADD COLUMN national_id_type VARCHAR(50) DEFAULT 'Aadhaar'",
            "ALTER TABLE patients ADD COLUMN national_id_last4 VARCHAR(20)"
        ]:
            try:
                conn.execute(text(col_def))
            except Exception:
                pass
        conn.commit()
