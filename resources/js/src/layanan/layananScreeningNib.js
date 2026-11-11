import api from './api';

/**
 * Layanan API untuk Screening NIB di halaman Super Admin.
 * Semua permintaan dilindungi oleh middleware auth:api dan role:Super_Admin
 * yang sudah diatur di backend.
 */
const layananScreeningNib = {
    /**
     * Memulai proses screening NIB.
     * Mengirim job ke antrian untuk diproses secara asynchronous.
     *
     * @param {string} idNib - Primary key record NIB
     * @returns {Promise<AxiosResponse>}
     */
    mulaiScreening: async (idNib) => {
        const respons = await api.post(`/super-admin/nib/${idNib}/screening`);
        return respons.data;
    },

    /**
     * Mengambil hasil screening NIB.
     *
     * @param {string} idNib - Primary key record NIB
     * @returns {Promise<AxiosResponse>}
     */
    ambilHasilScreening: async (idNib) => {
        const respons = await api.get(`/super-admin/nib/${idNib}/screening`);
        return respons.data;
    },

    /**
     * Meminta screening ulang NIB.
     * Hasil lama tetap tersedia sampai job baru berhasil.
     *
     * @param {string} idNib - Primary key record NIB
     * @returns {Promise<AxiosResponse>}
     */
    ulangScreening: async (idNib) => {
        const respons = await api.post(`/super-admin/nib/${idNib}/screening/ulang`);
        return respons.data;
    },
};

export default layananScreeningNib;
