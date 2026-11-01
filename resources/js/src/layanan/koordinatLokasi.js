import { parseLocationCoordinates } from './lokasiIndramayu.js';

export const getCompanyAddress = (perusahaan) => {
    const address = typeof perusahaan?.alamat_perusahaan === 'string' ? perusahaan.alamat_perusahaan.trim() : '';
    if (!address || parseLocationCoordinates(address).isCoordinate) return null;
    return address;
};

export const getCompanyCoordinates = (perusahaan) => {
    const values = [perusahaan?.latitude, perusahaan?.longitude];
    // Missing values must not become a misleading pin at (0, 0).
    if (values.some(value =>
        (typeof value !== 'number' && typeof value !== 'string')
        || (typeof value === 'string' && value.trim() === '')
    )) return null;

    const [latitude, longitude] = values.map(Number);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)
        || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;

    return { latitude, longitude };
};
