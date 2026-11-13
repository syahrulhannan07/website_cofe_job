import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../layanan/api';
import MapLokasi from '../../../komponen/umum/MapLokasi';

const DetailVerifikasi = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [screening, setScreening] = useState(null);
    const [sedangMemuat, setSedangMemuat] = useState(true);
    const [sedangMemuatScreening, setSedangMemuatScreening] = useState(false);
    const [sedangProsesKeputusan, setSedangProsesKeputusan] = useState(false);
    const [catatanKeputusan, setCatatanKeputusan] = useState('');
    const [keputusanTerpilih, setKeputusanTerpilih] = useState(null);
    const [dokumenBlobUrl, setDokumenBlobUrl] = useState(null);
    const [dokumenMemuat, setDokumenMemuat] = useState(false);
    const [dokumenError, setDokumenError] = useState(null);
    const [logoError, setLogoError] = useState(false);
    const [outletError, setOutletError] = useState(false);
    const [deskripsiExpanded, setDeskripsiExpanded] = useState(false);
    const [showDokumenDetail, setShowDokumenDetail] = useState(false);
    const pollingInterval = useRef(null);

    useEffect(() => {
        const muatData = async () => {
            setSedangMemuat(true);
            try {
                const respons = await api.get(`/superadmin/verifikasi/${id}`);
                setData(respons.data.data);

                const perusahaan = respons.data.data;
                if (perusahaan?.nib?.id_nib) {
                    await muatScreening(perusahaan.nib.id_nib);

                    // Auto-start screening jika belum ada hasil dan belum berjalan
                    const statusProses = perusahaan.nib.status_proses_screening;
                    const hasHasil = perusahaan.nib.hasil_screening;
                    if (!hasHasil && statusProses === 'Belum_Dimulai') {
                        await mulaiScreening(perusahaan.nib.id_nib);
                    } else if (statusProses === 'Menunggu' || statusProses === 'Sedang_Diproses') {
                        // Mulai polling jika proses masih berjalan
                        mulaiPolling(perusahaan.nib.id_nib);
                    }
                }
            } catch (err) {
                console.error('Gagal memuat detail:', err);
            } finally {
                setSedangMemuat(false);
            }
        };
        muatData();
    }, [id]);

    // Bersihkan interval saat komponen dilepas
    useEffect(() => {
        return () => {
            if (pollingInterval.current) {
                clearInterval(pollingInterval.current);
                pollingInterval.current = null;
            }
            if (dokumenBlobUrl) {
                URL.revokeObjectURL(dokumenBlobUrl);
            }
        };
    }, [dokumenBlobUrl]);

    const mulaiPolling = useCallback((idNib) => {
        if (pollingInterval.current) {
            clearInterval(pollingInterval.current);
        }
        pollingInterval.current = setInterval(async () => {
            try {
                const respons = await api.get(`/super-admin/nib/${idNib}/screening`);
                const dataBaru = respons.data.data;
                setScreening(dataBaru);

                const statusProses = dataBaru?.status_proses_screening;
                if (statusProses === 'Selesai' || statusProses === 'Gagal') {
                    clearInterval(pollingInterval.current);
                    pollingInterval.current = null;
                    // Muat ulang data detail untuk mendapatkan hasil_screening terbaru
                    const responsDetail = await api.get(`/superadmin/verifikasi/${id}`);
                    setData(responsDetail.data.data);
                }
            } catch (err) {
                console.error('Gagal polling screening:', err);
            }
        }, 3000);
    }, [id]);

    const muatScreening = async (idNib) => {
        setSedangMemuatScreening(true);
        try {
            const respons = await api.get(`/super-admin/nib/${idNib}/screening`);
            setScreening(respons.data.data);
        } catch (err) {
            console.error('Gagal memuat screening:', err);
        } finally {
            setSedangMemuatScreening(false);
        }
    };

    const mulaiScreening = async (idNib) => {
        try {
            const respons = await api.post(`/super-admin/nib/${idNib}/screening`);
            if (respons.data.status === 'success') {
                // Set status awal dan mulai polling
                setScreening(prev => ({
                    ...prev,
                    status_proses_screening: 'Menunggu',
                }));
                mulaiPolling(idNib);
            }
        } catch (err) {
            console.error('Gagal memulai screening:', err);
            if (err.response?.status === 409) {
                // Sudah berjalan, mulai polling
                mulaiPolling(idNib);
            }
        }
    };

    const parseHasilScreening = () => {
        if (!data?.nib?.hasil_screening) return null;
        try {
            return typeof data.nib.hasil_screening === 'string'
                ? JSON.parse(data.nib.hasil_screening)
                : data.nib.hasil_screening;
        } catch (err) {
            console.error('Gagal parsing hasil_screening:', err);
            return null;
        }
    };

    const hasilScreening = parseHasilScreening();

    const urlDokumenNib = data?.nib?.id_nib ? `/super-admin/nib/${data.nib.id_nib}/dokumen` : null;

    const lihatLebihDetail = () => {
        if (urlDokumenNib) {
            const apiBase = api.defaults.baseURL || '';
            const fullUrl = apiBase.endsWith('/') 
                ? `${apiBase.slice(0, -1)}${urlDokumenNib}`
                : `${apiBase}${urlDokumenNib}`;
            
            // Menggunakan window.open dengan URL API langsung. 
            // Karena ini endpoint privat, browser akan meminta auth jika token tidak ada di cookie.
            // Namun karena kita menggunakan JWT di header, cara terbaik adalah 
            // tetap menggunakan blob atau membuka di tab baru jika browser mendukung stream.
            // Untuk tugas ini, kita buka di tab baru menggunakan blob jika sudah dimuat,
            // atau download link jika belum.
            if (dokumenBlobUrl) {
                window.open(dokumenBlobUrl, '_blank');
            } else {
                muatDokumenSebagaiBlob().then(() => {
                    if (dokumenBlobUrl) window.open(dokumenBlobUrl, '_blank');
                });
            }
        }
    };

    const muatDokumenSebagaiBlob = async () => {
        if (!urlDokumenNib || dokumenBlobUrl) return;
        setDokumenMemuat(true);
        setDokumenError(null);
        try {
            const respons = await api.get(urlDokumenNib, {
                responseType: 'blob',
            });
            const blob = new Blob([respons.data], { type: respons.headers['content-type'] || 'application/pdf' });
            const blobUrl = URL.createObjectURL(blob);
            setDokumenBlobUrl(blobUrl);
        } catch (err) {
            console.error('Gagal memuat dokumen:', err);
            setDokumenError(err.response?.data?.message || 'Gagal memuat dokumen NIB.');
        } finally {
            setDokumenMemuat(false);
        }
    };

    // Muat dokumen saat komponen pertama kali render dengan data
    useEffect(() => {
        if (urlDokumenNib && !dokumenBlobUrl && !dokumenError) {
            muatDokumenSebagaiBlob();
        }
    }, [urlDokumenNib, dokumenBlobUrl, dokumenError]);

    const unduhDokumen = async () => {
        if (!urlDokumenNib) return;
        setDokumenMemuat(true);
        try {
            const respons = await api.get(urlDokumenNib, {
                responseType: 'blob',
            });
            const blob = new Blob([respons.data], { type: respons.headers['content-type'] || 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = data.nib?.dokumen_nib ? data.nib.dokumen_nib.split('/').pop() : 'dokumen-nib.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Gagal mengunduh dokumen:', err);
            alert('Gagal mengunduh dokumen. Silakan coba lagi.');
        } finally {
            setDokumenMemuat(false);
        }
    };

    const tanganiSetujui = async () => {
        if (!confirm('Yakin ingin menyetujui verifikasi perusahaan ini?')) return;
        setSedangProsesKeputusan(true);
        try {
            await api.put(`/superadmin/${id}/setujui`);
            window.location.reload();
        } catch (err) {
            console.error('Gagal menyetujui:', err);
            alert('Gagal menyetujui verifikasi. Silakan coba lagi.');
        } finally {
            setSedangProsesKeputusan(false);
        }
    };

    const tanganiTolak = async () => {
        if (!catatanKeputusan || catatanKeputusan.trim().length < 5) {
            alert('Alasan penolakan minimal 5 karakter.');
            return;
        }
        if (!confirm('Yakin ingin menolak verifikasi perusahaan ini?')) return;
        setSedangProsesKeputusan(true);
        try {
            await api.post(`/superadmin/${id}/tolak`, { alasan: catatanKeputusan });
            window.location.reload();
        } catch (err) {
            console.error('Gagal menolak:', err);
            alert('Gagal menolak verifikasi. Silakan coba lagi.');
        } finally {
            setSedangProsesKeputusan(false);
        }
    };

    const statusProsesScreening = screening?.status_proses_screening || data?.nib?.status_proses_screening || null;
    const statusScreening = screening?.status_screening || data?.nib?.status_screening || null;
    const screeningAktif = statusProsesScreening === 'Menunggu' || statusProsesScreening === 'Sedang_Diproses' || sedangMemuatScreening;

    // Helper: Identifikasi Indikator NIB
    const identifikasiIndikator = () => {
        const res = {
            garuda: { status: 'Perlu Cek Visual', detail: 'Sistem tidak memiliki deteksi otomatis lambang negara. Silakan periksa pada pratinjau dokumen.', poin: 0, max: 20 },
            qr: { status: 'Tidak Terdeteksi', detail: 'QR Code tidak ditemukan pada dokumen.', poin: 0, max: 25 },
            nib: { status: 'Tidak Ditemukan', detail: 'Nomor NIB gagal terekstraksi oleh OCR.', poin: 0, max: 20 },
            kbli: { status: 'Tidak Ditemukan', detail: 'Kode KBLI tidak ditemukan pada dokumen.', poin: 0, max: 35 }
        };

        if (!screening?.hasil_screening) return res;

        const hasil = screening.hasil_screening;
        const fields = hasil.data_terekstraksi?.fields || [];
        const qr = hasil.data_terekstraksi?.qr || {};

        // 1. Garuda (System Limitation)
        res.garuda = { status: 'Perlu Cek Visual', detail: 'Deteksi otomatis lambang Garuda tidak tersedia. Harap validasi secara manual di dokumen.', poin: 0, max: 20 };

        // 2. QR Code
        if (qr.ditemukan) {
            if (qr.url_validasi?.status === 'OSS_URL_VALID') {
                res.qr = { status: 'Resmi OSS', detail: `QR Code valid dan mengarah ke domain resmi OSS.`, poin: 25, max: 25 };
            } else if (qr.url_validasi?.status === 'UNTRUSTED_URL') {
                res.qr = { status: 'URL Tidak Resmi', detail: `Domain tidak terverifikasi: ${qr.konten ? new URL(qr.konten).hostname : 'N/A'}`, poin: 0, max: 25 };
            } else {
                res.qr = { status: 'Terbaca', detail: 'QR Code ditemukan tetapi validasi domain tidak tersedia.', poin: 10, max: 25 };
            }
        } else {
            res.qr = { status: 'Tidak Ditemukan', detail: 'Dokumen tidak memiliki QR Code.', poin: 0, max: 25 };
        }

        // 3. Nomor NIB (13 Digit)
        const nibField = fields.find(f => f.nama_field === 'nomor_nib');
        if (nibField && nibField.status === 'FIELD_FOUND') {
            const val = nibField.normalized_value || '';
            if (val.length === 13 && /^\d+$/.test(val)) {
                res.nib = { status: 'Valid', detail: `Format 13 digit: ${val}`, poin: 20, max: 20 };
            } else {
                res.nib = { status: 'Format Salah', detail: `Ditemukan: ${val || 'kosong'}. Format NIB harus 13 digit angka.`, poin: 0, max: 20 };
            }
        }

        // 4. KBLI
        // Karena hasil_screening tidak secara eksplisit menyertakan list KBLI dalam JSON contoh, 
        // kita akan menandai ini sebagai "Tidak Dapat Diverifikasi" sampai integrasi data KBLI ditambahkan.
        res.kbli = { status: 'Tidak Dapat Diverifikasi', detail: 'Data KBLI belum tersedia pada hasil ekstraksi otomatis.', poin: 0, max: 35 };

        return res;
    };

    const indikator = identifikasiIndikator();
    const totalSkor = Object.values(indikator).reduce((acc, curr) => acc + curr.poin, 0);

    if (sedangMemuat) return <div className="p-8 font-poppins text-[#4B2E2B] flex items-center justify-center min-h-screen">Memuat data...</div>;
    if (!data) return <div className="p-8 font-poppins text-[#4B2E2B] text-center">Data tidak ditemukan.</div>;

    return (
        <div className="min-h-screen bg-[#F7F8FA] p-8">
            <style>
                {`
                    .skeleton-pulse {
                        animation: skeleton-pulse 1.5s ease-in-out infinite;
                        background: linear-gradient(90deg, #F7F8FA 25%, #E2E8F0 50%, #F7F8FA 75%);
                        background-size: 200% 100%;
                        border-radius: 4px;
                    }
                    @keyframes skeleton-pulse {
                        0% { background-position: 200% 0; }
                        100% { background-position: -200% 0; }
                    }
                    .skeleton-text {
                        height: 16px;
                        margin-bottom: 8px;
                        border-radius: 4px;
                    }
                    .skeleton-text-sm {
                        height: 14px;
                        margin-bottom: 6px;
                        border-radius: 4px;
                    }
                    .skeleton-row {
                        height: 32px;
                        margin-bottom: 12px;
                        border-radius: 4px;
                    }
                    .skeleton-badge {
                        height: 20px;
                        width: 100px;
                        border-radius: 12px;
                    }
                `}
            </style>
            <div className="max-w-6xl mx-auto space-y-8">
                {/* ── A. HEADER MANDIRI ── */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/super-admin/verifikasi')}
                        className="flex items-center gap-2 text-[#64748B] hover:text-[#4B2E2B] transition-colors mb-4 text-[14px] font-semibold"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                        Kembali ke Daftar Verifikasi
                    </button>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <p className="text-[14px] font-medium text-[#64748B] mb-1">Super Admin / Verifikasi Perusahaan / Detail</p>
                            <h1 className="text-[32px] font-bold text-[#1E293B] mb-2">Detail Verifikasi Perusahaan</h1>
                            <p className="text-[16px] text-[#64748B]">
                                Tinjau dokumen dan informasi perusahaan sebelum menyetujui atau menolak.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-[#E2E8F0]">
                            <span className={`w-2.5 h-2.5 rounded-full ${data.status_verifikasi === 'Diterima' ? 'bg-[#16A34A]' : data.status_verifikasi === 'Ditolak' ? 'bg-[#DC2626]' : 'bg-[#D97706]'}`} />
                            <span className={`text-[14px] font-bold ${data.status_verifikasi === 'Diterima' ? 'text-[#16A34A]' : data.status_verifikasi === 'Ditolak' ? 'text-[#DC2626]' : 'text-[#D97706]'}`}>
                                Status: {data.status_verifikasi || 'Pending'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── B. INFORMASI PERUSAHAAN ── */}
                <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 md:p-8 shadow-sm space-y-8">
                    <h2 className="text-[20px] font-bold text-[#1E293B] border-b border-[#E2E8F0] pb-4">Informasi Perusahaan</h2>

                    {/* A. Identitas Perusahaan */}
                    <div className="space-y-4">
                        <h3 className="text-[16px] font-bold text-[#4B2E2B] uppercase tracking-wide">1. Identitas Perusahaan</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-[#F7F8FA] p-6 rounded-xl border border-[#E2E8F0]">
                            <div className="flex flex-col items-center md:items-start">
                                <p className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-2">Logo Kafe</p>
                                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#E2E8F0] bg-white flex items-center justify-center shadow-sm">
                                    {data.logo_url && !logoError ? (
                                        <img
                                            src={data.logo_url}
                                            alt={data.nama_perusahaan || 'Logo Kafe'}
                                            className="w-full h-full object-cover"
                                            onError={() => setLogoError(true)}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-[#EAE4DC] flex items-center justify-center text-[#4B2E2B] font-bold text-[12px] text-center p-2">
                                            Tanpa Logo
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Nama Kafe</p>
                                    <p className="text-[15px] font-semibold text-[#1E293B]">{data.nama_perusahaan || 'Belum diisi'}</p>
                                </div>
                                <div>
                                    <p className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Nama Pengelola</p>
                                    <p className="text-[15px] font-semibold text-[#1E293B]">{data.pengguna?.nama_pengguna || 'Belum diisi'}</p>
                                </div>
                                <div className="sm:col-span-2">
                                    <p className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Email Bisnis</p>
                                    <p className="text-[15px] font-semibold text-[#1E293B]">{data.pengguna?.email || 'Belum diisi'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* B. Informasi Usaha */}
                    <div className="space-y-4">
                        <h3 className="text-[16px] font-bold text-[#4B2E2B] uppercase tracking-wide">2. Informasi Usaha</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#F7F8FA] p-6 rounded-xl border border-[#E2E8F0]">
                            <div>
                                <p className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Kecamatan</p>
                                <p className="text-[15px] font-semibold text-[#1E293B]">{data.kecamatan || 'Belum diisi'}</p>
                            </div>
                            <div>
                                <p className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Tanggal Berdiri</p>
                                <p className="text-[15px] font-semibold text-[#1E293B]">
                                    {data.tanggal_berdiri ? new Date(data.tanggal_berdiri).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Belum diisi'}
                                </p>
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Alamat Lengkap</p>
                                <p className="text-[15px] font-semibold text-[#1E293B]">{data.alamat_perusahaan || 'Belum diisi'}</p>
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Deskripsi Kafe</p>
                                <div className="text-[14px] text-[#1E293B] leading-relaxed bg-white p-4 rounded-lg border border-[#E2E8F0]">
                                    {data.deskripsi ? (
                                        <div>
                                            <p className={`${!deskripsiExpanded && data.deskripsi.length > 250 ? 'line-clamp-3' : ''}`}>
                                                {data.deskripsi}
                                            </p>
                                            {data.deskripsi.length > 250 && (
                                                <button
                                                    onClick={() => setDeskripsiExpanded(!deskripsiExpanded)}
                                                    className="mt-2 text-[13px] font-semibold text-[#4B2E2B] hover:underline focus:outline-none"
                                                >
                                                    {deskripsiExpanded ? 'Sembunyikan' : 'Baca Selengkapnya'}
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-[#64748B] italic">Belum diisi</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* C. Foto Outlet */}
                    <div className="space-y-4">
                        <h3 className="text-[16px] font-bold text-[#4B2E2B] uppercase tracking-wide">3. Foto Outlet</h3>
                        <div className="bg-[#F7F8FA] p-6 rounded-xl border border-[#E2E8F0] space-y-4">
                            {data.foto_outlet_url && !outletError ? (
                                <div className="h-[320px] w-full rounded-xl overflow-hidden border border-[#E2E8F0] bg-[#1E293B] shadow-sm relative flex items-center justify-center z-0">
                                    {/* Blurred Fill Background */}
                                    <div 
                                        className="absolute inset-0 bg-cover bg-center blur-md opacity-40 transform scale-105"
                                        style={{ backgroundImage: `url(${data.foto_outlet_url})` }}
                                    />
                                    {/* Main Proportional Image (No Cut) */}
                                    <img
                                        src={data.foto_outlet_url}
                                        alt={data.nama_perusahaan ? `Foto Outlet ${data.nama_perusahaan}` : 'Foto Outlet'}
                                        className="relative z-10 w-full h-full object-contain p-2"
                                        onError={() => setOutletError(true)}
                                    />
                                </div>
                            ) : (
                                <div className="h-[320px] w-full rounded-xl border border-dashed border-[#CCCCCC] bg-white flex flex-col items-center justify-center p-6 text-center">
                                    <p className="text-[15px] font-semibold text-[#64748B]">Foto outlet belum tersedia</p>
                                    <p className="text-[13px] text-[#64748B] mt-1">Perusahaan belum mengunggah foto outlet kafe saat pendaftaran.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* D. Titik Lokasi Perusahaan */}
                    <div className="space-y-4">
                        <h3 className="text-[16px] font-bold text-[#4B2E2B] uppercase tracking-wide">4. Titik Lokasi Perusahaan</h3>
                        <div className="bg-[#F7F8FA] p-6 rounded-xl border border-[#E2E8F0] space-y-4">
                            {data.latitude && data.longitude && !(Number(data.latitude) === 0 && Number(data.longitude) === 0) ? (
                                <>
                                    <div className="h-[320px] w-full rounded-xl overflow-hidden border border-[#E2E8F0] shadow-sm z-0">
                                        <MapLokasi
                                            latitude={Number(data.latitude)}
                                            longitude={Number(data.longitude)}
                                            zoom={16}
                                            showMarker={true}
                                            showPopup={true}
                                            popupText={data.nama_perusahaan || 'Lokasi Kafe'}
                                            height="100%"
                                        />
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-center justify-between bg-white px-4 py-3 rounded-lg border border-[#E2E8F0] text-[14px]">
                                        <span className="text-[#64748B] font-medium">Koordinat GPS Aktual:</span>
                                        <span className="font-mono font-bold text-[#1E293B]">{data.latitude}, {data.longitude}</span>
                                    </div>
                                </>
                            ) : (
                                <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 text-center">
                                    <p className="text-[15px] font-semibold text-[#DC2626]">Titik lokasi belum tersedia</p>
                                    <p className="text-[13px] text-[#64748B] mt-1">Perusahaan belum menetapkan koordinat latitude dan longitude pada peta.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── C. DOKUMEN NIB ── */}
                <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 md:p-8 shadow-sm space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
                        <h2 className="text-[20px] font-bold text-[#1E293B]">Dokumen NIB (Nomor Induk Berusaha)</h2>
                        <div className="flex items-center gap-3">
                            {urlDokumenNib && (
                                <>
                                    <button
                                        onClick={lihatLebihDetail}
                                        disabled={dokumenMemuat}
                                        className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg text-[14px] font-semibold transition-colors flex items-center gap-2 disabled:opacity-60"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                                        Lihat Lebih Detail
                                    </button>
                                    <button
                                        onClick={unduhDokumen}
                                        disabled={dokumenMemuat}
                                        className="px-4 py-2 bg-[#4B2E2B] hover:bg-[#382220] text-white rounded-lg text-[14px] font-semibold transition-colors flex items-center gap-2 disabled:opacity-60"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                                        Unduh
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* 1. Preview Area */}
                        <div className="space-y-4">
                            <h3 className="text-[14px] font-bold text-[#64748B] uppercase tracking-wider">Preview Dokumen</h3>
                            {data.nib ? (
                                <div className="border border-[#E2E8F0] rounded-xl overflow-hidden bg-[#F7F8FA] h-[550px] relative">
                                    {dokumenMemuat && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10">
                                            <svg className="w-8 h-8 animate-spin text-[#4B2E2B] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                                            <p className="text-[13px] font-medium text-[#4B2E2B]">Memuat berkas...</p>
                                        </div>
                                    )}
                                    {dokumenError ? (
                                        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                                            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                                            </div>
                                            <p className="text-[14px] text-red-600 font-semibold">{dokumenError}</p>
                                        </div>
                                    ) : dokumenBlobUrl ? (
                                        <iframe
                                            src={`${dokumenBlobUrl}#toolbar=0`}
                                            title="Preview Dokumen NIB"
                                            className="w-full h-full border-none"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                                            <p className="text-[14px] text-[#64748B]">Menunggu pratinjau dokumen...</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-[#F7F8FA] border border-dashed border-[#E2E8F0] rounded-xl h-[550px] flex items-center justify-center text-center p-8">
                                    <p className="text-[15px] font-medium text-[#64748B]">Dokumen NIB tidak tersedia untuk perusahaan ini.</p>
                                </div>
                            )}
                        </div>

                        {/* 2. Analysis Area */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[14px] font-bold text-[#64748B] uppercase tracking-wider">Hasil Identifikasi Otomatis</h3>
                                <div className="bg-[#F1F5F9] px-3 py-1 rounded-full border border-[#E2E8F0]">
                                    <span className="text-[12px] font-bold text-[#475569]">Status: {statusProsesScreening || 'Belum Screening'}</span>
                                </div>
                            </div>

                            {/* Indikator List */}
                            <div className="space-y-3">
                                {[
                                    { label: 'Lambang Negara (Garuda)', data: indikator.garuda, icon: '🏛️' },
                                    { label: 'Pemeriksaan QR Code', data: indikator.qr, icon: '🛡️' },
                                    { label: 'Format Nomor NIB', data: indikator.nib, icon: '📄' },
                                    { label: 'Identifikasi KBLI Usaha', data: indikator.kbli, icon: '☕' }
                                ].map((item, idx) => (
                                    <div key={idx} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4 flex gap-4">
                                        <div className="text-[20px] shrink-0 mt-1">{item.icon}</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="text-[14px] font-bold text-[#1E293B]">{item.label}</h4>
                                                <div className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#E2E8F0] text-[#475569]">
                                                    {item.data.poin} / {item.data.max} Poin
                                                </div>
                                            </div>
                                            <p className={`text-[13px] font-semibold mb-1 ${
                                                item.data.status === 'Valid' || item.data.status === 'Sesuai' ? 'text-[#16A34A]' : 
                                                item.data.status.includes('Tidak') ? 'text-[#DC2626]' : 'text-[#D97706]'
                                            }`}>
                                                {item.data.status}
                                            </p>
                                            <p className="text-[12px] text-[#64748B] leading-relaxed">{item.data.detail}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Skor Section */}
                            <div className="bg-[#4B2E2B] rounded-xl p-6 text-white shadow-md">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[12px] font-bold opacity-70 uppercase tracking-widest">Skor Indikator Keaslian</p>
                                        <p className="text-[36px] font-extrabold mt-1">{totalSkor} <span className="text-[20px] opacity-60 font-medium">/ 100</span></p>
                                    </div>
                                    <div className="bg-white/10 p-3 rounded-xl">
                                        <svg className="w-8 h-8 text-[#F5B759]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>
                                    </div>
                                </div>
                                <div className="mt-6 pt-4 border-t border-white/10 text-[11px] leading-relaxed text-white/70 italic">
                                    * Skor pemeriksaan otomatis sebagai referensi awal. Harap tinjau dokumen secara visual untuk verifikasi akhir. Skor bukan merupakan bukti keaslian hukum.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── D. DATA HASIL EKSTRAKSI ── */}
                <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 shadow-sm">
                    <h2 className="text-[18px] font-bold text-[#1E293B] mb-6">Data Hasil Ekstraksi Dokumen NIB</h2>

                    {screening && screening.hasil_screening?.data_terekstraksi ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center p-4 bg-[#F7F8FA] rounded-lg border border-[#E2E8F0]">
                                <div>
                                    <p className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Total Field</p>
                                    <p className="text-[18px] font-bold text-[#1E293B]">{screening.hasil_screening.data_terekstraksi.fields?.length || 0}</p>
                                </div>
                                <div>
                                    <p className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Ditemukan</p>
                                    <p className="text-[18px] font-bold text-[#16A34A]">{screening.hasil_screening.data_terekstraksi.fields?.filter(f => f.status === 'FIELD_FOUND').length || 0}</p>
                                </div>
                                <div>
                                    <p className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Tidak Ditemukan</p>
                                    <p className="text-[18px] font-bold text-[#DC2626]">{screening.hasil_screening.data_terekstraksi.fields?.filter(f => f.status === 'FIELD_NOT_FOUND').length || 0}</p>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-[#E2E8F0] bg-[#F7F8FA]">
                                            <th className="pb-3 text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Field</th>
                                            <th className="pb-3 text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Nilai Diekstrak</th>
                                            <th className="pb-3 text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Status</th>
                                            <th className="pb-3 text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Validasi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {screening.hasil_screening.data_terekstraksi.fields?.map((field, idx) => (
                                            <tr key={idx} className="border-b border-[#E2E8F0]">
                                                <td className="py-3 text-[14px] text-[#1E293B] font-medium">{field.nama_field || '—'}</td>
                                                <td className="py-3 text-[14px] text-[#1E293B]">{field.normalized_value || '—'}</td>
                                                <td className="py-3">
                                                    <span className={`px-2 py-1 rounded text-[11px] font-bold uppercase ${
                                                        field.status === 'FIELD_FOUND' ? 'bg-[#92E3A9] text-[#15803D]' :
                                                        field.status === 'FIELD_NOT_FOUND' ? 'bg-[#FEE2E2] text-[#B91C1C]' :
                                                        field.status === 'FIELD_AMBIGUOUS' ? 'bg-[#FEF3C7] text-[#92400E]' :
                                                        'bg-[#E5E7EB] text-[#6B7280]'
                                                    }`}>
                                                        {field.status === 'FIELD_FOUND' ? 'Ditemukan' :
                                                        field.status === 'FIELD_NOT_FOUND' ? 'Tidak Ditemukan' :
                                                        field.status === 'FIELD_AMBIGUOUS' ? 'Netral' : 'Tidak Valid'}
                                                    </span>
                                                </td>
                                                <td className="py-3 text-[14px] text-[#64748B]">{field.validasi?.status || '—'}</td>
                                            </tr>
                                        ))}
                                        {(!screening.hasil_screening.data_terekstraksi.fields || screening.hasil_screening.data_terekstraksi.fields.length === 0) && (
                                            <tr>
                                                <td colSpan={4} className="py-4 text-center text-[#64748B]">Tidak ada field yang diekstrak.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-[#F7F8FA] border border-[#E2E8F0] rounded-lg p-6">
                            {screeningAktif ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="skeleton-text" style={{ width: '40%' }}></div>
                                        <div className="skeleton-badge"></div>
                                    </div>
                                    <div className="skeleton-row" style={{ width: '60%' }}></div>
                                    <div className="skeleton-row" style={{ width: '80%' }}></div>
                                    <div className="skeleton-row" style={{ width: '45%' }}></div>
                                </div>
                            ) : (
                                <p className="text-[15px] font-medium text-[#64748B] text-center">Hasil ekstraksi dokumen NIB belum tersedia.</p>
                            )}
                        </div>
                    )}
                </div>

                {/* ── E. DATA HASIL PERBANDINGAN ── */}
                <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 shadow-sm">
                    <h2 className="text-[18px] font-bold text-[#1E293B] mb-6">Data Hasil Perbandingan</h2>
                    <p className="text-[14px] text-[#64748B] mb-6">
                        Perbandingan antara data profil perusahaan dan data hasil ekstraksi dokumen NIB.
                    </p>

                    {screening && screening.hasil_screening?.data_terekstraksi?.perbandingan?.ketidaksesuaian ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-[#E2E8F0] bg-[#F7F8FA]">
                                        <th className="pb-3 text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Nama Informasi</th>
                                        <th className="pb-3 text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Data Profil Perusahaan</th>
                                        <th className="pb-3 text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Data Hasil Ekstraksi</th>
                                        <th className="pb-3 text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Hasil Perbandingan</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {screening.hasil_screening.data_terekstraksi.perbandingan.ketidaksesuaian.map((item, idx) => (
                                        <tr key={idx} className="border-b border-[#E2E8F0]">
                                            <td className="py-3 text-[14px] text-[#1E293B] font-medium">{item.nama_field || '—'}</td>
                                            <td className="py-3 text-[14px] text-[#1E293B]">{item.nilai_database || '—'}</td>
                                            <td className="py-3 text-[14px] text-[#1E293B]">{item.nilai_dokumen || '—'}</td>
                                            <td className="py-3">
                                                <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase bg-[#FEE2E2] text-[#B91C1C]`}>
                                                    Tidak Sesuai
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {(screening.hasil_screening.data_terekstraksi.perbandingan.ketidaksesuaian?.length === 0) && (
                                        <tr>
                                            <td colSpan={4} className="py-4 text-center text-[#64748B]">Tidak ada ketidaksesuaian yang ditemukan.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="bg-[#F7F8FA] border border-[#E2E8F0] rounded-lg p-6">
                            {screeningAktif ? (
                                <div className="space-y-4">
                                    <div className="skeleton-row" style={{ width: '100%' }}></div>
                                    <div className="skeleton-row" style={{ width: '85%' }}></div>
                                    <div className="skeleton-row" style={{ width: '85%' }}></div>
                                    <div className="skeleton-badge" style={{ width: '60%' }}></div>
                                </div>
                            ) : (
                                <p className="text-[15px] font-medium text-[#64748B] text-center">Hasil perbandingan belum tersedia.</p>
                            )}
                        </div>
                    )}
                </div>

                {/* ── F. VALIDASI QR CODE ── */}
                <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 shadow-sm">
                    <h2 className="text-[18px] font-bold text-[#1E293B] mb-6">Validasi QR Code</h2>

                    {screening && screening.hasil_screening?.data_terekstraksi?.qr ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-1">QR Ditemukan</p>
                                    <p className={`text-[15px] font-medium ${screening.hasil_screening.data_terekstraksi.qr.ditemukan ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                                        {screening.hasil_screening.data_terekstraksi.qr.ditemukan ? 'Ya' : 'Tidak'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Jenis QR</p>
                                    <p className="text-[15px] font-medium text-[#1E293B]">{screening.hasil_screening.data_terekstraksi.qr.jenis || '—'}</p>
                                </div>
                            </div>

                            {screening.hasil_screening.data_terekstraksi.qr.ditemukan && screening.hasil_screening.data_terekstraksi.qr.konten ? (
                                <div className="bg-[#F7F8FA] border border-[#E2E8F0] rounded-lg p-4">
                                    <p className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-2">Isi QR Code</p>
                                    <p className="text-[14px] font-mono text-[#1E293B] break-all mb-2">
                                        {screening.hasil_screening.data_terekstraksi.qr.konten}
                                    </p>
                                    <p className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Host/Domain</p>
                                    <p className="text-[14px] font-medium text-[#1E293B]">
                                        {screening.hasil_screening.data_terekstraksi.qr.konten ? new URL(screening.hasil_screening.data_terekstraksi.qr.konten).hostname : '—'}
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-[#F7F8FA] border border-[#E2E8F0] rounded-lg p-4 text-center">
                                    <p className="text-[14px] text-[#64748B]">QR Code tidak ditemukan dalam dokumen NIB.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-[#F7F8FA] border border-[#E2E8F0] rounded-lg p-6">
                            {screeningAktif ? (
                                <div className="space-y-4">
                                    <div className="skeleton-row" style={{ width: '100%' }}></div>
                                    <div className="skeleton-row" style={{ width: '80%' }}></div>
                                    <div className="skeleton-text" style={{ width: '90%' }}></div>
                                    <div className="skeleton-text" style={{ width: '70%' }}></div>
                                </div>
                            ) : (
                                <p className="text-[15px] font-medium text-[#64748B] text-center">Data validasi QR belum tersedia.</p>
                            )}
                        </div>
                    )}
                </div>

                {/* ── F-2. STATUS PROSES SCREENING ── */}
                {data.nib && (
                    <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 shadow-sm">
                        <h2 className="text-[18px] font-bold text-[#1E293B] mb-6">Status Proses Screening</h2>
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <p className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Status Proses</p>
                                <p className={`text-[16px] font-bold ${
                                    statusProsesScreening === 'Selesai' ? 'text-[#16A34A]' :
                                    statusProsesScreening === 'Gagal' ? 'text-[#DC2626]' :
                                    statusProsesScreening === 'Menunggu' || statusProsesScreening === 'Sedang_Diproses' ? 'text-[#D97706]' :
                                    'text-[#64748B]'
                                }`}>
                                    {statusProsesScreening === 'Selesai' ? 'Screening Selesai' :
                                    statusProsesScreening === 'Gagal' ? 'Screening Gagal' :
                                    statusProsesScreening === 'Menunggu' ? 'Memulai Screening' :
                                    statusProsesScreening === 'Sedang_Diproses' ? 'Sedang Menganalisis Dokumen' :
                                    statusProsesScreening === 'Belum_Dimulai' ? 'Belum Dimulai' :
                                    '—'}
                                </p>
                            </div>
                            <div className="flex-1">
                                <p className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Hasil Screening</p>
                                <p className={`text-[16px] font-bold ${
                                    statusScreening === 'Lulus' ? 'text-[#16A34A]' :
                                    statusScreening === 'Ditolak' ? 'text-[#DC2626]' :
                                    statusScreening === 'Perlu_Review' ? 'text-[#D97706]' :
                                    'text-[#64748B]'
                                }`}>
                                    {statusScreening === 'Lulus' ? 'Lulus' :
                                    statusScreening === 'Ditolak' ? 'Ditolak' :
                                    statusScreening === 'Perlu_Review' ? 'Perlu Review' :
                                    statusScreening === 'Belum_Diperiksa' ? 'Belum Diperiksa' :
                                    '—'}
                                </p>
                            </div>
                        </div>
                        {statusProsesScreening === 'Sedang_Diproses' && (
                            <p className="mt-3 text-[13px] text-[#64748B]">Sistem sedang menganalisis dokumen NIB. Halaman akan diperbarui otomatis saat selesai.</p>
                        )}
                        {statusProsesScreening === 'Menunggu' && (
                            <p className="mt-3 text-[13px] text-[#64748B]">Permintaan screening telah diterima dan menunggu antrean pemrosesan.</p>
                        )}
                    </div>
                )}

                {/* ── G. KEPUTUSAN SUPER ADMIN ── */}
                <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 shadow-sm">
                    <h2 className="text-[18px] font-bold text-[#1E293B] mb-6">Keputusan Super Admin</h2>

                    <div className="mb-6">
                        <p className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-2">Ringkasan Temuan Screening</p>
                        {screening?.hasil_screening?.ringkasan && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Status Ekstraksi</p>
                                    <p className="text-[15px] font-medium text-[#1E293B]">{screening.hasil_screening.ringkasan.status_ekstraksi || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Persentase Kelengkapan</p>
                                    <p className="text-[15px] font-medium text-[#1E293B]">{screening.hasil_screening.ringkasan.persentase_kelengkapan || 0}%</p>
                                </div>
                                <div>
                                    <p className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Temuan Critical</p>
                                    <p className={`text-[15px] font-medium ${screening.hasil_screening.ringkasan.temuan_critical > 0 ? 'text-[#DC2626]' : 'text-[#16A34A]'}`}>
                                        {screening.hasil_screening.ringkasan.temuan_critical || 0}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Perlu Review Manual</p>
                                    <p className={`text-[15px] font-medium ${screening.hasil_screening.perlu_review_manual ? 'text-[#D97706]' : 'text-[#16A34A]'}`}>
                                        {screening.hasil_screening.perlu_review_manual ? 'Ya' : 'Tidak'}
                                    </p>
                                </div>
                            </div>
                        )} else {
                            <p className="text-[14px] text-[#64748B]">Data ringkasan screening belum tersedia.</p>
                        }
                    </div>

                    <div className="space-y-4">
                        <p className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-2">Pilihan Keputusan</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button
                                onClick={tanganiSetujui}
                                disabled={sedangProsesKeputusan || keputusanTerpilih !== null}
                                className={`px-6 py-3 rounded-lg text-[14px] font-semibold transition-all flex items-center justify-center gap-2 ${
                                    sedangProsesKeputusan || keputusanTerpilih !== null
                                        ? 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
                                        : 'bg-[#16A34A] text-white hover:bg-[#15803D] shadow-sm'
                                }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                                Setujui Perusahaan
                            </button>
                            <button
                                onClick={() => setKeputusanTerpilih('tolak')}
                                disabled={sedangProsesKeputusan || keputusanTerpilih !== null}
                                className={`px-6 py-3 rounded-lg text-[14px] font-semibold transition-all flex items-center justify-center gap-2 ${
                                    sedangProsesKeputusan || keputusanTerpilih !== null
                                        ? 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
                                        : 'bg-[#DC2626] text-white hover:bg-[#B91C1C] shadow-sm'
                                }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                                Tolak Perusahaan
                            </button>
                            <button
                                onClick={() => setKeputusanTerpilih('review')}
                                disabled={sedangProsesKeputusan || keputusanTerpilih !== null}
                                className={`px-6 py-3 rounded-lg text-[14px] font-semibold transition-all flex items-center justify-center gap-2 ${
                                    sedangProsesKeputusan || keputusanTerpilih !== null
                                        ? 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
                                        : 'bg-[#D97706] text-white hover:bg-[#B45309] shadow-sm'
                                }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                                Perlu Review
                            </button>
                        </div>

                        {keputusanTerpilih === 'tolak' && (
                            <div className="bg-[#F7F8FA] border border-[#E2E8F0] rounded-lg p-4">
                                <p className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-2">Alasan Penolakan</p>
                                <textarea
                                    value={catatanKeputusan}
                                    onChange={(e) => setCatatanKeputusan(e.target.value)}
                                    placeholder="Masukkan alasan penolakan (minimal 5 karakter)..."
                                    className="w-full h-[100px] p-3 text-[14px] text-[#1E293B] bg-white border border-[#E2E8F0] rounded-md focus:ring-2 focus:ring-[#DC2626] focus:border-transparent outline-none"
                                />
                            </div>
                        )}

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setKeputusanTerpilih(null)}
                                disabled={sedangProsesKeputusan}
                                className="px-6 py-3 rounded-lg text-[14px] font-semibold text-[#64748B] bg-white border border-[#E2E8F0] hover:bg-[#F7F8FA] transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={keputusanTerpilih === 'tolak' ? tanganiTolak : tanganiSetujui}
                                disabled={sedangProsesKeputusan || (keputusanTerpilih === 'tolak' && (!catatanKeputusan || catatanKeputusan.trim().length < 5))}
                                className="px-6 py-3 rounded-lg text-[14px] font-bold text-white bg-[#4B2E2B] hover:bg-[#382220] transition-colors shadow-sm"
                            >
                                {sedangProsesKeputusan ? 'Memproses...' : keputusanTerpilih === 'tolak' ? 'Simpan Penolakan' : 'Konfirmasi Setuju'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailVerifikasi;