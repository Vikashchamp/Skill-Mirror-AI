import numpy as np
from scipy.io import wavfile


def analyze_prosody(audio_file):
    """
    Perform basic voice tone/prosody analysis.

    Returns:
        Dictionary containing pitch and energy metrics.
    """

    sample_rate, audio = wavfile.read(audio_file)

    # Convert stereo audio to mono
    if audio.ndim > 1:
        audio = np.mean(audio, axis=1)

    # Convert to floating point
    audio = audio.astype(np.float64)

    # Normalize audio
    max_value = np.max(np.abs(audio))

    if max_value > 0:
        audio = audio / max_value

    # --------------------------------
    # ENERGY ANALYSIS
    # --------------------------------

    rms_energy = np.sqrt(np.mean(audio ** 2))

    energy_std = np.std(audio)

    # --------------------------------
    # ZERO CROSSING RATE
    # --------------------------------

    zero_crossings = np.sum(
        np.abs(np.diff(np.sign(audio))) > 0
    )

    duration = len(audio) / sample_rate

    if duration > 0:
        zero_crossing_rate = zero_crossings / duration
    else:
        zero_crossing_rate = 0.0

    # --------------------------------
    # BASIC PITCH ESTIMATION
    # --------------------------------

    frame_size = int(sample_rate * 0.03)
    hop_size = int(sample_rate * 0.015)

    pitches = []

    for start in range(
        0,
        len(audio) - frame_size,
        hop_size
    ):

        frame = audio[start:start + frame_size]

        # Ignore very quiet frames
        if np.sqrt(np.mean(frame ** 2)) < 0.01:
            continue

        frame = frame - np.mean(frame)

        correlation = np.correlate(
            frame,
            frame,
            mode="full"
        )

        correlation = correlation[
            len(correlation) // 2:
        ]

        if len(correlation) < 2:
            continue

        # Search for human speech pitch range
        min_frequency = 70
        max_frequency = 350

        min_lag = int(sample_rate / max_frequency)
        max_lag = int(sample_rate / min_frequency)

        max_lag = min(max_lag, len(correlation) - 1)

        if min_lag >= max_lag:
            continue

        lag = (
            np.argmax(
                correlation[min_lag:max_lag]
            ) + min_lag
        )

        if lag > 0:
            pitch = sample_rate / lag

            if 70 <= pitch <= 350:
                pitches.append(pitch)

    # --------------------------------
    # PITCH STATISTICS
    # --------------------------------

    if pitches:
        average_pitch = np.mean(pitches)
        pitch_std = np.std(pitches)
        minimum_pitch = np.min(pitches)
        maximum_pitch = np.max(pitches)
    else:
        average_pitch = 0.0
        pitch_std = 0.0
        minimum_pitch = 0.0
        maximum_pitch = 0.0

    return {
        "average_pitch_hz": round(
            float(average_pitch), 2
        ),

        "pitch_variation_hz": round(
            float(pitch_std), 2
        ),

        "minimum_pitch_hz": round(
            float(minimum_pitch), 2
        ),

        "maximum_pitch_hz": round(
            float(maximum_pitch), 2
        ),

        "average_energy": round(
            float(rms_energy), 4
        ),

        "energy_variation": round(
            float(energy_std), 4
        ),

        "zero_crossing_rate": round(
            float(zero_crossing_rate), 2
        ),
    }


def print_prosody_report(result):
    """Print the prosody analysis report."""

    print("\n" + "=" * 45)
    print("        TONE / PROSODY ANALYSIS")
    print("=" * 45)

    print(
        f"Average pitch       : "
        f"{result['average_pitch_hz']} Hz"
    )

    print(
        f"Pitch variation     : "
        f"{result['pitch_variation_hz']} Hz"
    )

    print(
        f"Minimum pitch       : "
        f"{result['minimum_pitch_hz']} Hz"
    )

    print(
        f"Maximum pitch       : "
        f"{result['maximum_pitch_hz']} Hz"
    )

    print(
        f"Average energy      : "
        f"{result['average_energy']}"
    )

    print(
        f"Energy variation    : "
        f"{result['energy_variation']}"
    )

    print(
        f"Zero crossing rate  : "
        f"{result['zero_crossing_rate']}"
    )

    print("=" * 45)


if __name__ == "__main__":

    result = analyze_prosody("speech.wav")

    print_prosody_report(result)