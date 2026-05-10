import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import api from '../../../layanan/api';
import placeholderProfile from '../../../admin-perusahaan/aset/profil-perusahaan/placeholder_profile.png';
import iconLocation from '../../../aset/lowongan/Location.png';
import leftArrow from '../../../aset/lowongan/Left Arrow.png';
import iconLokasiMini from '../../../aset/lowongan/Icon2.svg';
import calendarIcon from '../../../aset/lowongan/Calendar.png';
import briefcaseIcon from '../../../aset/lowongan/School Briefcase.png';
import verifiedBadge from '../../../aset/lowongan/Verified Badge.png';

import HalamanErrorKopi from '../../../komponen/umum/HalamanErrorKopi';
import LoadingKopi from '../../../komponen/umum/LoadingKopi';

const DetailLowongan = ({ lowongan: lowonganProp }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { state } = useLocation();
    
    // Gunakan data dari prop atau state rute jika tersedia agar tampilan muncul instan
    const [dataLowongan, setDataLowongan] = useState(lowonganProp || state?.job || null);
    const [sedangMemuat, setSedangMemuat] = useState(!lowonganProp && !state?.job);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Mengambil data detail lowongan dari API Laravel berdasarkan ID
        // Jika data sudah ada dari state, pengambilan API tetap dilakukan di background untuk memastikan data terbaru
        const ambilDetailLowongan = async () => {
            try {
                if (!dataLowongan) setSedangMemuat(true);
                const respons = await api.get(`/lowongan/${id}`, { timeout: 10000 }); // 10 detik timeout
                if (respons.data.status === 'success') {
                    setDataLowongan(respons.data.data);
                    setError(null);
                }
            } catch (err) {
                console.error('Gagal mengambil detail lowongan:', err);
                if (err.response?.status === 404) {
                    setError(404);
                } else if (err.code === 'ECONNABORTED' || !err.response) {
                    setError('timeout');
                } else {
                    setError('error');
                }
            } finally {
                setSedangMemuat(false);
            }
        };

        if (id) {
            ambilDetailLowongan();
        }
    }, [id]);

    const handleLamar = () => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/melamar');
        } else {
            // Jika belum login, arahkan ke login
            navigate('/masuk');
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    // Tampilkan Halaman Error jika terjadi masalah
    if (error === 404) {
        return <HalamanErrorKopi code={404} message="Lowongan Tidak Ditemukan" subMessage="Maaf, lowongan yang Anda cari tidak tersedia atau sudah ditutup." />;
    }

    if (error === 'timeout' || error === 'error') {
        return <HalamanErrorKopi code="500" message="Koneksi Terganggu" subMessage="Sepertinya ada masalah dengan jaringan Anda atau server kami sedang sibuk. Silakan coba lagi nanti." />;
    }

    if (sedangMemuat && !dataLowongan) {
        return <LoadingKopi pesan="Menyeduh Data Lowongan..." />;
    }

    if (!dataLowongan) {
        return <HalamanErrorKopi code={404} message="Lowongan Kosong" />;
    }

    const lowongan = dataLowongan;
    const perusahaan = lowongan.perusahaan;

    return (
        <div className="w-full min-h-screen bg-[#F3EDE6] font-poppins pb-[100px] flex flex-col">
            {/* Header Lowongan - Banner Atas */}
            <div className="banner-header-lowongan w-full h-[300px] bg-[#4B2E2B] flex items-center justify-center shrink-0">
                <div className="w-full max-w-[1440px] px-[50px] flex flex-col md:flex-row justify-between items-center gap-8">
                    
                    {/* Info Utama Lowongan */}
                    <div className="info-utama-lowongan flex items-center gap-[30px] md:gap-[50px]">
                        <div className="foto-profil-perusahaan-kecil w-[120px] h-[120px] md:w-[150px] md:h-[150px] bg-[#F3EDE6] rounded-[15px] flex items-center justify-center p-[10px] overflow-hidden shrink-0">
                            <img 
                                src={lowongan.logo_kafe || placeholderProfile} 
                                alt={lowongan.nama_kafe} 
                                className="w-full h-full object-contain" 
                            />
                        </div>
                        
                        <div className="flex flex-col gap-[8px]">
                            <h1 className="font-poppins font-extrabold text-[28px] md:text-[36px] text-[#F3EDE6] leading-[1.2]">
                                {lowongan.posisi}
                            </h1>
                            <p className="font-poppins font-normal text-[18px] md:text-[20px] text-[#F3EDE6] leading-[1.2]">
                                {lowongan.nama_kafe}
                            </p>
                            
                            {/* Lokasi Kecamatan */}
                            <div className="bg-[#F3EDE6] rounded-[25px] h-[24px] inline-flex items-center justify-center px-[12px] w-fit mt-[4px]">
                                <div className="flex items-center gap-[6px]">
                                    <img src={iconLokasiMini} alt="Location" className="w-[10px] h-[12px] object-contain" />
                                    <span className="font-inter font-normal text-[12px] text-[#4B2E2B] leading-[1]">
                                        {lowongan.kecamatan}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tombol Aksi */}
                    <div className="flex flex-col gap-[15px] md:gap-[20px]">
                        <button 
                            onClick={handleLamar}
                            className="w-[200px] h-[55px] md:h-[61px] bg-[#C69C6D] rounded-[12px] font-inter font-bold text-[18px] md:text-[20px] text-[#F3EDE6] hover:bg-[#b0895f] transition-colors flex items-center justify-center"
                        >
                            Lamar Sekarang
                        </button>
                        <button 
                            onClick={handleBack}
                            className="w-[200px] h-[55px] md:h-[61px] border border-[#F3EDE6] rounded-[12px] font-inter font-bold text-[20px] md:text-[24px] text-[#C69C6D] hover:bg-[#F3EDE6]/10 transition-colors flex items-center justify-center gap-[10px]"
                        >
                            <img src={leftArrow} alt="Back" className="w-[30px] md:w-[37px] h-[40px] md:h-[50px] object-contain" />
                            Kembali...
                        </button>
                    </div>
                </div>
            </div>

            {/* Konten Utama */}
            <div className="w-full max-w-[1440px] mx-auto px-[30px] md:px-[50px] mt-[40px] flex flex-col lg:flex-row gap-[40px] lg:gap-[113px]">
                
                {/* Deskripsi & Kualifikasi */}
                <div className="flex-1 flex flex-col max-w-full lg:max-w-[788px]">
                    <h2 className="font-poppins font-extrabold text-[24px] text-[#4B2E2B] mb-[9px]">
                        Deskripsi Pekerjaan
                    </h2>
                    <div className="area-deskripsi-pekerjaan font-poppins font-normal text-[15px] text-[#C69C6D] leading-[1.8] mb-[64px] text-justify whitespace-pre-line">
                        {lowongan.deskripsi}
                    </div>

                    <h2 className="font-poppins font-extrabold text-[24px] text-[#4B2E2B] mb-[21px]">
                        Persyaratan & Kualifikasi
                    </h2>
                    <div className="daftar-syarat-kualifikasi font-poppins font-normal text-[15px] text-[#C69C6D] leading-[1.8] text-justify whitespace-pre-line">
                        {lowongan.persyaratan}
                    </div>
                </div>

                {/* Sidebar Ringkasan Perusahaan */}
                <div className="w-full lg:w-[550px] shrink-0 flex flex-col">
                    <div className="kartu-ringkasan-kafe w-full border-[3px] border-[#C69C6D] rounded-[50px] overflow-hidden bg-transparent flex flex-col relative min-h-[700px] lg:h-[802px]">
                        
                        {/* Banner Kartu */}
                        <div className="w-full h-[173px] bg-[#C69C6D] shrink-0" />
                        
                        {/* Logo Perusahaan */}
                        <div className="absolute top-[82px] left-[40px] w-[160px] h-[160px] bg-[#F3EDE6] rounded-[15px] flex items-center justify-center p-[10px] border border-[#C69C6D]/20 shadow-lg">
                            <img 
                                src={perusahaan?.logo_perusahaan || placeholderProfile} 
                                alt={perusahaan?.nama_perusahaan} 
                                className="w-[140px] h-[140px] object-contain" 
                            />
                        </div>

                        {/* Detail Info Perusahaan */}
                        <div className="detail-info-perusahaan flex flex-col px-[40px] mt-[90px] h-full relative pb-[40px]">
                            <div className="flex items-center gap-[10px] mb-[15px]">
                                <h3 className="font-poppins font-extrabold text-[24px] text-[#C69C6D] line-clamp-1">
                                    {perusahaan?.nama_perusahaan}
                                </h3>
                                {perusahaan?.status_verifikasi === 'Diterima' && (
                                    <img src={verifiedBadge} alt="Verified" className="w-[24px] h-[24px] object-contain" />
                                )}
                            </div>
                            
                            <p className="font-poppins font-normal text-[16px] text-[#C69C6D] leading-[24px] mb-[30px]">
                                “{perusahaan?.deskripsi || "Perusahaan kafe yang berdedikasi memberikan pengalaman kopi terbaik."}”
                            </p>
                            
                            <div className="w-full border-t border-[#C69C6D] pt-[30px] flex flex-col gap-[25px] flex-grow">
                                
                                {/* Info Berdiri */}
                                <div className="flex items-start gap-[15px]">
                                    <div className="w-[30px] h-[30px] flex items-center justify-start shrink-0">
                                        <img src={calendarIcon} alt="Calendar" className="w-[24px] h-[24px] object-contain" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-poppins font-semibold text-[15px] text-[#C69C6D] leading-tight">Berdiri</span>
                                        <span className="font-poppins font-normal text-[14px] text-[#4B2E2B] mt-1">
                                            {perusahaan?.tanggal_berdiri || "-"}
                                        </span>
                                    </div>
                                </div>

                                {/* Info Lokasi */}
                                <div className="flex items-start gap-[15px]">
                                    <div className="w-[30px] h-[30px] flex items-center justify-start shrink-0">
                                        <img src={iconLocation} alt="Location" className="w-[24px] h-[24px] object-contain" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-poppins font-semibold text-[15px] text-[#C69C6D] leading-tight">Lokasi</span>
                                        <span className="font-poppins font-normal text-[14px] text-[#4B2E2B] mt-1">
                                            {perusahaan?.alamat_perusahaan}
                                            {perusahaan?.kecamatan && !perusahaan?.alamat_perusahaan?.includes(perusahaan?.kecamatan) && `, ${perusahaan?.kecamatan}`}
                                            {", Indramayu"}
                                        </span>
                                    </div>
                                </div>

                                {/* Info Lowongan Aktif */}
                                <div className="flex items-start gap-[15px]">
                                    <div className="w-[30px] h-[30px] flex items-center justify-start shrink-0">
                                        <img src={briefcaseIcon} alt="Jobs" className="w-[24px] h-[24px] object-contain" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-poppins font-semibold text-[15px] text-[#C69C6D] leading-tight">Lowongan Aktif</span>
                                        <span className="font-poppins font-normal text-[14px] text-[#4B2E2B] mt-1">
                                            {perusahaan?.jumlah_lowongan} Lowongan
                                        </span>
                                    </div>
                                </div>

                            </div>

                            {/* Tombol Profil */}
                            <button 
                                onClick={() => navigate(`/perusahaan/${perusahaan?.id_perusahaan}`)}
                                className="w-full max-w-[467px] h-[51px] bg-[#C69C6D] rounded-[25px] font-poppins font-extrabold text-[20px] md:text-[24px] text-[#F3EDE6] mt-[40px] hover:bg-[#b0895f] transition-colors self-center"
                            >
                                Lihat Profil Perusahaan
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DetailLowongan;
