import React, { useState, useEffect, useMemo } from 'react';
// [UPDATE LOGIC] - Import Axios API instance
import api from '../../../layanan/api';

// Import Komponen Composite
import CardTotalAdmin from './komponen/CardTotalAdmin';
import CardKafeAktif from './komponen/CardKafeAktif';
import DaftarAdmin from './komponen/DaftarAdmin';
import ModalDetailAdmin from './komponen/ModalDetailAdmin';

// Import Assets
import ikonSearch from '../../aset/akun admin/search.svg';

const HalamanKelolaAkun = () => {
    const [daftarAdmin, setDaftarAdmin]       = useState([]);
    const [sedangMemuat, setSedangMemuat]     = useState(true);
    const [searchQuery, setSearchQuery]       = useState('');
    // Default fokus ke akun Aktif sesuai instruksi monitoring
    const [filterStatus, setFilterStatus]     = useState('Aktif');
    const [notifikasi, setNotifikasi]         = useState(null);
    const [adminTerpilihDetail, setAdminTerpilihDetail] = useState(null);
    const [sedangMuatDetail, setSedangMuatDetail] = useState(false);

    const [modalKonfirmasiBuka, setModalKonfirmasiBuka] = useState(false);
    const [adminIdUntukSuspend, setAdminIdUntukSuspend] = useState(null);

    // Fetch daftar admin dengan debounce 300ms pada search query
    useEffect(() => {
        const muatData = async () => {
            setSedangMemuat(true);
            try {
                const respons = await api.get('/super-admin/akun-kafe', {
                    params: { search: searchQuery }
                });
                if (respons.data?.data) {
                    setDaftarAdmin(respons.data.data);
                }
            } catch (err) {
                console.error('Gagal memuat akun admin kafe:', err);
            } finally {
                setSedangMemuat(false);
            }
        };

        const timeoutId = setTimeout(muatData, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    // Filter lokal untuk tab status — terpisah dari stats agar angka tetap akurat
    const adminTerfilter = useMemo(() => {
        if (filterStatus === 'Semua') return daftarAdmin;
        return daftarAdmin.filter(a => {
            if (filterStatus === 'Nonaktif') return a.status === 'Nonaktif' || a.status === 'Diblokir';
            return a.status === filterStatus;
        });
    }, [daftarAdmin, filterStatus]);

    // Stats dihitung dari data penuh (sebelum filter tab), tidak bergantung filter aktif
    const totalAdmin = daftarAdmin.length;
    const kafeAktif  = daftarAdmin.filter(a => a.status === 'Aktif').length;


    const tampilNotif = (tipe, pesan) => {
        setNotifikasi({ tipe, pesan });
        setTimeout(() => setNotifikasi(null), 4000);
    };

    const handleSuspend = (admin) => {
        setAdminIdUntukSuspend(admin.id);
        setModalKonfirmasiBuka(true);
    };

    const handleAktifkan = (admin) => {
        setDaftarAdmin(prev => prev.map(a => a.id === admin.id ? { ...a, status: 'Aktif' } : a));
        if (adminTerpilihDetail?.id === admin.id) {
            setAdminTerpilihDetail(prev => prev ? { ...prev, status: 'Aktif' } : null);
        }
        tampilNotif('sukses', `Akun "${admin.nama_perusahaan}" berhasil diaktifkan.`);
    };

    const handleUpdateStatus = (admin, statusBaru) => {
        if (statusBaru === 'Nonaktif') {
            setAdminIdUntukSuspend(admin.id);
            setModalKonfirmasiBuka(true);
        } else {
            setDaftarAdmin(prev => prev.map(a => a.id === admin.id ? { ...a, status: 'Aktif' } : a));
            if (adminTerpilihDetail?.id === admin.id) {
                setAdminTerpilihDetail(prev => prev ? { ...prev, status: 'Aktif' } : null);
            }
            tampilNotif('sukses', `Status akun "${admin.nama_perusahaan}" berhasil diaktifkan.`);
        }
    };

    // Fetch detail lengkap satu kafe (profil + lowongan) lalu buka modal
    const fetchDetailAdmin = async (adminRingkas) => {
        setSedangMuatDetail(true);
        try {
            const respons = await api.get(`/super-admin/akun-kafe/${adminRingkas.id}`);
            if (respons.data?.data) {
                setAdminTerpilihDetail(respons.data.data);
            }
        } catch (err) {
            console.error('Gagal memuat detail admin kafe:', err);
            // Fallback: buka modal dengan data ringkas dari tabel
            setAdminTerpilihDetail(adminRingkas);
        } finally {
            setSedangMuatDetail(false);
        }
    };

    const handleKonfirmasiSuspend = async () => {
        if (!adminIdUntukSuspend) return;
        try {
            const respons = await api.put(`/super-admin/akun-kafe/${adminIdUntukSuspend}/suspend`);
            if (respons.status === 200) {
                const adminTarget = daftarAdmin.find(a => a.id === adminIdUntukSuspend);
                const namaPerusahaan = adminTarget ? adminTarget.nama_perusahaan : '';
                setDaftarAdmin(prev => prev.map(a => a.id === adminIdUntukSuspend ? { ...a, status: 'Diblokir' } : a));
                setModalKonfirmasiBuka(false);
                setAdminTerpilihDetail(null);
                setAdminIdUntukSuspend(null);
                tampilNotif('sukses', `Akun "${namaPerusahaan}" berhasil diblokir.`);
            }
        } catch (err) {
            console.error('Gagal menonaktifkan akun:', err);
            tampilNotif('gagal', 'Gagal menonaktifkan akun admin.');
        }
    };

    const handleBatalSuspend = () => {
        setModalKonfirmasiBuka(false);
        setAdminIdUntukSuspend(null);
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
                    {/* [UPDATE LOGIC] - Bind input value ke searchQuery */}
                    <input
                        type="text"
                        placeholder="Cari nama cafe"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
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
                    onLihatDetail={fetchDetailAdmin}
                    sedangMuatDetail={sedangMuatDetail}
                />
            )}

            {adminTerpilihDetail && (
                <ModalDetailAdmin
                    admin={adminTerpilihDetail}
                    onTutup={() => setAdminTerpilihDetail(null)}
                    onUpdateStatus={handleUpdateStatus}
                />
            )}

            {/* [UPDATE LOGIC] - Pop-up modal konfirmasi penonaktifan */}
            {modalKonfirmasiBuka && (
                <div className="fixed inset-0 bg-[#1c120e]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#FAF8F6] rounded-[16px] shadow-2xl p-6 w-[400px] border border-[#EAE4DC] flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
                        <h3 className="font-bold text-[18px] text-[#4B2E2B]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Konfirmasi Penonaktifan
                        </h3>
                        <p className="text-[14px] text-[#4B2E2B] leading-relaxed" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                            Apakah Anda yakin ingin menonaktifkan akun admin kafe ini? Tindakan ini akan memblokir akses login bagi akun ini.
                        </p>
                        <div className="flex justify-end gap-3 mt-2">
                            <button
                                onClick={handleBatalSuspend}
                                className="px-4 py-2 bg-[#EAE4DC] hover:bg-[#DED7CE] text-[#4B2E2B] rounded-[8px] font-semibold text-[14px] transition-colors focus:outline-none"
                                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleKonfirmasiSuspend}
                                className="px-4 py-2 bg-[#C98285] hover:bg-[#C27376] text-[#521A1C] rounded-[8px] font-bold text-[14px] transition-colors focus:outline-none"
                                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                            >
                                Ya, Nonaktifkan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HalamanKelolaAkun;
