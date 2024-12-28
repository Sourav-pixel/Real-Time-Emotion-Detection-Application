# Real-Time Emotion Detection Application

This project is a **Real-Time Emotion Detection App** that uses a Flask backend and a React.js frontend. The system processes video streams to detect human emotions using deep learning and provides audio feedback for the detected emotion. 

---
![Screenshot_20241228_132117](https://github.com/user-attachments/assets/97688b60-7249-47dd-97ec-a8c1a538783b)

![Screenshot_20241228_124920](https://github.com/user-attachments/assets/502a206e-d3a9-4704-9286-e960da334655)

![Screenshot_20241228_132219](https://github.com/user-attachments/assets/38ba5309-c608-4dc9-9ecb-992d2f298242)

## Features

1. **Real-Time Emotion Detection**: 
   - Detects emotions such as *happy*, *sad*, *angry*, *surprised*, *fear*, and *neutral* from live video streams.
2. **Speech Feedback**: 
   - The application provides spoken feedback for detected emotions.
3. **Interactive UI**:
   - Built with React.js, offering a user-friendly interface with live camera feed and controls.
4. **Backend API**:
   - The Flask backend processes the video frames using a deep learning model and YOLOv8 for face detection.
5. **Cross-Origin Support**:
   - Enabled CORS to allow seamless communication between the frontend and backend.

---

## Technologies Used

### Frontend
- **React.js**: For building the UI.
- **Tailwind CSS**: For styling.
- **Lucide React Icons**: For interactive icons.

### Backend
- **Flask**: Serves the API endpoints and video feed.
- **YOLOv8**: For face detection.
- **Keras TensorFlow**: For emotion classification.

### Others
- **Speech Synthesis API**: For providing spoken feedback.
- **OpenCV**: For video frame processing.

---

## Prerequisites

1. **Backend Dependencies**:
   - Python 3.8 or higher
   - Flask
   - TensorFlow
   - OpenCV
   - Ultralytics (for YOLOv8)

   Install Python dependencies:
   ```bash
   pip install -r requirements.txt
