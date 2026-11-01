import test from 'node:test';
import assert from 'node:assert/strict';
import { PUSAT_INDRAMAYU, isWithinIndramayuSearchArea, parseLocationCoordinates } from '../../resources/js/src/layanan/lokasiIndramayu.js';

test('coordinate input supplies the map pin directly without geocoding', () => {
    for (const value of [
        '-6.3274, 108.3249',
        '  -6.3274,108.3249  ',
        '-6.3274; 108.3249',
        '-6.3274, +108.3249',
        '-6.3274,\n108.3249',
    ]) {
        assert.deepEqual(parseLocationCoordinates(value), {
            isCoordinate: true,
            point: { lat: -6.3274, lng: 108.3249 },
        });
    }
});

test('out-of-area, invalid-range and reversed coordinates do not produce a pin', () => {
    for (const value of [
        '-6.2, 106.81667',
        '91, 108.3',
        '-6.4, 181',
        '108.3249, -6.3274',
    ]) {
        assert.deepEqual(parseLocationCoordinates(value), { isCoordinate: true, point: null });
    }
});

test('addresses and incomplete coordinate input are not mistaken for coordinate pairs', () => {
    for (const value of [
        '',
        'Kopi Kenanga',
        'Jalan Merdeka 12, Indramayu',
        '-6.3274,',
        '-6.3274, 108.',
        '-6.3274,108.3249,0',
        'NaN, 108.3',
    ]) {
        assert.deepEqual(parseLocationCoordinates(value), { isCoordinate: false, point: null });
    }
});

test('the initial map center is inside the Indramayu search envelope', () => {
    assert.equal(isWithinIndramayuSearchArea(PUSAT_INDRAMAYU), true);
});

test('coordinates outside the search envelope are not accepted', () => {
    for (const point of [
        { lat: -6.2, lng: 106.81667 },
        { lat: -6.86, lng: 108.3 },
        { lat: -6.19, lng: 108.3 },
        { lat: -6.4, lng: 107.84 },
        { lat: -6.4, lng: 108.66 },
    ]) {
        assert.equal(isWithinIndramayuSearchArea(point), false);
    }
});

test('invalid and non-finite coordinates are rejected', () => {
    for (const point of [
        { lat: NaN, lng: 108.3 },
        { lat: -6.4, lng: Infinity },
        { lat: '-6.4', lng: 108.3 },
        { lat: null, lng: null },
        {},
    ]) {
        assert.equal(isWithinIndramayuSearchArea(point), false);
    }
});
