from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(
    title="SkillMirror AI",
    description="AI-powered mock interview coaching API",
    version="1.0.0"
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
