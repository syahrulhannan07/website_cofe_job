import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../layanan/api';
import layananScreeningNib from '../../../layanan/layananScreeningNib';

const DetailVerifikasi = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [kafe, setKafe] = useState(null);
    const [sedangMemuat, setSedangMemuat] = useState(true);
    const [alasanTolak, setAlasanTolak] = useState('');
    const [sedangProses, setSedangProses] = useState(false);
    const [pesanError, setPesanError] = useState('');
    const [tampilkanFormPenolakan, setTampilkanFormPenolakan] = useState(false);
    const [submittingKeputusan, setSubmittingKeputusan] = useState(false);

    // Screening NIB state
    const [dataScreening, setDataScreening] = useState(null);
    const [sedangMemuatScreening, setSedangMemuatScreening] = useState(false);
    const [pesanErrorScreening, setPesanErrorScreening] = useState('');
    const [menungguHasilScreening, setMenungguHasilScreening] = useState(false);
    const [statusProsesScreening, setStatusProsesScreening] = useState(null);

    // Polling interval ref
    const pollingIntervalRef = useRef(null);

    // Dokumen NIB state (diambil via axios agar token ikut terkirim)
    const [dokumenUrl, setDokumenUrl] = useState(null);
    const [dokumenMuat, setDokumenMuat] = useState(false);

    // Dokumen legacy state (diambil via axios agar token ikut terkirim)
    const [dokumenLamaUrl, setDokumenLamaUrl] = useState(null);
    const [dokumenLamaMuat, setDokumenLamaMuat] = useState(false);

    useEffect(() => {
        ambilDetailKafe();
    }, [id]);

    const ambilDetailKafe = async () => {
        setSedangMemuat(true);
        try {
            const respons = await api.get(`/super-admin/akun-kafe/${id}`);
            if (respons.data?.data) {
                setKafe(respons.data.data);
                // Ambil status_proses_screening dari data nib
                if (respons.data.data?.nib) {
                    setStatusProsesScreening(respons.data.data.nib.status_proses_screening || 'Belum_Dimulai');
                }
            }
        } catch (err) {
            setPesanError(err.response?.data?.message || 'Gagal memuat detail kafe.');
        } finally {
            setSedangMemuat(false);
        }
    };

    // Ambil dokumen NIB melalui axios (tercantumkan token autentikasi)
    useEffect(() => {
        let cancelled = false;
        const fetchDokumen = async () => {
            if (!kafe?.nib?.dokumen_nib || !kafe?.nib?.id_nib) {
                setDokumenUrl(null);
                return;
            }
            setDokumenMuat(true);
            try {
                const respons = await api.get(`/super-admin/nib/${kafe.nib.id_nib}/dokumen`, {
                    responseType: 'blob',
                });
                const blob = new Blob([respons.data], { type: respons.headers['content-type'] || 'application/octet-stream' });
                if (!cancelled) {
                    setDokumenUrl(URL.createObjectURL(blob));
                }
            } catch (err) {
                console.error('Gagal memuat dokumen NIB:', err);
                if (!cancelled) setDokumenUrl(null);
            } finally {
                if (!cancelled) setDokumenMuat(false);
            }
        };
        fetchDokumen();
        return () => { cancelled = true; };
    }, [kafe?.nib?.dokumen_nib, kafe?.nib?.id_nib]);

    // Ambil dokumen legacy melalui axios (tercantumkan token autentikasi)
    useEffect(() => {
        let cancelled = false;
        const fetchDokumenLama = async () => {
            if (!kafe?.dokumen_izin) {
                setDokumenLamaUrl(null);
                return;
            }
            setDokumenLamaMuat(true);
            try {
                const respons = await api.get(`/super-admin/akun-kafe/${id}/dokumen`, {
                    responseType: 'blob',
                });
                const blob = new Blob([respons.data], { type: respons.headers['content-type'] || 'application/octet-stream' });
                if (!cancelled) {
                    setDokumenLamaUrl(URL.createObjectURL(blob));
                }
            } catch (err) {
                console.error('Gagal memuat dokumen lama:', err);
                if (!cancelled) {
                    if (err.response?.status === 401) {
                        setPesanError('Sesi telah berakhir. Silakan login kembali.');
                    } else if (err.response?.status === 403) {
                        setPesanError('Anda tidak berwenang mengakses dokumen ini.');
                    } else if (err.response?.status === 404) {
                        setPesanError('Dokumen tidak ditemukan.');
                    } else {
                        setPesanError('Gagal memuat dokumen lama.');
                    }
                    setDokumenLamaUrl(null);
                }
            } finally {
                if (!cancelled) setDokumenLamaMuat(false);
            }
        };
        fetchDokumenLama();
        return () => { cancelled = true; };
    }, [kafe?.dokumen_izin, id]);

    // Bersihkan object URL dan polling interval saat komponen dilepas
    useEffect(() => {
        return () => {
            if (dokumenUrl) URL.revokeObjectURL(dokumenUrl);
            if (dokumenLamaUrl) URL.revokeObjectURL(dokumenLamaUrl);
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
            }
        };
    }, [dokumenUrl, dokumenLamaUrl]);

    // Polling hasil screening ketika status Menunggu atau Sedang_Diproses
    useEffect(() => {
        // Hanya poll ketika status Menunggu atau Sedang_Diproses
        const shouldPoll = statusProsesScreening === 'Menunggu' || statusProsesScreening === 'Sedang_Diproses';

        if (!shouldPoll) {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
            }
            return;
        }

        pollingIntervalRef.current = setInterval(async () => {
            try {
                const nibId = kafe?.nib?.id_nib;
                if (!nibId) return;

                const respons = await layananScreeningNib.ambilHasilScreening(nibId);
                const data = respons.data?.data;

                if (data) {
                    setDataScreening(data);
                    const newStatus = data.status_proses_screening || 'Selesai';
                    setStatusProsesScreening(newStatus);

                    // Hentikan polling jika sudah Selesai atau Gagal
                    if (newStatus === 'Selesai' || newStatus === 'Gagal') {
                        if (pollingIntervalRef.current) {
                            clearInterval(pollingIntervalRef.current);
                            pollingIntervalRef.current = null;
                        }
                        setMenungguHasilScreening(false);
                    }
                }
            } catch (err) {
                // Jika 404, berarti hasil belum tersedia, terus poll
                if (err.response?.status !== 404) {
                    console.error('Polling gagal:', err);
                }
            }
        }, 3000);

        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
            }
        };
    }, [statusProsesScreening, kafe?.nib?.id_nib]);

    const formatWaktu = (nilai) => {
        if (!nilai) return null;
        const tanggal = new Date(nilai);
        if (Number.isNaN(tanggal.getTime())) return null;
        return tanggal.toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const tanganiSetujui = async () => {
        setSubmittingKeputusan(true);
        setPesanError('');
        try {
            await api.put(`/super-admin/verifikasi/${id}/setuju`);
            navigate('/super-admin/verifikasi');
        } catch (err) {
            setPesanError(err.response?.data?.message || 'Gagal menyetujui. Coba lagi.');
        } finally {
            setSubmittingKeputusan(false);
        }
    };

    const tanganiBukaFormPenolakan = () => {
        setTampilkanFormPenolakan(true);
        setPesanError('');
    };

    const tanganiTutupFormPenolakan = () => {
        setTampilkanFormPenolakan(false);
        setAlasanTolak('');
        setPesanError('');
    };

    const tanganiTolak = async () => {
        if (!alasanTolak.trim()) {
            setPesanError('Alasan penolakan wajib diisi sebelum keputusan dikirim.');
            return;
        }
        setSubmittingKeputusan(true);
        setPesanError('');
        try {
            await api.put(`/super-admin/verifikasi/${id}/tolak`, {
                alasan: alasanTolak,
            });
            navigate('/super-admin/verifikasi');
        } catch (err) {
            setPesanError(err.response?.data?.message || 'Gagal menolak. Coba lagi.');
        } finally {
            setSubmittingKeputusan(false);
        }
    };

    const tanganiMulaiScreening = async () => {
        setSedangMemuatScreening(true);
        setPesanErrorScreening('');
        try {
            const nibId = kafe?.nib?.id_nib;
            if (!nibId) {
                setPesanErrorScreening('NIB tidak tersedia untuk perusahaan ini.');
                return;
            }
            await layananScreeningNib.mulaiScreening(nibId);
            setMenungguHasilScreening(true);
            setDataScreening(null);
            setStatusProsesScreening('Menunggu');
        } catch (err) {
            setPesanErrorScreening(err.response?.data?.message || 'Gagal memulai screening. Coba lagi.');
        } finally {
            setSedangMemuatScreening(false);
        }
    };

    const tanganiPerbaruiHasil = async () => {
        setSedangMemuatScreening(true);
        setPesanErrorScreening('');
        try {
            const nibId = kafe?.nib?.id_nib;
            if (!nibId) {
                setPesanErrorScreening('NIB tidak tersedia untuk perusahaan ini.');
                return;
            }
            const respons = await layananScreeningNib.ambilHasilScreening(nibId);
            setDataScreening(respons.data?.data || null);
            setMenungguHasilScreening(false);
            const newStatus = respons.data?.data?.status_proses_screening || 'Selesai';
            setStatusProsesScreening(newStatus);
        } catch (err) {
            if (err.response?.status === 404) {
                setDataScreening(null);
                setMenungguHasilScreening(true);
                setPesanErrorScreening('');
                setStatusProsesScreening('Menunggu');
            } else {
                setPesanErrorScreening(err.response?.data?.message || 'Gagal memuat hasil screening. Coba lagi.');
            }
        } finally {
            setSedangMemuatScreening(false);
        }
    };

    const tanganiUlangScreening = async () => {
        setSedangMemuatScreening(true);
        setPesanErrorScreening('');
        try {
            const nibId = kafe?.nib?.id_nib;
            if (!nibId) {
                setPesanErrorScreening('NIB tidak tersedia untuk perusahaan ini.');
                return;
            }
            await layananScreeningNib.ulangScreening(nibId);
            setMenungguHasilScreening(true);
            setStatusProsesScreening('Menunggu');
        } catch (err) {
            setPesanErrorScreening(err.response?.data?.message || 'Gagal meminta screening ulang. Coba lagi.');
        } finally {
            setSedangMemuatScreening(false);
        }
    };

    // Automatic Screening Trigger
    useEffect(() => {
        if (!kafe || !kafe.nib) return;

        const nib = kafe.nib;
        const statusProses = statusProsesScreening || 'Belum_Dimulai';
        
        // Only trigger if Belum_Dimulai and documents are available
        if (statusProses === 'Belum_Dimulai' && nib.dokumen_nib) {
            tanganiMulaiScreening();
        }
    }, [kafe, statusProsesScreening]);

    // Ambil hasil screening jika sudah selesai
    useEffect(() => {
        if (kafe?.nib?.id_nib && dataScreening === null && !menungguHasilScreening && statusProsesScreening !== 'Menunggu' && statusProsesScreening !== 'Sedang_Diproses') {
            tanganiPerbaruiHasil();
        }
    }, [kafe?.nib?.id_nib, dataScreening, menungguHasilScreening, statusProsesScreening]);

    if (sedangMemuat || statusProsesScreening === 'Menunggu' || statusProsesScreening === 'Sedang_Diproses') {
        return (
            <div className="min-h-screen bg-[#F4ECE9] font-poppins animate-pulse">
                {/* Header Skeleton */}
                <div className="bg-[#4B2E2B] p-6 md:p-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <div className="h-4 w-48 bg-[#F3EDE6]/20 rounded mb-3" />
                                <div className="h-8 w-64 bg-[#F3EDE6]/20 rounded mb-2" />
                                <div className="h-4 w-36 bg-[#F3EDE6]/20 rounded" />
                            </div>
                            <div className="flex gap-3">
                                <div className="h-10 w-28 bg-[#F3EDE6]/20 rounded-full" />
                                <div className="h-10 w-28 bg-[#F3EDE6]/20 rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="space-y-8">
                        {/* 1. Informasi Perusahaan Skeleton */}
                        <div className="bg-white rounded-[12px] shadow-sm border border-[#EAE4DC] p-6">
                            <div className="h-6 w-48 bg-[#4B2E2B]/10 rounded mb-6" />
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[...Array(9)].map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="h-3 w-32 bg-[#4B2E2B]/10 rounded" />
                                        <div className="h-5 w-48 bg-[#4B2E2B]/10 rounded" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 2. Dokumen NIB Skeleton */}
                        <div className="bg-white rounded-[12px] shadow-sm border border-[#EAE4DC] p-6">
                            <div className="h-6 w-56 bg-[#4B2E2B]/10 rounded mb-4" />
                            <div className="w-full h-[400px] rounded-[10px] bg-[#EAE4DC] flex items-center justify-center">
                                <div className="text-center">
                                    <div className="h-8 w-8 mx-auto mb-2 bg-[#4B2E2B]/20 rounded-full animate-spin" />
                                    <span className="text-sm text-[#827470] font-medium">Memuat dokumen NIB...</span>
                                </div>
                            </div>
                        </div>

                        {/* 3. Status dan Hasil Screening Skeleton */}
                        <div className="bg-white rounded-[12px] shadow-sm border border-[#EAE4DC] p-6">
                            <div className="h-6 w-60 bg-[#4B2E2B]/10 rounded mb-4" />
                            <div className="mb-6 flex items-center gap-3">
                                <div className="h-8 w-32 bg-[#4B2E2B]/10 rounded-full" />
                                <div className="h-4 w-48 bg-[#4B2E2B]/10 rounded" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="bg-[#F4ECE9] rounded-[8px] p-4 h-20" />
                                ))}
                            </div>
                        </div>

                        {/* 4. Hasil Ekstraksi & Perbandingan Skeleton */}
                        <div className="bg-white rounded-[12px] shadow-sm border border-[#EAE4DC] p-6">
                            <div className="h-6 w-48 bg-[#4B2E2B]/10 rounded mb-6" />
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="h-4 w-36 bg-[#4B2E2B]/10 rounded mb-3" />
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className="h-16 bg-[#F4ECE9] rounded-[8px]" />
                                    ))}
                                </div>
                                <div className="space-y-4">
                                    <div className="h-4 w-36 bg-[#4B2E2B]/10 rounded mb-3" />
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className="h-16 bg-[#F4ECE9] rounded-[8px]" />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!kafe) {
        return (
            <div className="min-h-screen bg-[#F4ECE9] flex items-center justify-center font-poppins p-6">
                <div className="text-center">
                    <h1 className="text-[24px] font-bold text-[#4B2E2B] mb-2">Kafe tidak ditemukan</h1>
                    <button
                        onClick={() => navigate('/super-admin/verifikasi')}
                        className="mt-4 px-6 py-3 bg-[#4B2E2B] text-[#F3EDE6] rounded-full font-semibold hover:bg-[#3a2423] transition-colors"
                    >
                        Kembali ke Daftar Verifikasi
                    </button>
                </div>
            </div>
        );
    }

    const dataNib = kafe.nib || null;
    const statusScreening = dataNib?.status_screening || null;
    const sudahDiperiksa = Boolean(statusScreening) && statusScreening !== 'Belum_Diperiksa';

    const nomorNib = dataNib?.nomor_nib || 'Belum tersedia';
    const labelStatusScreening = dataNib
        ? (statusScreening || 'Belum_Diperiksa')
        : 'Belum ada data NIB';

    const dokumenNib = kafe.nib?.dokumen_nib || null;
    const dokumenLama = kafe.dokumen_izin || kafe.dokumen_legalitas || null;
    const nibId = kafe.nib?.id_nib || null;

    const labelSumberDokumen = dokumenNib
        ? 'Dokumen NIB'
        : (dokumenLama ? 'Dokumen lama â€” belum terhubung ke data NIB' : null);

    const ekstensiDokumen = dokumenNib ? dokumenNib.split('.').pop().toLowerCase() : '';
    const adalahGambar = ['jpg', 'jpeg', 'png', 'webp'].includes(ekstensiDokumen);

    const labelDiperiksaPada = sudahDiperiksa
        ? (formatWaktu(dataNib?.diperiksa_pada) || 'â€”')
        : 'Belum diperiksa';

    // Ekstrak data screening untuk tampilan
    const dataTerekstraksi = dataScreening?.data_terekstraksi || null;
    const analisisStruktur = dataScreening?.analisis_struktur || null;
    const ketidaksesuaian = dataScreening?.ketidaksesuaian || [];
    const indikatorStruktur = analisisStruktur?.indikator_struktur || [];
    const temuanStruktur = analisisStruktur?.temuan || [];
    const buktiPemeriksaan = dataScreening?.bukti_pemeriksaan || [];
    const dataQr = dataTerekstraksi?.qr || null;
    const perbandingan = dataTerekstraksi?.perbandingan || {};

    // Hitung ringkasan perbandingan
    let jumlahSesuai = 0;
    let jumlahTidakSesuai = 0;
    let jumlahTidakDapatDiverifikasi = 0;

    if (perbandingan && typeof perbandingan === 'object') {
        Object.values(perbandingan).forEach((item) => {
            if (item && item.status_perbandingan === 'Sesuai') jumlahSesuai++;
            else if (item && item.status_perbandingan === 'Tidak Sesuai') jumlahTidakSesuai++;
            else if (item && item.status_perbandingan === 'Tidak Dapat Diverifikasi') jumlahTidakDapatDiverifikasi++;
        });
    }

    const totalFieldDiverifikasi = jumlahSesuai + jumlahTidakSesuai + jumlahTidakDapatDiverifikasi;

    return (
        <div className="min-h-screen bg-[#F4ECE9] font-poppins">
            {/* Header */}
            <div className="bg-[#4B2E2B] p-6 md:p-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <button
                                onClick={() => navigate('/super-admin/verifikasi')}
                                className="inline-flex items-center gap-2 text-[#C69C6D] hover:text-[#F5B759] font-medium text-sm transition-colors"
                            >
                                â† Kembali ke Daftar Verifikasi
                            </button>
                            <h1 className="text-[28px] font-extrabold text-[#F3EDE6] mt-2 tracking-tight">
                                Tinjau Pendaftaran
                            </h1>
                            <p className="text-[#F3EDE6]/70 text-sm mt-1">
                                Verifikasi Status Pendaftaran Kafe
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={tanganiSetujui}
                                disabled={submittingKeputusan || sedangProses}
                                className="flex items-center gap-2 px-6 py-3 bg-[#5C8D69] text-[#1A3821] font-bold rounded-full hover:bg-[#4a7256] disabled:opacity-60 transition-all"
                            >
                                {submittingKeputusan ? (
                                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                    </svg>
                                )}
                                Setujui
                            </button>
                            <button
                                onClick={tanganiBukaFormPenolakan}
                                disabled={submittingKeputusan || sedangProses}
                                className="flex items-center gap-2 px-6 py-3 bg-[#C98285] text-[#521A1C] font-bold rounded-full hover:bg-[#b36a6d] disabled:opacity-60 transition-all"
                            >
                                Ditolak
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Error Alert */}
                {pesanError && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-[10px] p-4 text-red-600 font-semibold text-sm">
                        {pesanError}
                    </div>
                )}

                <div className="space-y-8">
                    {/* =====================
                         BAGIAN 1: Informasi Perusahaan
                         ===================== */}
                    <div className="bg-white rounded-[12px] shadow-sm border border-[#EAE4DC] p-6">
                        <h2 className="text-[18px] font-bold text-[#4B2E2B] mb-4 flex items-center gap-2">
                            <span className="text-[20px]">ðŸ¢</span>
                            Informasi Perusahaan
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-semibold text-[#827470] uppercase tracking-wider">Nama Perusahaan</label>
                                <p className="text-[15px] font-bold text-[#4B2E2B]">{kafe.nama_perusahaan}</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-semibold text-[#827470] uppercase tracking-wider">Email Bisnis</label>
                                <p className="text-[15px] font-bold text-[#4B2E2B] break-all">{kafe.email}</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-semibold text-[#827470] uppercase tracking-wider">Nama Pengelola</label>
                                <p className="text-[15px] font-bold text-[#4B2E2B]">{kafe.nama_pengguna || 'â€”'}</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-semibold text-[#827470] uppercase tracking-wider">Alamat</label>
                                <p className="text-[15px] font-semibold text-[#4B2E2B] leading-relaxed">{kafe.alamat_perusahaan || 'â€”'}</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-semibold text-[#827470] uppercase tracking-wider">Kecamatan</label>
                                <p className="text-[15px] font-semibold text-[#4B2E2B]">{kafe.kecamatan || 'â€”'}</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-semibold text-[#827470] uppercase tracking-wider">Deskripsi Cafe</label>
                                <p className="text-[15px] text-[#4B2E2B] leading-relaxed">{kafe.deskripsi || 'â€”'}</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-semibold text-[#827470] uppercase tracking-wider">Nomor NIB</label>
                                <p className={`text-[15px] font-bold break-all ${dataNib?.nomor_nib ? 'text-[#5C8D69]' : 'text-[#C98285]'}`}>
                                    {nomorNib}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-semibold text-[#827470] uppercase tracking-wider">Status Verifikasi Perusahaan</label>
                                <p className={`text-[15px] font-bold ${kafe.status_verifikasi === 'Diterima' ? 'text-[#5C8D69]' : kafe.status_verifikasi === 'Ditolak' ? 'text-[#C98285]' : 'text-[#F5B759]'}`}>
                                    {kafe.status_verifikasi}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-semibold text-[#827470] uppercase tracking-wider">Status Screening NIB</label>
                                <p className={`text-[15px] font-semibold ${statusScreening === 'Lulus' ? 'text-[#5C8D69]' : statusScreening === 'Ditolak' ? 'text-[#C98285]' : statusScreening === 'Perlu_Review' ? 'text-[#8A5A00]' : 'text-[#4B2E2B]'}`}>
                                    {labelStatusScreening}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-semibold text-[#827470] uppercase tracking-wider">Diperiksa Pada</label>
                                <p className="text-[15px] font-semibold text-[#4B2E2B]">{labelDiperiksaPada}</p>
                            </div>
                        </div>
                    </div>

                    {/* =====================
                         BAGIAN 2: Dokumen NIB
                         ===================== */}
                    <div className="bg-white rounded-[12px] shadow-sm border border-[#EAE4DC] p-6">
                        <h2 className="text-[18px] font-bold text-[#4B2E2B] mb-4 flex items-center gap-2">
                            <span className="text-[20px]">ðŸ“„</span>
                            Tinjau Dokumen NIB & Izin Usaha
                        </h2>
                        {/* Dokumen Preview */}
                        <div className="w-full h-[400px] rounded-[10px] flex flex-col justify-between p-2 overflow-hidden shadow-inner bg-[#EAE4DC]">
                            {/* Kondisi 1: Dokumen NIB tersedia */}
                            {dokumenUrl && (
                                <div className="w-full h-full flex flex-col justify-between">
                                    <div className="w-full h-[340px] overflow-hidden rounded-[6px] border border-[#D5CFC8]">
                                        {dokumenMuat && !dokumenUrl ? (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4B2E2B]"></div>
                                            </div>
                                        ) : adalahGambar ? (
                                            <img
                                                src={dokumenUrl}
                                                alt="Dokumen NIB"
                                                className="w-full h-full object-contain bg-[#ffffff]"
                                            />
                                        ) : (
                                            <iframe
                                                src={dokumenUrl}
                                                title="PDF Preview"
                                                className="w-full h-full border-none"
                                            />
                                        )}
                                    </div>
                                    <div className="mt-3 flex items-center justify-between px-2">
                                        <span className="text-[12px] font-semibold text-[#4B2E2B] truncate" title={dokumenNib}>
                                            ðŸ“Ž {dokumenNib}
                                        </span>
                                        <a
                                            href={dokumenUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#4B2E2B] hover:text-[#C69C6D] underline transition-colors"
                                        >
                                            â†— Buka Dokumen Penuh
                                        </a>
                                    </div>
                                </div>
                            )}
                            {/* Kondisi 2: Dokumen legacy tersedia */}
                            {dokumenLamaUrl && !dokumenUrl && !dokumenNib && (
                                <div className="w-full h-full flex flex-col justify-between">
                                    <div className="w-full h-[340px] overflow-hidden rounded-[6px] border border-[#D5CFC8]">
                                        {dokumenLamaMuat && !dokumenLamaUrl ? (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4B2E2B]"></div>
                                            </div>
                                        ) : adalahGambar ? (
                                            <img
                                                src={dokumenLamaUrl}
                                                alt="Dokumen Lama"
                                                className="w-full h-full object-contain bg-[#ffffff]"
                                            />
                                        ) : (
                                            <iframe
                                                src={dokumenLamaUrl}
                                                title="PDF Preview"
                                                className="w-full h-full border-none"
                                            />
                                        )}
                                    </div>
                                    <div className="mt-3 flex items-center justify-between px-2">
                                        <span className="text-[12px] font-semibold text-[#827470] truncate" title={dokumenLama}>
                                            ðŸ“Ž {dokumenLama}
                                        </span>
                                        <a
                                            href={dokumenLamaUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#4B2E2B] hover:text-[#C69C6D] underline transition-colors"
                                        >
                                            â†— Buka Dokumen Penuh
                                        </a>
                                    </div>
                                </div>
                            )}
                            {/* Kondisi 3: Record NIB tidak tersedia */}
                            {!dataNib && (
                                <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                                    <span className="text-[48px]">ðŸ“„</span>
                                    <span className="text-[14px] font-semibold text-[#827470]">
                                        Data NIB Tidak Tersedia
                                    </span>
                                    <p className="text-[12px] text-[#6E625A] text-center px-4">
                                        Perusahaan ini belum memiliki record NIB terintegrasi. Silakan hubungi tim pendaftaran.
                                    </p>
                                </div>
                            )}
                            {/* Kondisi 4: Record NIB ada tapi dokumen kosong */}
                            {dataNib && !dokumenNib && !dokumenLama && !dokumenUrl && !dokumenLamaUrl && (
                                <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                                    <span className="text-[48px]">ðŸ“„</span>
                                    <span className="text-[14px] font-semibold text-[#827470]">
                                        Tidak Ada Dokumen
                                    </span>
                                    <p className="text-[12px] text-[#6E625A] text-center px-4">
                                        Tidak ada dokumen NIB atau dokumen izin yang diunggah.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* =====================
                         BAGIAN 3: Status dan Hasil Screening
                         ===================== */}
                    <div className="bg-white rounded-[12px] shadow-sm border border-[#EAE4DC] p-6">
                        <h2 className="text-[18px] font-bold text-[#4B2E2B] mb-4 flex items-center gap-2">
                            <span className="text-[20px]">ðŸ”</span>
                            Status dan Hasil Screening NIB
                        </h2>

                        {/* Status Proses Screening */}
                        <div className="mb-6">
                            <h3 className="text-[14px] font-bold text-[#4B2E2B] mb-2">Status Proses Screening</h3>
                            <div className="flex items-center gap-3">
                                <span
                                    className={`px-3 py-1.5 rounded-full text-[12px] font-bold ${
                                        statusProsesScreening === 'Belum_Dimulai'
                                            ? 'bg-[#F4ECE9] text-[#4B2E2B]'
                                            : statusProsesScreening === 'Menunggu'
                                            ? 'bg-[#FCE6C9] text-[#8A5A00]'
                                            : statusProsesScreening === 'Sedang_Diproses'
                                            ? 'bg-[#F3EDE6] text-[#4B2E2B] animate-pulse'
                                            : statusProsesScreening === 'Selesai'
                                            ? 'bg-[#D1FAE5] text-[#5C8D69]'
                                            : statusProsesScreening === 'Gagal'
                                            ? 'bg-[#FEE2E2] text-[#991B1B]'
                                            : 'bg-[#F4ECE9] text-[#4B2E2B]'
                                    }`}
                                >
                                    {statusProsesScreening === 'Belum_Dimulai'
                                        ? 'Belum Dimulai'
                                        : statusProsesScreening === 'Menunggu'
                                        ? 'Menunggu Antrean'
                                        : statusProsesScreening === 'Sedang_Diproses'
                                        ? 'Sedang Diproses'
                                        : statusProsesScreening === 'Selesai'
                                        ? 'Selesai'
                                        : statusProsesScreening === 'Gagal'
                                        ? 'Gagal'
                                        : 'â€”'}
                                </span>
                                {statusProsesScreening === 'Sedang_Diproses' && (
                                    <span className="text-[11px] text-[#6E625A]">Sistem sedang menganalisis dokumen...</span>
                                )}
                                {statusProsesScreening === 'Menunggu' && (
                                    <span className="text-[11px] text-[#6E625A]">Menunggu diproses oleh sistem...</span>
                                )}
                            </div>
                        </div>

                        {/* Hasil Screening (jika tersedia) */}
                        {dataScreening && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-[#F4ECE9] rounded-[8px] p-3">
                                        <span className="text-[10px] font-semibold text-[#827470] uppercase block mb-1">Status Hasil</span>
                                        <span className={`text-[12px] font-bold ${
                                            dataScreening.status_proses === 'BERHASIL'
                                                ? 'text-[#5C8D69]'
                                                : dataScreening.status_proses === 'BERHASIL_DENGAN_PERINGATAN'
                                                ? 'text-[#8A5A00]'
                                                : 'text-[#C98285]'
                                        }`}>
                                            {dataScreening.status_proses === 'BERHASIL' ? 'Lulus' : dataScreening.status_proses === 'BERHASIL_DENGAN_PERINGATAN' ? 'Lulus dengan Peringatan' : dataScreening.status_proses}
                                        </span>
                                    </div>
                                    <div className="bg-[#F4ECE9] rounded-[8px] p-3">
                                        <span className="text-[10px] font-semibold text-[#827470] uppercase block mb-1">Review Manual</span>
                                        <span className={`text-[12px] font-bold ${dataScreening.perlu_review_manual ? 'text-[#C98285]' : 'text-[#5C8D69]'}`}>
                                            {dataScreening.perlu_review_manual ? 'Diperlukan' : 'Tidak'}
                                        </span>
                                    </div>
                                    <div className="bg-[#F4ECE9] rounded-[8px] p-3">
                                        <span className="text-[10px] font-semibold text-[#827470] uppercase block mb-1">Diperiksa Pada</span>
                                        <span className="text-[12px] font-semibold text-[#4B2E2B]">
                                            {dataScreening.dihasilkan_pada ? formatWaktu(dataScreening.dihasilkan_pada) : 'â€”'}
                                        </span>
                                    </div>
                                </div>

                                {dataScreening.perlu_review_manual && dataScreening.alasan_review && (
                                    <div className="bg-red-50 border border-red-200 rounded-[8px] p-3">
                                        <div className="flex items-start gap-2 mb-2">
                                            <span className="text-[12px]">âš </span>
                                            <span className="text-[13px] font-semibold text-red-600">Alasan Review Manual</span>
                                        </div>
                                        <p className="text-[13px] text-[#4B2E2B] leading-relaxed">{dataScreening.alasan_review}</p>
                                    </div>
                            )}
                        </div>
                    )}

                            <div className="mt-4 flex flex-col sm:flex-row gap-3">
                            {statusProsesScreening === 'Belum_Dimulai' && (
                                <button
                                    onClick={tanganiMulaiScreening}
                                    disabled={!kafe?.nib?.id_nib || sedangMemuatScreening}
                                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-[8px] font-bold text-[14px] bg-[#5C8D69] text-[#1A3821] hover:bg-[#4a7256] disabled:opacity-60 transition-all"
                                >
                                    {sedangMemuatScreening ? (
                                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                        </svg>
                                    )}
                                    Mulai Screening
                                </button>
                            )}
                            {statusProsesScreening === 'Selesai' && (
                                <button
                                    onClick={tanganiUlangScreening}
                                    disabled={sedangMemuatScreening}
                                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-[8px] font-bold text-[14px] bg-[#4B2E23] text-[#EAE4DC] hover:bg-[#3a2423] disabled:opacity-60 transition-all"
                                >
                                    {sedangMemuatScreening ? (
                                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                            <path d="M4 4v5h12V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5z"/>
                                        </svg>
                                    )}
                                    Screening Ulang
                                </button>
                            )}
                            {statusProsesScreening === 'Gagal' && (
                                <button
                                    onClick={tanganiUlangScreening}
                                    disabled={sedangMemuatScreening}
                                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-[8px] font-bold text-[14px] bg-[#4B2E23] text-[#EAE4DC] hover:bg-[#3a2423] disabled:opacity-60 transition-all"
                                >
                                    {sedangMemuatScreening ? (
                                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                            <path d="M4 4v5h12V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5z"/>
                                        </svg>
                                    )}
                                    Coba Lagi
                                </button>
                            )}
                        </div>
                    </div>

                    {dataScreening && dataTerekstraksi && (
                        <div className="bg-white rounded-[12px] shadow-sm border border-[#EAE4DC] p-6">
                            <h2 className="text-[18px] font-bold text-[#4B2E2B] mb-4 flex items-center gap-2">
                                <span className="text-[20px]">ðŸ“Š</span>
                                Hasil Ekstraksi Data
                            </h2>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Tabel perbandingan */}
                                <div className="space-y-3">
                                    <h3 className="text-[14px] font-bold text-[#4B2E2B] mb-2">Perbandingan Data</h3>
                                    {[nomorNib, kafe.nama_perusahaan, kafe.alamat_perusahaan, kafe.deskripsi].filter(Boolean).map((fieldLabel, idx) => {
                                        const kunci = ['nomor_nib', 'nama_perusahaan', 'alamat_perusahaan', 'deskripsi'][idx];
                                        const field = dataTerekstraksi.fields?.find(f => f.nama_field === kunci);
                                        const nilaiEkstraksi = field?.normalized_value || field?.raw_value || 'â€”';
                                        const nilaiDatabase = idx === 0 ? nomorNib : idx === 1 ? kafe.nama_perusahaan : idx === 2 ? kafe.alamat_perusahaan : kafe.deskripsi || 'â€”';

                                        let statusPerbandingan = 'Tidak Dapat Diverifikasi';
                                        let warnaStatus = 'text-[#4B2E2B]';

                                        if (field?.validasi) {
                                            if (field.validasi.status === 'VALID') {
                                                statusPerbandingan = 'Sesuai';
                                                warnaStatus = 'text-[#5C8D69]';
                                            } else if (field.validasi.status === 'INVALID') {
                                                statusPerbandingan = 'Tidak Sesuai';
                                                warnaStatus = 'text-[#C98285]';
                                            }
                                        } else if (!field) {
                                            statusPerbandingan = 'Tidak Dapat Diverifikasi';
                                            warnaStatus = 'text-[#4B2E2B]';
                                        }

                                        return (
                                            <div key={kunci} className="flex items-start justify-between py-2 border-b border-[#EAE4DC] last:border-0">
                                                <div className="flex-1">
                                                    <span className="text-[11px] font-semibold text-[#827470] uppercase block">{fieldLabel}</span>
                                                    <span className="text-[13px] text-[#4B2E2B]">{nilaiEkstraksi}</span>
                                                    <span className="text-[11px] text-[#6E625A] mt-1 block">Database: {nilaiDatabase}</span>
                                                </div>
                                                <span className={`text-[11px] font-bold ${warnaStatus}`}>
                                                    {statusPerbandingan}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Detail per field */}
                                <div className="space-y-3">
                                    <h3 className="text-[14px] font-bold text-[#4B2E2B] mb-2">Detail Field</h3>
                                    {dataTerekstraksi.fields?.map((field) => (
                                        <div key={field.nama_field} className="p-3 rounded-[8px] border border-[#EAE4DC] bg-[#F4ECE9]">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-[11px] font-semibold text-[#827470] uppercase">{field.nama_field}</span>
                                                <span className={`text-[10px] font-bold ${field.validasi?.status === 'VALID' ? 'text-[#5C8D69]' : field.validasi?.status === 'INVALID' ? 'text-[#C98285]' : 'text-[#4B2E2B]'}`}>
                                                    {field.validasi?.status === 'VALID' ? 'Sesuai' : field.validasi?.status === 'INVALID' ? 'Tidak Sesuai' : 'â€”'}
                                                </span>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[11px] text-[#6E625A] block">Nilai Ekstraksi:</span>
                                                <span className="text-[13px] font-semibold text-[#4B2E2B] block">{field.normalized_value || field.raw_value || 'â€”'}</span>
                                                {field.bukti?.length > 0 && (
                                                    <span className="text-[10px] text-[#827470] block mt-0.5">Bukti: {field.bukti.map(b => b.bukti_teks || b.raw_value).join(', ')}</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {dataTerekstraksi.fields?.length === 0 && (
                                        <p className="text-[12px] text-[#6E625A] text-center py-4">Tidak ada data field yang diekstraksi.</p>
                            )}
                            </div>
                        </div>
                    </div>
                    )}

                    {/* =====================
                         BAGIAN 5: Validasi QR Code
                         ===================== */}
                    {dataScreening && dataQr && (
                        <div className="bg-white rounded-[12px] shadow-sm border border-[#EAE4DC] p-6">
                            <h2 className="text-[18px] font-bold text-[#4B2E2B] mb-4 flex items-center gap-2">
                                <span className="text-[20px]">ðŸ“±</span>
                                Validasi QR Code
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-semibold text-[#827470] uppercase tracking-wider">QR Ditemukan</label>
                                    <p className={`text-[15px] font-bold ${dataQr.ditemukan ? 'text-[#5C8D69]' : 'text-[#C98285]'}`}>
                                        {dataQr.ditemukan ? 'Ya' : 'Tidak'}
                                    </p>
                                </div>
                                {dataQr.ditemukan && (
                                    <>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-semibold text-[#827470] uppercase tracking-wider">Jenis Konten</label>
                                        <p className="text-[15px] font-bold text-[#4B2E2B]">{dataQr.jenis || 'â€”'}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-semibold text-[#827470] uppercase tracking-wider">URL Hasil Decoding</label>
                                        <p className="text-[13px] text-[#4B2E2B] break-all">{dataQr.url_validasi?.url || 'â€”'}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-semibold text-[#827470] uppercase tracking-wider">Host / Domain</label>
                                        <p className="text-[13px] font-semibold text-[#4B2E2B] break-all">{dataQr.url_validasi?.host || 'â€”'}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-semibold text-[#827470] uppercase tracking-wider">Validasi Domain</label>
                                        <p className={`text-[15px] font-bold ${dataQr.url_validasi?.is_oss_domain ? 'text-[#5C8D69]' : 'text-[#C98285]'}`}>
                                            {dataQr.url_validasi?.is_oss_domain ? 'Domain OSS Diizinkan' : 'Domain Tidak Diizinkan'}
                                        </p>
                                        <p className="text-[11px] text-[#6E625A] mt-1">
                                            Validasi domain hanya memastikan hostname sesuai daftar OSS yang diizinkan. Ini bukan verifikasi resmi melalui API OSS.
                                        </p>
                                    </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* =====================
                         BAGIAN 6: Ringkasan Hasil Pemeriksaan
                         ===================== */}
                    {dataScreening && (
                        <div className="bg-white rounded-[12px] shadow-sm border border-[#EAE4DC] p-6">
                            <h2 className="text-[18px] font-bold text-[#4B2E2B] mb-4 flex items-center gap-2">
                                <span className="text-[20px]">ðŸ“‹</span>
                                Ringkasan Hasil Pemeriksaan
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-[#D1FAE5] rounded-[8px] p-4">
                                    <span className="text-[10px] font-semibold text-[#5C8D69] uppercase block mb-1">Data Sesuai</span>
                                    <span className="text-[24px] font-bold text-[#5C8D69]">{jumlahSesuai}</span>
                                </div>
                                <div className="bg-[#FEE2E2] rounded-[8px] p-4">
                                    <span className="text-[10px] font-semibold text-[#C98285] uppercase block mb-1">Data Tidak Sesuai</span>
                                    <span className="text-[24px] font-bold text-[#C98285]">{jumlahTidakSesuai}</span>
                                </div>
                                <div className="bg-[#FCE6C9] rounded-[8px] p-4">
                                    <span className="text-[10px] font-semibold text-[#8A5A00] uppercase block mb-1">Perlu Diverifikasi</span>
                                    <span className="text-[24px] font-bold text-[#8A5A00]">{jumlahTidakDapatDiverifikasi}</span>
                                </div>
                            </div>

                            <div className="mt-6 space-y-3">
                                <h3 className="text-[14px] font-bold text-[#4B2E2B] mb-2">Temuan Struktur Dokumen</h3>
                                {indikatorStruktur.length > 0 ? (
                                    <div className="space-y-2">
                                        {indikatorStruktur.map((indikator, idx) => (
                                            <div key={idx} className="flex items-center gap-2 p-2 bg-[#F4ECE9] rounded-[6px]">
                                                <span className={`w-2 h-2 rounded-full ${
                                                    indikator.includes('LENGKAP') ? 'bg-[#5C8D69]' :
                                                    indikator.includes('KETIDAKSESUAIAN') || indikator.includes('TIDAK_LENGKAP') ? 'bg-[#C98285]' :
                                                    'bg-[#8A5A00]'
                                                }`}></span>
                                                <span className="text-[12px] text-[#4B2E2B]">{indikator.split('_').join(' ')}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-[12px] text-[#6E625A] text-center py-4">Tidak ada indikator struktur.</p>
                                )}
                            </div>

                            <div className="mt-6">
                                <h3 className="text-[14px] font-bold text-[#4B2E2B] mb-2">Temuan Pemeriksaan</h3>
                                {temuanStruktur.length > 0 ? (
                                    <div className="space-y-2">
                                        {temuanStruktur.map((temuan, idx) => (
                                            <div key={idx} className={`p-3 rounded-[6px] border ${temuan.tingkat_perhatian === 'CRITICAL' ? 'border-red-200 bg-red-50' : temuan.tingkat_perhatian === 'WARNING' ? 'border-[#FCE6C9] bg-[#FCE6C9]' : 'border-[#D1FAE5] bg-[#D1FAE5]'}`}>
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className={`text-[11px] font-bold uppercase tracking-wider ${temuan.tingkat_perhatian === 'CRITICAL' ? 'text-[#C98285]' : temuan.tingkat_perhatian === 'WARNING' ? 'text-[#8A5A00]' : 'text-[#5C8D69]'}`}>
                                                        {temuan.jenis_temuan.replace(/_/g, ' ')}
                                                    </span>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-[4px] ${temuan.tingkat_perhatian === 'CRITICAL' ? 'bg-red-100 text-red-700' : temuan.tingkat_perhatian === 'WARNING' ? 'bg-[#FCE6C9]/50 text-[#8A5A00]' : 'bg-[#D1FAE5]/50 text-[#5C8D69]'}`}>
                                                        {temuan.tingkat_perhatian}
                                                    </span>
                                                </div>
                                                <p className="text-[12px] text-[#4B2E2B] leading-relaxed">{temuan.deskripsi}</p>
                                                {temuan.field_terkait && (
                                                    <p className="text-[11px] font-semibold text-[#827470] mt-1">Field: {temuan.field_terkait}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-[12px] text-[#6E625A] text-center py-4">Tidak ada temuan pemeriksaan.</p>
                                )}
                            </div>

                            {/* Rekomendasi screening */}
                            <div className="mt-6 bg-[#F4ECE9] rounded-[8px] p-4">
                                <h3 className="text-[14px] font-bold text-[#4B2E2B] mb-2">Rekomendasi Screening</h3>
                                <p className="text-[13px] text-[#4B2E2B] leading-relaxed">
                                    {dataScreening.perlu_review_manual
                                        ? 'Hasil screening menunjukkan beberapa ketidaksesuaian yang perlu ditinjau kembali oleh Super Admin sebelum keputusan akhir.'
                                        : 'Hasil screening menunjukkan data yang konsisten. Keputusan terima atau tolak tetap menjadi kewenangan Super Admin.'}
                                </p>
                                {dataScreening.perlu_review_manual && dataScreening.alasan_review && (
                                    <div className="mt-3 bg-red-50 border border-red-200 rounded-[6px] p-3">
                                        <span className="text-[11px] font-semibold text-[#8A5A00] block mb-1">Alasan:</span>
                                        <p className="text-[13px] text-[#4B2E2B]">{dataScreening.alasan_review}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                {tampilkanFormPenolakan && (
                    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-6">
                        <div className="bg-white rounded-[12px] shadow-2xl w-full max-w-md p-6">
                            <h2 className="text-[18px] font-bold text-[#4B2E2B] mb-4">Alasan Penolakan</h2>
                            <p className="text-[13px] text-[#6E625A] mb-6">
                                Berikan alasan penolakan untuk kafe <strong>{kafe.nama_perusahaan}</strong>.
                            </p>
                            <textarea
                                value={alasanTolak}
                                onChange={(e) => setAlasanTolak(e.target.value)}
                                placeholder="Alasan penolakan (wajib diisi)"
                                rows={4}
                                className="w-full h-[120px] border border-[#EAE4DC] rounded-[8px] p-3 text-[14px] text-[#4B2E2B] focus:outline-none focus:ring-2 focus:ring-[#C98285]/50 focus:border-[#C98285]"
                            />
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={tanganiTutupFormPenolakan}
                                    className="px-6 py-3 rounded-[8px] font-semibold text-[#6E625A] hover:bg-[#F4ECE9] transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={tanganiTolak}
                                    disabled={submittingKeputusan || !alasanTolak.trim()}
                                    className="px-6 py-3 rounded-[8px] font-bold text-white bg-[#C98285] hover:bg-[#b36a6d] disabled:opacity-60 transition-all"
                                >
                                    {submittingKeputusan ? 'Memproses...' : 'Kirim Penolakan'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DetailVerifikasi;

