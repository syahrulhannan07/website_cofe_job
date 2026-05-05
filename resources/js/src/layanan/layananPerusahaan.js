import api from './api';

const layananPerusahaan = {
    ambilSemuaPerusahaan: async (params) => {
        try {
            const response = await api.get('/v1/perusahaan', { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    ambilDetailPerusahaan: async (id) => {
        try {
            const response = await api.get(`/v1/perusahaan/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default layananPerusahaan;
