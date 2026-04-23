import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../komponen/umum/Navbar';
import layananAutentikasi from '../../layanan/layananAutentikasi';
import CloudUploadFill from '../../aset/daftar/CloudUploadFill.svg';

const Daftar = () => {
    const [peran, setPeran] = useState('Pelamar');
    
    // State Form Pelamar
    const [namaLengkap, setNamaLengkap] = useState('');
    
    // State Form Perusahaan
    const [namaCafe, setNamaCafe] = useState('');
    const [namaPengelola, setNamaPengelola] = useState('');
    const [alamat, setAlamat] = useState('');
    const [dokumen, setDokumen] = useState(null);
    
    // State Umum
    const [surel, setSurel] = useState('');
    const [kataSandi, setKataSandi] = useState('');
    const [konfirmasiKataSandi, setKonfirmasiKataSandi] = useState('');
    const [sedangMemuat, setSedangMemuat] = useState(false);
    const [pesanGalat, setPesanGalat] = useState('');
    const [pesanSukses, setPesanSukses] = useState('');
    
    const navigate = useNavigate();

    const menanganiDaftar = async (e) => {
        e.preventDefault();
        setSedangMemuat(true);
        setPesanGalat('');
        setPesanSukses('');

        if (kataSandi !== konfirmasiKataSandi) {
            setPesanGalat('Kata sandi dan konfirmasi tidak cocok.');
            setSedangMemuat(false);
            return;
        }

        try {
            let payload;
            let endpoint;

            if (peran === 'Pelamar') {
                endpoint = '/auth/daftar-pelamar';
                payload = {
                    nama_pengguna: namaLengkap,
                    email: surel,
                    kata_sandi: kataSandi,
                    konfirmasi_kata_sandi: konfirmasiKataSandi,
                    peran: peran
                };
            } else {
                endpoint = '/auth/register/perusahaan'; // Match backend route
                payload = new FormData();
                payload.append('nama_kafe', namaCafe);
                payload.append('nama_pengelola', namaPengelola);
                payload.append('email', surel);
                payload.append('kata_sandi', kataSandi);
                payload.append('konfirmasi_kata_sandi', konfirmasiKataSandi);
                payload.append('alamat', alamat);
                if (dokumen) {
                    payload.append('dokumen_legalitas', dokumen);
                }
            }
            
            await layananAutentikasi.daftar(payload, endpoint);

            setPesanSukses('Pendaftaran berhasil! Silakan login.');
            setTimeout(() => {
                navigate('/masuk');
            }, 2000);
            
        } catch (error) {
            console.error('Registration error:', error);
            setPesanGalat(error.response?.data?.message || 'Gagal mendaftar. Silakan coba lagi.');
        } finally {
            setSedangMemuat(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F3EDE6] font-poppins flex flex-col overflow-x-hidden">
            <Navbar />
            
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col md:flex-row w-full max-w-[1440px] mx-auto py-8">
                
                {/* Sisi Kiri: Sidebar Cokelat (Menempel di kiri) */}
                <div className="hidden md:flex w-[40%] max-w-[413px] min-h-[600px] bg-[#4B2E2B] rounded-r-[50px] flex-col justify-start pt-[130px] px-10 shadow-lg">
                    <div className="w-full">
                        <span className="text-[#C69C6D] text-[32px] lg:text-[36px] font-jakarta font-[800] leading-[1.4] break-words block">
                            Gabung bersama
                        </span>
                        <span className="text-[#F3EDE6] text-[32px] lg:text-[36px] font-jakarta italic font-[800] leading-[1.4] break-words block mt-[-5px]">
                            di cofe job.
                        </span>
                    </div>
                </div>

                {/* Sisi Kanan: Area Tabs & Form */}
                <div className="w-full md:w-[60%] flex flex-col items-center justify-center p-6 lg:p-10">
                    <div className="flex flex-col items-center w-full max-w-[500px] mx-auto gap-6">
                        
                        {/* Tab Seleksi Peran */}
                        <div className="w-full h-[60px] bg-[#C69C6D] rounded-[50px] flex p-[4px] items-center shadow-sm">
                            <button
                                type="button"
                                onClick={() => setPeran('Pelamar')}
                                className={`flex-1 h-full rounded-[50px] flex items-center justify-center transition-all ${
                                    peran === 'Pelamar' ? 'bg-white text-[#4B2E2B] shadow-sm' : 'text-[#4B2E2B] hover:bg-white/20'
                                }`}
                            >
                                <span className="text-[18px] font-bold">Pelamar</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setPeran('Admin_Perusahaan')}
                                className={`flex-1 h-full rounded-[50px] flex items-center justify-center transition-all ${
                                    peran === 'Admin_Perusahaan' ? 'bg-white text-[#4B2E2B] shadow-sm' : 'text-[#4B2E2B] hover:bg-white/20'
                                }`}
                            >
                                <span className="text-[18px] font-bold">Perusahaan</span>
                            </button>
                        </div>

                        {/* Form Daftar */}
                        <div className="w-full bg-white rounded-[40px] p-8 md:p-10 shadow-lg">
                            <div className="mb-6 text-center md:text-left">
                                <h1 className="text-[22px] font-bold text-[#4B2E2B] mb-1">
                                    {peran === 'Pelamar' ? 'Buat Akun untuk Careermu!' : 'Buat Akun untuk Bisnismu!'}
                                </h1>
                                <p className="text-[15px] font-medium text-[#4B2E2B]">Gabung di cofe job</p>
                            </div>

                            {pesanGalat && (
                                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-5 rounded-lg">
                                    <p className="text-red-700 text-sm">{pesanGalat}</p>
                                </div>
                            )}

                            {pesanSukses && (
                                <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-5 rounded-lg">
                                    <p className="text-green-700 text-sm">{pesanSukses}</p>
                                </div>
                            )}

                            <form onSubmit={menanganiDaftar} className="space-y-4">
                                {peran === 'Pelamar' ? (
                                    <>
                                        <div>
                                            <label className="block text-[15px] text-[#4B2E2B] font-semibold mb-2" htmlFor="username">Username</label>
                                            <input
                                                id="username"
                                                type="text"
                                                value={namaLengkap}
                                                onChange={(e) => setNamaLengkap(e.target.value)}
                                                className="w-full px-5 py-3 h-[46px] rounded-[10px] border border-[#4B2E2B] focus:outline-none focus:ring-2 focus:ring-[#C69C6D]/50 focus:border-[#C69C6D] transition-all text-[#4B2E2B]"
                                                required
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex flex-col md:flex-row gap-4">
                                            <div className="flex-1">
                                                <label className="block text-[15px] text-[#4B2E2B] font-semibold mb-2" htmlFor="namaCafe">Nama Cafe</label>
                                                <input
                                                    id="namaCafe"
                                                    type="text"
                                                    value={namaCafe}
                                                    onChange={(e) => setNamaCafe(e.target.value)}
                                                    className="w-full px-5 py-3 h-[46px] rounded-[10px] border border-[#4B2E2B] focus:outline-none focus:ring-2 focus:ring-[#C69C6D]/50 focus:border-[#C69C6D] transition-all text-[#4B2E2B]"
                                                    required
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-[15px] text-[#4B2E2B] font-semibold mb-2" htmlFor="namaPengelola">Nama Pengelola/HRD</label>
                                                <input
                                                    id="namaPengelola"
                                                    type="text"
                                                    value={namaPengelola}
                                                    onChange={(e) => setNamaPengelola(e.target.value)}
                                                    className="w-full px-5 py-3 h-[46px] rounded-[10px] border border-[#4B2E2B] focus:outline-none focus:ring-2 focus:ring-[#C69C6D]/50 focus:border-[#C69C6D] transition-all text-[#4B2E2B]"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div>
                                    <label className="block text-[15px] text-[#4B2E2B] font-semibold mb-2" htmlFor="email">
                                        {peran === 'Pelamar' ? 'Email' : 'Email Bisnis'}
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={surel}
                                        onChange={(e) => setSurel(e.target.value)}
                                        className="w-full px-5 py-3 h-[46px] rounded-[10px] border border-[#4B2E2B] focus:outline-none focus:ring-2 focus:ring-[#C69C6D]/50 focus:border-[#C69C6D] transition-all text-[#4B2E2B]"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-[15px] text-[#4B2E2B] font-semibold mb-2" htmlFor="password">Password</label>
                                    <input
                                        id="password"
                                        type="password"
                                        value={kataSandi}
                                        onChange={(e) => setKataSandi(e.target.value)}
                                        className="w-full px-5 py-3 h-[46px] rounded-[10px] border border-[#4B2E2B] focus:outline-none focus:ring-2 focus:ring-[#C69C6D]/50 focus:border-[#C69C6D] transition-all text-[#4B2E2B]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-[15px] text-[#4B2E2B] font-semibold mb-2" htmlFor="konfirmasiPassword">Konfirmasi Password</label>
                                    <input
                                        id="konfirmasiPassword"
                                        type="password"
                                        value={konfirmasiKataSandi}
                                        onChange={(e) => setKonfirmasiKataSandi(e.target.value)}
                                        className="w-full px-5 py-3 h-[46px] rounded-[10px] border border-[#4B2E2B] focus:outline-none focus:ring-2 focus:ring-[#C69C6D]/50 focus:border-[#C69C6D] transition-all text-[#4B2E2B]"
                                        required
                                    />
                                </div>

                                {peran === 'Admin_Perusahaan' && (
                                    <>
                                        <div>
                                            <label className="block text-[15px] text-[#4B2E2B] font-semibold mb-2" htmlFor="alamat">Alamat</label>
                                            <input
                                                id="alamat"
                                                type="text"
                                                value={alamat}
                                                onChange={(e) => setAlamat(e.target.value)}
                                                className="w-full px-5 py-3 h-[46px] rounded-[10px] border border-[#4B2E2B] focus:outline-none focus:ring-2 focus:ring-[#C69C6D]/50 focus:border-[#C69C6D] transition-all text-[#4B2E2B]"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[15px] text-[#4B2E2B] font-semibold mb-2">Dokumen Izin Usaha/NIB</label>
                                            <div className="relative w-full h-[120px] bg-[#F5E8DF] rounded-[10px] border border-[#4B2E2B] flex flex-col items-center justify-center cursor-pointer hover:bg-[#ebdccc] transition-colors overflow-hidden">
                                                <input 
                                                    type="file" 
                                                    onChange={(e) => setDokumen(e.target.files[0])} 
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                                    accept=".pdf,.jpg,.jpeg,.png" 
                                                    required 
                                                />
                                                <div className="flex flex-col items-center z-0">
                                                    <img src={CloudUploadFill} alt="Upload Icon" className="w-[40px] h-[40px]" />
                                                    <span className="text-[13px] text-[#4B2E2B] mt-2 font-medium px-4 text-center">
                                                        {dokumen ? dokumen.name : 'Upload dengan format Pdf (max 10mb)'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="flex items-center gap-1 mt-1">
                                    <span className="text-[13px] font-medium text-[#4B2E2B]">Sudah punya akun? </span>
                                    <Link to="/masuk" className="text-[#C69C6D] text-[13px] font-medium hover:underline">
                                        Login disini
                                    </Link>
                                </div>

                                <div className="pt-3">
                                    <button
                                        type="submit"
                                        disabled={sedangMemuat}
                                        className="w-full bg-[#C69C6D] h-[46px] text-[#4B2E2B] font-bold text-[16px] rounded-[50px] hover:bg-[#b88c5d] transition-all shadow-md active:scale-[0.98] disabled:opacity-70 flex items-center justify-center"
                                    >
                                        {sedangMemuat ? 'Memproses...' : 'Daftar'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Daftar;
