from flask import Flask, request, jsonify, Response
import cv2
import numpy as np
from ultralytics import YOLO
from tensorflow.keras.models import load_model
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load YOLOv8 model for face detection
yolo_model = YOLO("yolov8n-face.pt")

# Load emotion detection model
model = load_model('emotion_detection_model.h5')

# Open a global VideoCapture instance to keep the camera open
camera = cv2.VideoCapture(0)
if not camera.isOpened():
    raise RuntimeError("Could not start camera.")

def detect_emotion_from_frame(frame):
    results = yolo_model(frame)
    detections = results[0].boxes.data.cpu().numpy()  # Convert detections to numpy array
    emotions = []

    for det in detections:
        x1, y1, x2, y2, conf = map(int, det[:5])  # Extract bounding box and confidence
        face = frame[y1:y2, x1:x2]

        if face.size == 0:
            continue

        face = cv2.cvtColor(face, cv2.COLOR_BGR2GRAY)
        face = cv2.resize(face, (48, 48))
        face = face.astype('float32') / 255.0
        face = np.expand_dims(face, axis=-1)  # Add channel dimension (grayscale)
        face = np.expand_dims(face, axis=0)  # Add batch dimension

        emotion_pred = model.predict(face)
        emotion = np.argmax(emotion_pred)

        emotion_label = ['angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral']
        emotions.append({"box": [int(x1), int(y1), int(x2-x1), int(y2-y1)], "emotion": emotion_label[emotion]})

    return emotions

@app.route('/video_feed')
def video_feed():
    def generate():
        while True:
            ret, frame = camera.read()
            if not ret:
                continue

            emotions = detect_emotion_from_frame(frame)
            for emotion in emotions:
                x, y, w, h = emotion["box"]
                label = emotion["emotion"]
                cv2.rectangle(frame, (x, y), (x+w, y+h), (255, 0, 0), 2)
                cv2.putText(frame, label, (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 0, 0), 2)

            _, buffer = cv2.imencode('.jpg', frame)
            frame_bytes = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

    return Response(generate(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/detect_emotion', methods=['POST'])
def detect_emotion():
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400

    file = request.files['image']
    try:
        file_bytes = np.frombuffer(file.read(), np.uint8)
        image = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
        emotions = detect_emotion_from_frame(image)
        return jsonify({"emotions": emotions})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
        app.run(debug=True)
