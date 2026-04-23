import axios from 'axios';

/**
 * Instance Axios untuk semua permintaan ke API Laravel.
 * Secara otomatis menyertakan token autentikasi dan menangani error 401.
 */
const api = axios.create({
    baseURL: '/api/v1',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true,
});

// Pencegat Permintaan — tambahkan token ke setiap permintaan
api.interceptors.request.use((konfigurasi) => {
    const token = localStorage.getItem('token');
    if (token) {
        konfigurasi.headers.Authorization = `Bearer ${token}`;
    }
    return konfigurasi;
});

// Pencegat Respons — tangani error autentikasi
api.interceptors.response.use(
    (respons) => respons,
    (galat) => {
        if (galat.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/masuk';
        }
        return Promise.reject(galat);
    }
);

export default api;
