import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import coffeeBeansIcon from '../../aset/status_lamaran/Coffee Beans.png';
import placeholderProfile from '../../aset/profil/placeholder_profil.jpg';
import api from '../../layanan/api'; // Pastikan path ini sesuai untuk memanggil axios instance

const DetailStatusLamaran = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [showModal, setShowModal] = useState(false);
    
    const [data, setData] = useState(null);
    const [wawancara, setWawancara] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false); // [UPDATE LOGIC]
    const timelineRef = useRef(null);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const response = await api.get(`/pelamar/lamaran/${id}`);
                if (response.data.status === 'success') {
                    const apiData = response.data.data;
                    
                    const mappedData = {
                        posisi: apiData.posisi,
                        nama_perusahaan: apiData.nama_kafe,
                        logo_perusahaan: apiData.logo_kafe,
                        nama_pelamar: apiData.nama_pelamar,
                        tanggal_lamar: apiData.timeline[apiData.timeline.length - 1]?.waktu 
                            ? new Date(apiData.timeline[apiData.timeline.length - 1].waktu).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) 
                            : 'Tanggal tidak tersedia',
                        status: apiData.status_saat_ini,
                        timeline: apiData.timeline.map((log) => {
                            let judul = log.status;
                            let deskripsi = log.keterangan;
                            let hasButton = false;
                            
                            if (log.status === 'Diproses') {
                                judul = 'Lamaran Dikirim';
                                // Sesuai desain: nama kafe dinamis
                                deskripsi = `Lamaran Anda telah berhasil diterima oleh tim rekrutmen ${apiData.nama_kafe}.`;
                            } else if (log.status === 'Dalam Review') {
                                judul = 'Dalam Review';
                                // Sesuai desain
                                deskripsi = 'Tim HRD sedang meninjau portofolio dan pengalaman kerja Anda.';
                            } else if (log.status === 'Wawancara') {
                                if (log.keterangan === 'Jadwal wawancara telah dibuat.') {
                                    judul = 'Jadwal Wawancara';
                                    // Sesuai desain: ada tombol Lihat Jadwal
                                    deskripsi = 'Anda diundang untuk sesi wawancara.';
                                    hasButton = true;
                                } else {
                                    judul = 'Lamaran Diterima';
                                    // Sesuai desain
                                    deskripsi = 'Lamaran anda lolos seleksi, selanjutnya tunggu informasi jadwal wawancara Anda.';
                                }
                            } else if (log.status === 'Diterima') {
                                judul = 'Lamaran Diterima';
                                deskripsi = 'Selamat! Anda dinyatakan diterima. Silakan tunggu informasi lebih lanjut dari perusahaan.';
                            } else if (log.status === 'Ditolak') {
                                judul = 'Lamaran Tidak Diterima';
                                deskripsi = 'Terima kasih atas lamaran Anda. Mohon maaf, lamaran Anda belum dapat diproses ke tahap selanjutnya.';
                            }
                            
                            return {
                                judul: judul,
                                waktu: new Date(log.waktu).toLocaleString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute:'2-digit' }).replace(' pukul ', ' - '),
                                deskripsi: deskripsi,
                                selesai: true,
                                hasButton: hasButton,
                            };
                        }).reverse() // Reverse karena API return DESC (terbaru di atas), timeline butuh ASC
                    };

                    setData(mappedData);
                    
                    if (apiData.wawancara) {
                        setWawancara(apiData.wawancara);
                    }
                }
            } catch (error) {
                console.error("Gagal memuat detail lamaran:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [id]);

    // ─── Deep-Link Handler ───────────────────────────────────────────────────
    // Jika URL mengandung ?action=open_modal_wawancara (dikirim dari notifikasi
    // Poin 9 & 10), tunggu data selesai dimuat lalu buka modal secara otomatis.
    useEffect(() => {
        if (!loading && data) {
            const action = searchParams.get('action');
            if (action === 'open_modal_wawancara') {
                setShowModal(true);
            } else if (action === 'open_timeline') {
                // Scroll ke area tracking timeline
                timelineRef.current?.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [loading, data, searchParams]);

    // [UPDATE LOGIC] Handler untuk tombol Konfirmasi
    const handleKonfirmasi = async () => {
        setSubmitting(true);
        try {
            const response = await api.post(`/pelamar/lamaran/${id}/konfirmasi-wawancara`);
            if (response.data.status === 'success') {
                setShowModal(false);
                // Optional: Beri feedback sukses
                alert('Terima kasih! Konfirmasi Anda telah terkirim ke perusahaan.');
            }
        } catch (error) {
            console.error("Gagal mengirim konfirmasi:", error);
            alert('Gagal mengirim konfirmasi. Silakan coba lagi nanti.');
        } finally {
            setSubmitting(false);
        }
    };

    const warnaGold = '#FBB041';
    const warnaCokelat = '#3D2722';

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F6F1EE]/50">
                <p className="font-poppins font-medium text-[#3D2722]/60">Memuat detail lamaran...</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F6F1EE]/50">
                <p className="font-poppins font-medium text-[#3D2722]/60">Data lamaran tidak ditemukan.</p>
            </div>
        );
    }

    return (
        <div className="halaman-detail-status min-h-screen py-6 px-4">
            {/* Wadah Utama */}
            <div className="wadah-utama-rounded max-w-2xl mx-auto bg-[#F6F1EE]/50 rounded-2xl shadow-lg overflow-hidden relative">
                <div className="wadah-konten p-4 md:p-5">
                
                {/* Tombol Kembali */}
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center text-[#3D2722]/50 hover:text-[#3D2722] font-poppins font-bold mb-5 transition-all group"
                >
                    <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center mr-2 shadow-sm group-hover:shadow-md transition-all">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
                        </svg>
                    </div>
                    Kembali
                </button>

                {/* Header Card Sesuai Gambar - Pixel Perfect */}
                <div className="header-detail-premium relative rounded-2xl bg-[#3D2722] overflow-hidden mb-6 shadow-md border-b-[6px] border-[#FBB041]">
                    <div className="p-5 flex flex-col md:flex-row items-center gap-4">
                        {/* Logo Perusahaan */}
                        <div className="wadah-logo w-12 h-12 bg-[#C69C6D] rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 overflow-hidden">
                            <img 
                                src={data.logo_perusahaan ? (data.logo_perusahaan.startsWith('http') || data.logo_perusahaan.startsWith('/') ? data.logo_perusahaan : `/storage/${data.logo_perusahaan}`) : placeholderProfile}
                                alt="Logo Perusahaan"
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.onerror = null; e.target.src = placeholderProfile; }}
                            />
                        </div>

                        {/* Info Utama */}
                        <div className="info-utama flex-grow text-center md:text-left">
                            <h1 className="font-poppins font-bold text-lg md:text-xl text-white leading-tight mb-0.5">
                                {data.posisi}
                            </h1>
                            <p className="font-poppins font-medium text-sm text-white/80">
                                {data.nama_perusahaan}
                            </p>
                            <p className="font-poppins text-[11px] text-white/60 mt-0.5">
                                Dikirim pada {data.tanggal_lamar}
                            </p>
                        </div>

                        {/* Status Pill */}
                        <div className="wadah-pill">
                            <div className="px-4 py-1.5 rounded-full font-poppins font-bold text-xs shadow-md"
                                 style={{ backgroundColor: warnaGold, color: warnaCokelat }}>
                                {data.status}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tracking Timeline Section */}
                <div ref={timelineRef} className="area-tracking flex flex-col items-center">
                    <h2 className="font-poppins font-bold text-lg text-[#3D2722] mb-4">
                        Tracking Timeline
                    </h2>

                    <div className="wadah-timeline-induk relative w-full flex">
                        {/* Garis Vertikal Utama */}
                        <div className="garis-vertikal-pixel absolute left-[22px] md:left-[28px] top-0 bottom-0 w-[2px]"
                             style={{ backgroundColor: warnaCokelat }}></div>

                        <div className="daftar-langkah-premium flex flex-col gap-4 w-full relative z-10">
                            {data.timeline.map((item, index) => (
                                <div key={index} className="item-langkah-baris flex items-center">
                                    {/* Simpul Ikon Kopi */}
                                    <div className="flex-shrink-0 w-10 md:w-14 flex justify-center">
                                        <div className="simpul-kopi-pixel w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-md border-2 border-[#EBE4DC]"
                                             style={{ backgroundColor: warnaCokelat }}>
                                            <img 
                                                src={coffeeBeansIcon} 
                                                alt="Icon" 
                                                className="w-4 h-4 md:w-5 md:h-5 object-contain"
                                                style={{ filter: 'sepia(1) saturate(1.5) brightness(1.2)' }}
                                            />
                                        </div>
                                    </div>

                                    {/* Kartu Detail Langkah */}
                                    <div className="kartu-langkah-detail flex-grow bg-[#FDF7F2] rounded-xl p-3 md:p-4 flex flex-col md:flex-row items-center gap-3 shadow-sm border border-white/20">
                                        {/* Info Kiri */}
                                        <div className="info-kiri flex-grow text-center md:text-left">
                                            <h4 className="font-poppins font-bold text-sm md:text-base text-[#3D2722] mb-0.5">
                                                {item.judul}
                                            </h4>
                                            <p className="font-poppins font-medium text-[11px] md:text-xs text-[#3D2722]/60">
                                                {item.waktu}
                                            </p>
                                        </div>

                                        {/* Kotak Pesan Cokelat */}
                                        <div className="kotak-pesan-cokelat bg-[#3D2722] rounded-lg p-3 flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto md:max-w-[240px]">
                                            <p className="font-poppins text-[11px] md:text-xs text-white/90 text-center md:text-left leading-relaxed flex-grow">
                                                {item.deskripsi}
                                            </p>
                                            {item.hasButton && (
                                                <button 
                                                    onClick={() => setShowModal(true)}
                                                    className="flex-shrink-0 px-3 py-1.5 rounded-lg font-poppins font-bold text-[11px] transition-all hover:scale-105 active:scale-95"
                                                    style={{ backgroundColor: warnaGold, color: warnaCokelat }}>
                                                    Lihat Jadwal
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                </div>
            </div>

            {/* Modal Detail Jadwal Wawancara - Pixel Perfect & Tanpa Scroll */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
                        
                        {/* Header Modal */}
                        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                            <h3 className="font-poppins font-bold text-base text-[#2D1B18]">
                                Detail Jadwal Wawancara
                            </h3>
                            <button 
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Body Modal */}
                        <div className="p-4 md:p-5 bg-[#FFFBF8] space-y-3">
                            {wawancara ? (
                                <>
                                    <div className="flex flex-col md:flex-row gap-4">
                                        {/* Nama Pelamar */}
                                        <div className="flex-grow space-y-1.5">
                                            <label className="font-poppins font-semibold text-[12px] text-[#2D1B18]/60 ml-1">Nama Pelamar</label>
                                            <div className="flex items-center bg-[#F8F4F1] rounded-lg px-3 py-2">
                                                <svg className="w-3.5 h-3.5 text-[#8B5E3C] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                <span className="font-poppins font-semibold text-[14px] text-[#2D1B18]">{data.nama_pelamar || 'Pelamar'}</span>
                                            </div>
                                        </div>
                                        {/* Status */}
                                        <div className="space-y-1.5">
                                            <label className="font-poppins font-semibold text-[12px] text-[#2D1B18]/60 ml-1">Status</label>
                                            <div className="bg-[#FBB041] text-[#2D1B18] font-poppins font-bold px-3 py-1.5 rounded-full flex items-center shadow-sm text-[11px]">
                                                <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                {wawancara.status_jadwal || 'Terjadwal'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Lokasi */}
                                    <div className="space-y-1.5">
                                        <label className="font-poppins font-semibold text-[12px] text-[#2D1B18]/60 ml-1">Lokasi / Link Pertemuan</label>
                                        <div className="bg-[#F8F4F1] rounded-xl p-3 flex gap-3 items-center">
                                            <div className="w-9 h-9 bg-[#805000] rounded-lg flex items-center justify-center flex-shrink-0">
                                                <svg className="w-4 h-4 text-[#FBB041]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className="font-poppins font-bold text-[14px] text-[#2D1B18]">{data.nama_perusahaan}</h4>
                                                <p className="font-poppins text-[12px] text-[#2D1B18]/60 leading-tight mt-0.5">{wawancara.lokasi}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Tanggal */}
                                        <div className="space-y-1.5">
                                            <label className="font-poppins font-semibold text-[12px] text-[#2D1B18]/60 ml-1">Tanggal & Waktu</label>
                                            <div className="flex items-center bg-[#F8F4F1] rounded-lg px-3 py-2">
                                                <svg className="w-3.5 h-3.5 text-[#8B5E3C] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span className="font-poppins font-semibold text-[13px] text-[#2D1B18]">
                                                    {new Date(wawancara.tanggal).toLocaleString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute:'2-digit' }).replace(' pukul ', ' - ')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Catatan */}
                                    {wawancara.catatan && (
                                        <div className="space-y-1.5">
                                            <label className="font-poppins font-semibold text-[12px] text-[#2D1B18]/60 ml-1">Catatan Tambahan</label>
                                            <div className="bg-[#F8F4F1] rounded-lg p-3 leading-relaxed text-[#2D1B18]/70 font-poppins text-[12px]">
                                                "{wawancara.catatan}"
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-6">
                                    <p className="font-poppins text-[#2D1B18]/60">Data jadwal wawancara belum tersedia.</p>
                                </div>
                            )}
                        </div>

                        {/* Footer Modal */}
                        <div className="px-5 py-3 bg-[#F0EDE9] flex justify-end">
                            <button 
                                onClick={handleKonfirmasi}
                                disabled={submitting}
                                className={`px-6 py-2 rounded-full font-poppins font-bold text-[13px] shadow-sm transition-all ${submitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#F9A62B]'}`}
                                style={{ backgroundColor: warnaGold, color: warnaCokelat }}>
                                {submitting ? 'Mengirim...' : 'Konfirmasi'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DetailStatusLamaran;
