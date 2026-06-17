import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import api from '../../../layanan/api';
import placeholderProfile from '../../../aset/profil/placeholder_profil.jpg';
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
    
    const [dataLowongan, setDataLowongan] = useState(lowonganProp || state?.job || null);
    const [sedangMemuat, setSedangMemuat] = useState(!lowonganProp && !state?.job);
    const [error, setError] = useState(null);

    useEffect(() => {
        const ambilDetailLowongan = async () => {
            try {
                if (!dataLowongan) setSedangMemuat(true);
                const respons = await api.get(`/lowongan/${id}`, { timeout: 10000 });
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
            navigate('/melamar', { state: { lowongan: dataLowongan } });
        } else {
            navigate('/masuk');
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

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
        <div className="w-full min-h-screen bg-[#F3EDE6] font-poppins pb-12 flex flex-col">
            <div className="w-full h-[180px] bg-[#4B2E2B] flex items-center shrink-0">
                <div className="w-full max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4 md:gap-6">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-[#F3EDE6] rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                            <img src={lowongan.logo_kafe || placeholderProfile} alt={lowongan.nama_kafe} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <h1 className="font-poppins font-bold text-xl md:text-2xl text-[#F3EDE6] leading-tight">
                                {lowongan.posisi}
                            </h1>
                            <p className="font-poppins font-normal text-sm md:text-base text-[#F3EDE6]">
                                {lowongan.nama_kafe}
                            </p>
                            <div className="bg-[#F3EDE6] rounded-full h-5 inline-flex items-center px-2.5 w-fit">
                                <div className="flex items-center gap-1">
                                    <img src={iconLokasiMini} alt="Location" className="w-[9px] h-[11px] object-contain" />
                                    <span className="font-inter font-normal text-[10px] text-[#4B2E2B] leading-none">
                                        {lowongan.lokasi}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button onClick={handleLamar} className="h-10 px-6 bg-[#C69C6D] rounded-lg font-inter font-bold text-sm text-[#F3EDE6] hover:bg-[#b0895f] transition-colors flex items-center justify-center">
                            Lamar Sekarang
                        </button>
                        <button onClick={handleBack} className="h-10 px-4 border border-[#F3EDE6] rounded-lg font-inter font-bold text-sm text-[#C69C6D] hover:bg-[#F3EDE6]/10 transition-colors flex items-center justify-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                            Kembali
                        </button>
                    </div>
                </div>
            </div>

            <div className="w-full max-w-6xl mx-auto px-6 mt-6 flex flex-col lg:flex-row gap-8 lg:gap-12">
                <div className="flex-1 flex flex-col">
                    <h2 className="font-poppins font-bold text-lg text-[#4B2E2B] mb-2">Deskripsi Pekerjaan</h2>
                    <div className="font-poppins font-normal text-sm text-[#C69C6D] leading-relaxed mb-8 text-justify whitespace-pre-line">
                        {lowongan.deskripsi}
                    </div>

                    <h2 className="font-poppins font-bold text-lg text-[#4B2E2B] mb-3">Persyaratan & Kualifikasi</h2>
                    <div className="font-poppins font-normal text-sm text-[#C69C6D] leading-relaxed text-justify whitespace-pre-line">
                        {lowongan.persyaratan}
                    </div>
                </div>

                <div className="w-full lg:w-[380px] shrink-0 flex flex-col">
                    <div className="w-full border-2 border-[#C69C6D] rounded-2xl overflow-hidden bg-transparent flex flex-col relative">
                        <div className="w-full h-[100px] bg-[#C69C6D] shrink-0" />
                        <div className="absolute top-[40px] left-6 w-[80px] h-[80px] bg-[#F3EDE6] rounded-lg flex items-center justify-center border border-[#C69C6D]/20 shadow-lg overflow-hidden">
                            <img src={perusahaan?.logo_perusahaan || placeholderProfile} alt={perusahaan?.nama_perusahaan} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col px-6 mt-12 pb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <h3 className="font-poppins font-bold text-base text-[#C69C6D] line-clamp-1">
                                    {perusahaan?.nama_perusahaan}
                                </h3>
                                {perusahaan?.status_verifikasi === 'Diterima' && (
                                    <img src={verifiedBadge} alt="Verified" className="w-4 h-4 object-contain" />
                                )}
                            </div>
                            <p className="font-poppins font-normal text-sm text-[#C69C6D] leading-snug mb-4">
                                &ldquo;{perusahaan?.deskripsi || "Perusahaan kafe yang berdedikasi memberikan pengalaman kopi terbaik."}&rdquo;
                            </p>
                            <div className="w-full border-t border-[#C69C6D] pt-4 flex flex-col gap-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-5 h-5 flex items-center justify-start shrink-0">
                                        <img src={calendarIcon} alt="Calendar" className="w-4 h-4 object-contain" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-poppins font-semibold text-xs text-[#C69C6D] leading-tight">Berdiri</span>
                                        <span className="font-poppins font-normal text-xs text-[#4B2E2B] mt-0.5">
                                            {perusahaan?.tanggal_berdiri || "-"}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-5 h-5 flex items-center justify-start shrink-0">
                                        <img src={iconLocation} alt="Location" className="w-4 h-4 object-contain" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-poppins font-semibold text-xs text-[#C69C6D] leading-tight">Lokasi</span>
                                        <span className="font-poppins font-normal text-xs text-[#4B2E2B] mt-0.5">
                                            {perusahaan?.alamat_perusahaan}
                                            {perusahaan?.kecamatan && !perusahaan?.alamat_perusahaan?.includes(perusahaan?.kecamatan) && `, ${perusahaan?.kecamatan}`}
                                            {", Indramayu"}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-5 h-5 flex items-center justify-start shrink-0">
                                        <img src={briefcaseIcon} alt="Jobs" className="w-4 h-4 object-contain" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-poppins font-semibold text-xs text-[#C69C6D] leading-tight">Lowongan Aktif</span>
                                        <span className="font-poppins font-normal text-xs text-[#4B2E2B] mt-0.5">
                                            {perusahaan?.jumlah_lowongan} Lowongan
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => navigate(`/perusahaan/${perusahaan?.id_perusahaan}`)}
                                className="w-full h-10 bg-[#C69C6D] rounded-full font-poppins font-bold text-sm text-[#F3EDE6] mt-6 hover:bg-[#b0895f] transition-colors"
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
