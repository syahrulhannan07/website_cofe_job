import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ProgressBar from './komponen/ProgressBar';
import Step1Upload from './komponen/Step1Upload';
import Step2Pertanyaan from './komponen/Step2Pertanyaan';
import Step3Profile from './komponen/Step3Profile';
import Step4Review from './komponen/Step4Review';
import iconKembali from '../../aset/melamar/iconkembali.svg';
import iconLanjut from '../../aset/melamar/iconlanjut.svg';
import iconSent from '../../aset/melamar/Sent.png';
import layananLamaran from '../../layanan/layananLamaran';

/**
 * SIPEKA — Sistem Pelamaran Kerja
 * Wrapper utama yang mengatur state dan navigasi 4 tahap lamaran.
 * Mengintegrasikan endpoint backend secara sekuensial.
 */
const STATE_AWAL = {
    upload: {}, // Akan menyimpan mapping { id_jenis_dokumen: File }
    pertanyaan: [], // Akan menyimpan array { id_pertanyaan, jawaban }
    profil: {
        tentangSaya: '',
    },
};

const TOTAL_STEP = 4;

const varianAnimasi = {
    masuk: (arah) => ({ opacity: 0, x: arah > 0 ? 60 : -60 }),
    tengah:  { opacity: 1, x: 0 },
    keluar: (arah) => ({ opacity: 0, x: arah > 0 ? -60 : 60 }),
};

const Melamar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Ambil info lowongan dari state navigasi
    const infoLowongan = location.state?.lowongan || null;

    const [stepSaatIni, setStepSaatIni] = useState(1);
    const [arahAnimasi, setArahAnimasi] = useState(1);
    const [formData, setFormData] = useState(STATE_AWAL);
    const [galat, setGalat] = useState('');
    const [sedangMengirim, setSedangMengirim] = useState(false);
    const [lamaranTerkirim, setLamaranTerkirim] = useState(false);

    // State Integrasi API
    const [isLoadingInit, setIsLoadingInit] = useState(true);
    const [idLamaran, setIdLamaran] = useState(null);
    const [dokumenWajib, setDokumenWajib] = useState([]);
    const [pertanyaanSeleksi, setPertanyaanSeleksi] = useState([]);

    useEffect(() => {
        if (!infoLowongan?.id) {
            alert('Akses tidak valid. Tidak ada data lowongan.');
            navigate('/');
            return;
        }

        const inisialisasiLamaran = async () => {
            try {
                // 1. Mulai lamaran untuk mendapatkan ID dan dokumen wajib
                const resMulai = await layananLamaran.mulaiLamaran(infoLowongan.id);
                if (resMulai.status === 'success') {
                    setIdLamaran(resMulai.data.id_lamaran);
                    setDokumenWajib(resMulai.data.dokumen_wajib || []);
                }

                // 2. Ambil detail lowongan untuk mendapatkan pertanyaan seleksi
                const resDetail = await layananLamaran.getDetailLowongan(infoLowongan.id);
                if (resDetail.status === 'success') {
                    setPertanyaanSeleksi(resDetail.data.pertanyaan_seleksi || []);
                    
                    // Inisialisasi state pertanyaan
                    if (resDetail.data.pertanyaan_seleksi) {
                        const initPertanyaan = resDetail.data.pertanyaan_seleksi.map(p => ({
                            id_pertanyaan: p.id_pertanyaan,
                            jawaban: ''
                        }));
                        setFormData(prev => ({ ...prev, pertanyaan: initPertanyaan }));
                    }
                }
            } catch (err) {
                console.error('Gagal inisialisasi lamaran:', err);
                const pesan = err.response?.data?.message || 'Gagal memulai lamaran. Pastikan profil Anda lengkap.';
                alert(pesan);
                navigate('/profil'); // Redirect ke profil jika profil belum lengkap
            } finally {
                setIsLoadingInit(false);
            }
        };

        inisialisasiLamaran();
    }, [infoLowongan, navigate]);

    // ─── Handlers State Per Seksi ────────────────────────────────────────────
    const updateUpload = (data) => setFormData((prev) => ({ ...prev, upload: data }));
    const updatePertanyaan = (data) => setFormData((prev) => ({ ...prev, pertanyaan: data }));
    const updateProfil = (data) => setFormData((prev) => ({ ...prev, profil: data }));

    // ─── Validasi Per Step ───────────────────────────────────────────────────
    const validasiStep = () => {
        setGalat('');
        if (stepSaatIni === 1) {
            // Cek semua dokumen yang statusnya wajib
            for (let doc of dokumenWajib) {
                if (doc.wajib && !formData.upload[doc.id_jenis_dokumen]) {
                    setGalat(`Dokumen ${doc.nama_dokumen} wajib diunggah sebelum melanjutkan.`);
                    return false;
                }
            }
        }
        if (stepSaatIni === 2) {
            // Cek semua pertanyaan
            for (let q of pertanyaanSeleksi) {
                const jawabanItem = formData.pertanyaan.find(p => p.id_pertanyaan === q.id_pertanyaan);
                if (!jawabanItem || !jawabanItem.jawaban.trim()) {
                    setGalat('Harap jawab semua pertanyaan dari perusahaan sebelum melanjutkan.');
                    return false;
                }
            }
        }
        return true;
    };

    // ─── Navigasi Antar Step ─────────────────────────────────────────────────
    const lanjut = () => {
        if (!validasiStep()) return;
        setArahAnimasi(1);
        setStepSaatIni((prev) => Math.min(prev + 1, TOTAL_STEP));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const kembali = () => {
        setGalat('');
        setArahAnimasi(-1);
        if (stepSaatIni === 1) {
            navigate(-1);
            return;
        }
        setStepSaatIni((prev) => Math.max(prev - 1, 1));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ─── Pengiriman Lamaran ──────────────────────────────────────────────────
    const kirimLamaran = async () => {
        setSedangMengirim(true);
        setGalat('');
        try {
            // 1. Upload Dokumen
            const payloadUpload = new FormData();
            let hasFiles = false;
            Object.keys(formData.upload).forEach((id_jenis_dokumen) => {
                if (formData.upload[id_jenis_dokumen]) {
                    payloadUpload.append('dokumen[]', formData.upload[id_jenis_dokumen]);
                    payloadUpload.append('id_jenis_dokumen[]', id_jenis_dokumen);
                    hasFiles = true;
                }
            });

            if (hasFiles) {
                await layananLamaran.uploadDokumen(idLamaran, payloadUpload);
            }

            // 2. Simpan Jawaban Pertanyaan
            if (formData.pertanyaan && formData.pertanyaan.length > 0) {
                await layananLamaran.simpanJawaban(idLamaran, formData.pertanyaan);
            }

            // 3. Finalisasi / Kirim Lamaran
            await layananLamaran.kirimLamaran(idLamaran);

            setLamaranTerkirim(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            console.error('Gagal mengirim lamaran:', err);
            setGalat(err.response?.data?.message || 'Gagal mengirim lamaran. Silakan coba lagi.');
        } finally {
            setSedangMengirim(false);
        }
    };

    // ─── Render Komponen Per Step ────────────────────────────────────────────
    const renderStep = () => {
        switch (stepSaatIni) {
            case 1: 
                return <Step1Upload 
                    data={formData.upload} 
                    onChange={updateUpload} 
                    dokumenWajib={dokumenWajib}
                />;
            case 2: 
                return <Step2Pertanyaan 
                    data={formData.pertanyaan} 
                    onChange={updatePertanyaan} 
                    pertanyaanSeleksi={pertanyaanSeleksi}
                />;
            case 3: 
                return <Step3Profile 
                    data={formData.profil} 
                    onChange={updateProfil} 
                />;
            case 4: 
                return <Step4Review 
                    formData={formData} 
                    onKirim={kirimLamaran} 
                    sedangMengirim={sedangMengirim} 
                    dokumenWajib={dokumenWajib}
                    pertanyaanSeleksi={pertanyaanSeleksi}
                />;
            default: return null;
        }
    };

    if (isLoadingInit) {
        return (
            <div className="w-full flex items-center justify-center min-h-screen bg-[#F3EDE6]">
                <p className="font-poppins font-bold text-xl text-[#4B2E2B]">Menyiapkan lamaran Anda...</p>
            </div>
        );
    }

    // ─── Halaman Sukses ──────────────────────────────────────────────────────
    if (lamaranTerkirim) {
        return (
            <div className="flex-1 flex items-center justify-center p-8 min-h-[60vh] pembungkus-utama-melamar">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md text-center"
                >
                    <div className="w-24 h-24 bg-[#6B8E23] rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-12 h-12">
                            <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <h1 className="font-poppins font-bold text-[36px] text-[#4B2E2B] mb-3">
                        Lamaran Terkirim! 🎉
                    </h1>
                    <p className="font-poppins text-[16px] text-[#4B2E2B]/70 mb-8 leading-relaxed">
                        Lamaran Anda telah berhasil dikirimkan. Tim HRD akan menghubungi Anda dalam waktu 3-7 hari kerja.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button onClick={() => navigate('/status-lamaran')}
                            className="px-8 py-3 bg-[#4B2E2B] text-white rounded-full font-semibold hover:bg-[#3d2523] transition-all">
                            Lihat Status Lamaran
                        </button>
                        <button onClick={() => navigate('/')}
                            className="px-8 py-3 border-2 border-[#4B2E2B] text-[#4B2E2B] rounded-full font-semibold hover:bg-[#4B2E2B] hover:text-white transition-all">
                            Kembali ke Beranda
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    // ─── Render Utama ────────────────────────────────────────────────────────
    return (
        <div className="pembungkus-utama-melamar w-full flex flex-col bg-[#F3EDE6] min-h-screen">

            {/* Header Banner */}
            <div className="w-full bg-[#4B2E2B] py-12 px-6">
                <div className="max-w-[1300px] mx-auto text-center flex flex-col items-center">
                    <h1 className="font-poppins font-bold text-[36px] text-white leading-tight">
                        Selesaikan Lamaran Sekarang!
                    </h1>
                    <p className="font-poppins font-medium text-[16px] text-white mt-4 opacity-90">
                        Ikuti beberapa tahap untuk melamar pekerjaan tersebut
                    </p>
                    {infoLowongan && (
                        <div className="mt-6 inline-flex items-center gap-2 bg-white/10 rounded-full px-6 py-2 backdrop-blur-sm border border-white/20">
                            <span className="font-poppins text-[14px] text-white">
                                Melamar untuk: <span className="font-bold">{infoLowongan.posisi}</span> di <span className="font-bold">{infoLowongan.nama_kafe}</span>
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Konten Utama */}
            <main className="flex-1 w-full max-w-[1300px] mx-auto px-6 py-12 flex flex-col">
                {/* Progress Bar */}
                <ProgressBar stepSaatIni={stepSaatIni} />

                {/* Pesan Galat */}
                <AnimatePresence>
                    {galat && (
                        <motion.div
                            key="galat"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-4 bg-red-50 border-2 border-red-200 rounded-[15px] px-5 py-3 flex items-center gap-3"
                        >
                            <span className="text-red-500 text-xl">⚠️</span>
                            <p className="font-poppins text-[14px] text-red-600 font-medium">{galat}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Konten Step dengan Animasi */}
                <div className="relative overflow-hidden flex-1">
                    <AnimatePresence mode="wait" custom={arahAnimasi}>
                        <motion.div
                            key={stepSaatIni}
                            custom={arahAnimasi}
                            variants={varianAnimasi}
                            initial="masuk"
                            animate="tengah"
                            exit="keluar"
                            transition={{ duration: 0.35, ease: 'easeInOut' }}
                        >
                            {renderStep()}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Tombol Navigasi (Step 1-3) */}
                {stepSaatIni < 4 && (
                    <div className="flex items-center justify-end gap-4 mt-12">
                        <button
                            onClick={kembali}
                            className="flex items-center gap-3 px-10 py-4 border-2 border-[#4B2E2B]/10 bg-[#F5F1EA] text-[#4B2E2B] rounded-[10px] font-poppins font-semibold text-[18px] hover:bg-[#4B2E2B] hover:text-white transition-all duration-300 active:scale-95"
                        >
                            <img src={iconKembali} alt="back" className="w-5 h-5" />
                            Kembali
                        </button>

                        <button
                            onClick={lanjut}
                            className="flex items-center gap-3 px-12 py-4 bg-[#4B2E2B] text-white rounded-[10px] font-poppins font-semibold text-[18px] hover:bg-[#3d2523] transform transition-all duration-300 active:scale-95"
                        >
                            Lanjut
                            <img src={iconLanjut} alt="next" className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Tombol Navigasi Akhir (Step 4) */}
                {stepSaatIni === 4 && (
                    <div className="flex items-center justify-end gap-4 mt-12">
                        <button
                            onClick={kembali}
                            className="flex items-center gap-3 px-10 py-4 border-2 border-[#4B2E2B]/10 bg-[#F5F1EA] text-[#4B2E2B] rounded-[10px] font-poppins font-semibold text-[18px] hover:bg-[#4B2E2B] hover:text-white transition-all duration-300 active:scale-95"
                        >
                            <img src={iconKembali} alt="back" className="w-5 h-5" />
                            Kembali
                        </button>

                        <button
                            onClick={kirimLamaran}
                            disabled={sedangMengirim}
                            className="flex items-center gap-3 px-12 py-4 bg-[#4B2E2B] text-white rounded-[10px] font-poppins font-semibold text-[18px] hover:bg-[#3d2523] transform transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {sedangMengirim ? 'Mengirim...' : 'Kirim lamaran'}
                            <img src={iconSent} alt="sent" className="w-6 h-6 object-contain" />
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Melamar;
