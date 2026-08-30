import os
import subprocess
import tempfile

import cv2

from fastapi import (
    Depends,
    FastAPI,
    File,
    UploadFile,
)

from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.auth import (
    hash_password,
    verify_password,
)

from backend.database import (
    engine,
    get_db,
)

from backend.models import (
    Base,
    User,
    InterviewSession,
)

from backend.reka_service import generate_ai_feedback

from video_analysis.video_analyzer import VideoAnalyzer
from video_analysis.session_analyzer import SessionAnalyzer
from speech_analysis.analyzer import analyze_speech


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="SkillMirror AI",
    description="AI-powered mock interview coaching API",
    version="1.0.0",
)


# ============================================================
# DATABASE INITIALIZATION
# ============================================================

Base.metadata.create_all(bind=engine)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# REQUEST MODELS
# ============================================================

class AnalyzeRequest(BaseModel):
    question: str
    answer: str


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():
    return {
        "message": "Welcome to SkillMirror AI"
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health_check():
    return {
        "status": "ok"
    }


# ============================================================
# REGISTER
# ============================================================

@app.post("/register")
def register_user(
    request: RegisterRequest,
    db: Session = Depends(get_db),
):
    existing_user = (
        db.query(User)
        .filter(User.email == request.email)
        .first()
    )

    if existing_user:
        return {
            "status": "error",
            "message": "Email already registered",
        }

    hashed_password = hash_password(
        request.password
    )

    user = User(
        name=request.name,
        email=request.email,
        password_hash=hashed_password,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "status": "success",
        "message": "User registered successfully",
        "user_id": user.id,
        "name": user.name,
        "email": user.email,
    }


# ============================================================
# LOGIN
# ============================================================

@app.post("/login")
def login_user(
    request: LoginRequest,
    db: Session = Depends(get_db),
):
    user = (
        db.query(User)
        .filter(User.email == request.email)
        .first()
    )

    if not user:
        return {
            "status": "error",
            "message": "Invalid email or password",
        }

    password_valid = verify_password(
        request.password,
        user.password_hash,
    )

    if not password_valid:
        return {
            "status": "error",
            "message": "Invalid email or password",
        }

    return {
        "status": "success",
        "message": "Login successful",
        "user_id": user.id,
        "name": user.name,
        "email": user.email,
    }


# ============================================================
# SIMPLE ANSWER ANALYSIS
# ============================================================

@app.post("/analyze")
def analyze_answer(
    request: AnalyzeRequest,
):
    answer_length = len(
        request.answer.split()
    )

    if answer_length < 10:

        score = 5

        feedback = (
            "Your answer is too short. "
            "Try explaining your thoughts "
            "in more detail."
        )

    elif answer_length < 30:

        score = 7

        feedback = (
            "Good start. "
            "Try adding more specific examples."
        )

    else:

        score = 9

        feedback = (
            "Good answer. "
            "Keep your response structured "
            "and specific."
        )

    return {
        "question": request.question,
        "answer": request.answer,
        "score": score,
        "feedback": feedback,
    }


# ============================================================
# INTERVIEW HISTORY
# ============================================================

@app.get("/interview-history/{user_id}")
def get_interview_history(
    user_id: int,
    db: Session = Depends(get_db),
):

    interviews = (
        db.query(InterviewSession)
        .filter(
            InterviewSession.user_id == user_id
        )
        .order_by(
            InterviewSession.created_at.desc()
        )
        .all()
    )

    return {
        "status": "success",
        "user_id": user_id,
        "total_interviews": len(interviews),

        "interviews": [

            {
                "id": interview.id,

                "created_at": (
                    interview.created_at
                ),

                "engagement_score": (
                    interview.engagement_score
                ),

                "word_count": (
                    interview.word_count
                ),

                "words_per_minute": (
                    interview.words_per_minute
                ),

                "total_fillers": (
                    interview.total_fillers
                ),

                "pause_count": (
                    interview.pause_count
                ),

                "average_pause": (
                    interview.average_pause
                ),

                "longest_pause": (
                    interview.longest_pause
                ),

                "average_pitch": (
                    interview.average_pitch
                ),

                "pitch_variation": (
                    interview.pitch_variation
                ),

                "average_energy": (
                    interview.average_energy
                ),

                "energy_variation": (
                    interview.energy_variation
                ),

                "audio_duration": (
                    interview.audio_duration
                ),

                "speaking_duration": (
                    interview.speaking_duration
                ),

                "transcript": (
                    interview.transcript
                ),
            }

            for interview in interviews
        ],
    }


# ============================================================
# SINGLE INTERVIEW DETAILS
# ============================================================

@app.get(
    "/interview-history/{user_id}/{interview_id}"
)
def get_interview(
    user_id: int,
    interview_id: int,
    db: Session = Depends(get_db),
):

    interview = (
        db.query(InterviewSession)
        .filter(
            InterviewSession.id == interview_id,
            InterviewSession.user_id == user_id,
        )
        .first()
    )

    if not interview:

        return {
            "status": "error",
            "message": "Interview not found",
        }

    return {
        "status": "success",

        "interview": {

            "id": interview.id,

            "user_id": interview.user_id,

            "created_at": (
                interview.created_at
            ),

            "engagement_score": (
                interview.engagement_score
            ),

            "word_count": (
                interview.word_count
            ),

            "words_per_minute": (
                interview.words_per_minute
            ),

            "total_fillers": (
                interview.total_fillers
            ),

            "pause_count": (
                interview.pause_count
            ),

            "average_pause": (
                interview.average_pause
            ),

            "longest_pause": (
                interview.longest_pause
            ),

            "average_pitch": (
                interview.average_pitch
            ),

            "pitch_variation": (
                interview.pitch_variation
            ),

            "average_energy": (
                interview.average_energy
            ),

            "energy_variation": (
                interview.energy_variation
            ),

            "audio_duration": (
                interview.audio_duration
            ),

            "speaking_duration": (
                interview.speaking_duration
            ),

            "transcript": (
                interview.transcript
            ),
        },
    }


# ============================================================
# INTERVIEW SESSION ANALYSIS
# ============================================================

@app.post("/analyze-session")
async def analyze_session(
    file: UploadFile = File(...),
    user_id: int = 1,
    db: Session = Depends(get_db),
):
    """
    Analyze a recorded interview video.

    Processing includes:

    - Video / facial engagement analysis
    - Audio extraction
    - Speech transcription
    - Speech metrics
    - Filler word detection
    - Pause detection
    - Prosody analysis
    - Reka AI interview coaching
    - Database storage
    """

    video_path = None
    audio_path = None

    try:

        # ====================================================
        # 1. SAVE UPLOADED VIDEO
        # ====================================================

        video_suffix = os.path.splitext(
            file.filename or ""
        )[1]

        if not video_suffix:
            video_suffix = ".webm"

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=video_suffix,
        ) as temp_video:

            video_path = temp_video.name

            content = await file.read()

            temp_video.write(content)

        # ====================================================
        # 2. VIDEO ANALYSIS
        # ====================================================

        video_analyzer = VideoAnalyzer()

        session = SessionAnalyzer()

        session.start()

        cap = cv2.VideoCapture(
            video_path
        )

        if not cap.isOpened():

            raise RuntimeError(
                "Could not open uploaded video."
            )

        fps = cap.get(
            cv2.CAP_PROP_FPS
        )

        if not fps or fps <= 0:

            fps = 30.0

        frame_number = 0

        while True:

            ret, frame = cap.read()

            if not ret:
                break

            timestamp_ms = int(
                (frame_number / fps) * 1000
            )

            data = video_analyzer.analyze(
                frame,
                timestamp_ms,
            )

            session.process(data)

            frame_number += 1

        cap.release()

        session.stop()

        video_report = session.get_report()

        video_analyzer.close()

        # ====================================================
        # 3. EXTRACT AUDIO USING FFMPEG
        # ====================================================

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=".wav",
        ) as temp_audio:

            audio_path = temp_audio.name

        subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-i",
                video_path,
                "-vn",
                "-ac",
                "1",
                "-ar",
                "16000",
                audio_path,
            ],
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )

        # ====================================================
        # 4. SPEECH ANALYSIS
        # ====================================================

        speech_report = analyze_speech(
            audio_path
        )

        # ====================================================
        # 5. EXTRACT PROSODY
        # ====================================================

        prosody = speech_report.get(
            "prosody",
            {},
        )

        # ====================================================
        # 6. SAVE INTERVIEW TO DATABASE
        # ====================================================

        interview = InterviewSession(

            user_id=user_id,

            transcript=speech_report.get(
                "transcript"
            ),

            word_count=speech_report.get(
                "word_count"
            ),

            words_per_minute=speech_report.get(
                "words_per_minute"
            ),

            total_fillers=speech_report.get(
                "total_fillers"
            ),

            pause_count=speech_report.get(
                "pause_count"
            ),

            average_pause=speech_report.get(
                "average_pause"
            ),

            longest_pause=speech_report.get(
                "longest_pause"
            ),

            average_pitch=prosody.get(
                "average_pitch_hz"
            ),

            pitch_variation=prosody.get(
                "pitch_variation_hz"
            ),

            average_energy=prosody.get(
                "average_energy"
            ),

            energy_variation=prosody.get(
                "energy_variation"
            ),

            engagement_score=video_report.get(
                "average_engagement"
            ),

            audio_duration=speech_report.get(
                "audio_duration"
            ),

            speaking_duration=speech_report.get(
                "speaking_duration"
            ),
        )

        db.add(interview)

        db.commit()

        db.refresh(interview)

        # ====================================================
        # 7. PREPARE DATA FOR REKA AI
        # ====================================================

        reka_input = {

            "interview_id": interview.id,

            "user_id": user_id,

            "video_analysis": video_report,

            "speech_analysis": speech_report,
        }

        # ====================================================
        # 8. GENERATE REKA AI INSIGHTS
        # ====================================================

        try:

            print("\n")
            print("=" * 60)
            print("GENERATING REKA AI INTERVIEW INSIGHTS")
            print("=" * 60)

            ai_feedback = generate_ai_feedback(
                reka_input
            )

            print("=" * 60)
            print("REKA AI ANALYSIS COMPLETED")
            print("=" * 60)
            print("\n")

        except Exception as reka_error:

            # Do NOT destroy the successful interview analysis
            # if Reka temporarily fails.

            print("\n")
            print("=" * 60)
            print("REKA AI ANALYSIS FAILED")
            print("=" * 60)
            print(str(reka_error))
            print("=" * 60)
            print("\n")

            ai_feedback = {
                "overall_assessment": (
                    "AI coaching is temporarily unavailable. "
                    "Your interview metrics were successfully "
                    "analyzed and saved."
                ),

                "strengths": [],

                "weaknesses": [],

                "speech_feedback": {
                    "summary": "",
                    "suggestions": [],
                },

                "voice_feedback": {
                    "summary": "",
                    "suggestions": [],
                },

                "visual_feedback": {
                    "summary": "",
                    "suggestions": [],
                },

                "improvement_suggestions": [],

                "interview_coaching": [],

                "practice_plan": [],

                "encouragement": (
                    "Keep practicing and try another interview."
                ),
            }

        # ====================================================
        # 9. FINAL COMBINED RESULT
        # ====================================================

        return {

            "status": "success",

            "interview_id": interview.id,

            "user_id": user_id,

            "video_analysis": video_report,

            "speech_analysis": speech_report,

            "ai_feedback": ai_feedback,
        }

    # ========================================================
    # FFMPEG ERROR
    # ========================================================

    except subprocess.CalledProcessError as error:

        return {

            "status": "error",

            "message": (
                "FFmpeg could not extract audio "
                "from the recording."
            ),

            "details": str(error),
        }

    # ========================================================
    # GENERAL ERROR
    # ========================================================

    except Exception as error:

        return {

            "status": "error",

            "message": str(error),
        }

    # ========================================================
    # CLEAN TEMPORARY FILES
    # ========================================================

    finally:

        if (
            video_path
            and os.path.exists(video_path)
        ):

            os.remove(video_path)

        if (
            audio_path
            and os.path.exists(audio_path)
        ):

            os.remove(audio_path)