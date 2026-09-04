import os
import json
import re

from dotenv import load_dotenv
from openai import OpenAI


# ============================================================
# LOAD ENVIRONMENT VARIABLES
# ============================================================

load_dotenv(
    os.path.join(
        os.path.dirname(__file__),
        ".env",
    )
)

REKA_API_KEY = os.getenv("REKA_API_KEY")

if not REKA_API_KEY:
    raise RuntimeError(
        "REKA_API_KEY is missing. Add it to backend/.env"
    )


# ============================================================
# REKA CLIENT
# ============================================================

client = OpenAI(
    base_url="https://api.reka.ai/v1",
    api_key=REKA_API_KEY,
)


# ============================================================
# DEFAULT RESPONSE
# ============================================================

def empty_feedback():
    return {
        "overall_assessment": "",
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
# REPAIR COMMON JSON FORMATTING ERRORS
# ============================================================

def repair_json(content):

    if not content:
        return content

    content = content.strip()

    # --------------------------------------------------------
    # Remove markdown code fences
    # --------------------------------------------------------

    content = re.sub(
        r"```json\s*",
        "",
        content,
        flags=re.IGNORECASE,
    )

    content = re.sub(
        r"```\s*",
        "",
        content,
    )

    content = content.strip()

    # --------------------------------------------------------
    # Repair missing commas between string fields
    # --------------------------------------------------------

    content = re.sub(
        r'("\s*)\n(\s*")',
        r'\1,\n\2',
        content,
    )

    # --------------------------------------------------------
    # Repair missing commas after arrays/objects
    # --------------------------------------------------------

    content = re.sub(
        r'(\]|\})\s*\n(\s*")',
        r'\1,\n\2',
        content,
    )

    # --------------------------------------------------------
    # Remove accidental double commas
    # --------------------------------------------------------

    content = re.sub(
        r",\s*,",
        ",",
        content,
    )

    return content.strip()


# ============================================================
# EXTRACT JSON FROM RESPONSE
# ============================================================

def extract_json(content):

    if not content:
        return None

    content = content.strip()

    # --------------------------------------------------------
    # First attempt: normal JSON
    # --------------------------------------------------------

    try:
        return json.loads(content)

    except json.JSONDecodeError:
        pass

    # --------------------------------------------------------
    # Second attempt: repair common JSON mistakes
    # --------------------------------------------------------

    repaired = repair_json(content)

    try:
        return json.loads(repaired)

    except json.JSONDecodeError:
        pass

    # --------------------------------------------------------
    # Third attempt: extract JSON object from text
    # --------------------------------------------------------

    start = repaired.find("{")
    end = repaired.rfind("}")

    if start != -1 and end != -1 and end > start:

        possible_json = repaired[
            start:end + 1
        ]

        try:
            return json.loads(
                possible_json
            )

        except json.JSONDecodeError:
            pass

    return None


# ============================================================
# NORMALIZE REKA RESPONSE
# ============================================================

def normalize_feedback(data):

    if not isinstance(data, dict):
        return empty_feedback()

    result = empty_feedback()

    # ========================================================
    # OVERALL ASSESSMENT
    # ========================================================

    result["overall_assessment"] = str(
        data.get(
            "overall_assessment",
            "",
        )
    ).strip()

    # Keep it reasonably short
    if len(result["overall_assessment"]) > 600:
        result["overall_assessment"] = (
            result["overall_assessment"][:600].rstrip()
            + "..."
        )

    # ========================================================
    # STRENGTHS
    # ========================================================

    strengths = data.get(
        "strengths",
        [],
    )

    if isinstance(strengths, list):

        result["strengths"] = [
            str(item).strip()
            for item in strengths[:3]
            if str(item).strip()
        ]

    # ========================================================
    # WEAKNESSES
    # ========================================================

    weaknesses = data.get(
        "weaknesses",
        [],
    )

    if isinstance(weaknesses, list):

        result["weaknesses"] = [
            str(item).strip()
            for item in weaknesses[:3]
            if str(item).strip()
        ]

    # ========================================================
    # SPEECH FEEDBACK
    # ========================================================

    speech = data.get(
        "speech_feedback",
        {},
    )

    if isinstance(speech, dict):

        suggestions = speech.get(
            "suggestions",
            [],
        )

        result["speech_feedback"] = {
            "summary": str(
                speech.get(
                    "summary",
                    "",
                )
            ).strip()[:500],

            "suggestions": (
                [
                    str(item).strip()
                    for item in suggestions[:3]
                    if str(item).strip()
                ]
                if isinstance(
                    suggestions,
                    list,
                )
                else []
            ),
        }

    # ========================================================
    # VOICE FEEDBACK
    # ========================================================

    voice = data.get(
        "voice_feedback",
        {},
    )

    if isinstance(voice, dict):

        suggestions = voice.get(
            "suggestions",
            [],
        )

        result["voice_feedback"] = {
            "summary": str(
                voice.get(
                    "summary",
                    "",
                )
            ).strip()[:500],

            "suggestions": (
                [
                    str(item).strip()
                    for item in suggestions[:3]
                    if str(item).strip()
                ]
                if isinstance(
                    suggestions,
                    list,
                )
                else []
            ),
        }

    # ========================================================
    # VISUAL FEEDBACK
    # ========================================================

    visual = data.get(
        "visual_feedback",
        {},
    )

    if isinstance(visual, dict):

        suggestions = visual.get(
            "suggestions",
            [],
        )

        result["visual_feedback"] = {
            "summary": str(
                visual.get(
                    "summary",
                    "",
                )
            ).strip()[:500],

            "suggestions": (
                [
                    str(item).strip()
                    for item in suggestions[:3]
                    if str(item).strip()
                ]
                if isinstance(
                    suggestions,
                    list,
                )
                else []
            ),
        }

    # ========================================================
    # IMPROVEMENT SUGGESTIONS
    # ========================================================

    improvements = data.get(
        "improvement_suggestions",
        None,
    )

    # Reka may sometimes use this alternative name
    if improvements is None:

        improvements = data.get(
            "development_recommendations",
            [],
        )

    if isinstance(improvements, list):

        result["improvement_suggestions"] = [
            str(item).strip()
            for item in improvements[:4]
            if str(item).strip()
        ]

    # ========================================================
    # INTERVIEW COACHING
    # ========================================================

    coaching = data.get(
        "interview_coaching",
        [],
    )

    if isinstance(coaching, list):

        result["interview_coaching"] = [
            str(item).strip()
            for item in coaching[:3]
            if str(item).strip()
        ]

    # ========================================================
    # PRACTICE PLAN
    # ========================================================

    practice = data.get(
        "practice_plan",
        [],
    )

    if isinstance(practice, list):

        result["practice_plan"] = [
            str(item).strip()
            for item in practice[:4]
            if str(item).strip()
        ]

    # ========================================================
    # ENCOURAGEMENT
    # ========================================================

    result["encouragement"] = str(
        data.get(
            "encouragement",
            "",
        )
    ).strip()[:300]

    # ========================================================
    # FALLBACK PRACTICE PLAN
    # ========================================================

    if (
        not result["practice_plan"]
        and result["improvement_suggestions"]
    ):

        result["practice_plan"] = (
            result[
                "improvement_suggestions"
            ][:3]
        )

    # ========================================================
    # FALLBACK INTERVIEW COACHING
    # ========================================================

    if (
        not result["interview_coaching"]
        and result["weaknesses"]
    ):

        result["interview_coaching"] = [
            "Keep answers concise and structured.",
            "Support important claims with specific examples.",
        ]

    # ========================================================
    # FALLBACK ENCOURAGEMENT
    # ========================================================

    if not result["encouragement"]:

        result["encouragement"] = (
            "You have a strong foundation. "
            "Focus on the specific improvements above "
            "and keep practicing."
        )

    return result


# ============================================================
# GENERATE AI INTERVIEW FEEDBACK
# ============================================================

def generate_ai_feedback(interview_data):

    # --------------------------------------------------------
    # Keep only the useful information for Reka.
    #
    # This prevents unnecessary data from increasing the
    # model's reasoning/output size.
    # --------------------------------------------------------

    compact_data = {
        "interview_id": interview_data.get(
            "interview_id"
        ),

        "video_analysis": {
            "face_detection_percentage":
                interview_data.get(
                    "video_analysis",
                    {}
                ).get(
                    "face_detection_percentage",
                    None,
                ),

            "eye_open_percentage":
                interview_data.get(
                    "video_analysis",
                    {}
                ).get(
                    "eye_open_percentage",
                    None,
                ),

            "forward_looking_percentage":
                interview_data.get(
                    "video_analysis",
                    {}
                ).get(
                    "forward_looking_percentage",
                    None,
                ),

            "average_engagement":
                interview_data.get(
                    "video_analysis",
                    {}
                ).get(
                    "average_engagement",
                    None,
                ),
        },

        "speech_analysis": {
            "transcript":
                interview_data.get(
                    "speech_analysis",
                    {}
                ).get(
                    "transcript",
                    None,
                ),

            "word_count":
                interview_data.get(
                    "speech_analysis",
                    {}
                ).get(
                    "word_count",
                    None,
                ),

            "audio_duration":
                interview_data.get(
                    "speech_analysis",
                    {}
                ).get(
                    "audio_duration",
                    None,
                ),

            "speaking_duration":
                interview_data.get(
                    "speech_analysis",
                    {}
                ).get(
                    "speaking_duration",
                    None,
                ),

            "words_per_minute":
                interview_data.get(
                    "speech_analysis",
                    {}
                ).get(
                    "words_per_minute",
                    None,
                ),

            "total_fillers":
                interview_data.get(
                    "speech_analysis",
                    {}
                ).get(
                    "total_fillers",
                    None,
                ),

            "pause_count":
                interview_data.get(
                    "speech_analysis",
                    {}
                ).get(
                    "pause_count",
                    None,
                ),

            "average_pause":
                interview_data.get(
                    "speech_analysis",
                    {}
                ).get(
                    "average_pause",
                    None,
                ),

            "longest_pause":
                interview_data.get(
                    "speech_analysis",
                    {}
                ).get(
                    "longest_pause",
                    None,
                ),

            "prosody": {
                "average_pitch_hz":
                    interview_data.get(
                        "speech_analysis",
                        {}
                    ).get(
                        "prosody",
                        {}
                    ).get(
                        "average_pitch_hz",
                        None,
                    ),

                "pitch_variation_hz":
                    interview_data.get(
                        "speech_analysis",
                        {}
                    ).get(
                        "prosody",
                        {}
                    ).get(
                        "pitch_variation_hz",
                        None,
                    ),

                "average_energy":
                    interview_data.get(
                        "speech_analysis",
                        {}
                    ).get(
                        "prosody",
                        {}
                    ).get(
                        "average_energy",
                        None,
                    ),

                "energy_variation":
                    interview_data.get(
                        "speech_analysis",
                        {}
                    ).get(
                        "prosody",
                        {}
                    ).get(
                        "energy_variation",
                        None,
                    ),
            },
        },
    }

    interview_json = json.dumps(
        compact_data,
        indent=2,
        default=str,
    )

    # ========================================================
    # FUNCTION SCHEMA
    # ========================================================

    feedback_schema = {
        "type": "object",

        "additionalProperties": False,

        "properties": {

            # ------------------------------------------------
            # OVERALL
            # ------------------------------------------------

            "overall_assessment": {
                "type": "string",
                "maxLength": 400,
                "description": (
                    "One concise overall assessment. "
                    "Maximum about 3 sentences. "
                    "Do not repeat the same point."
                ),
            },

            # ------------------------------------------------
            # STRENGTHS
            # ------------------------------------------------

            "strengths": {
                "type": "array",
                "maxItems": 3,
                "description": (
                    "At most 3 genuine strengths supported "
                    "by the supplied metrics."
                ),
                "items": {
                    "type": "string",
                    "maxLength": 160,
                },
            },

            # ------------------------------------------------
            # WEAKNESSES
            # ------------------------------------------------

            "weaknesses": {
                "type": "array",
                "maxItems": 3,
                "description": (
                    "At most 3 important weaknesses supported "
                    "by the supplied metrics."
                ),
                "items": {
                    "type": "string",
                    "maxLength": 160,
                },
            },

            # ------------------------------------------------
            # SPEECH
            # ------------------------------------------------

            "speech_feedback": {
                "type": "object",
                "additionalProperties": False,

                "properties": {

                    "summary": {
                        "type": "string",
                        "maxLength": 300,
                        "description": (
                            "Concise speech assessment based "
                            "only on transcript, WPM, fillers "
                            "and pauses."
                        ),
                    },

                    "suggestions": {
                        "type": "array",
                        "maxItems": 3,
                        "items": {
                            "type": "string",
                            "maxLength": 150,
                        },
                    },
                },

                "required": [
                    "summary",
                    "suggestions",
                ],
            },

            # ------------------------------------------------
            # VOICE
            # ------------------------------------------------

            "voice_feedback": {
                "type": "object",
                "additionalProperties": False,

                "properties": {

                    "summary": {
                        "type": "string",
                        "maxLength": 300,
                        "description": (
                            "Concise voice assessment based "
                            "only on pitch, pitch variation, "
                            "energy and energy variation."
                        ),
                    },

                    "suggestions": {
                        "type": "array",
                        "maxItems": 3,
                        "items": {
                            "type": "string",
                            "maxLength": 150,
                        },
                    },
                },

                "required": [
                    "summary",
                    "suggestions",
                ],
            },

            # ------------------------------------------------
            # VISUAL
            # ------------------------------------------------

            "visual_feedback": {
                "type": "object",
                "additionalProperties": False,

                "properties": {

                    "summary": {
                        "type": "string",
                        "maxLength": 300,
                        "description": (
                            "Concise visual assessment based "
                            "only on face detection, eye "
                            "openness, forward looking and "
                            "engagement."
                        ),
                    },

                    "suggestions": {
                        "type": "array",
                        "maxItems": 3,
                        "items": {
                            "type": "string",
                            "maxLength": 150,
                        },
                    },
                },

                "required": [
                    "summary",
                    "suggestions",
                ],
            },

            # ------------------------------------------------
            # IMPROVEMENTS
            # ------------------------------------------------

            "improvement_suggestions": {
                "type": "array",
                "maxItems": 4,
                "items": {
                    "type": "string",
                    "maxLength": 160,
                },
            },

            # ------------------------------------------------
            # COACHING
            # ------------------------------------------------

            "interview_coaching": {
                "type": "array",
                "maxItems": 3,
                "items": {
                    "type": "string",
                    "maxLength": 160,
                },
            },

            # ------------------------------------------------
            # PRACTICE PLAN
            # ------------------------------------------------

            "practice_plan": {
                "type": "array",
                "maxItems": 4,
                "items": {
                    "type": "string",
                    "maxLength": 160,
                },
            },

            # ------------------------------------------------
            # ENCOURAGEMENT
            # ------------------------------------------------

            "encouragement": {
                "type": "string",
                "maxLength": 250,
            },
        },

        "required": [
            "overall_assessment",
            "strengths",
            "weaknesses",
            "speech_feedback",
            "voice_feedback",
            "visual_feedback",
            "improvement_suggestions",
            "interview_coaching",
            "practice_plan",
            "encouragement",
        ],
    }

    # ========================================================
    # CALL REKA
    # ========================================================

    try:

        response = client.chat.completions.create(

            model="reka-flash-3",

            messages=[
                {
                    "role": "system",
                    "content": (
    "You are SkillMirror AI, an expert interview coach.\n\n"

    "Analyze ONLY the supplied interview data.\n\n"

    "Return feedback using the provided function.\n\n"

    "IMPORTANT RULES:\n"

    "1. Be concise and practical.\n"

    "2. Do not repeat information.\n"

    "3. Never invent measurements, observations, or events.\n"

    "4. Every strength, weakness, and suggestion must be "
    "supported by a supplied metric or transcript.\n"

    "5. Never assume that a metric is good or bad without "
    "considering what that metric actually measures.\n"

    "6. Do not label performance as 'below average', 'average', "
    "or 'above average' unless the supplied data clearly "
    "supports that comparison.\n"

    "7. Do not infer nervousness, anxiety, confidence, stress, "
    "facial expressions, body language, posture, gestures, "
    "eye contact, vocal strain, or similar traits unless they "
    "are explicitly measured in the supplied data.\n"

    "8. If a metric is missing, unavailable, zero because no "
    "measurement was recorded, or otherwise insufficient, "
    "say that the metric is unavailable instead of guessing.\n"

    "9. Speech feedback may use ONLY transcript, word count, "
    "speaking duration, WPM, filler count, and pause metrics.\n"

    "10. Voice feedback may use ONLY pitch, pitch variation, "
    "energy, and energy variation.\n"

    "11. Visual feedback may use ONLY face detection, eye "
    "openness, forward-looking percentage, and engagement "
    "when those measurements are actually available.\n"

    "12. Do not claim that high pitch variation means nervousness "
    "or that low energy means disengagement unless the supplied "
    "data explicitly establishes that relationship.\n"

    "13. Do not recommend doctors, therapists, speech-language "
    "pathologists, or other medical professionals.\n"

    "14. Give interview-specific recommendations that the "
    "candidate can realistically practice.\n"

    "15. Do not discuss unrelated topics.\n"

    "16. Keep normal list items short.\n"

    "17. Finish the function call completely."
),
                },

                {
                    "role": "user",
                    "content": (
                        "Analyze this interview performance "
                        "and provide concise coaching feedback:\n\n"
                        + interview_json
                    ),
                },
            ],

            temperature=0,

            max_tokens=3000,

            tools=[
                {
                    "type": "function",

                    "function": {
                        "name": "submit_interview_feedback",

                        "description": (
                            "Submit concise structured "
                            "interview coaching feedback."
                        ),

                        "parameters": feedback_schema,
                    },
                },
            ],

            tool_choice={
                "type": "function",
                "function": {
                    "name": "submit_interview_feedback",
                },
            },
        )

    except Exception as error:

        print("\n")
        print("=" * 70)
        print("REKA API ERROR")
        print("=" * 70)
        print(str(error))
        print("=" * 70)
        print("\n")

        raise RuntimeError(
            f"Reka API request failed: {error}"
        )

    # ========================================================
    # VALIDATE RESPONSE
    # ========================================================

    if not response.choices:

        raise RuntimeError(
            "Reka AI returned no choices."
        )

    choice = response.choices[0]

    message = choice.message

    # ========================================================
    # DEBUG OUTPUT
    # ========================================================

    print("\n")
    print("=" * 70)
    print("REKA AI STRUCTURED RESPONSE")
    print("=" * 70)

    print(
        "Finish reason:",
        getattr(
            choice,
            "finish_reason",
            None,
        ),
    )

    tool_calls = getattr(
        message,
        "tool_calls",
        None,
    )

    print(
        "Tool calls:",
        tool_calls,
    )

    print("=" * 70)
    print("\n")

    # ========================================================
    # CHECK FOR TRUNCATION
    # ========================================================

    finish_reason = getattr(
        choice,
        "finish_reason",
        None,
    )

    if finish_reason == "length":

        raise RuntimeError(
            "Reka AI truncated the structured function "
            "response because it reached the token limit. "
            "The model generated too much content."
        )

    # ========================================================
    # GET FUNCTION CALL
    # ========================================================

    if not tool_calls:

        # Helpful diagnostic if Reka returns text instead
        content = getattr(
            message,
            "content",
            None,
        )

        print(
            "Unexpected text content:",
            content,
        )

        raise RuntimeError(
            "Reka did not return the expected "
            "structured interview feedback function call."
        )

    # ========================================================
    # USE FIRST FUNCTION CALL
    # ========================================================

    tool_call = tool_calls[0]

    function_arguments = (
        getattr(
            tool_call.function,
            "arguments",
            None,
        )
    )

    # ========================================================
    # VALIDATE FUNCTION ARGUMENTS
    # ========================================================

    if not function_arguments:

        raise RuntimeError(
            "Reka returned an empty feedback function call."
        )

    # ========================================================
    # DEBUG ARGUMENT LENGTH
    # ========================================================

    print(
        "Structured argument length:",
        len(function_arguments),
        "characters",
    )

    # ========================================================
    # PARSE FUNCTION ARGUMENTS
    # ========================================================

    try:

        parsed = json.loads(
            function_arguments
        )

    except json.JSONDecodeError as error:

        print("\n")
        print("=" * 70)
        print("INVALID REKA FUNCTION JSON")
        print("=" * 70)
        print(function_arguments)
        print("=" * 70)
        print("\n")

        raise RuntimeError(
            "Reka returned invalid structured feedback JSON: "
            + str(error)
        )

    # ========================================================
    # NORMALIZE
    # ========================================================

    feedback = normalize_feedback(
        parsed
    )

    # ========================================================
    # RETURN
    # ========================================================

    return feedback