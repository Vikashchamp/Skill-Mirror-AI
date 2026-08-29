import cv2

# Open the default camera
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("ERROR: Could not open camera.")
    exit()

print("Camera started successfully!")
print("Press Q to quit.")

while True:
    # Read a frame from the camera
    ret, frame = cap.read()

    if not ret:
        print("ERROR: Could not read frame.")
        break

    # Display the video
    cv2.imshow("SkillMirror AI - Camera Test", frame)

    # Press Q to quit
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

# Release camera
cap.release()
cv2.destroyAllWindows()

print("Camera stopped.")