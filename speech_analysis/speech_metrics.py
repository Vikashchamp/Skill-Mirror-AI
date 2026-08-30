import re
import wave
from faster_whisper import WhisperModel


PAUSE_THRESHOLD = 1.0


def get_audio_duration(audio_file):
    """Return audio duration in seconds."""

    with wave.open(audio_file, "rb") as audio:
        frames = audio.getnframes()
        sample_rate = audio.getframerate()

        return frames / float(sample_rate)


def count_words(transcript):
    """Count words in the transcript."""

    words = re.findall(r"\b[\w']+\b", transcript)

    return len(words)


def analyze_speech(audio_file):
    """
    Analyze speech using Whisper timestamps.

    Returns:
        Dictionary containing speech metrics.
    """

    print("\n🧠 Loading speech analysis model...")

    model = WhisperModel(
        "base",
        device="cpu",
        compute_type="int8"
    )

    print("🎙️ Analyzing speech...")

    segments, info = model.transcribe(
        audio_file,
        beam_size=5
    )

    segments = list(segments)

    transcript_parts = []

    for segment in segments:
        transcript_parts.append(segment.text.strip())

    transcript = " ".join(transcript_parts)

    # -------------------------
    # WORD COUNT
    # -------------------------

    word_count = count_words(transcript)

    # -------------------------
    # AUDIO DURATION
    # -------------------------

    audio_duration = get_audio_duration(audio_file)

    # -------------------------
    # SPEAKING DURATION
    # -------------------------

    speaking_duration = sum(
        segment.end - segment.start
        for segment in segments
    )

    # -------------------------
    # PAUSE DETECTION
    # -------------------------

    pauses = []

    for previous, current in zip(segments, segments[1:]):

        pause = current.start - previous.end

        if pause >= PAUSE_THRESHOLD:
            pauses.append(pause)

    pause_count = len(pauses)

    # -------------------------
    # PAUSE STATISTICS
    # -------------------------

    if pauses:
        average_pause = sum(pauses) / len(pauses)
        longest_pause = max(pauses)
    else:
        average_pause = 0.0
        longest_pause = 0.0

    # -------------------------
    # WORDS PER MINUTE
    # -------------------------

    if speaking_duration > 0:
        words_per_minute = (
            word_count / speaking_duration
        ) * 60
    else:
        words_per_minute = 0.0

    return {
        "transcript": transcript,
        "word_count": word_count,
        "audio_duration": round(audio_duration, 2),
        "speaking_duration": round(speaking_duration, 2),
        "words_per_minute": round(words_per_minute, 2),
        "pause_count": pause_count,
        "average_pause": round(average_pause, 2),
        "longest_pause": round(longest_pause, 2),
    }


def print_speech_report(result):
    """Display speech analysis results."""

    print("\n" + "=" * 45)
    print("        SPEECH ANALYSIS REPORT")
    print("=" * 45)

    print("\n📝 Transcript:")
    print(result["transcript"])

    print("\n📊 Speech Metrics:")
    print(f"Word count       : {result['word_count']}")
    print(f"Audio duration   : {result['audio_duration']} seconds")
    print(f"Speaking duration: {result['speaking_duration']} seconds")
    print(f"Words per minute : {result['words_per_minute']} WPM")

    print("\n⏸️ Pause Analysis:")
    print(f"Pause count      : {result['pause_count']}")
    print(f"Average pause    : {result['average_pause']} seconds")
    print(f"Longest pause    : {result['longest_pause']} seconds")

    print("=" * 45)


if __name__ == "__main__":

    result = analyze_speech("speech.wav")

    print_speech_report(result)