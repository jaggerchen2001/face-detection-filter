# Face Detection Application
## Description
This interactive face detection application leverages advanced image processing techniques and real-time video capture to provide a unique user experience. Utilizing ES6 syntax and modular design principles, the application incorporates live webcam feed manipulation, including grayscale conversion, brightness adjustment, and color space conversion with CMY and YCbCr. It features real-time face detection using ml5.faceApi, customizable image filters, and sophisticated extensions for enhanced user interaction.

## Features
- Live Webcam Feed: Capture real-time video to process and manipulate.
- Grayscale Conversion: Transform images to grayscale for further analysis.
- Brightness Adjustment: Increase brightness by 20% with proper capping to prevent washout.
- Color Channel Splitting: Separate images into red, green, and blue components.
- Color Channel Thresholding: Apply thresholds to each color channel using interactive sliders.
- Color Space Conversion: Convert RGB images to CMY and YCbCr color spaces.
- Face Detection: Detect faces in real-time using ml5.faceApi.
- Interactive Filters: Apply grayscale, blur, color conversion, and pixelation to the detected faces.
- Custom Filters: UOL and demon filters for a fun and personalized experience.
- Face Parts Detection: Identify specific facial landmarks for advanced applications.
  
## Installation
1. Clone the repository to your local machine.
```
git clone [repository-url]
cd [repository-name]
```
2. Navigate to the project directory.
3. Open index.html in a web browser.
4. Upon launching the application, you will see a grid layout with various sections for each feature:

- Activate the webcam by clicking the 'Enable Webcam' button.
- Use the sliders to adjust the threshold for each color channel.
- Press the designated keys (1-7) to toggle between the various filters and face detection.
- To capture a snapshot, click the 'snap' button.
- View the console window for live logs and status updates.
  
## Dependencies
ml5.js for face detection.
p5.js for the canvas and image processing functionality.
