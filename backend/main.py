import os
import subprocess
import tempfile

import cv2
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from video_analysis.video_analyzer import VideoAnalyzer
from video_analysis.session_analyzer import SessionAnalyzer
from speech_analysis.analyzer import analyze_speech

app = FastAPI(
    title="SkillMirror AI",
    description="AI-powered mock interview coaching API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    question: str
    answer: str


@app.get("/")
def root():
    return {
        "message": "Welcome to SkillMirror AI"
    }


@app.get("/health")
def health_check():
    return {
        "status": "ok"
    }


@app.post("/analyze")
def analyze_answer(request: AnalyzeRequest):
    answer_length = len(request.answer.split())

    if answer_length < 10:
        score = 5
        feedback = "Your answer is too short. Try explaining your thoughts in more detail."
    elif answer_length < 30:
        score = 7
        feedback = "Good start. Try adding more specific examples."
    else:
        score = 9
        feedback = "Good answer. Keep your response structured and specific."

    return {
        "question": request.question,
        "answer": request.answer,
        "score": score,
        "feedback": feedback
    }


@app.post("/analyze-session")
async def analyze_session(file: UploadFile = File(...)):
    """
    Analyze a recorded interview video.

    The uploaded browser recording is processed for:
    - Video / facial engagement analysis
    - Speech transcription and speech metrics
    """

    video_path = None
    audio_path = None

    try:
        # ---------------------------------------------
        # 1. Save uploaded video
        # ---------------------------------------------

        video_suffix = os.path.splitext(file.filename or "")[1]

        if not video_suffix:
            video_suffix = ".webm"

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=video_suffix
        ) as temp_video:
            video_path = temp_video.name

            content = await file.read()
            temp_video.write(content)

        # ---------------------------------------------
        # 2. VIDEO ANALYSIS
        # ---------------------------------------------

        video_analyzer = VideoAnalyzer()
        session = SessionAnalyzer()

        session.start()

        cap = cv2.VideoCapture(video_path)

        if not cap.isOpened():
            raise RuntimeError("Could not open uploaded video.")

        fps = cap.get(cv2.CAP_PROP_FPS)

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
                timestamp_ms
            )

            session.process(data)

            frame_number += 1

        cap.release()

        session.stop()

        video_report = session.get_report()

        video_analyzer.close()

        # ---------------------------------------------
        # 3. EXTRACT AUDIO USING FFMPEG
        # ---------------------------------------------

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=".wav"
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
                audio_path
            ],
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )

        # ---------------------------------------------
        # 4. SPEECH ANALYSIS
        # ---------------------------------------------

        speech_report = analyze_speech(audio_path)

        # ---------------------------------------------
        # 5. COMBINED RESULT
        # ---------------------------------------------

        return {
            "status": "success",
            "video_analysis": video_report,
            "speech_analysis": speech_report
        }

    except subprocess.CalledProcessError as error:
        return {
            "status": "error",
            "message": "FFmpeg could not extract audio from the recording.",
            "details": str(error)
        }

    except Exception as error:
        return {
            "status": "error",
            "message": str(error)
        }

    finally:
        # ---------------------------------------------
        # 6. CLEAN TEMPORARY FILES
        # ---------------------------------------------

        if video_path and os.path.exists(video_path):
            os.remove(video_path)

        if audio_path and os.path.exists(audio_path):
            os.remove(audio_path)