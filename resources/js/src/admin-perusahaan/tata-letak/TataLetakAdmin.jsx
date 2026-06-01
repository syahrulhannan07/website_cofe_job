import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import SidebarAdmin from '../komponen/SidebarAdmin';
import TopbarAdmin from '../komponen/TopbarAdmin';
import { AdminProvider, useAdmin } from '../konteks/AdminContext';
import HalamanErrorKopi from '../komponen/HalamanErrorKopi';

const TataLetakAdminContent = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { identitas, fetchDashboard, error } = useAdmin();
    const [menuAktif, setMenuAktif] = useState('dashboard');

    const menanganiLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('peran');
        localStorage.removeItem('pengguna');
        navigate('/masuk');
    };

    const [showRejectionModal, setShowRejectionModal] = useState(false);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    // Tangani redirect deep-link untuk aksi go_profil (Poin 4) dan show_rejection_notice
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        if (queryParams.get('action') === 'go_profil') {
            navigate('/admin/profil', { replace: true });
        } else if (queryParams.get('action') === 'show_rejection_notice') {
            setShowRejectionModal(true);
            // Hapus query param dari URL agar tidak popup terus-menerus saat refresh
            navigate('/admin', { replace: true });
        }
    }, [location.search, navigate]);

    // Update menu aktif berdasarkan path
    useEffect(() => {
        const path = location.pathname;
        if (path.includes('profil')) setMenuAktif('profil');
        else if (path.includes('pelamar')) setMenuAktif('pelamar');
        else if (path.includes('lowongan')) setMenuAktif('lowongan');
        else if (path.includes('wawancara')) setMenuAktif('wawancara');
        else setMenuAktif('dashboard');
    }, [location.pathname]);

    // Jika terjadi error (misal 404 atau timeout)
    if (error) {
        return <HalamanErrorKopi code={error} message={error === 404 ? "Cangkir ini kosong (404)" : "Koneksi Terganggu"} />;
    }

    const isHalamanProfil = location.pathname === '/admin/profil';
    const isHalamanStandalone = location.pathname === '/admin/lowongan/tambah' || location.pathname.includes('/admin/lowongan/edit');

    if (isHalamanStandalone) {
        return (
            <main className="flex-1 min-h-screen overflow-y-auto bg-[#F3EDE6]">
                <Outlet />
            </main>
        );
    }

    return (
        <div className="layout-admin-utama h-screen w-screen overflow-hidden flex font-poppins bg-[#F3EDE6]">
            <SidebarAdmin 
                menuAktif={menuAktif} 
                setMenuAktif={setMenuAktif} 
                menanganiLogout={menanganiLogout} 
            />

            <div className="area-kanan-admin flex-1 flex flex-col min-h-0 h-full overflow-hidden">
                {!isHalamanProfil && <TopbarAdmin identitas={identitas} />}
                <main className={`konten-halaman-admin flex-1 min-h-0 overflow-y-auto bg-[#F3EDE6] ${isHalamanProfil ? 'pt-[20px]' : ''}`}>
                    <Outlet />
                </main>
            </div>

            {/* Modal Alasan Penolakan Akun */}
            {showRejectionModal && (
                <div className="fixed inset-0 bg-[#1c120e]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#FAF8F6] rounded-[16px] shadow-2xl p-6 w-[420px] border border-[#EAE4DC] flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">❌</span>
                            <h3 className="font-bold text-[18px] text-[#4B2E2B]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Pendaftaran Akun Ditolak
                            </h3>
                        </div>
                        <p className="text-[14px] text-[#4B2E2B]/80 leading-relaxed" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                            Mohon maaf, pendaftaran akun kafe Anda ditolak oleh Super Admin karena dokumen atau informasi belum memenuhi syarat. 
                            <br /><br />
                            Silakan **periksa email Anda** untuk melihat rincian alasan penolakan secara lengkap dan langkah perbaikan.
                        </p>
                        <div className="flex justify-end mt-2">
                            <button
                                onClick={() => setShowRejectionModal(false)}
                                className="px-6 py-2 bg-[#4B2E2B] hover:opacity-90 text-[#F5B759] rounded-[8px] font-semibold text-[14px] transition-colors focus:outline-none cursor-pointer"
                                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                            >
                                Dimengerti
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const TataLetakAdmin = () => (
    <AdminProvider>
        <TataLetakAdminContent />
    </AdminProvider>
);

export default TataLetakAdmin;
