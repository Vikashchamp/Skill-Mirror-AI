import os
import json
import re

from dotenv import load_dotenv
from openai import OpenAI


# ============================================================
# LOAD ENVIRONMENT
# ============================================================

load_dotenv(
    os.path.join(
        os.path.dirname(__file__),
        ".env"
    )
)

REKA_API_KEY = os.getenv("REKA_API_KEY")

if not REKA_API_KEY:
    raise RuntimeError(
        "REKA_API_KEY is missing. "
        "Add it to backend/.env"
    )


# ============================================================
# REKA CLIENT
# ============================================================

client = OpenAI(
    base_url="https://api.reka.ai/v1",
    api_key=REKA_API_KEY,
)


# ============================================================
# DEFAULT FEEDBACK
# ============================================================

def empty_feedback(message="AI feedback unavailable."):

    return {
        "overall_assessment": message,

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

        "encouragement": "",
    }


# ============================================================
# CLEAN REKA RESPONSE
# ============================================================

def clean_reka_response(content):

    if not content:
        return None

    content = content.strip()

    # Remove ```json ... ```
    content = re.sub(
        r"^```json\s*",
        "",
        content,
        flags=re.IGNORECASE,
    )

    content = re.sub(
        r"^```\s*",
        "",
        content,
    )

    content = re.sub(
        r"\s*```$",
        "",
        content,
    )

    content = content.strip()

    # Find first JSON object if Reka added extra text
    start = content.find("{")
    end = content.rfind("}")

    if start != -1 and end != -1 and end > start:

        content = content[start:end + 1]

    try:

        return json.loads(content)

    except json.JSONDecodeError:

        return None


# ============================================================
# GENERATE AI INTERVIEW FEEDBACK
# ============================================================

def generate_ai_feedback(interview_data):

    prompt = f"""
You are SkillMirror AI, a professional interview coach.

Analyze ONLY the interview measurements provided below.

Do NOT invent measurements.
Do NOT assume missing information.
If a metric is 0 or unavailable, say that it could not
be meaningfully evaluated.

Your job is to provide concise, practical and personalized
coaching for a student preparing for interviews.

INTERVIEW DATA:

{json.dumps(interview_data, indent=2, default=str)}


Return ONLY a valid JSON object.

Do NOT use Markdown.
Do NOT use ```json.
Do NOT add explanations before or after the JSON.

Use EXACTLY this structure:

{{
  "overall_assessment": "short assessment",

  "strengths": [
    {{
      "category": "category",
      "description": "specific strength supported by the data"
    }}
  ],

  "weaknesses": [
    {{
      "category": "category",
      "description": "specific improvement area supported by the data"
    }}
  ],

  "speech_feedback": {{
    "summary": "speech analysis summary",
    "suggestions": [
      "actionable suggestion"
    ]
  }},

  "voice_feedback": {{
    "summary": "voice and prosody summary",
    "suggestions": [
      "actionable suggestion"
    ]
  }},

  "visual_feedback": {{
    "summary": "facial engagement and visual behavior summary",
    "suggestions": [
      "actionable suggestion"
    ]
  }},

  "improvement_suggestions": [
    "specific improvement"
  ],

  "interview_coaching": [
    "specific interview coaching tip"
  ],

  "practice_plan": [
    "specific practice activity"
  ],

  "encouragement": "short encouraging message"
}}

Keep the response focused.

Prefer 2-4 strengths.
Prefer 2-4 weaknesses.
Prefer 2-4 suggestions in each feedback section.
Prefer 3-5 improvement suggestions.
Prefer 3-5 coaching tips.
Prefer 3-5 practice activities.

Every recommendation must be connected to the supplied
interview data.
"""

    print("\n")
    print("=" * 60)
    print("SENDING INTERVIEW DATA TO REKA AI")
    print("=" * 60)

    try:

        response = client.chat.completions.create(
            model="reka-flash-3",

            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are SkillMirror AI. "
                        "Return concise valid JSON only."
                    ),
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],

            temperature=0.2,

            # Increased because Reka was previously stopping
            # before producing the final JSON.
            max_tokens=5000,
        )

    except Exception as error:

        print("\nREKA API ERROR:")
        print(error)

        return empty_feedback(
            "AI coaching is temporarily unavailable."
        )

    # ========================================================
    # DEBUG RESPONSE
    # ========================================================

    print("\n")
    print("=" * 60)
    print("REKA RESPONSE STATUS")
    print("=" * 60)

    choice = None

    if response.choices:
        choice = response.choices[0]

    if not choice:

        print("No response choice returned.")

        return empty_feedback()

    print(
        "Finish reason:",
        choice.finish_reason
    )

    message = choice.message

    content = message.content

    # ========================================================
    # IMPORTANT:
    # Reka may place useful content in reasoning_content
    # while content is empty.
    # ========================================================

    if not content:

        print("REKA CONTENT WAS EMPTY.")

        if getattr(
            message,
            "reasoning_content",
            None
        ):

            print(
                "Reka used the token budget for reasoning "
                "instead of returning the requested JSON."
            )

        return empty_feedback(
            "Reka AI did not return a final coaching response."
        )

    print("\n")
    print("=" * 60)
    print("RAW REKA CONTENT")
    print("=" * 60)

    print(content)

    # ========================================================
    # PARSE JSON
    # ========================================================

    parsed = clean_reka_response(content)

    if parsed is None:

        print("\n")
        print("=" * 60)
        print("REKA RETURNED INVALID JSON")
        print("=" * 60)

        return empty_feedback(
            "Reka returned an invalid coaching response."
        )

    # ========================================================
    # ENSURE REQUIRED STRUCTURE
    # ========================================================

    result = empty_feedback()

    if isinstance(parsed, dict):

        result.update(parsed)

    # ========================================================
    # GUARANTEE NESTED OBJECTS
    # ========================================================

    if not isinstance(
        result.get("speech_feedback"),
        dict
    ):

        result["speech_feedback"] = {
            "summary": "",
            "suggestions": [],
        }

    if not isinstance(
        result.get("voice_feedback"),
        dict
    ):

        result["voice_feedback"] = {
            "summary": "",
            "suggestions": [],
        }

    if not isinstance(
        result.get("visual_feedback"),
        dict
    ):

        result["visual_feedback"] = {
            "summary": "",
            "suggestions": [],
        }

    # ========================================================
    # GUARANTEE ARRAYS
    # ========================================================

    array_fields = [
        "strengths",
        "weaknesses",
        "improvement_suggestions",
        "interview_coaching",
        "practice_plan",
    ]

    for field in array_fields:

        if not isinstance(
            result.get(field),
            list
        ):

            result[field] = []

    print("\n")
    print("=" * 60)
    print("REKA AI ANALYSIS SUCCESSFUL")
    print("=" * 60)

    return result