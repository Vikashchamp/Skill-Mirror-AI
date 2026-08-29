import cv2
import mediapipe as mp
import math


# ============================================================
# MediaPipe setup
# ============================================================

BaseOptions = mp.tasks.BaseOptions
FaceLandmarker = mp.tasks.vision.FaceLandmarker
FaceLandmarkerOptions = mp.tasks.vision.FaceLandmarkerOptions
VisionRunningMode = mp.tasks.vision.RunningMode

MODEL_PATH = "models/face_landmarker.task"


options = FaceLandmarkerOptions(
    base_options=BaseOptions(model_asset_path=MODEL_PATH),
    running_mode=VisionRunningMode.VIDEO,
    num_faces=1,
    min_face_detection_confidence=0.5,
    min_face_presence_confidence=0.5,
    min_tracking_confidence=0.5,
)


# ============================================================
# Calculate distance between two landmarks
# ============================================================

def distance(point1, point2):

    return math.sqrt(
        (point1.x - point2.x) ** 2 +
        (point1.y - point2.y) ** 2
    )


# ============================================================
# Calculate Eye Aspect Ratio
# ============================================================

def calculate_eye_aspect_ratio(landmarks, eye_indices):

    p1 = landmarks[eye_indices[0]]
    p2 = landmarks[eye_indices[1]]
    p3 = landmarks[eye_indices[2]]
    p4 = landmarks[eye_indices[3]]
    p5 = landmarks[eye_indices[4]]
    p6 = landmarks[eye_indices[5]]

    vertical_1 = distance(p2, p6)
    vertical_2 = distance(p3, p5)

    horizontal = distance(p1, p4)

    if horizontal == 0:
        return 0

    ear = (vertical_1 + vertical_2) / (2 * horizontal)

    return ear


# ============================================================
# Eye landmark indices
# ============================================================

LEFT_EYE = [33, 160, 158, 133, 153, 144]

RIGHT_EYE = [362, 385, 387, 263, 373, 380]


# ============================================================
# Start camera
# ============================================================

cap = cv2.VideoCapture(0)

if not cap.isOpened():

    print("ERROR: Could not open camera.")
    exit()


print("Facial metrics analysis started!")
print("Press Q to quit.")


# ============================================================
# Start MediaPipe
# ============================================================

with FaceLandmarker.create_from_options(options) as landmarker:

    timestamp = 0

    while True:

        ret, frame = cap.read()

        if not ret:

            print("ERROR: Could not read frame.")
            break


        # ----------------------------------------------------
        # Convert BGR → RGB
        # ----------------------------------------------------

        rgb_frame = cv2.cvtColor(
            frame,
            cv2.COLOR_BGR2RGB
        )


        # ----------------------------------------------------
        # Create MediaPipe image
        # ----------------------------------------------------

        mp_image = mp.Image(
            image_format=mp.ImageFormat.SRGB,
            data=rgb_frame
        )


        # ----------------------------------------------------
        # Detect face
        # ----------------------------------------------------

        result = landmarker.detect_for_video(
            mp_image,
            timestamp
        )

        timestamp += 33


        # ====================================================
        # Analyze detected face
        # ====================================================

        if result.face_landmarks:

            landmarks = result.face_landmarks[0]


            # ------------------------------------------------
            # Calculate left and right eye openness
            # ------------------------------------------------

            left_ear = calculate_eye_aspect_ratio(
                landmarks,
                LEFT_EYE
            )

            right_ear = calculate_eye_aspect_ratio(
                landmarks,
                RIGHT_EYE
            )


            average_ear = (
                left_ear + right_ear
            ) / 2


            # ------------------------------------------------
            # Determine whether eyes are open
            # ------------------------------------------------

            if average_ear > 0.20:

                eye_status = "OPEN"

            else:

                eye_status = "CLOSED"


            # ------------------------------------------------
            # Display metrics
            # ------------------------------------------------

            cv2.putText(
                frame,
                f"Left Eye: {left_ear:.2f}",
                (20, 40),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (0, 255, 0),
                2
            )

            cv2.putText(
                frame,
                f"Right Eye: {right_ear:.2f}",
                (20, 70),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (0, 255, 0),
                2
            )

            cv2.putText(
                frame,
                f"Eye Status: {eye_status}",
                (20, 100),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (0, 255, 0),
                2
            )


            # ------------------------------------------------
            # Draw a few eye landmarks
            # ------------------------------------------------

            height, width, _ = frame.shape

            for index in LEFT_EYE + RIGHT_EYE:

                landmark = landmarks[index]

                x = int(landmark.x * width)
                y = int(landmark.y * height)

                cv2.circle(
                    frame,
                    (x, y),
                    3,
                    (255, 0, 0),
                    -1
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


        # ====================================================
        # Show camera
        # ====================================================

        cv2.imshow(
            "SkillMirror AI - Facial Metrics",
            frame
        )


        # Press Q to quit
        if cv2.waitKey(1) & 0xFF == ord("q"):

            break


# ============================================================
# Cleanup
# ============================================================

cap.release()

cv2.destroyAllWindows()

print("Facial metrics analysis stopped.")