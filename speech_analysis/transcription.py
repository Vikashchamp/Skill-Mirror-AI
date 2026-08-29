from faster_whisper import WhisperModel


def transcribe_audio(audio_file):
    """
    Convert an audio file into text using Whisper.

    Args:
        audio_file: Path to the WAV/audio file.

    Returns:
        The complete transcript as a string.
    """

    print("\n📝 Loading speech recognition model...")

    model = WhisperModel(
        "base",
        device="cpu",
        compute_type="int8"
    )

    print("🎙️ Transcribing audio...")

    segments, info = model.transcribe(
        audio_file,
        beam_size=5
    )

    transcript = " ".join(
        segment.text.strip()
        for segment in segments
    )

    print("\n✅ Transcription completed.")
    print("\nTranscript:")
    print(transcript)

    return transcript


if __name__ == "__main__":
    transcribe_audio("speech.wav")