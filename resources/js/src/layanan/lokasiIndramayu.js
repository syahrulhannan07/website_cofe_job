export const PUSAT_INDRAMAYU = { lat: -6.3274, lng: 108.3249 };

// Search envelope only, not a precise administrative boundary polygon.
export const BATAS_PENCARIAN_INDRAMAYU = {
    south: -6.85,
    west: 107.85,
    north: -6.2,
    east: 108.65,
};

export const isWithinIndramayuSearchArea = ({ lat, lng }) =>
    Number.isFinite(lat) && Number.isFinite(lng)
    && lat >= BATAS_PENCARIAN_INDRAMAYU.south
    && lat <= BATAS_PENCARIAN_INDRAMAYU.north
    && lng >= BATAS_PENCARIAN_INDRAMAYU.west
    && lng <= BATAS_PENCARIAN_INDRAMAYU.east;

export const parseLocationCoordinates = (value) => {
    const match = value.trim().match(/^([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*[,;]\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))$/);
    if (!match) return { isCoordinate: false, point: null };

    const point = { lat: Number(match[1]), lng: Number(match[2]) };
    return {
        isCoordinate: true,
        point: isWithinIndramayuSearchArea(point) ? point : null,
    };
};
