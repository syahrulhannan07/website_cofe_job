import { createBrowserRouter } from 'react-router-dom';
import TataLetakUtama from '../tata-letak/TataLetakUtama';
import TataLetakFooterSahaja from '../tata-letak/TataLetakFooterSahaja';
import TataLetakAdmin from '../admin-perusahaan/tata-letak/TataLetakAdmin';
import TataLetakSuperAdmin from '../super-admin/tata-letak/TataLetakSuperAdmin';
import Beranda from '../halaman/beranda';
import Lowongan from '../halaman/lowongan';
import Perusahaan from '../halaman/perusahaan';
import DetailPerusahaan from '../halaman/perusahaan/DetailPerusahaan';
import DetailLowongan from '../halaman/lowongan/komponen/DetailLowongan';
import Profil from '../halaman/profil';
import StatusLamaran from '../halaman/status_lamaran';
import DetailStatusLamaran from '../halaman/status_lamaran/DetailStatusLamaran';
import Masuk from '../halaman/autentikasi/Masuk';
import Daftar from '../halaman/autentikasi/Daftar';
import AturUlangSandi from '../halaman/autentikasi/AturUlangSandi';
import Melamar from '../halaman/melamar';

// Fitur Admin Perusahaan
import DashboardAdmin from '../admin-perusahaan/halaman/dashboard';
import ProfilAdmin    from '../admin-perusahaan/halaman/profil';
import PelamarAdmin   from '../admin-perusahaan/halaman/pelamar';
import LowonganAdmin  from '../admin-perusahaan/halaman/lowongan';
import TambahLowongan  from '../admin-perusahaan/halaman/lowongan/TambahLowongan';
import WawancaraAdmin from '../admin-perusahaan/halaman/wawancara';

import DashboardSuperAdmin from '../super-admin/halaman/dashboard';
import LoginSuperAdmin    from '../super-admin/halaman/masuk';
import VerifikasiSuperAdmin from '../super-admin/halaman/verifikasi';
import KelolaAkunSuperAdmin from '../super-admin/halaman/kelola-akun';
import HalamanDetailLowonganSuperAdmin from '../super-admin/halaman/kelola-akun/HalamanDetailLowonganSuperAdmin';

const ruter = createBrowserRouter([
    // --- Rute Publik (Pelamar) ---
    {
        path: '/',
        element: <TataLetakUtama />,
        children: [
            { index: true, element: <Beranda /> },
            { path: 'lowongan', element: <Lowongan /> },
            { path: 'perusahaan', element: <Perusahaan /> },
            { path: 'profil', element: <Profil /> },
            { path: 'status-lamaran', element: <StatusLamaran /> },
            { path: 'status-lamaran/:id', element: <DetailStatusLamaran /> },
        ],
    },

    // --- Rute Tanpa Navbar (Hanya Footer) ---
    {
        path: '/',
        element: <TataLetakFooterSahaja />,
        children: [
            { path: 'perusahaan/:id', element: <DetailPerusahaan /> },
            { path: 'lowongan/:id', element: <DetailLowongan /> },
            { path: 'melamar', element: <Melamar /> },
        ],
    },

    // --- Rute Autentikasi ---
    { path: '/masuk', element: <Masuk /> },
    { path: '/daftar', element: <Daftar /> },
    { path: '/atur-ulang-sandi', element: <AturUlangSandi /> },

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

    // --- Rute Super Admin (UC-10, UC-11, UC-12) ---
    // Halaman Tanpa Layout Sidebar/Topbar
    { path: '/auth/portal-pusat/login', element: <LoginSuperAdmin /> }, // [UPDATE LOGIC]
    { path: '/super-admin/kelola-akun/lowongan/:id', element: <HalamanDetailLowonganSuperAdmin /> },

    // Panel terproteksi — dengan layout sidebar Super Admin
    {
        path: '/super-admin',
        element: <TataLetakSuperAdmin />,
        children: [
            { index: true,         element: <DashboardSuperAdmin /> },
            { path: 'dashboard',   element: <DashboardSuperAdmin /> },
            { path: 'verifikasi',  element: <VerifikasiSuperAdmin /> },
            { path: 'kelola-akun', element: <KelolaAkunSuperAdmin /> },
        ],
    },
]);

export default ruter;
