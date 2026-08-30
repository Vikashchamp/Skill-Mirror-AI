from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Float,
    ForeignKey
)

from backend.database import Base


# ============================================================
# USER MODEL
# ============================================================

class User(Base):
    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String,
        nullable=False
    )

    email = Column(
        String,
        unique=True,
        index=True,
        nullable=False
    )

    password_hash = Column(
        String,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# ============================================================
# INTERVIEW SESSION MODEL
# ============================================================

class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    # ========================================================
    # SPEECH METRICS
    # ========================================================

    transcript = Column(
        String,
        nullable=True
    )

    word_count = Column(
        Integer,
        nullable=True
    )

    words_per_minute = Column(
        Float,
        nullable=True
    )

    total_fillers = Column(
        Integer,
        nullable=True
    )

    pause_count = Column(
        Integer,
        nullable=True
    )

    average_pause = Column(
        Float,
        nullable=True
    )

    longest_pause = Column(
        Float,
        nullable=True
    )

    # ========================================================
    # VOICE / PROSODY
    # ========================================================

    average_pitch = Column(
        Float,
        nullable=True
    )

    pitch_variation = Column(
        Float,
        nullable=True
    )

    average_energy = Column(
        Float,
        nullable=True
    )

    energy_variation = Column(
        Float,
        nullable=True
    )

    # ========================================================
    # VIDEO / ENGAGEMENT
    # ========================================================

    engagement_score = Column(
        Float,
        nullable=True
    )

    # ========================================================
    # SESSION TIMING
    # ========================================================

    audio_duration = Column(
        Float,
        nullable=True
    )

    speaking_duration = Column(
        Float,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        index=True
    )