const VISION_ROOT = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21';
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite';

let visionModulePromise;

const loadVisionModule = () => {
    if (!visionModulePromise) {
        const moduleUrl = `${VISION_ROOT}/vision_bundle.mjs`;
        visionModulePromise = import(/* @vite-ignore */ moduleUrl).catch(error => {
            visionModulePromise = undefined;
            throw error;
        });
    }
    return visionModulePromise;
};

export const createFaceDetector = async (loadModule = loadVisionModule) => {
    const { FaceDetector, FilesetResolver } = await loadModule();
    const vision = await FilesetResolver.forVisionTasks(`${VISION_ROOT}/wasm`);
    const detector = await FaceDetector.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: MODEL_URL,
            delegate: 'CPU',
        },
        runningMode: 'IMAGE',
        minDetectionConfidence: 0.6,
    });
    let closed = false;

    return {
        detect(image) {
            if (closed) throw new Error('FACE_DETECTOR_CLOSED');
            // Keep the geometry contract used by the oval check independent of the detection engine.
            return detector.detect(image).detections.map(({ boundingBox }) => ({
                boundingBox: boundingBox && {
                    x: boundingBox.originX,
                    y: boundingBox.originY,
                    width: boundingBox.width,
                    height: boundingBox.height,
                },
            }));
        },
        close() {
            if (!closed) {
                closed = true;
                detector.close();
            }
        },
    };
};
