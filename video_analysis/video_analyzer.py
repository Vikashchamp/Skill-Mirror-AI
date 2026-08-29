import cv2
import mediapipe as mp
import numpy as np
import math


class VideoAnalyzer:

    def __init__(self, model_path="models/face_landmarker.task"):

        # ==================================================
        # MediaPipe Face Landmarker
        # ==================================================

        BaseOptions = mp.tasks.BaseOptions
        FaceLandmarker = mp.tasks.vision.FaceLandmarker
        FaceLandmarkerOptions = mp.tasks.vision.FaceLandmarkerOptions
        VisionRunningMode = mp.tasks.vision.RunningMode

        options = FaceLandmarkerOptions(
            base_options=BaseOptions(
                model_asset_path=model_path
            ),
            running_mode=VisionRunningMode.VIDEO,
            num_faces=1,
            min_face_detection_confidence=0.5,
            min_face_presence_confidence=0.5,
            min_tracking_confidence=0.5
        )

        self.landmarker = FaceLandmarker.create_from_options(
            options
        )

    # ==================================================
    # Distance between two landmarks
    # ==================================================

    @staticmethod
    def distance(point1, point2):

        return math.sqrt(
            (point1.x - point2.x) ** 2
            + (point1.y - point2.y) ** 2
        )

    # ==================================================
    # Eye Aspect Ratio
    # ==================================================

    def calculate_eye_aspect_ratio(
        self,
        landmarks,
        eye_indices
    ):

        p1 = landmarks[eye_indices[0]]
        p2 = landmarks[eye_indices[1]]
        p3 = landmarks[eye_indices[2]]
        p4 = landmarks[eye_indices[3]]
        p5 = landmarks[eye_indices[4]]
        p6 = landmarks[eye_indices[5]]

        vertical_1 = self.distance(p2, p6)
        vertical_2 = self.distance(p3, p5)

        horizontal = self.distance(p1, p4)

        if horizontal == 0:
            return 0.0

        ear = (
            vertical_1 + vertical_2
        ) / (2 * horizontal)

        return ear

    # ==================================================
    # Head Pose
    # ==================================================

    def calculate_head_pose(
        self,
        landmarks,
        width,
        height
    ):

        # --------------------------------------------------
        # 3D reference points of a generic face
        # --------------------------------------------------

        model_points = np.array([
            (0.0, 0.0, 0.0),          # Nose
            (0.0, -63.6, -12.5),      # Chin
            (-43.3, 32.7, -26.0),     # Left eye
            (43.3, 32.7, -26.0),      # Right eye
            (-28.9, -28.9, -24.1),    # Left mouth
            (28.9, -28.9, -24.1)      # Right mouth
        ], dtype=np.float64)

        # --------------------------------------------------
        # MediaPipe landmark IDs
        # --------------------------------------------------

        landmark_ids = [
            1,      # Nose
            152,    # Chin
            33,     # Left eye
            263,    # Right eye
            61,     # Left mouth
            291     # Right mouth
        ]

        image_points = []

        for landmark_id in landmark_ids:

            landmark = landmarks[landmark_id]

            image_points.append([
                landmark.x * width,
                landmark.y * height
            ])

        image_points = np.array(
            image_points,
            dtype=np.float64
        )

        # --------------------------------------------------
        # Camera matrix
        # --------------------------------------------------

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

        # --------------------------------------------------
        # Assume no lens distortion
        # --------------------------------------------------

        distortion_coefficients = np.zeros(
            (4, 1),
            dtype=np.float64
        )

        # --------------------------------------------------
        # Solve head pose
        # --------------------------------------------------

        success, rotation_vector, translation_vector = cv2.solvePnP(
            model_points,
            image_points,
            camera_matrix,
            distortion_coefficients,
            flags=cv2.SOLVEPNP_ITERATIVE
        )

        if not success:

            return {
                "yaw": 0.0,
                "pitch": 0.0,
                "roll": 0.0,
                "direction": "UNKNOWN"
            }

        # --------------------------------------------------
        # Convert rotation vector to rotation matrix
        # --------------------------------------------------

        rotation_matrix, _ = cv2.Rodrigues(
            rotation_vector
        )

        # --------------------------------------------------
        # Extract rotation angles
        # --------------------------------------------------

        angles, _, _, _, _, _ = cv2.RQDecomp3x3(
            rotation_matrix
        )

        pitch = float(angles[0])
        yaw = float(angles[1])
        roll = float(angles[2])

        # --------------------------------------------------
        # Normalize angles
        #
        # This prevents values such as 177 degrees.
        # --------------------------------------------------

        if pitch > 90:
            pitch -= 180

        elif pitch < -90:
            pitch += 180

        if yaw > 90:
            yaw -= 180

        elif yaw < -90:
            yaw += 180

        if roll > 90:
            roll -= 180

        elif roll < -90:
            roll += 180

        # --------------------------------------------------
        # Determine looking direction
        # --------------------------------------------------

        if yaw > 15:

            direction = "RIGHT"

        elif yaw < -15:

            direction = "LEFT"

        elif pitch > 15:

            direction = "DOWN"

        elif pitch < -15:

            direction = "UP"

        else:

            direction = "FORWARD"

        return {
            "yaw": yaw,
            "pitch": pitch,
            "roll": roll,
            "direction": direction
        }

    # ==================================================
    # Engagement Score
    # ==================================================

    def calculate_engagement(
        self,
        eye_status,
        looking_direction
    ):

        score = 40

        # --------------------------------------------------
        # Eyes open
        # --------------------------------------------------

        if eye_status == "OPEN":

            score += 30

        # --------------------------------------------------
        # Looking forward
        # --------------------------------------------------

        if looking_direction == "FORWARD":

            score += 30

        # --------------------------------------------------
        # Attention level
        # --------------------------------------------------

        if score >= 80:

            attention_status = "HIGH"

        elif score >= 50:

            attention_status = "MEDIUM"

        else:

            attention_status = "LOW"

        return score, attention_status

    # ==================================================
    # Analyze one frame
    # ==================================================

    def analyze(
        self,
        frame,
        timestamp_ms
    ):

        height, width, _ = frame.shape

        # --------------------------------------------------
        # Convert BGR to RGB
        # --------------------------------------------------

        rgb_frame = cv2.cvtColor(
            frame,
            cv2.COLOR_BGR2RGB
        )

        # --------------------------------------------------
        # Create MediaPipe image
        # --------------------------------------------------

        mp_image = mp.Image(
            image_format=mp.ImageFormat.SRGB,
            data=rgb_frame
        )

        # --------------------------------------------------
        # Run face landmark detection
        # --------------------------------------------------

        result = self.landmarker.detect_for_video(
            mp_image,
            timestamp_ms
        )

        # ==================================================
        # No face detected
        # ==================================================

        if not result.face_landmarks:

            return {
                "face_detected": False,
                "eye_status": "UNKNOWN",
                "left_eye_ratio": 0.0,
                "right_eye_ratio": 0.0,
                "yaw": 0.0,
                "pitch": 0.0,
                "roll": 0.0,
                "looking_direction": "UNKNOWN",
                "engagement_score": 0,
                "attention_status": "LOW"
            }

        # ==================================================
        # Face detected
        # ==================================================

        landmarks = result.face_landmarks[0]

        # --------------------------------------------------
        # Eye landmark indices
        # --------------------------------------------------

        left_eye = [
            33,
            160,
            158,
            133,
            153,
            144
        ]

        right_eye = [
            362,
            385,
            387,
            263,
            373,
            380
        ]

        # --------------------------------------------------
        # Calculate eye ratios
        # --------------------------------------------------

        left_ratio = self.calculate_eye_aspect_ratio(
            landmarks,
            left_eye
        )

        right_ratio = self.calculate_eye_aspect_ratio(
            landmarks,
            right_eye
        )

        average_ratio = (
            left_ratio + right_ratio
        ) / 2

        # --------------------------------------------------
        # Determine eye status
        # --------------------------------------------------

        if average_ratio > 0.20:

            eye_status = "OPEN"

        else:

            eye_status = "CLOSED"

        # --------------------------------------------------
        # Calculate head pose
        # --------------------------------------------------

        pose = self.calculate_head_pose(
            landmarks,
            width,
            height
        )

        # --------------------------------------------------
        # Calculate engagement
        # --------------------------------------------------

        engagement_score, attention_status = (
            self.calculate_engagement(
                eye_status,
                pose["direction"]
            )
        )

        # ==================================================
        # Return analysis result
        # ==================================================

        return {
            "face_detected": True,

            "eye_status": eye_status,

            "left_eye_ratio": round(
                left_ratio,
                3
            ),

            "right_eye_ratio": round(
                right_ratio,
                3
            ),

            "yaw": round(
                pose["yaw"],
                2
            ),

            "pitch": round(
                pose["pitch"],
                2
            ),

            "roll": round(
                pose["roll"],
                2
            ),

            "looking_direction": pose["direction"],

            "engagement_score": engagement_score,

            "attention_status": attention_status
        }

    # ==================================================
    # Close MediaPipe
    # ==================================================

    def close(self):

        self.landmarker.close()