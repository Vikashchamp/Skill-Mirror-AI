import cv2
import mediapipe as mp


# --------------------------------------------------
# MediaPipe Face Landmarker setup
# --------------------------------------------------

BaseOptions = mp.tasks.BaseOptions
FaceLandmarker = mp.tasks.vision.FaceLandmarker
FaceLandmarkerOptions = mp.tasks.vision.FaceLandmarkerOptions
VisionRunningMode = mp.tasks.vision.RunningMode


# Path to the MediaPipe face landmarker model
MODEL_PATH = "models/face_landmarker.task"


options = FaceLandmarkerOptions(
    base_options=BaseOptions(model_asset_path=MODEL_PATH),
    running_mode=VisionRunningMode.VIDEO,
    num_faces=1,
    min_face_detection_confidence=0.5,
    min_face_presence_confidence=0.5,
    min_tracking_confidence=0.5,
)


# --------------------------------------------------
# Start camera
# --------------------------------------------------

cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("ERROR: Could not open camera.")
    exit()

print("Face detection started!")
print("Press Q to quit.")


# --------------------------------------------------
# Process camera frames
# --------------------------------------------------

with FaceLandmarker.create_from_options(options) as landmarker:

    frame_timestamp_ms = 0

    while True:

        # Read frame from webcam
        ret, frame = cap.read()

        if not ret:
            print("ERROR: Could not read camera frame.")
            break

        # OpenCV uses BGR.
        # MediaPipe expects RGB.
        rgb_frame = cv2.cvtColor(
            frame,
            cv2.COLOR_BGR2RGB
        )

        # Convert frame to MediaPipe Image
        mp_image = mp.Image(
            image_format=mp.ImageFormat.SRGB,
            data=rgb_frame
        )

        # Run face landmark detection
        result = landmarker.detect_for_video(
            mp_image,
            frame_timestamp_ms
        )

        frame_timestamp_ms += 33


        # --------------------------------------------------
        # Draw detected face landmarks
        # --------------------------------------------------

        if result.face_landmarks:

            for face_landmarks in result.face_landmarks:

                height, width, _ = frame.shape

                for landmark in face_landmarks:

                    x = int(landmark.x * width)
                    y = int(landmark.y * height)

                    cv2.circle(
                        frame,
                        (x, y),
                        1,
                        (0, 255, 0),
                        -1
                    )

            cv2.putText(
                frame,
                "FACE DETECTED",
                (20, 40),
                cv2.FONT_HERSHEY_SIMPLEX,
                1,
                (0, 255, 0),
                2
            )

        else:

            cv2.putText(
                frame,
                "NO FACE DETECTED",
                (20, 40),
                cv2.FONT_HERSHEY_SIMPLEX,
                1,
                (0, 0, 255),
                2
            )


        # --------------------------------------------------
        # Display camera
        # --------------------------------------------------

        cv2.imshow(
            "SkillMirror AI - Face Detection",
            frame
        )


        # Press Q to quit
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break


# --------------------------------------------------
# Cleanup
# --------------------------------------------------

cap.release()
cv2.destroyAllWindows()

print("Face detection stopped.")