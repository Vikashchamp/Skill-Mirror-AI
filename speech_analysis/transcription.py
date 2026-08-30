from faster_whisper import WhisperModel


def transcribe_audio(audio_file):
    """
    Convert an audio file into English text using Faster-Whisper.
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

        # Force English interview transcription
        language="en",

        # Better decoding
        beam_size=5,
        temperature=0,

        # Ignore silent/noisy portions
        vad_filter=True,

        # Reduce repetitive hallucinations
        condition_on_previous_text=False
    )

    transcript = " ".join(
        segment.text.strip()
        for segment in segments
        if segment.text.strip()
    )

    transcript = transcript.strip()

    print("\n✅ Transcription completed.")

    print("\nDetected language:", info.language)
    print("Transcript:")
    print(transcript)

    return transcript


if __name__ == "__main__":
    transcribe_audio("speech.wav")