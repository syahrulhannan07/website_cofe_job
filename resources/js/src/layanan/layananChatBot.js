import api from './api';

export const kirimPesan = async (messages) => {
    try {
        const response = await api.post('/chatbot/ask', { messages });
        if (response.data.status === 'success') {
            return response.data.data;
        }
        throw new Error(response.data.message || 'Gagal memproses pesan');
    } catch (error) {
        throw error;
    }
};
