import api from './api';
import axios from 'axios';

const layananLamaran = {
    /**
     * Menginisiasi lamaran baru untuk mendapatkan id_lamaran dan dokumen wajib
     */
    mulaiLamaran: async (id_lowongan) => {
        try {
            const res = await api.post('/lamaran/mulai', { id_lowongan });
            return res.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Mengunggah dokumen lamaran
     */
    uploadDokumen: async (id_lamaran, formData) => {
        try {
            // formData harus berisi array file 'dokumen[]' dan array id_jenis_dokumen 'id_jenis_dokumen[]'
            const res = await api.post(`/lamaran/${id_lamaran}/dokumen`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Menyimpan jawaban pertanyaan seleksi
     */
    simpanJawaban: async (id_lamaran, jawabanArray) => {
        try {
            // jawabanArray format: [{ id_pertanyaan: X, jawaban: Y }]
            const res = await api.post(`/lamaran/${id_lamaran}/jawaban`, { jawaban: jawabanArray });
            return res.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Memfinalisasi (mengirim) lamaran
     */
    kirimLamaran: async (id_lamaran) => {
        try {
            const res = await api.post(`/lamaran/${id_lamaran}/kirim`);
            return res.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Mengambil detail lowongan publik beserta pertanyaan seleksinya
     */
    getDetailLowongan: async (id_lowongan) => {
        try {
            const res = await api.get(`/lowongan/${id_lowongan}`);
            return res.data;
        } catch (error) {
            throw error;
        }
    }
};

export default layananLamaran;
