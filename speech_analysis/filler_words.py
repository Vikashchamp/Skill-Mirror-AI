import re


FILLER_WORDS = [
    "um",
    "uh",
    "er",
    "ah",
    "like",
    "you know",
    "actually",
    "basically",
    "literally",
    "i mean",
    "sort of",
    "kind of",
]


def detect_filler_words(transcript):
    """
    Detect common filler words and phrases in a transcript.

    Args:
        transcript: Speech transcript as a string.

    Returns:
        Dictionary containing filler counts and total count.
    """

    text = transcript.lower()

    filler_counts = {}

    for filler in FILLER_WORDS:
        pattern = r"\b" + re.escape(filler) + r"\b"
        matches = re.findall(pattern, text)

        if matches:
            filler_counts[filler] = len(matches)

    total_fillers = sum(filler_counts.values())

    return {
        "filler_counts": filler_counts,
        "total_fillers": total_fillers,
    }


def print_filler_report(result):
    """
    Display a readable filler-word report.
    """

    print("\n" + "=" * 40)
    print("FILLER WORD ANALYSIS")
    print("=" * 40)

    if not result["filler_counts"]:
        print("No filler words detected.")
    else:
        for filler, count in result["filler_counts"].items():
            print(f"{filler}: {count}")

    print("-" * 40)
    print(f"Total filler words: {result['total_fillers']}")
    print("=" * 40)


from .transcription import transcribe_audio


if __name__ == "__main__":

    transcript = transcribe_audio("speech.wav")

    result = detect_filler_words(transcript)

    print_filler_report(result)