import sounddevice as sd
from scipy.io.wavfile import write


def record_audio(
    filename="speech.wav",
    duration=20,
    sample_rate=44100
):
    """
    Record microphone audio and save it as a WAV file.
    """

    print("\n" + "=" * 50)
    print("       SKILLMIRROR AUDIO RECORDER")
    print("=" * 50)

    print(f"\n🎙️ Recording for {duration} seconds...")
    print("Speak naturally and include your normal interview-style speech.")
    print("You can use filler words such as:")
    print("um, uh, basically, actually, you know, like, yeah")
    print("\n🔴 Recording started...")

    audio = sd.rec(
        int(duration * sample_rate),
        samplerate=sample_rate,
        channels=1,
        dtype="int16"
    )

    sd.wait()

    print("🛑 Recording finished.")

    write(
        filename,
        sample_rate,
        audio
    )

    print(f"✅ Audio saved as: {filename}")
    print("=" * 50)


if __name__ == "__main__":
    record_audio(
        filename="speech.wav",
        duration=20,
        sample_rate=44100
    )