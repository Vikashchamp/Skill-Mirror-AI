import cv2
import mediapipe as mp
import numpy as np


# ============================================================
# MediaPipe Face Landmarker setup
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
# 3D reference points for a generic human face
# ============================================================

MODEL_POINTS = np.array([
    (0.0, 0.0, 0.0),          # Nose
    (0.0, -63.6, -12.5),      # Chin
    (-43.3, 32.7, -26.0),     # Left eye
    (43.3, 32.7, -26.0),      # Right eye
    (-28.9, -28.9, -24.1),    # Left mouth
    (28.9, -28.9, -24.1)      # Right mouth
], dtype=np.float64)


# MediaPipe landmark indices corresponding to the points above
LANDMARK_IDS = [
    1,      # Nose
    152,    # Chin
    33,     # Left eye
    263,    # Right eye
    61,     # Left mouth
    291     # Right mouth
]


# ============================================================
# Start camera
# ============================================================

cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("ERROR: Could not open camera.")
    exit()

print("Head pose detection started!")
print("Press Q to quit.")


# ============================================================
# Start MediaPipe
# ============================================================

with FaceLandmarker.create_from_options(options) as landmarker:

    timestamp = 0

    while True:

        # ----------------------------------------------------
        # Read camera frame
        # ----------------------------------------------------

        ret, frame = cap.read()

        if not ret:
            print("ERROR: Could not read camera frame.")
            break


        height, width, _ = frame.shape


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
        # Head pose calculation
        # ====================================================

        if result.face_landmarks:

            landmarks = result.face_landmarks[0]


            # ------------------------------------------------
            # Get 2D image coordinates
            # ------------------------------------------------

            image_points = []

            for landmark_id in LANDMARK_IDS:

                landmark = landmarks[landmark_id]

                x = landmark.x * width
                y = landmark.y * height

                image_points.append((x, y))


            image_points = np.array(
                image_points,
                dtype=np.float64
            )


            # ------------------------------------------------
            # Camera matrix
            # ------------------------------------------------

            focal_length = width

            center = (
                width / 2,
                height / 2
            )

            camera_matrix = np.array([
                [focal_length, 0, center[0]],
                [0, focal_length, center[1]],
                [0, 0, 1]
            ], dtype=np.float64)


            # Assume no lens distortion
            distortion_coefficients = np.zeros(
                (4, 1),
                dtype=np.float64
            )


            # ------------------------------------------------
            # Solve head pose
            # ------------------------------------------------

            success, rotation_vector, translation_vector = cv2.solvePnP(
                MODEL_POINTS,
                image_points,
                camera_matrix,
                distortion_coefficients,
                flags=cv2.SOLVEPNP_ITERATIVE
            )


            if success:

                # Convert rotation vector to rotation matrix
                rotation_matrix, _ = cv2.Rodrigues(
                    rotation_vector
                )


                # Convert rotation matrix to Euler angles
                angles, _, _, _, _, _ = cv2.RQDecomp3x3(
                    rotation_matrix
                )


                pitch = angles[0]
                yaw = angles[1]
                roll = angles[2]


                # ------------------------------------------------
                # Determine looking direction
                # ------------------------------------------------

                if yaw > 15:

                    direction = "LOOKING RIGHT"

                elif yaw < -15:

                    direction = "LOOKING LEFT"

                elif pitch > 15:

                    direction = "LOOKING DOWN"

                elif pitch < -15:

                    direction = "LOOKING UP"

                else:

                    direction = "LOOKING FORWARD"


                # ------------------------------------------------
                # Display angles
                # ------------------------------------------------

                cv2.putText(
                    frame,
                    f"Yaw: {yaw:.1f}",
                    (20, 40),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.7,
                    (0, 255, 0),
                    2
                )

                cv2.putText(
                    frame,
                    f"Pitch: {pitch:.1f}",
                    (20, 70),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.7,
                    (0, 255, 0),
                    2
                )

                cv2.putText(
                    frame,
                    f"Roll: {roll:.1f}",
                    (20, 100),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.7,
                    (0, 255, 0),
                    2
                )


                # ------------------------------------------------
                # Display direction
                # ------------------------------------------------

                cv2.putText(
                    frame,
                    direction,
                    (20, 140),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.9,
                    (0, 255, 255),
                    2
                )


                # ------------------------------------------------
                # Draw selected landmarks
                # ------------------------------------------------

                for point in image_points:

                    x = int(point[0])
                    y = int(point[1])

                    cv2.circle(
                        frame,
                        (x, y),
                        4,
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
        # Display
        # ====================================================

        cv2.imshow(
            "SkillMirror AI - Head Pose",
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

print("Head pose detection stopped.")