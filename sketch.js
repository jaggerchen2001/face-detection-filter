let img;
let UOL;
let demon;
let capture;
let button;
let sliders = [];
let video;
let CMYslider;
let YCbCrslider;
let CMYImg;
let YCbCrImg;
let rImg;
let gImg;
let bImg;
let faceapi;
let detections;
let filterGrayScale = false; // This will be toggled when '1' is pressed
let blur = false; // This will be toggled when '2' is pressed
let colorConvert = false; // This will be toggled when '3' is pressed
let pixelate = false; // This will be toggled when '4' is pressed
let UOL_pic = false; // This will be toggled when '5' is pressed
let demon_pic = false; // This will be toggled when '6' is pressed
let face_Parts_Detection = false; // This will be toggled when '7' is pressed
//to display when it is ready
let logged = false;
let logged_2 = false;

function preload() {
    // preload() runs once
    UOL = loadImage("UOL.png");
    demon = loadImage("demon.png");
}

function setup() {
    pixelDensity(1);
    createCanvas(1000, 800);
    background(255);
    capture = createCapture(VIDEO);
    capture.size(160, 120);
    capture.hide();
    video = createCapture(VIDEO);
    video.size(160, 120);
    video.hide();
    button = createButton("snap");
    button.position(510 - capture.height + 20, capture.height / 2);
    // wait until the video starts playing to create the image
    button.mousePressed(takeSnapshot);
    // Create sliders for thresholding each color channel
    for (let i = 0; i < 3; i++) {
        sliders[i] = createSlider(0, 255, 100); // Range between 0 and 255, starting at 100
        sliders[i].position(20 + i * 180, 310);
        sliders[i].size(100);
    }
    CMYslider = createSlider(0, 255, 150);
    CMYslider.position(200, 610);
    CMYslider.size(100);

    YCbCrslider = createSlider(0, 255, 100);
    YCbCrslider.position(380, 610);
    YCbCrslider.size(100);

    faceapi = ml5.faceApi(video);
    noLoop();
}

function draw() {
    drawText();
    // Display the original image scaled to 160 x 120 pixels
    if (img) {
        image(img, 0, 0, 160, 120);
        drawGray();
        drawRGB();
        drawthreshold();
        image(img, 0, 450, 160, 120);
        drawCMY();
        drawYCbCr();
        drawCMYThreshold();
        drawYCbCrThreshold();
        faceDetaction();
    }
}

function takeSnapshot() {
    // Adjusted to handle the snapshot functionality
    if (!img || img.width !== capture.width) {
        img = createImage(capture.width, capture.height);
    }
    img.copy(
        capture,
        0,
        0,
        capture.width,
        capture.height,
        0,
        0,
        img.width,
        img.height
    );
    redraw(); // Ensure the canvas is updated with the new image
}

function drawGray() {
    // Create a grayscale version of the image with increased brightness
    let grayImg = img.get();
    grayImg.filter(GRAY);
    grayImg.loadPixels();
    // Iterates over the pixels[] array of the grayImg image.
    for (let i = 0; i < grayImg.pixels.length; i += 4) {
        // Increase brightness by 20%
        for (let j = 0; j < 3; j++) {
            // Loop through the R, G, B components
            grayImg.pixels[i + j] = min(grayImg.pixels[i + j] * 1.2, 255); // Increase and cap at 255
        }
    }
    grayImg.updatePixels();

    // Display the processed image beside the original
    image(grayImg, 170, 0, 160, 120);
}

function drawRGB() {
    rImg = img.get();
    gImg = img.get();
    bImg = img.get();

    rImg.loadPixels();
    gImg.loadPixels();
    bImg.loadPixels();

    for (let y = 0; y < img.height; y++) {
        for (let x = 0; x < img.width; x++) {
            let index = (x + y * img.width) * 4;
            let r = img.pixels[index];
            let g = img.pixels[index + 1];
            let b = img.pixels[index + 2];

            // Red channel
            rImg.pixels[index] = r;
            rImg.pixels[index + 1] = 0;
            rImg.pixels[index + 2] = 0;
            rImg.pixels[index + 3] = 255; // Alpha

            // Green channel
            gImg.pixels[index] = 0;
            gImg.pixels[index + 1] = g;
            gImg.pixels[index + 2] = 0;
            gImg.pixels[index + 3] = 255; // Alpha

            // Blue channel
            bImg.pixels[index] = 0;
            bImg.pixels[index + 1] = 0;
            bImg.pixels[index + 2] = b;
            bImg.pixels[index + 3] = 255; // Alpha
        }
    }

    rImg.updatePixels();
    gImg.updatePixels();
    bImg.updatePixels();

    // Display the images
    image(rImg, 0, 150);
    image(gImg, 170, 150);
    image(bImg, 340, 150);
}

function drawthreshold() {
    let thresholdImages = [rImg.get(), gImg.get(), bImg.get()];

    thresholdImages.forEach((img, i) => {
        img.loadPixels();

        for (let y = 0; y < img.height; y++) {
            for (let x = 0; x < img.width; x++) {
                let index = (x + y * img.width) * 4;
                let colorValue = img.pixels[index + i]; // Get the color component based on the channel
                let threshold = sliders[i].value();
                let color;

                // Apply threshold using if-else instead of ternary operator
                if (colorValue > threshold) {
                    color = 255; // Set to white
                } else {
                    color = 0; // Set to black
                }

                // Set all RGB channels to the same value to create a grayscale image
                img.pixels[index] = color;
                img.pixels[index + 1] = color;
                img.pixels[index + 2] = color;
                img.pixels[index + 3] = 255; // Alpha channel stays fully opaque
            }
        }

        img.updatePixels();
    });

    // Display the thresholded images
    image(thresholdImages[0], 0, 300); // Red channel
    image(thresholdImages[1], 170, 300); // Green channel
    image(thresholdImages[2], 340, 300); // Blue channel
}

function drawCMY() {
    CMYImg = img.get();
    CMYImg.loadPixels();

    for (let i = 0; i < img.pixels.length; i += 4) {
        // Extract the RGB components from the original image
        let r = img.pixels[i];
        let g = img.pixels[i + 1];
        let b = img.pixels[i + 2];

        // Convert RGB to CMY
        let c = 255 - r;
        let m = 255 - g;
        let y = 255 - b;

        // Set the CMY values in the new image, ignoring the alpha channel
        CMYImg.pixels[i] = c; // Cyan
        CMYImg.pixels[i + 1] = m; // Magenta
        CMYImg.pixels[i + 2] = y; // Yellow
        CMYImg.pixels[i + 3] = 255; // Alpha channel, keeping it fully opaque
    }

    CMYImg.updatePixels();

    // Display the CMY image
    image(CMYImg, 170, 450);
}

function drawYCbCr() {
    YCbCrImg = convertYCbCr(img);
    image(YCbCrImg, 340, 450);
}

// convert img from RGB to YCbCr
function convertYCbCr(img) {
    let Img = img.get();
    Img.loadPixels();

    for (let i = 0; i < img.pixels.length; i += 4) {
        let r = img.pixels[i];
        let g = img.pixels[i + 1];
        let b = img.pixels[i + 2];

        let R = r / 255;
        let G = g / 255;
        let B = b / 255;

        // Apply the YCbCr conversion
        let Y = 0.299 * R + 0.587 * G + 0.114 * B;
        let Cb = -0.169 * R - 0.331 * G + 0.5 * B;
        let Cr = 0.5 * R - 0.419 * G - 0.081 * B;

        // Scale the YCbCr values to the 0-255 range
        let Y_scaled = map(Y, 0, 1, 0, 255);
        let Cb_scaled = map(Cb, -0.5, 0.5, 0, 255);
        let Cr_scaled = map(Cr, -0.5, 0.5, 0, 255);

        Img.pixels[i] = Y_scaled;
        Img.pixels[i + 1] = Cb_scaled;
        Img.pixels[i + 2] = Cr_scaled;
        Img.pixels[i + 3] = 255; // Alpha channel
    }

    Img.updatePixels();

    // Return the modified image
    return Img;
}

function drawCMYThreshold() {
    // Assuming CMYImg is already defined and loaded elsewhere in your code
    let CMYThresImg = CMYImg.get();
    CMYThresImg.loadPixels();

    let threshold = CMYslider.value(); // Get the current threshold value from the slider

    for (let i = 0; i < CMYThresImg.pixels.length; i += 4) {
        // Calculate the intensity of the current pixel
        let intensity =
            (CMYThresImg.pixels[i] +
                CMYThresImg.pixels[i + 1] +
                CMYThresImg.pixels[i + 2]) /
            3;

        // Apply the threshold to determine if the pixel should be black or white
        let val;

        if (intensity < threshold) {
            val = 255;
        } else {
            val = 0;
        }

        // Set the pixel to black or white based on the threshold comparison
        CMYThresImg.pixels[i] = val; // Cyan channel
        CMYThresImg.pixels[i + 1] = val; // Magenta channel
        CMYThresImg.pixels[i + 2] = val; // Yellow channel
        // Alpha channel remains unchanged
        CMYThresImg.pixels[i + 3] = 255;
    }

    CMYThresImg.updatePixels();

    // Display the black and white threshold image
    image(CMYThresImg, 170, 600);
}

function drawYCbCrThreshold() {
    let YCbCrThresImg = YCbCrImg.get(); // Clone the original YCbCr image
    YCbCrThresImg.loadPixels();

    let threshold = YCbCrslider.value(); // Get the current threshold value from the slider

    for (let i = 0; i < YCbCrThresImg.pixels.length; i += 4) {
        // Get the Y component from the YCbCr image
        let Y = YCbCrThresImg.pixels[i];

        // Apply the threshold to the Y component to create a black and white image
        if (Y < threshold) {
            YCbCrThresImg.pixels[i] = 0; // Set the pixel to black
            YCbCrThresImg.pixels[i + 1] = 0;
            YCbCrThresImg.pixels[i + 2] = 0;
        } else {
            YCbCrThresImg.pixels[i] = 255; // Set the pixel to white
            YCbCrThresImg.pixels[i + 1] = 255;
            YCbCrThresImg.pixels[i + 2] = 255;
        }
        // Keep the alpha channel
        YCbCrThresImg.pixels[i + 3] = 255;
    }

    YCbCrThresImg.updatePixels();

    // Display the black and white threshold image
    image(YCbCrThresImg, 340, 600);
}

function drawText() {
    fill(0);
    noStroke();
    textSize(15);
    text("Webcam image", 40, 140);
    text("Grayscale and brightness + 20% ", 160, 140);
    text("Red channel", 40, 290);
    text("Green channel ", 195, 290);
    text("Blue channel", 370, 290);
    text("Threshold image ", 30, 440);
    text("Threshold image ", 190, 440);
    text("Threshold image ", 370, 440);
    text("Webcam image ", 40, 590);
    text("CMY", 230, 590);
    text("Y'CbCr", 400, 590);
    text("Face detection and replaced face images ", 40, 740, 120);
    text("Threshold image from CMY", 190, 740, 120);
    text("Threshold image from Y'CbCr", 370, 740, 120);
    text("Press 'snap button' to take pic and video ", 550, 210);
    text("Press 1 to on and off gray filter for face detection", 550, 230);
    text("Press 2 to on and off blur filter for face detection", 550, 250);
    text(
        "Press 3 to on and off color convert filter for face detection",
        550,
        270
    );
    text("Press 4 to on and off pixelate for face detection", 550, 290);
    text("Press 5 to on and off UOL filter for face detection", 550, 310);
    text("Press 6 to on and off demon filter for face detection", 550, 330);
    text("Press 7 to on and off face_Parts_Detection", 550, 350);
}

function faceDetaction() {
    if (!logged_2) {
        console.log('loading...');
        logged_2 = true;
    }
    faceapi.detect(gotResults);
}

function gotResults(err, result) {
    if (err) {
        console.log(err);
        return;
    }
    // console.log(result)
    detections = result;

    // background(220);
    image(video, 0, 600, 160, 120);
    if (detections) {
        if (detections.length > 0) {
            // console.log(detections)
            drawBox(detections);
            if (face_Parts_Detection) {
                drawLandmarks(detections);
            }
        }
    }
    faceapi.detect(gotResults);
}

function drawBox(detections) {
    for (let i = 0; i < detections.length; i += 1) {
        const alignedRect = detections[i].alignedRect;
        const x = alignedRect._box._x;
        const y = alignedRect._box._y + 600;
        const boxWidth = alignedRect._box._width;
        const boxHeight = alignedRect._box._height;
        if (!logged) {
            console.log('ready!');
            logged = true;
        }

        // Draw the face detection box normally
        noFill();
        stroke(161, 95, 251);
        strokeWeight(2);
        rect(x, y, boxWidth, boxHeight);
        // Get the pixels of the face area
        let faceImg = get(x, y, boxWidth, boxHeight);

        if (filterGrayScale) {
            // Apply grayscale filter to the face area
            faceImg.filter(GRAY);
            // Load the pixels and replace the face area with the grayscale image
            faceImg.loadPixels();
            // Replace the area on the canvas with the grayscale image
            image(faceImg, x, y);
        }

        if (blur) {
            // Apply blur filter to the face area
            faceImg.filter(BLUR, 3);
            // Load the pixels and replace the face area with the blurred image
            faceImg.loadPixels();
            // Replace the area on the canvas with the blurred image
            image(faceImg, x, y);
        }

        if (colorConvert) {
            let colorImg;
            colorImg = convertYCbCr(faceImg);
            image(colorImg, x, y);
        }

        if (pixelate) {
            faceImg.filter(GRAY); // Ensure it's grayscale if not already
            faceImg.loadPixels();

            const blockSize = 5; // Define the size of each block

            for (let by = 0; by < faceImg.height; by += blockSize) {
                for (let bx = 0; bx < faceImg.width; bx += blockSize) {
                    let total = 0;
                    let count = 0;

                    // Calculate the average pixel intensity for the 5x5 block
                    for (let y = by; y < by + blockSize && y < faceImg.height; y++) {
                        for (let x = bx; x < bx + blockSize && x < faceImg.width; x++) {
                            let index = (x + y * faceImg.width) * 4;
                            let r = faceImg.pixels[index];
                            total += r; // Since it's grayscale, R=G=B for intensity
                            count++;
                        }
                    }

                    let avePixInt = total / count;

                    // Paint the entire block with the average pixel intensity
                    for (let y = by; y < by + blockSize && y < faceImg.height; y++) {
                        for (let x = bx; x < bx + blockSize && x < faceImg.width; x++) {
                            let index = (x + y * faceImg.width) * 4;
                            faceImg.pixels[index] = avePixInt;
                            faceImg.pixels[index + 1] = avePixInt;
                            faceImg.pixels[index + 2] = avePixInt;
                        }
                    }
                }
            }

            faceImg.updatePixels();
            // Replace the area on the canvas with the pixelated image
            image(faceImg, x, y);
        }

        if (UOL_pic) {
            imageMode(CORNER);
            image(UOL, x, y, boxWidth, boxHeight);
        }

        if (demon_pic) {
            imageMode(CORNER);
            image(demon, x, y - 30, boxWidth, boxHeight + 40);
        }

    }
}

function drawLandmarks(detections) {
    noFill();
    stroke(161, 95, 251);
    strokeWeight(2);

    for (let i = 0; i < detections.length; i += 1) {
        const mouth = detections[i].parts.mouth;
        const nose = detections[i].parts.nose;
        const leftEye = detections[i].parts.leftEye;
        const rightEye = detections[i].parts.rightEye;
        const rightEyeBrow = detections[i].parts.rightEyeBrow;
        const leftEyeBrow = detections[i].parts.leftEyeBrow;

        drawPart(mouth, true);
        drawPart(nose, false);
        drawPart(leftEye, true);
        drawPart(leftEyeBrow, false);
        drawPart(rightEye, true);
        drawPart(rightEyeBrow, false);
    }
}

function drawPart(feature, closed) {
    beginShape();
    for (let i = 0; i < feature.length; i += 1) {
        const x = feature[i]._x;
        const y = feature[i]._y + 600;
        vertex(x, y);
    }

    if (closed === true) {
        endShape(CLOSE);
    } else {
        endShape();
    }
}

function keyPressed() {
    // press 1
    if (keyCode === 97 || keyCode === 49) {
        filterGrayScale = !filterGrayScale; // Toggle grayscale filter on and off
        // press 2
    } else if (keyCode === 98 || keyCode === 50) {
        blur = !blur; // Toggle blur filter on and off
        // press 3
    } else if (keyCode === 99 || keyCode === 51) {
        colorConvert = !colorConvert; // Toggle color convert filter on and off
        // press 4
    } else if (keyCode === 100 || keyCode === 52) {
        pixelate = !pixelate; // Toggle pixelate filter on and off
        // press 5
    } else if (keyCode === 101 || keyCode === 53) {
        UOL_pic = !UOL_pic; // Toggle pixelate filter on and off
        // press 6
    } else if (keyCode === 102 || keyCode === 54) {
        demon_pic = !demon_pic; // Toggle pixelate filter on and off
        // press 7
    } else if (keyCode === 103 || keyCode === 55) {
        face_Parts_Detection = !face_Parts_Detection; // Toggle face_Parts_Detectionr on and off
    }
}
