import re
import wave

from faster_whisper import WhisperModel

from .filler_words import detect_filler_words
from .prosody import analyze_prosody


PAUSE_THRESHOLD = 1.0


def get_audio_duration(audio_file):
    """Return the total audio duration in seconds."""

    with wave.open(audio_file, "rb") as audio:
        frames = audio.getnframes()
        sample_rate = audio.getframerate()

        return frames / float(sample_rate)


def count_words(transcript):
    """Count words in a transcript."""

    words = re.findall(r"\b[\w']+\b", transcript)

    return len(words)


def analyze_speech(audio_file="speech.wav"):
    """
    Run the complete SkillMirror speech analysis pipeline.

    Returns:
        Dictionary containing transcript and speech metrics.
    """

    print("\n" + "=" * 50)
    print("       SKILLMIRROR SPEECH ANALYSIS")
    print("=" * 50)

    # --------------------------------
    # 1. LOAD WHISPER MODEL
    # --------------------------------

    print("\n🧠 Loading speech recognition model...")

    model = WhisperModel(
        "base",
        device="cpu",
        compute_type="int8"
    )

    # --------------------------------
    # 2. TRANSCRIBE AUDIO
    # --------------------------------

    print("🎙️ Transcribing audio...")

    segments, info = model.transcribe(
        audio_file,
        beam_size=5
    )

    segments = list(segments)

    transcript = " ".join(
        segment.text.strip()
        for segment in segments
    )

    print("✅ Transcription completed.")

    # --------------------------------
    # 3. WORD COUNT
    # --------------------------------

    word_count = count_words(transcript)

    # --------------------------------
    # 4. AUDIO DURATION
    # --------------------------------

    audio_duration = get_audio_duration(audio_file)

    # --------------------------------
    # 5. SPEAKING DURATION
    # --------------------------------

    speaking_duration = sum(
        segment.end - segment.start
        for segment in segments
    )

    # --------------------------------
    # 6. FILLER WORD ANALYSIS
    # --------------------------------

    filler_result = detect_filler_words(transcript)

    # --------------------------------
    # 7. PAUSE DETECTION
    # --------------------------------

    pauses = []

    for previous, current in zip(segments, segments[1:]):

        pause = current.start - previous.end

        if pause >= PAUSE_THRESHOLD:
            pauses.append(pause)

    pause_count = len(pauses)

    if pauses:
        average_pause = sum(pauses) / len(pauses)
        longest_pause = max(pauses)
    else:
        average_pause = 0.0
        longest_pause = 0.0

    # --------------------------------
    # 8. WORDS PER MINUTE
    # --------------------------------

    if speaking_duration > 0:
        words_per_minute = (
            word_count / speaking_duration
        ) * 60
    else:
        words_per_minute = 0.0

    # --------------------------------
    # 9. FINAL RESULT
    # --------------------------------

        # --------------------------------
    # 9. TONE / PROSODY ANALYSIS
    # --------------------------------

    print("🎵 Analyzing tone and prosody...")

    prosody_result = analyze_prosody(audio_file)

    result = {
        "transcript": transcript,

        "word_count": word_count,

        "audio_duration": round(
            audio_duration, 2
        ),

        "speaking_duration": round(
            speaking_duration, 2
        ),

        "words_per_minute": round(
            words_per_minute, 2
        ),

        "filler_words": filler_result["filler_counts"],

        "total_fillers": filler_result["total_fillers"],

        "pause_count": pause_count,

        "average_pause": round(
            average_pause, 2
        ),

        "longest_pause": round(
            longest_pause, 2
        ),

        "prosody": prosody_result,
    }

    return result


def print_speech_report(result):
    """Print the complete SkillMirror speech report."""

    print("\n" + "=" * 50)
    print("             SPEECH REPORT")
    print("=" * 50)

    print("\n📝 TRANSCRIPT")
    print("-" * 50)
    print(result["transcript"])

    print("\n📊 SPEECH METRICS")
    print("-" * 50)
    print(f"Word count        : {result['word_count']}")
    print(f"Audio duration    : {result['audio_duration']} sec")
    print(f"Speaking duration : {result['speaking_duration']} sec")
    print(f"Words per minute  : {result['words_per_minute']} WPM")

    print("\n🚫 FILLER WORDS")
    print("-" * 50)

    if result["filler_words"]:
        for filler, count in result["filler_words"].items():
            print(f"{filler:<15}: {count}")
    else:
        print("No filler words detected.")

    print(f"Total fillers     : {result['total_fillers']}")

    print("\n⏸️ PAUSE ANALYSIS")
    print("-" * 50)
    print(f"Pause count       : {result['pause_count']}")
    print(f"Average pause     : {result['average_pause']} sec")
    print(f"Longest pause     : {result['longest_pause']} sec")

    print("\n🎵 TONE / PROSODY")
    print("-" * 50)

    prosody = result["prosody"]

    print(
        f"Average pitch     : "
        f"{prosody['average_pitch_hz']} Hz"
    )

    print(
        f"Pitch variation   : "
        f"{prosody['pitch_variation_hz']} Hz"
    )

    print(
        f"Minimum pitch     : "
        f"{prosody['minimum_pitch_hz']} Hz"
    )

    print(
        f"Maximum pitch     : "
        f"{prosody['maximum_pitch_hz']} Hz"
    )

    print(
        f"Average energy    : "
        f"{prosody['average_energy']}"
    )

    print(
        f"Energy variation  : "
        f"{prosody['energy_variation']}"
    )

    print("\n" + "=" * 50)


if __name__ == "__main__":

    result = analyze_speech("speech.wav")

    print_speech_report(result)