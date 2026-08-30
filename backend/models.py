from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String

from backend.database import Base


# ============================================================
# USER MODEL
# ============================================================

class User(Base):

    __tablename__ = "users"

    # --------------------------------------------------------
    # PRIMARY KEY
    # --------------------------------------------------------

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # --------------------------------------------------------
    # USER NAME
    # --------------------------------------------------------

    name = Column(
        String,
        nullable=False
    )

    # --------------------------------------------------------
    # EMAIL
    # --------------------------------------------------------

    email = Column(
        String,
        unique=True,
        index=True,
        nullable=False
    )

    # --------------------------------------------------------
    # PASSWORD HASH
    # --------------------------------------------------------

    password_hash = Column(
        String,
        nullable=False
    )

    # --------------------------------------------------------
    # ACCOUNT CREATION TIME
    # --------------------------------------------------------

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )