import { createBrowserRouter } from 'react-router-dom';
import TataLetakUtama from '../tata-letak/TataLetakUtama';
import TataLetakAdmin from '../admin-perusahaan/tata-letak/TataLetakAdmin';
import TataLetakSuperAdmin from '../tata-letak/TataLetakSuperAdmin';
import Beranda from '../halaman/beranda';
import Lowongan from '../halaman/lowongan';
import Perusahaan from '../halaman/perusahaan';
import Masuk from '../halaman/autentikasi/Masuk';
import Daftar from '../halaman/autentikasi/Daftar';

// Fitur Admin Perusahaan
import DashboardAdmin from '../admin-perusahaan/halaman/dashboard';
import ProfilAdmin    from '../admin-perusahaan/halaman/profil';
import PelamarAdmin   from '../admin-perusahaan/halaman/pelamar';
import LowonganAdmin  from '../admin-perusahaan/halaman/lowongan';
import TambahLowongan  from '../admin-perusahaan/halaman/lowongan/TambahLowongan';
import WawancaraAdmin from '../admin-perusahaan/halaman/wawancara';

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

    // --- Rute Autentikasi ---
    { path: '/masuk', element: <Masuk /> },
    { path: '/daftar', element: <Daftar /> },

    // --- Rute Admin Perusahaan (Struktur Refactored) ---
    {
        path: '/admin',
        element: <TataLetakAdmin />,
        children: [
            { index: true, element: <DashboardAdmin /> },
            { path: 'profil',    element: <ProfilAdmin /> },
            { path: 'pelamar',   element: <PelamarAdmin /> },
            { path: 'lowongan',  element: <LowonganAdmin /> },
            { path: 'lowongan/tambah', element: <TambahLowongan /> },
            { path: 'lowongan/edit/:id', element: <TambahLowongan /> },
            { path: 'wawancara', element: <WawancaraAdmin /> },
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
