import React, { useState, useEffect } from 'react';
import api from '../../../layanan/api';
import TabelVerifikasi from './komponen/TabelVerifikasi';
import ModalDetailKafe from './komponen/ModalDetailKafe';

/**
 * UC-11: Halaman Verifikasi Akun Kafe
 * Menampilkan daftar kafe berstatus "Menunggu Verifikasi"
 * dan memungkinkan Super Admin menyetujui atau menolak pendaftaran.
 */

// [UPDATE LOGIC] - DATA_KAFE_MOCK dihapus sepenuhnya karena menggunakan data real dari API


import { ChevronRight } from 'lucide-react'; // Keeping Chevron if needed, but we have view.svg
import ikonSearch from '../../aset/verifikasi/Search.svg';
import ikonDiterima from '../../aset/verifikasi/diterima.svg';
import ikonDitolak from '../../aset/verifikasi/ditolak.svg';
import ikonPending from '../../aset/verifikasi/pending.svg';
import ikonTotalPerusahaan from '../../aset/verifikasi/total-perusahaan.svg';

const HalamanVerifikasi = () => {
    const [daftarKafe, setDaftarKafe] = useState([]);
    const [sedangMemuat, setSedangMemuat] = useState(true);
    const [kafeAktif, setKafeAktif] = useState(null);
    const [kataKunci, setKataKunci] = useState('');
    const [notifikasi, setNotifikasi] = useState(null); // { tipe: 'sukses'|'gagal', pesan: '' }

    // [UPDATE LOGIC] - Ambil data kafe dari API Laravel secara dinamis
    useEffect(() => {
        const ambilDataVerifikasi = async () => {
            setSedangMemuat(true);
            try {
                const respons = await api.get('/super-admin/verifikasi');
                if (respons.data && respons.data.data) {
                    // Pemetaan (mapping) id_perusahaan ke id jika komponen anak membutuhkannya
                    const dataReal = respons.data.data.map((item) => ({
                        ...item,
                        id: item.id || item.id_perusahaan
                    }));
                    setDaftarKafe(dataReal);
                }
            } catch (err) {
                console.error('Gagal mengambil data verifikasi:', err);
            } finally {
                setSedangMemuat(false);
            }
        };

        ambilDataVerifikasi();
    }, []);

    const stats = [
        { label: 'Total Perusahaan', nilai: '24', ikon: ikonTotalPerusahaan, bg: 'bg-[#EAE4DC]' },
        { label: 'Pending', nilai: '4', ikon: ikonPending, bg: 'bg-[#FCE6C9]' },
        { label: 'Ditolak', nilai: '7', ikon: ikonDitolak, bg: 'bg-[#F9D9D9]' },
        { label: 'Diterima', nilai: '3', ikon: ikonDiterima, bg: 'bg-[#D1FAE5]' },
    ];

    // Callback setelah verifikasi berhasil — hapus dari daftar dan tampilkan notifikasi
    const tanganiSuksesVerifikasi = (idKafe, statusBaru) => {
        setDaftarKafe((prev) => prev.filter((k) => k.id !== idKafe));
        tampilkanNotifikasi(
            'sukses',
            statusBaru === 'Aktif'
                ? '✓ Kafe berhasil disetujui dan email notifikasi telah dikirim.'
                : '✕ Kafe berhasil ditolak dan email alasan telah dikirim.'
        );
    };

    const tampilkanNotifikasi = (tipe, pesan) => {
        setNotifikasi({ tipe, pesan });
        setTimeout(() => setNotifikasi(null), 5000);
    };

    return (
        <div className="halaman-verifikasi min-h-screen bg-[#F4ECE9] p-6 md:p-8 lg:p-10">
            {/* Toast Notifikasi */}
            {notifikasi && (
                <div
                    className={`toast-notifikasi fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-[12px] shadow-xl max-w-[380px] font-poppins text-[13px] font-semibold transition-all duration-300 ${
                        notifikasi.tipe === 'sukses'
                            ? 'bg-[#4B2E2B] text-[#F5B759]'
                            : 'bg-red-600 text-white'
                    }`}
                    role="status"
                >
                    <span>{notifikasi.pesan}</span>
                    <button onClick={() => setNotifikasi(null)} className="ml-auto text-[16px] opacity-70 hover:opacity-100">×</button>
                </div>
            )}

            {/* Header Halaman */}
            <div className="header-verifikasi mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div className="area-judul">
                    <h1 className="font-poppins font-bold text-[32px] text-[#4B2E2B] leading-tight mb-2">
                        Verifikasi Status Pendaftaran Cafe
                    </h1>
                    <p className="font-poppins text-[16px] text-[#4B2E2B]/70">
                        Lakukan verifikasi Status perusahaan pada CAFE job platform
                    </p>
                </div>
                
                <div className="area-cari relative">
                    <img 
                        src={ikonSearch} 
                        alt="Cari" 
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50" 
                    />
                    <input 
                        type="text"
                        placeholder="Cari Perusahaan"
                        className="w-full md:w-[320px] bg-[#EAE4DC] border-none rounded-full py-3 pl-12 pr-6 font-poppins text-[14px] text-[#4B2E2B] placeholder:text-[#4B2E2B]/50 focus:ring-2 focus:ring-[#4B2E2B]/20 outline-none transition-all"
                        value={kataKunci}
                        onChange={(e) => setKataKunci(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid Statistik Ringkasan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {stats.map((stat, index) => (
                    <div 
                        key={index} 
                        className={`${stat.bg} rounded-[12px] p-5 flex items-center justify-between border border-[#4B2E2B]/5 shadow-sm`}
                    >
                        <div className="flex items-center gap-4">
                            <div className="ikon-stat w-10 h-10 flex items-center justify-center">
                                <img src={stat.ikon} alt={stat.label} className="w-8 h-8 object-contain" />
                            </div>
                            <span className="font-poppins font-medium text-[15px] text-[#4B2E2B]/80">
                                {stat.label}
                            </span>
                        </div>
                        <span className="font-poppins font-bold text-[28px] text-[#4B2E2B]">
                            {stat.nilai}
                        </span>
                    </div>
                ))}
            </div>

            {/* Tabel Utama */}
            <TabelVerifikasi
                dataKafe={daftarKafe.filter((kafe) => {
                    const query = kataKunci.toLowerCase();
                    return (
                        kafe.nama_perusahaan?.toLowerCase().includes(query) ||
                        kafe.nama_pengguna?.toLowerCase().includes(query) ||
                        kafe.kecamatan?.toLowerCase().includes(query)
                    );
                })}
                sedangMemuat={sedangMemuat}
                onLihatDetail={(kafe) => setKafeAktif(kafe)}
            />

            {/* Modal Detail Kafe */}
            <ModalDetailKafe
                kafeAktif={kafeAktif}
                onTutup={() => setKafeAktif(null)}
                onBerhasilVerifikasi={tanganiSuksesVerifikasi}
            />
        </div>
    );
};

export default HalamanVerifikasi;
