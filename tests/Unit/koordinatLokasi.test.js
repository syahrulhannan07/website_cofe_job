import test from 'node:test';
import assert from 'node:assert/strict';
import { getCompanyAddress, getCompanyCoordinates } from '../../resources/js/src/layanan/koordinatLokasi.js';

test('public addresses contain only the saved address text without automatic region suffixes', () => {
    const perusahaan = {
        alamat_perusahaan: '  Jalan Merdeka No. 12, Indramayu  ',
        kecamatan: 'Indramayu',
        latitude: -6.3274,
        longitude: 108.3249,
    };
    assert.equal(getCompanyAddress(perusahaan), 'Jalan Merdeka No. 12, Indramayu');
    assert.equal(perusahaan.alamat_perusahaan, '  Jalan Merdeka No. 12, Indramayu  ');
});

test('legacy coordinate addresses are not displayed as public addresses and the map pin is preserved', () => {
    for (const alamat_perusahaan of ['-6.334657818417727, 108.33169348456899', '-6.334657; 108.331693']) {
        const perusahaan = { alamat_perusahaan, latitude: -6.334657, longitude: 108.331693 };
        assert.equal(getCompanyAddress(perusahaan), null);
        assert.deepEqual(getCompanyCoordinates(perusahaan), { latitude: -6.334657, longitude: 108.331693 });
    }
});

test('missing public addresses do not become coordinate strings or region labels', () => {
    for (const perusahaan of [undefined, null, {}, { alamat_perusahaan: null }, { alamat_perusahaan: ' ' }]) {
        assert.equal(getCompanyAddress(perusahaan), null);
    }
});

test('uses the saved registration coordinates without geocoding or substituting a map center', () => {
    const perusahaan = { latitude: -6.3274567, longitude: 108.3249123 };
    assert.deepEqual(getCompanyCoordinates(perusahaan), perusahaan);
});

test('supports decimal strings returned by an API', () => {
    assert.deepEqual(getCompanyCoordinates({ latitude: '-6.3274567', longitude: '108.3249123' }), {
        latitude: -6.3274567,
        longitude: 108.3249123,
    });
});

test('old companies without both coordinates have no map pin', () => {
    for (const perusahaan of [
        null,
        undefined,
        {},
        { latitude: null, longitude: null },
        { latitude: '', longitude: '' },
        { latitude: ' ', longitude: ' ' },
        { latitude: -6.3 },
        { longitude: 108.3 },
        { latitude: null, longitude: 108.3 },
        { latitude: -6.3, longitude: '' },
    ]) {
        assert.equal(getCompanyCoordinates(perusahaan), null);
    }
});

test('invalid, non-finite and out-of-range coordinates have no map pin', () => {
    for (const perusahaan of [
        { latitude: 'not a coordinate', longitude: 108.3 },
        { latitude: NaN, longitude: 108.3 },
        { latitude: -6.3, longitude: Infinity },
        { latitude: 91, longitude: 108.3 },
        { latitude: -91, longitude: 108.3 },
        { latitude: -6.3, longitude: 181 },
        { latitude: -6.3, longitude: -181 },
        { latitude: false, longitude: true },
        { latitude: [], longitude: [] },
    ]) {
        assert.equal(getCompanyCoordinates(perusahaan), null);
    }
});

test('zero is a valid coordinate, not a missing value', () => {
    assert.deepEqual(getCompanyCoordinates({ latitude: 0, longitude: 0 }), { latitude: 0, longitude: 0 });
});
