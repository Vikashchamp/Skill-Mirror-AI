from reka_service import generate_ai_feedback


# ============================================================
# TEST INTERVIEW DATA
# ============================================================

test_data = {
    "video_analysis": {
        "duration_seconds": 14.64,
        "face_detection_percentage": 95.34,
        "eye_open_percentage": 88.60,
        "forward_looking_percentage": 95.90,
        "average_engagement": 95.34,
    },

    "speech_analysis": {
        "transcript": (
            "Hello, my name is Iqas, basically I'm a psycho, "
            "I don't know where I'm living, so please like me "
            "in this interview, thank you, very care."
        ),
        "word_count": 26,
        "words_per_minute": 114.04,
        "total_fillers": 2,
        "pause_count": 0,
        "average_pause": 0,
        "longest_pause": 0,
        "audio_duration": 14.64,
        "speaking_duration": 13.68,

        "prosody": {
            "average_pitch_hz": 152.1,
            "pitch_variation_hz": 56.21,
            "minimum_pitch_hz": 120.0,
            "maximum_pitch_hz": 176.21,
            "average_energy": 0.0844,
            "energy_variation": 0.0844,
            "zero_crossing_rate": 0.0,
        },
    },
}


# ============================================================
# CALL REKA AI
# ============================================================

try:

    print("\n======================================")
    print("      SKILLMIRROR AI - REKA TEST")
    print("======================================\n")

    print("Sending interview data to Reka AI...")
    print("Please wait...\n")

    result = generate_ai_feedback(test_data)

    print("======================================")
    print("             REKA AI RESULT")
    print("======================================\n")

    print(result)

    print("\n======================================")
    print("          REKA TEST SUCCESSFUL")
    print("======================================\n")


except Exception as error:

    print("\n======================================")
    print("             REKA TEST FAILED")
    print("======================================\n")

    print("Error:")
    print(error)

    print("\nCheck the following:")
    print("1. backend/.env contains your Reka API key")
    print("2. The API key is valid")
    print("3. openai package is installed")
    print("4. python-dotenv is installed")