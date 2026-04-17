import { createBrowserRouter } from 'react-router-dom';
import TataLetakUtama from '../tata-letak/TataLetakUtama';
import TataLetakAdmin from '../tata-letak/TataLetakAdmin';
import TataLetakSuperAdmin from '../tata-letak/TataLetakSuperAdmin';
import Beranda from '../halaman/beranda';
import Lowongan from '../halaman/lowongan';
import Perusahaan from '../halaman/perusahaan';
import Masuk from '../halaman/autentikasi/Masuk';
import Daftar from '../halaman/autentikasi/Daftar';
import AdminPerusahaan from '../halaman/admin-perusahaan';
import SuperAdmin from '../halaman/super-admin';

const ruter = createBrowserRouter([
    // --- Rute Publik (Pelamar) ---
    {
        path: '/',
        element: <TataLetakUtama />,
        children: [
            { index: true, element: <Beranda /> },
            { path: 'lowongan', element: <Lowongan /> },
            { path: 'perusahaan', element: <Perusahaan /> },
        ],
    },

    // --- Rute Autentikasi (tanpa layout utama) ---
    { path: '/masuk', element: <Masuk /> },
    { path: '/daftar', element: <Daftar /> },

    // --- Rute Admin Perusahaan ---
    {
        path: '/admin',
        element: <TataLetakAdmin />,
        children: [
            { index: true, element: <AdminPerusahaan /> },
        ],
    },

    // --- Rute Super Admin ---
    {
        path: '/super-admin',
        element: <TataLetakSuperAdmin />,
        children: [
            { index: true, element: <SuperAdmin /> },
        ],
    },
]);

export default ruter;
