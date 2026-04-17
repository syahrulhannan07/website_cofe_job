import api from './api';

/**
 * Layanan untuk menangani semua operasi autentikasi pengguna.
 */
const layananAutentikasi = {
    /**
     * Masuk dengan surel dan kata sandi.
     * @param {{ surel: string, kataSandi: string }} dataKredensial
     */
    masuk: async (dataKredensial) => {
        const respons = await api.post('/auth/login', dataKredensial);
        return respons.data;
    },

    /**
     * Keluar dari aplikasi.
     */
    keluar: async () => {
        const respons = await api.post('/auth/logout');
        localStorage.removeItem('token');
        return respons.data;
    },

    /**
     * Mendaftarkan pengguna baru.
     * @param {{ namaLengkap: string, surel: string, kataSandi: string, peran: string }} dataPengguna
     */
    daftar: async (dataPengguna) => {
        const respons = await api.post('/auth/register', dataPengguna);
        return respons.data;
    },

    /**
     * Mengambil data profil pengguna yang sedang masuk.
     */
    ambilProfilSaya: async () => {
        const respons = await api.get('/auth/me');
        return respons.data;
    },
};

export default layananAutentikasi;
