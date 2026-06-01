import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../layanan/api';
import ikonTglPub from '../../aset/akun admin/tglpub.svg';
import ikonTglTutup from '../../aset/akun admin/tgltutup.svg';

const HalamanDetailLowonganSuperAdmin = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [lowongan, setLowongan] = useState(null);
    const [sedangMemuat, setSedangMemuat] = useState(true);
    const [sedangProses, setSedangProses] = useState(false);
    const [notifikasi, setNotifikasi] = useState(null);
    const [statusHalaman, setStatusHalaman] = useState('');

    useEffect(() => {
        const muatLowongan = async () => {
            setSedangMemuat(true);
            try {
                const respons = await api.get(`/super-admin/lowongan/${id}`);
                if (respons.data?.data) {
                    setLowongan(respons.data.data);
                    setStatusHalaman(respons.data.data.status);
                }
            } catch (err) {
                console.error('Gagal memuat detail lowongan:', err);
            } finally {
                setSedangMemuat(false);
            }
        };
        muatLowongan();
    }, [id]);

    const tampilNotif = (tipe, pesan) => {
        setNotifikasi({ tipe, pesan });
        setTimeout(() => setNotifikasi(null), 4000);
    };

    const tanganiBlokir = async () => {
        setSedangProses(true);
        try {
            const respons = await api.put(`/super-admin/lowongan/${id}/status`, { status: 'Ditutup' });
            if (respons.status === 200) {
                setStatusHalaman('Ditutup');
                tampilNotif('sukses', 'Lowongan ini berhasil diblokir dari platform.');
            }
        } catch (err) {
            console.error('Gagal memblokir lowongan:', err);
            tampilNotif('gagal', 'Gagal memblokir lowongan.');
        } finally {
            setSedangProses(false);
        }
    };

    const tanganiAbaikan = async () => {
        setSedangProses(true);
        try {
            const respons = await api.put(`/super-admin/lowongan/${id}/status`, { status: 'Aktif' });
            if (respons.status === 200) {
                setStatusHalaman('Aktif');
                tampilNotif('info', 'Laporan lowongan telah diabaikan. Status tetap aktif.');
            }
        } catch (err) {
            console.error('Gagal mengabaikan laporan lowongan:', err);
            tampilNotif('gagal', 'Gagal memproses tindakan.');
        } finally {
            setSedangProses(false);
        }
    };

    if (sedangMemuat) {
        return (
            <div className="halaman-detail-lowongan w-full min-h-screen bg-[#F4ECE9] p-8 md:p-10 flex flex-col justify-center items-center" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                <div className="pembungkus-memuat flex flex-col items-center gap-4 text-[#4B2E2B]">
                    <svg className="ikon-putar w-10 h-10 animate-spin text-[#F7B750]" viewBox="0 0 24 24" fill="none">
                        <circle className="lingkaran-putar opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="jalur-putar opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span className="teks-memuat font-semibold text-lg animate-pulse">Memuat detail lowongan...</span>
                </div>
            </div>
        );
    }

    if (!lowongan) {
        return (
            <div className="halaman-detail-lowongan w-full min-h-screen bg-[#F4ECE9] p-8 md:p-10 flex flex-col justify-center items-center" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                <div className="pembungkus-tidak-ditemukan flex flex-col items-center gap-4 text-[#4B2E2B]">
                    <span className="ikon-peringatan text-[48px]">⚠️</span>
                    <span className="teks-peringatan font-bold text-xl">Lowongan tidak ditemukan</span>
                    <button
                        onClick={() => navigate('/super-admin/kelola-akun')}
                        className="btn-kembali-error flex items-center gap-2.5 px-6 py-2.5 bg-white hover:bg-[#EAE4DC]/50 border border-[#EAE4DC] text-[#4B2E2B] rounded-full text-[14px] font-bold transition-all duration-300 shadow-sm cursor-pointer"
                    >
                        Kembali ke Kelola Akun
                    </button>
                </div>
            </div>
        );
    }

    const deskripsiParagraf = typeof lowongan.deskripsi === 'string'
        ? lowongan.deskripsi.split(/\r?\n/).map(p => p.trim()).filter(Boolean)
        : [];

    const kualifikasiList = typeof lowongan.persyaratan === 'string'
        ? lowongan.persyaratan.split(/\r?\n/).map(p => p.trim()).filter(Boolean)
        : [];

    const pertanyaanList = Array.isArray(lowongan.pertanyaan) ? lowongan.pertanyaan : [];
    const dokumenList = Array.isArray(lowongan.dokumen) ? lowongan.dokumen : [];

    return (
        <div className="halaman-detail-lowongan w-full min-h-screen bg-[#F4ECE9] p-8 md:p-10 flex flex-col gap-6" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {/* Toast Notification Banner */}
            {notifikasi && (
                <div className={`toast-notifikasi fixed top-6 right-6 z-50 px-6 py-4 rounded-[12px] shadow-xl text-[14.5px] font-bold transition-all border ${
                    notifikasi.tipe === 'sukses'
                        ? 'bg-[#FEF2F2] border-[#FCA5A5] text-[#991B1B]'
                        : notifikasi.tipe === 'info'
                        ? 'bg-[#E8F5E9] border-[#A5D6A7] text-[#2E7D32]'
                        : 'bg-[#4B2E2B] border-[#EAE4DC]/20 text-[#F7B750]'
                }`} style={{ fontFamily: 'Poppins, sans-serif' }}>
                    <div className="toast-content flex items-center gap-3">
                        <span className="toast-indicator w-2.5 h-2.5 rounded-full bg-current animate-ping" />
                        {notifikasi.pesan}
                    </div>
                </div>
            )}

            <div className="kembali-row flex items-center">
                <button
                    onClick={() => {
                        if (lowongan && lowongan.id_pengguna) {
                            navigate(`/super-admin/kelola-akun?open_kafe_id=${lowongan.id_pengguna}`);
                        } else {
                            navigate('/super-admin/kelola-akun');
                        }
                    }}
                    className="btn-kembali flex items-center gap-2.5 px-4 py-2 bg-white hover:bg-[#EAE4DC]/50 border border-[#EAE4DC] text-[#4B2E2B] rounded-full text-[14px] font-bold transition-all duration-300 shadow-sm cursor-pointer hover:-translate-x-0.5"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                    Kembali ke Kelola Akun
                </button>
            </div>

            {/* ── HEADER CARD SECTION ── */}
            <div className="header-card p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="header-info flex flex-col gap-2">
                    {/* Badge and ID */}
                    <div className="header-badge-row flex items-center gap-3">
                        <span className={`badge-status px-3 py-1 rounded-full text-[12px] font-bold tracking-wide flex items-center gap-1.5 ${
                            statusHalaman === 'Aktif'
                                ? 'bg-[#DCFCE7] text-[#15803D]'
                                : 'bg-[#FEE2E2] text-[#B91C1C]'
                        }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusHalaman === 'Aktif' ? 'bg-[#22C55E]' : 'bg-[#EF4444]'}`} />
                            {(statusHalaman || '').toUpperCase()}
                        </span>

                        <span className="header-id text-[12px] font-bold text-[#827470] tracking-[1.2px]">
                            ID: JOB-2024-{100 + lowongan.id}
                        </span>
                    </div>

                    {/* Job Position Title */}
                    <h1 className="header-judul font-bold text-[36px] tracking-tight leading-tight text-[#2B1810]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {lowongan.posisi}
                    </h1>

                    {/* Meta Rows (Location & Salary) */}
                    <div className="header-meta-row flex flex-wrap items-center gap-x-6 gap-y-2 mt-1 text-[#827470] font-semibold text-[14px]">
                        {/* Company & Location */}
                        <div className="header-meta-item flex items-center gap-2">
                            <svg className="w-[18px] h-[18px] text-[#F7B750]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                            </svg>
                            <span>{lowongan.perusahaan}, {lowongan.lokasi}</span>
                        </div>

                        {/* Salary */}
                        <div className="header-meta-item flex items-center gap-2">
                            <svg className="w-[18px] h-[18px] text-[#F7B750]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.22.11a3.118 3.118 0 004.56 0a3.118 3.118 0 000-4.364a3.118 3.118 0 00-4.56 0a3.118 3.118 0 000 4.364M12 6v12m-3-12h6M9 18h6" />
                            </svg>
                            <span>{lowongan.gaji}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── TWO-COLUMN CONTENT GRID ── */}
            <div className="grid-layout grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left 2 Columns: Vacancy details */}
                <div className="main-content-column lg:col-span-2 flex flex-col gap-6">
                    {/* Job Description Card */}
                    <div className="deskripsi-card bg-white rounded-[20px] border border-[#EAE4DC]/60 p-8 shadow-[0_8px_30px_-6px_rgba(67,44,35,0.02)]">
                        <div className="card-header-row flex items-center gap-3 mb-4">
                            <div className="card-header-accent w-[4px] h-[24px] rounded-full bg-[#F7B750]" />
                            <h3 className="card-header-title font-bold text-[20px] text-[#2B1810]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Deskripsi Pekerjaan
                            </h3>
                        </div>
                        <div className="deskripsi-isi flex flex-col gap-4 text-[15px] font-medium leading-[26px] text-[#4B2E2B] text-left">
                            {deskripsiParagraf.length > 0 ? (
                                deskripsiParagraf.map((para, i) => (
                                    <p key={i}>{para}</p>
                                ))
                            ) : (
                                <p className="text-gray-500 italic">Tidak ada deskripsi pekerjaan.</p>
                            )}
                        </div>
                    </div>

                    {/* Requirements & Qualifications Card */}
                    <div className="kualifikasi-card bg-white rounded-[20px] border border-[#EAE4DC]/60 p-8 shadow-[0_8px_30px_-6px_rgba(67,44,35,0.02)]">
                        <div className="card-header-row flex items-center gap-3 mb-5">
                            <div className="card-header-accent w-[4px] h-[24px] rounded-full bg-[#F7B750]" />
                            <h3 className="card-header-title font-bold text-[20px] text-[#2B1810]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Persyaratan & Kualifikasi
                            </h3>
                        </div>
                        <ul className="kualifikasi-daftar flex flex-col gap-4">
                            {kualifikasiList.length > 0 ? (
                                kualifikasiList.map((req, i) => (
                                    <li key={i} className="kualifikasi-item flex gap-3.5 text-[15px] text-[#4B2E2B] font-medium leading-[24px] text-left">
                                        <span className="kualifikasi-bullet text-[#F7B750] text-[20px] leading-[18px]">•</span>
                                        <span>{req}</span>
                                    </li>
                                ))
                            ) : (
                                <p className="text-gray-500 italic">Tidak ada persyaratan khusus.</p>
                            )}
                        </ul>
                    </div>

                    {/* Required Documents Card */}
                    <div className="dokumen-card bg-white rounded-[20px] border border-[#EAE4DC]/60 p-8 shadow-[0_8px_30px_-6px_rgba(67,44,35,0.02)]">
                        <div className="card-header-row flex items-center gap-3 mb-5">
                            <div className="card-header-accent w-[4px] h-[24px] rounded-full bg-[#F7B750]" />
                            <h3 className="card-header-title font-bold text-[20px] text-[#2B1810]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Dokumen yang Diperlukan
                            </h3>
                        </div>
                        <div className="dokumen-daftar flex flex-col gap-4">
                            {dokumenList.length > 0 ? (
                                dokumenList.map((doc, idx) => (
                                    <div key={doc.id || idx} className="dokumen-item bg-[#FAF8F6] border border-[#EAE4DC]/50 rounded-[16px] p-5 flex items-center justify-between shadow-sm">
                                        <div className="info-dokumen flex flex-col gap-1 text-left">
                                            <div className="baris-judul-dokumen flex items-center gap-3">
                                                <span className="ikon-dokumen text-[18px]">📄</span>
                                                <span className="nama-dokumen font-bold text-[16px] text-[#2B1810]">
                                                    {doc.nama}
                                                </span>
                                            </div>
                                            {doc.keterangan && (
                                                <span className="ket-dokumen text-[13.5px] font-medium text-[#827470] pl-7">
                                                    {doc.keterangan}
                                                </span>
                                            )}
                                        </div>
                                        
                                        {/* Status Badge: Wajib / Opsional */}
                                        <div className="status-badge-dokumen flex-shrink-0 ml-4">
                                            {doc.wajib ? (
                                                <span className="lencana-wajib px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wider bg-[#FEE2E2] text-[#B91C1C] border border-[#FCA5A5]/30" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                    WAJIB
                                                </span>
                                            ) : (
                                                <span className="lencana-opsional px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wider bg-[#EAE4DC] text-[#4B2E2B]/80 border border-[#EAE4DC]/40" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                    OPSIONAL
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 italic text-left pl-2">Tidak ada dokumen khusus yang diperlukan.</p>
                            )}
                        </div>
                    </div>

                    {/* Screening Questions Card */}
                    <div className="pertanyaan-card border border-[#EAE4DC] rounded-[20px] p-8 shadow-[inset_0_2px_8px_rgba(67,44,35,0.01)]">
                        <div className="card-header-row flex items-center gap-3 mb-5">
                            <div className="card-header-accent w-[4px] h-[24px] rounded-full bg-[#835500]" />
                            <h3 className="card-header-title font-bold text-[20px] text-[#2B1810]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Pertanyaan Perusahaan
                            </h3>
                        </div>
                        <div className="pertanyaan-daftar flex flex-col gap-4">
                            {pertanyaanList.length > 0 ? (
                                pertanyaanList.map((q, idx) => (
                                    <div key={idx} className="pertanyaan-item bg-white border border-[#EAE4DC] rounded-[16px] p-5 flex items-center gap-4 shadow-sm">
                                        <div className="pertanyaan-nomor w-9 h-9 rounded-full bg-[#FFEDD5] text-[#2B1800] flex items-center justify-center font-bold text-[15px] flex-shrink-0">
                                            {idx + 1}
                                        </div>
                                        <p className="pertanyaan-teks text-[15.5px] font-semibold text-[#2B1810] text-left">
                                            {q}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 italic pl-2">Tidak ada pertanyaan seleksi dari perusahaan.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right 1 Column: Metadata & Moderation */}
                <div className="sidebar-column lg:col-span-1 flex flex-col gap-6">
                    {/* Vacancy Info Metadata Card */}
                    <div className="info-lowongan-card bg-white rounded-[20px] border border-[#EAE4DC]/60 p-6 shadow-[0_8px_30px_-6px_rgba(67,44,35,0.02)] flex flex-col gap-5">
                        <h4 className="sidebar-section-title font-bold text-[13px] tracking-wider text-[#827470] uppercase mb-1">
                            Informasi Lowongan
                        </h4>

                        {/* Published Date */}
                        <div className="info-item flex flex-col gap-2">
                            <span className="info-label text-[12px] font-semibold text-[#827470]">
                                Tanggal Publikasi
                            </span>
                            <div className="info-value flex items-center gap-3 text-[#2B1810] font-bold text-[15px]">
                                <img src={ikonTglPub} alt="Tanggal Publikasi" className="w-[18px] h-[20px] object-contain" />
                                <span>{lowongan.tanggal}</span>
                            </div>
                        </div>

                        <div className="info-separator h-[1px] bg-[#EAE4DC]/80 w-full" />

                        {/* Closing Date */}
                        <div className="info-item flex flex-col gap-2">
                            <span className="info-label text-[12px] font-semibold text-[#827470]">
                                Batas Penutupan
                            </span>
                            <div className="info-value flex items-center gap-3 text-[#B91C1C] font-bold text-[15px]">
                                <img src={ikonTglTutup} alt="Batas Penutupan" className="w-[18px] h-[20px] object-contain" />
                                <span>{lowongan.batas}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HalamanDetailLowonganSuperAdmin;
