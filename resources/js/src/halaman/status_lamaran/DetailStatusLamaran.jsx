import React, { useState, useEffect } from 'react';
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
        if (!loading && data && searchParams.get('action') === 'open_modal_wawancara') {
            setShowModal(true);
        }
    }, [loading, data, searchParams]);

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
        <div className="halaman-detail-status min-h-screen py-12 px-4 md:px-8">
            {/* Wadah Utama dengan Margin & Rounded 25px */}
            <div className="wadah-utama-rounded max-w-[1100px] mx-auto bg-[#F6F1EE]/50 rounded-[25px] shadow-2xl overflow-hidden relative">
                <div className="wadah-konten p-6 md:p-12">
                
                {/* Tombol Kembali */}
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center text-[#3D2722]/50 hover:text-[#3D2722] font-poppins font-bold mb-10 transition-all group"
                >
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center mr-3 shadow-sm group-hover:shadow-md transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
                        </svg>
                    </div>
                    Kembali
                </button>

                {/* Header Card Sesuai Gambar - Pixel Perfect */}
                <div className="header-detail-premium relative rounded-[40px] bg-[#3D2722] overflow-hidden mb-16 shadow-xl border-b-[12px] border-[#FBB041]">
                    <div className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-10">
                        {/* Logo Perusahaan */}
                        <div className="wadah-logo w-[110px] h-[110px] bg-[#C69C6D] rounded-[20px] flex items-center justify-center shadow-lg flex-shrink-0 overflow-hidden">
                            <img 
                                src={data.logo_perusahaan ? (data.logo_perusahaan.startsWith('http') || data.logo_perusahaan.startsWith('/') ? data.logo_perusahaan : `/storage/${data.logo_perusahaan}`) : placeholderProfile}
                                alt="Logo Perusahaan"
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.onerror = null; e.target.src = placeholderProfile; }}
                            />
                        </div>

                        {/* Info Utama */}
                        <div className="info-utama flex-grow text-center md:text-left">
                            <h1 className="font-poppins font-bold text-[32px] md:text-[38px] text-white leading-tight mb-2">
                                {data.posisi}
                            </h1>
                            <p className="font-poppins font-medium text-[18px] md:text-[20px] text-white/80">
                                {data.nama_perusahaan}
                            </p>
                            <p className="font-poppins text-[15px] md:text-[16px] text-white/60 mt-1">
                                Dikirim pada {data.tanggal_lamar}
                            </p>
                        </div>

                        {/* Status Pill */}
                        <div className="wadah-pill">
                            <div className="px-12 py-3.5 rounded-full font-poppins font-bold text-[16px] shadow-lg"
                                 style={{ backgroundColor: warnaGold, color: warnaCokelat }}>
                                {data.status}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tracking Timeline Section */}
                <div className="area-tracking flex flex-col items-center">
                    <h2 className="font-poppins font-bold text-[36px] text-[#3D2722] mb-16">
                        Tracking Timeline
                    </h2>

                    <div className="wadah-timeline-induk relative w-full flex">
                        {/* Garis Vertikal Utama */}
                        <div className="garis-vertikal-pixel absolute left-[38px] md:left-[48px] top-0 bottom-0 w-[4px]"
                             style={{ backgroundColor: warnaCokelat }}></div>

                        <div className="daftar-langkah-premium flex flex-col gap-10 w-full relative z-10">
                            {data.timeline.map((item, index) => (
                                <div key={index} className="item-langkah-baris flex items-center">
                                    {/* Simpul Ikon Kopi */}
                                    <div className="flex-shrink-0 w-[80px] md:w-[100px] flex justify-center">
                                        <div className="simpul-kopi-pixel w-[60px] h-[60px] md:w-[75px] md:h-[75px] rounded-full flex items-center justify-center shadow-lg border-[3px] border-[#EBE4DC]"
                                             style={{ backgroundColor: warnaCokelat }}>
                                            <img 
                                                src={coffeeBeansIcon} 
                                                alt="Icon" 
                                                className="w-7 h-7 md:w-9 md:h-9 object-contain"
                                                style={{ filter: 'sepia(1) saturate(1.5) brightness(1.2)' }}
                                            />
                                        </div>
                                    </div>

                                    {/* Kartu Detail Langkah */}
                                    <div className="kartu-langkah-detail flex-grow bg-[#FDF7F2] rounded-[30px] p-6 md:p-8 flex flex-col lg:flex-row items-center gap-6 shadow-md border border-white/20">
                                        {/* Info Kiri */}
                                        <div className="info-kiri flex-grow text-center lg:text-left">
                                            <h4 className="font-poppins font-bold text-[22px] md:text-[24px] text-[#3D2722] mb-1">
                                                {item.judul}
                                            </h4>
                                            <p className="font-poppins font-medium text-[15px] md:text-[16px] text-[#3D2722]/60">
                                                {item.waktu}
                                            </p>
                                        </div>

                                        {/* Kotak Pesan Cokelat */}
                                        <div className="kotak-pesan-cokelat bg-[#3D2722] rounded-[20px] p-6 md:px-10 md:py-6 flex flex-col md:flex-row items-center gap-6 min-w-[300px] lg:max-w-[500px]">
                                            <p className="font-poppins text-[15px] md:text-[16px] text-white/90 text-center md:text-left leading-relaxed flex-grow">
                                                {item.deskripsi}
                                            </p>
                                            {item.hasButton && (
                                                <button 
                                                    onClick={() => setShowModal(true)}
                                                    className="flex-shrink-0 px-6 py-2.5 rounded-[10px] font-poppins font-bold text-[13px] transition-all hover:scale-105 active:scale-95"
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
                    <div className="bg-white w-full max-w-[600px] rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
                        
                        {/* Header Modal - Lebih Ringkas */}
                        <div className="flex items-center justify-between px-7 py-4 border-b border-gray-100">
                            <h3 className="font-poppins font-bold text-[20px] text-[#2D1B18]">
                                Detail Jadwal Wawancara
                            </h3>
                            <button 
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Body Modal - Padat & Proporsional */}
                        <div className="p-6 md:p-7 bg-[#FFFBF8] space-y-4">
                            {wawancara ? (
                                <>
                                    <div className="flex flex-col md:flex-row gap-6">
                                        {/* Nama Pelamar */}
                                        <div className="flex-grow space-y-1.5">
                                            <label className="font-poppins font-semibold text-[12px] text-[#2D1B18]/60 ml-1">Nama Pelamar</label>
                                            <div className="flex items-center bg-[#F8F4F1] rounded-[10px] px-4 py-2.5">
                                                <svg className="w-4 h-4 text-[#8B5E3C] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                <span className="font-poppins font-semibold text-[15px] text-[#2D1B18]">{data.nama_pelamar || 'Pelamar'}</span>
                                            </div>
                                        </div>
                                        {/* Status */}
                                        <div className="space-y-1.5">
                                            <label className="font-poppins font-semibold text-[12px] text-[#2D1B18]/60 ml-1">Status</label>
                                            <div className="bg-[#FBB041] text-[#2D1B18] font-poppins font-bold px-4 py-2 rounded-full flex items-center shadow-sm text-[12px]">
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
                                        <div className="bg-[#F8F4F1] rounded-[14px] p-4 flex gap-4 items-center">
                                            <div className="w-[44px] h-[44px] bg-[#805000] rounded-[10px] flex items-center justify-center flex-shrink-0">
                                                <svg className="w-5 h-5 text-[#FBB041]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className="font-poppins font-bold text-[16px] text-[#2D1B18]">{data.nama_perusahaan}</h4>
                                                <p className="font-poppins text-[12.5px] text-[#2D1B18]/60 leading-tight mt-1">{wawancara.lokasi}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        {/* Tanggal */}
                                        <div className="space-y-1.5">
                                            <label className="font-poppins font-semibold text-[12px] text-[#2D1B18]/60 ml-1">Tanggal & Waktu</label>
                                            <div className="flex items-center bg-[#F8F4F1] rounded-[10px] px-4 py-2.5">
                                                <svg className="w-4 h-4 text-[#8B5E3C] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span className="font-poppins font-semibold text-[14px] text-[#2D1B18]">
                                                    {new Date(wawancara.tanggal).toLocaleString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute:'2-digit' }).replace(' pukul ', ' - ')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Catatan */}
                                    {wawancara.catatan && (
                                        <div className="space-y-1.5">
                                            <label className="font-poppins font-semibold text-[12px] text-[#2D1B18]/60 ml-1">Catatan Tambahan</label>
                                            <div className="bg-[#F8F4F1] rounded-[14px] p-4 leading-relaxed text-[#2D1B18]/70 font-poppins text-[13px]">
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

                        {/* Footer Modal - Beige Lebih Gelap */}
                        <div className="px-7 py-4 bg-[#F0EDE9] flex justify-end">
                            <button 
                                onClick={() => setShowModal(false)}
                                className="px-9 py-2.5 rounded-full font-poppins font-bold text-[14px] shadow-sm transition-all hover:bg-[#F9A62B]"
                                style={{ backgroundColor: warnaGold, color: warnaCokelat }}>
                                Konfirmasi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DetailStatusLamaran;
