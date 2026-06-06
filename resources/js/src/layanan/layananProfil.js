import api from './api';

/**
 * Layanan untuk mengelola profil pelamar.
 * Mencakup data pribadi, pendidikan, pengalaman, dan keahlian.
 */
const layananProfil = {
    // Ambil data profil lengkap
    ambilProfil: async () => {
        const respons = await api.get('/pelamar/profil');
        return respons.data;
    },

    // Update informasi pribadi
    updateProfil: async (data) => {
        // Jika data adalah FormData (untuk upload foto), biarkan axios menangani headers
        const respons = await api.post('/pelamar/profil/update', data);
        return respons.data;
    },

    // Pendidikan
    tambahPendidikan: async (data) => {
        const respons = await api.post('/pelamar/profil/pendidikan', data);
        return respons.data;
    },
    updatePendidikan: async (id, data) => {
        const respons = await api.put(`/pelamar/profil/pendidikan/${id}`, data);
        return respons.data;
    },
    hapusPendidikan: async (id) => {
        const respons = await api.delete(`/pelamar/profil/pendidikan/${id}`);
        return respons.data;
    },

    // Pengalaman
    tambahPengalaman: async (data) => {
        const respons = await api.post('/pelamar/profil/pengalaman', data);
        return respons.data;
    },
    updatePengalaman: async (id, data) => {
        const respons = await api.put(`/pelamar/profil/pengalaman/${id}`, data);
        return respons.data;
    },
    hapusPengalaman: async (id) => {
        const respons = await api.delete(`/pelamar/profil/pengalaman/${id}`);
        return respons.data;
    },

    // Skill
    tambahSkill: async (data) => {
        const respons = await api.post('/pelamar/profil/skill', data);
        return respons.data;
    },
    hapusSkill: async (id) => {
        const respons = await api.delete(`/pelamar/profil/skill/${id}`);
        return respons.data;
    },

    // Ganti Password
    gantiPassword: async (data) => {
        const respons = await api.post('/pelamar/profil/update-password', data);
        return respons.data;
    },
};

export default layananProfil;
