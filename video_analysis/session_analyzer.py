import cv2
import time

from video_analyzer import VideoAnalyzer


# ==================================================
# SESSION ANALYZER
# ==================================================

class SessionAnalyzer:

    def __init__(self):

        self.total_frames = 0
        self.face_frames = 0
        self.eye_open_frames = 0
        self.forward_frames = 0

        self.total_engagement = 0

        self.start_time = None
        self.end_time = None

    # ==================================================
    # Process one frame
    # ==================================================

    def process(self, data):

        self.total_frames += 1

        # --------------------------------------------------
        # Face detected
        # --------------------------------------------------

        if data["face_detected"]:

            self.face_frames += 1

        # --------------------------------------------------
        # Eyes open
        # --------------------------------------------------

        if data["eye_status"] == "OPEN":

            self.eye_open_frames += 1

        # --------------------------------------------------
        # Looking forward
        # --------------------------------------------------

        if data["looking_direction"] == "FORWARD":

            self.forward_frames += 1

        # --------------------------------------------------
        # Engagement
        # --------------------------------------------------

        self.total_engagement += data["engagement_score"]

    # ==================================================
    # Start session
    # ==================================================

    def start(self):

        self.start_time = time.time()

    # ==================================================
    # End session
    # ==================================================

    def stop(self):

        self.end_time = time.time()

    # ==================================================
    # Generate session report
    # ==================================================

    def get_report(self):

        if self.total_frames == 0:

            return {
                "duration_seconds": 0,
                "face_detection_percentage": 0,
                "eye_open_percentage": 0,
                "forward_looking_percentage": 0,
                "average_engagement": 0
            }

        # --------------------------------------------------
        # Duration
        # --------------------------------------------------

        duration = 0

        if self.start_time is not None and self.end_time is not None:

            duration = self.end_time - self.start_time

        # --------------------------------------------------
        # Percentages
        # --------------------------------------------------

        face_percentage = (
            self.face_frames / self.total_frames
        ) * 100

        eye_percentage = (
            self.eye_open_frames / self.total_frames
        ) * 100

        forward_percentage = (
            self.forward_frames / self.total_frames
        ) * 100

        # --------------------------------------------------
        # Average engagement
        # --------------------------------------------------

        average_engagement = (
            self.total_engagement / self.total_frames
        )

        return {
            "duration_seconds": round(
                duration,
                2
            ),

            "face_detection_percentage": round(
                face_percentage,
                2
            ),

            "eye_open_percentage": round(
                eye_percentage,
                2
            ),

            "forward_looking_percentage": round(
                forward_percentage,
                2
            ),

            "average_engagement": round(
                average_engagement,
                2
            )
        }


# ==================================================
# MAIN PROGRAM
# ==================================================

def main():

    print()
    print("==========================================")
    print("      SkillMirror AI Session Analyzer")
    print("==========================================")
    print()

    # --------------------------------------------------
    # Create video analyzer
    # --------------------------------------------------

    analyzer = VideoAnalyzer()

    # --------------------------------------------------
    # Create session analyzer
    # --------------------------------------------------

    session = SessionAnalyzer()

    # --------------------------------------------------
    # Open camera
    # --------------------------------------------------

    cap = cv2.VideoCapture(0)

    if not cap.isOpened():

        print("ERROR: Could not open camera.")

        analyzer.close()

        return

    print("Camera started successfully!")
    print("Session analysis started.")
    print("Press Q to end the session.")
    print()

    # --------------------------------------------------
    # Start session timer
    # --------------------------------------------------

    session.start()

    timestamp = 0

    # ==================================================
    # Main loop
    # ==================================================

    while True:

        ret, frame = cap.read()

        if not ret:

            print("ERROR: Could not read camera frame.")

            break

        # --------------------------------------------------
        # Analyze current frame
        # --------------------------------------------------

        data = analyzer.analyze(
            frame,
            timestamp
        )

        timestamp += 33

        # --------------------------------------------------
        # Store frame data
        # --------------------------------------------------

        session.process(data)

        # ==================================================
        # Display current information
        # ==================================================

        if data["face_detected"]:

            cv2.putText(
                frame,
                "Face: YES",
                (20, 35),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (0, 255, 0),
                2
            )

            cv2.putText(
                frame,
                f"Eyes: {data['eye_status']}",
                (20, 65),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (0, 255, 0),
                2
            )

            cv2.putText(
                frame,
                f"Direction: {data['looking_direction']}",
                (20, 95),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (0, 255, 0),
                2
            )

            cv2.putText(
                frame,
                f"Engagement: {data['engagement_score']}%",
                (20, 130),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (0, 255, 255),
                2
            )

            cv2.putText(
                frame,
                f"Attention: {data['attention_status']}",
                (20, 165),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (0, 255, 255),
                2
            )

        else:

            cv2.putText(
                frame,
                "NO FACE DETECTED",
                (20, 40),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.8,
                (0, 0, 255),
                2
            )

        # --------------------------------------------------
        # Show session frame count
        # --------------------------------------------------

        cv2.putText(
            frame,
            f"Frames: {session.total_frames}",
            (20, 205),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            (255, 255, 255),
            2
        )

        # --------------------------------------------------
        # Display camera
        # --------------------------------------------------

        cv2.imshow(
            "SkillMirror AI - Session Analysis",
            frame
        )

        # --------------------------------------------------
        # Quit
        # --------------------------------------------------

        if cv2.waitKey(1) & 0xFF == ord("q"):

            break

    # ==================================================
    # Stop session
    # ==================================================

    session.stop()

    cap.release()

    cv2.destroyAllWindows()

    analyzer.close()

    # ==================================================
    # Generate report
    # ==================================================

    report = session.get_report()

    print()
    print("==========================================")
    print("          SESSION REPORT")
    print("==========================================")

    print(
        f"Session Duration       : "
        f"{report['duration_seconds']} seconds"
    )

    print(
        f"Face Detected          : "
        f"{report['face_detection_percentage']}%"
    )

    print(
        f"Eyes Open              : "
        f"{report['eye_open_percentage']}%"
    )

    print(
        f"Looking Forward        : "
        f"{report['forward_looking_percentage']}%"
    )

    print(
        f"Average Engagement     : "
        f"{report['average_engagement']}%"
    )

    print("==========================================")
    print()


# ==================================================
# Run
# ==================================================

if __name__ == "__main__":

    main()