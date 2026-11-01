export const FACE_OVAL = {
    width: 280,
    height: 360,
    centerX: 140,
    centerY: 165,
    radiusX: 95,
    radiusY: 125,
};

export const isFaceInsideOval = (faces, source, viewport) => {
    if (faces.length !== 1) return false;

    const box = faces[0].boundingBox;
    const dimensions = [source.width, source.height, viewport.width, viewport.height];
    if (!box || !dimensions.every(value => Number.isFinite(value) && value > 0)) return false;
    if (![box.x, box.y, box.width, box.height].every(Number.isFinite) || box.width <= 0 || box.height <= 0) return false;
    if (box.x < 0 || box.y < 0 || box.x + box.width > source.width || box.y + box.height > source.height) return false;

    // Match the video's centered object-cover crop and mirrored camera preview.
    const scale = Math.max(viewport.width / source.width, viewport.height / source.height);
    const cropX = (source.width * scale - viewport.width) / 2;
    const cropY = (source.height * scale - viewport.height) / 2;
    const left = viewport.width - ((box.x + box.width) * scale - cropX);
    const top = box.y * scale - cropY;
    const width = box.width * scale;
    const height = box.height * scale;
    if (height < viewport.height * 0.28) return false;

    const centerX = viewport.width * FACE_OVAL.centerX / FACE_OVAL.width;
    const centerY = viewport.height * FACE_OVAL.centerY / FACE_OVAL.height;
    const radiusX = viewport.width * FACE_OVAL.radiusX / FACE_OVAL.width;
    const radiusY = viewport.height * FACE_OVAL.radiusY / FACE_OVAL.height;

    return [left, left + width].every(x =>
        [top, top + height].every(y =>
            ((x - centerX) / radiusX) ** 2 + ((y - centerY) / radiusY) ** 2 <= 1
        )
    );
};
