import React, { useState, useEffect, useMemo } from 'react';

// Import Komponen Composite
import CardTotalAdmin from './komponen/CardTotalAdmin';
import CardKafeAktif from './komponen/CardKafeAktif';
import DaftarAdmin from './komponen/DaftarAdmin';
import ModalDetailAdmin from './komponen/ModalDetailAdmin';

// Import Assets
import ikonSearch from '../../aset/akun admin/search.svg';

/* ─────────────────────────────────────────────
   DATA MOCK  (ganti dengan API call nanti)
───────────────────────────────────────────── */
const DATA_ADMIN_MOCK = [
    { id: 1, nama_pengguna: 'Ramadhan Sanjaya',       nama_perusahaan: 'Kopi Kenangan Senopati', email: 'kenangakopi1@kafe.ac.id',    status: 'Aktif' },
    { id: 2, nama_pengguna: 'Syahrul Hannan Ramdhani', nama_perusahaan: 'Janji Jiwa',             email: 'janjijiwacofe2@gmail.com', status: 'Nonaktif' },
    { id: 3, nama_pengguna: 'Junanti',                 nama_perusahaan: 'Fore Coffe',             email: 'forecofe4@gmai.com',       status: 'Nonaktif' },
];

const HalamanKelolaAkun = () => {
    const [daftarAdmin, setDaftarAdmin]       = useState([]);
    const [sedangMemuat, setSedangMemuat]     = useState(true);
    const [kueriPencarian, setKueriPencarian] = useState('');
    const [filterStatus, setFilterStatus]     = useState('Semua');
    const [notifikasi, setNotifikasi]         = useState(null);
    const [adminTerpilihDetail, setAdminTerpilihDetail] = useState(null);

    useEffect(() => {
        const muat = async () => {
            setSedangMemuat(true);
            await new Promise(r => setTimeout(r, 800));
            setDaftarAdmin(DATA_ADMIN_MOCK);
            setSedangMemuat(false);
        };
        muat();
    }, []);

    const adminTerfilter = useMemo(() => {
        let hasil = [...daftarAdmin];
        if (filterStatus !== 'Semua') hasil = hasil.filter(a => a.status === filterStatus);
        if (kueriPencarian.trim()) {
            const q = kueriPencarian.toLowerCase();
            hasil = hasil.filter(a =>
                a.nama_pengguna.toLowerCase().includes(q) ||
                a.nama_perusahaan.toLowerCase().includes(q) ||
                a.email.toLowerCase().includes(q)
            );
        }
        return hasil;
    }, [daftarAdmin, filterStatus, kueriPencarian]);

    const totalAdmin  = daftarAdmin.length;
    const kafeAktif   = daftarAdmin.filter(a => a.status === 'Aktif').length;

    const tampilNotif = (tipe, pesan) => {
        setNotifikasi({ tipe, pesan });
        setTimeout(() => setNotifikasi(null), 4000);
    };

    const handleSuspend = (admin) => {
        setDaftarAdmin(prev => prev.map(a => a.id === admin.id ? { ...a, status: 'Nonaktif' } : a));
        if (adminTerpilihDetail?.id === admin.id) {
            setAdminTerpilihDetail(prev => prev ? { ...prev, status: 'Nonaktif' } : null);
        }
        tampilNotif('sukses', `Akun "${admin.nama_perusahaan}" berhasil disuspend.`);
    };

    const handleAktifkan = (admin) => {
        setDaftarAdmin(prev => prev.map(a => a.id === admin.id ? { ...a, status: 'Aktif' } : a));
        if (adminTerpilihDetail?.id === admin.id) {
            setAdminTerpilihDetail(prev => prev ? { ...prev, status: 'Aktif' } : null);
        }
        tampilNotif('sukses', `Akun "${admin.nama_perusahaan}" berhasil diaktifkan.`);
    };

    const handleUpdateStatus = (admin, statusBaru) => {
        setDaftarAdmin(prev => prev.map(a => a.id === admin.id ? { ...a, status: statusBaru } : a));
        if (adminTerpilihDetail?.id === admin.id) {
            setAdminTerpilihDetail(prev => prev ? { ...prev, status: statusBaru } : null);
        }
        tampilNotif('sukses', `Status akun "${admin.nama_perusahaan}" berhasil diubah menjadi ${statusBaru}.`);
    };

    return (
        <div className="min-h-screen" style={{ background: '#F4ECE9', padding: '40px 40px 60px' }}>

            {/* Toast */}
            {notifikasi && (
                <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-[10px] shadow-lg text-sm font-semibold transition-all ${notifikasi.tipe === 'sukses' ? 'bg-[#4B2E2B] text-[#F7B750]' : 'bg-red-600 text-white'}`}
                     style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {notifikasi.pesan}
                </div>
            )}

            {/* ── Header (351:261 + 351:262) ── */}
            <div className="mb-8">
                <h1 className="font-bold text-[32px] text-[#4B2E2B] leading-tight"
                    style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Manajemen Akun Admin
                </h1>
                <p className="text-[18px] mt-1"
                   style={{ color: '#4B2E2B', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 400, lineHeight: '28.8px' }}>
                    Kelola seluruh administrator kafe yang terdaftar dalam ekosistem Cafe Job.
                </p>
            </div>

            {/* ── Stats Cards (351:558 + 351:572) ── */}
            <div className="flex gap-4 mb-8" style={{ alignItems: 'stretch' }}>
                <CardTotalAdmin
                    nilai={sedangMemuat ? '—' : `${totalAdmin} Pengguna`}
                    tren="+12% bulan ini"
                />
                <CardKafeAktif
                    nilai={sedangMemuat ? '—' : `${kafeAktif} Lokasi`}
                />
            </div>

            {/* ── Search + Filter (355:160: 355:143 + 355:149) ── */}
            <div className="flex items-center justify-between gap-4 mb-6 w-full">
                {/* Search Input — 355:143 */}
                <div className="relative" style={{ flex: '1 1 0', maxWidth: 400 }}>
                    <img
                        src={ikonSearch}
                        alt="cari"
                        className="absolute"
                        style={{ left: 16, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, opacity: 0.5 }}
                    />
                    <input
                        type="text"
                        placeholder="Cari nama cafe"
                        value={kueriPencarian}
                        onChange={e => setKueriPencarian(e.target.value)}
                        style={{
                            width: '100%',
                            background: '#fff',
                            border: 'none',
                            borderRadius: 9999,
                            padding: '13px 16px 14px 48px',
                            fontSize: 16,
                            fontFamily: 'Plus Jakarta Sans, sans-serif',
                            fontWeight: 400,
                            color: '#4B2E2B',
                            outline: 'none',
                            boxShadow: '0 0 0 1px #EAE4DC',
                        }}
                    />
                </div>

                {/* Filter Tabs — 355:149 */}
                <div
                    className="flex"
                    style={{
                        border: '1px solid #EAE4DC',
                        borderRadius: 9999,
                        padding: 4,
                        background: '#fff',
                    }}
                >
                    {['Semua', 'Aktif', 'Nonaktif'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilterStatus(f)}
                            style={{
                                padding: '8px 24px',
                                borderRadius: 9999,
                                border: 'none',
                                cursor: 'pointer',
                                fontFamily: 'Plus Jakarta Sans, sans-serif',
                                fontWeight: 600,
                                fontSize: 14,
                                color: '#1C1C19',
                                background: filterStatus === f ? '#F7B750' : 'transparent',
                                transition: 'background 0.2s',
                            }}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Tabel ── */}
            {sedangMemuat ? (
                <div className="bg-white rounded-[12px] border border-[#EAE4DC] overflow-hidden shadow-sm animate-pulse">
                    <div style={{ height: 56, background: 'rgba(234,228,220,0.5)' }} />
                    {[...Array(3)].map((_, i) => (
                        <div key={i} style={{ height: 60, borderTop: '1px solid #EAE4DC', background: i % 2 === 0 ? '#FAFAFA' : '#fff' }} />
                    ))}
                </div>
            ) : (
                <DaftarAdmin
                    data={adminTerfilter}
                    onSuspend={handleSuspend}
                    onAktifkan={handleAktifkan}
                    onLihatDetail={(admin) => setAdminTerpilihDetail(admin)}
                />
            )}

            {adminTerpilihDetail && (
                <ModalDetailAdmin
                    admin={adminTerpilihDetail}
                    onTutup={() => setAdminTerpilihDetail(null)}
                    onUpdateStatus={handleUpdateStatus}
                />
            )}
        </div>
    );
};

export default HalamanKelolaAkun;
