import api from './api';

const layananSuperAdmin = {
    // Mengambil seluruh data dashboard: statistik, tren, pendaftar, dan antrian
    ambilDashboard: async () => {
        const respons = await api.get('/superadmin/dashboard');
        return respons.data;
    },
};

export default layananSuperAdmin;
