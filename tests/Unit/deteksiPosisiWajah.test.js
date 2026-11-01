import test from 'node:test';
import assert from 'node:assert/strict';
import { isFaceInsideOval } from '../../resources/js/src/layanan/deteksiPosisiWajah.js';

const portrait = { width: 280, height: 360 };
const centeredFace = { boundingBox: { x: 100, y: 105, width: 80, height: 120 } };

test('an empty frame never qualifies for verification', () => {
    assert.equal(isFaceInsideOval([], portrait, portrait), false);
});

test('exactly one face entirely inside the oval qualifies', () => {
    assert.equal(isFaceInsideOval([centeredFace], portrait, portrait), true);
});

test('multiple faces never qualify even when centered', () => {
    assert.equal(isFaceInsideOval([centeredFace, centeredFace], portrait, portrait), false);
});

test('a face outside the oval does not qualify', () => {
    const face = { boundingBox: { x: 5, y: 100, width: 80, height: 120 } };
    assert.equal(isFaceInsideOval([face], portrait, portrait), false);
});

test('a face whose center is inside but edges cross the oval does not qualify', () => {
    const face = { boundingBox: { x: 50, y: 45, width: 180, height: 240 } };
    assert.equal(isFaceInsideOval([face], portrait, portrait), false);
});

test('a face too far from the camera does not qualify', () => {
    const face = { boundingBox: { x: 130, y: 155, width: 20, height: 20 } };
    assert.equal(isFaceInsideOval([face], portrait, portrait), false);
});

test('landscape camera coordinates account for object-cover cropping', () => {
    const source = { width: 640, height: 480 };
    const face = { boundingBox: { x: 270, y: 150, width: 100, height: 140 } };
    assert.equal(isFaceInsideOval([face], source, portrait), true);
    assert.equal(isFaceInsideOval([face], source, { width: 560, height: 720 }), true);
});

test('a face cropped out of the portrait preview does not qualify', () => {
    const face = { boundingBox: { x: 40, y: 150, width: 100, height: 140 } };
    assert.equal(isFaceInsideOval([face], { width: 640, height: 480 }, portrait), false);
});

test('a portrait camera cropped vertically uses the same visible oval', () => {
    const face = { boundingBox: { x: 170, y: 200, width: 140, height: 200 } };
    assert.equal(isFaceInsideOval([face], { width: 480, height: 640 }, portrait), true);
});

test('missing, invalid, or truncated face geometry is rejected', () => {
    for (const boundingBox of [
        undefined,
        { x: NaN, y: 105, width: 80, height: 120 },
        { x: 100, y: 105, width: 0, height: 120 },
        { x: -1, y: 105, width: 80, height: 120 },
        { x: 250, y: 105, width: 80, height: 120 },
    ]) {
        assert.equal(isFaceInsideOval([{ boundingBox }], portrait, portrait), false);
    }
    assert.equal(isFaceInsideOval([centeredFace], { width: 0, height: 360 }, portrait), false);
    assert.equal(isFaceInsideOval([centeredFace], portrait, { width: 0, height: 0 }), false);
});
