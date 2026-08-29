import cv2

from video_analyzer import VideoAnalyzer


# ==================================================
# Start Video Analyzer
# ==================================================

analyzer = VideoAnalyzer()

# ==================================================
# Start Camera
# ==================================================

cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("ERROR: Could not open camera.")
    analyzer.close()
    exit()

print("SkillMirror Video Analyzer started!")
print("Press Q to quit.")


# Timestamp for MediaPipe VIDEO mode
timestamp = 0


# ==================================================
# Main Loop
# ==================================================

while True:

    ret, frame = cap.read()

    if not ret:
        print("ERROR: Could not read frame.")
        break

    # --------------------------------------------------
    # Analyze frame
    # --------------------------------------------------

    data = analyzer.analyze(
        frame,
        timestamp
    )

    timestamp += 33


    # ==================================================
    # Display Results
    # ==================================================

    if data["face_detected"]:

        # Face
        cv2.putText(
            frame,
            f"Face: YES",
            (20, 35),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (0, 255, 0),
            2
        )

        # Eyes
        cv2.putText(
            frame,
            f"Eyes: {data['eye_status']}",
            (20, 65),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (0, 255, 0),
            2
        )

        # Direction
        cv2.putText(
            frame,
            f"Direction: {data['looking_direction']}",
            (20, 95),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (0, 255, 0),
            2
        )

        # Yaw
        cv2.putText(
            frame,
            f"Yaw: {data['yaw']:.1f}",
            (20, 125),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (255, 255, 0),
            2
        )

        # Pitch
        cv2.putText(
            frame,
            f"Pitch: {data['pitch']:.1f}",
            (20, 155),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (255, 255, 0),
            2
        )

        # ==================================================
        # ENGAGEMENT
        # ==================================================

        cv2.putText(
            frame,
            f"Engagement: {data['engagement_score']}%",
            (20, 190),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (0, 255, 255),
            2
        )

        # ==================================================
        # ATTENTION
        # ==================================================

        cv2.putText(
            frame,
            f"Attention: {data['attention_status']}",
            (20, 225),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (0, 255, 255),
            2
        )

    else:

        # No face

        cv2.putText(
            frame,
            "NO FACE DETECTED",
            (20, 40),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (0, 0, 255),
            2
        )

        cv2.putText(
            frame,
            "Engagement: 0%",
            (20, 75),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (0, 0, 255),
            2
        )

        cv2.putText(
            frame,
            "Attention: LOW",
            (20, 110),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (0, 0, 255),
            2
        )


    # ==================================================
    # Show Camera
    # ==================================================

    cv2.imshow(
        "SkillMirror AI - Video Analyzer",
        frame
    )


    # ==================================================
    # Quit with Q
    # ==================================================

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break


# ==================================================
# Cleanup
# ==================================================

cap.release()

cv2.destroyAllWindows()

analyzer.close()

print("Video analyzer stopped.")