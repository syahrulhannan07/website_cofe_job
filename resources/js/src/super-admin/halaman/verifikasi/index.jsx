import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../layanan/api';
import TabelVerifikasi from './komponen/TabelVerifikasi';
import ModalDetailKafe from './komponen/ModalDetailKafe';

import ikonSearch from '../../aset/verifikasi/Search.svg';
import ikonDiterima from '../../aset/verifikasi/diterima.svg';
import ikonDitolak from '../../aset/verifikasi/ditolak.svg';
import ikonPending from '../../aset/verifikasi/pending.svg';
import ikonTotalPerusahaan from '../../aset/verifikasi/total-perusahaan.svg';

const HalamanVerifikasi = () => {
    const [daftarKafe, setDaftarKafe]       = useState([]);
    const [statistik, setStatistik]         = useState(null);
    const [sedangMemuat, setSedangMemuat]   = useState(true);
    const [kafeAktif, setKafeAktif]         = useState(null);
    const [kataKunci, setKataKunci]         = useState('');
    const [notifikasi, setNotifikasi]       = useState(null);

    // Ambil daftar kafe Pending dan statistik secara paralel
    const ambilSemuaData = useCallback(async () => {
        setSedangMemuat(true);
        try {
            const [responsList, responsStats] = await Promise.all([
                api.get('/super-admin/verifikasi'),
                api.get('/super-admin/verifikasi/statistik'),
            ]);

            if (responsList.data?.data) {
                setDaftarKafe(responsList.data.data);
            }
            if (responsStats.data?.data) {
                setStatistik(responsStats.data.data);
            }
        } catch (err) {
            console.error('Gagal memuat data halaman verifikasi:', err);
        } finally {
            setSedangMemuat(false);
        }
    }, []);

    useEffect(() => {
        ambilSemuaData();
    }, [ambilSemuaData]);

    // Kartu metrik — nilai dari statistik API, bukan hardcoded
    const kartuStatistik = [
        { label: 'Total Perusahaan', nilai: statistik?.total_perusahaan ?? '—', ikon: ikonTotalPerusahaan, bg: 'bg-[#EAE4DC]' },
        { label: 'Pending',          nilai: statistik?.pending          ?? '—', ikon: ikonPending,         bg: 'bg-[#FCE6C9]' },
        { label: 'Ditolak',          nilai: statistik?.ditolak          ?? '—', ikon: ikonDitolak,         bg: 'bg-[#F9D9D9]' },
        { label: 'Diterima',         nilai: statistik?.diterima         ?? '—', ikon: ikonDiterima,        bg: 'bg-[#D1FAE5]' },
    ];

    // Setelah verifikasi berhasil: hapus kafe dari daftar & perbarui statistik lokal
    const tanganiSuksesVerifikasi = (idKafe, statusBaru) => {
        setDaftarKafe((prev) => prev.filter((k) => k.id !== idKafe));

        // Perbarui angka statistik secara optimistis (tanpa refetch)
        setStatistik((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                pending:  (prev.pending  || 0) - 1,
                diterima: statusBaru === 'Aktif'    ? (prev.diterima || 0) + 1 : prev.diterima,
                ditolak:  statusBaru === 'Ditolak'  ? (prev.ditolak  || 0) + 1 : prev.ditolak,
            };
        });

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

    // Filter realtime berdasarkan kata kunci pencarian
    const dataTefilter = daftarKafe.filter((kafe) => {
        const query = kataKunci.toLowerCase();
        return (
            kafe.nama_perusahaan?.toLowerCase().includes(query) ||
            kafe.nama_pengguna?.toLowerCase().includes(query)   ||
            kafe.kecamatan?.toLowerCase().includes(query)
        );
    });

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
                        className="kolom-pencarian w-full md:w-[320px] bg-[#EAE4DC] border-none rounded-full py-3 pl-12 pr-6 font-poppins text-[14px] text-[#4B2E2B] placeholder:text-[#4B2E2B]/50 focus:ring-2 focus:ring-[#4B2E2B]/20 outline-none transition-all"
                        value={kataKunci}
                        onChange={(e) => setKataKunci(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid Statistik Ringkasan — nilai dinamis dari API */}
            <div className="grid-kartu-statistik grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {kartuStatistik.map((stat, index) => (
                    <div
                        key={index}
                        className={`kartu-statistik-verifikasi ${stat.bg} rounded-[12px] p-5 flex items-center justify-between border border-[#4B2E2B]/5 shadow-sm`}
                    >
                        <div className="flex items-center gap-4">
                            <div className="ikon-stat w-10 h-10 flex items-center justify-center">
                                <img src={stat.ikon} alt={stat.label} className="w-8 h-8 object-contain" />
                            </div>
                            <span className="font-poppins font-medium text-[15px] text-[#4B2E2B]/80">
                                {stat.label}
                            </span>
                        </div>
                        <span className="nilai-statistik font-poppins font-bold text-[28px] text-[#4B2E2B]">
                            {sedangMemuat ? '...' : stat.nilai}
                        </span>
                    </div>
                ))}
            </div>

            {/* Tabel Utama — default Pending, urutan ASC (terlama–terbaru) */}
            <TabelVerifikasi
                dataKafe={dataTefilter}
                sedangMemuat={sedangMemuat}
                onLihatDetail={(kafe) => setKafeAktif(kafe)}
            />

            {/* Modal Detail & Verifikasi Kafe */}
            <ModalDetailKafe
                kafeAktif={kafeAktif}
                onTutup={() => setKafeAktif(null)}
                onBerhasilVerifikasi={tanganiSuksesVerifikasi}
            />
        </div>
    );
};

export default HalamanVerifikasi;
