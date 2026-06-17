import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../komponen/umum/Navbar';
import layananAutentikasi from '../../layanan/layananAutentikasi';
import { masukDenganGoogle } from '../../layanan/firebase';
import CloudUploadFill from '../../aset/daftar/CloudUploadFill.svg';

const Daftar = () => {
    const location = useLocation();
    const [peran, setPeran] = useState(location.state?.activeTab || 'Pelamar');
    
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
    const [tampilkanKataSandi, setTampilkanKataSandi] = useState(false);
    const [tampilkanKonfirmasiSandi, setTampilkanKonfirmasiSandi] = useState(false);
    const [sedangMemuat, setSedangMemuat] = useState(false);
    const [sedangMemuatGoogle, setSedangMemuatGoogle] = useState(false);
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
            if (error.response?.status === 422 && error.response?.data?.errors) {
                const errors = error.response.data.errors;
                const errorMessages = Object.values(errors).map(err => err.join(', ')).join(' | ');
                setPesanGalat(`Validasi gagal: ${errorMessages}`);
            } else {
                setPesanGalat(error.response?.data?.message || 'Gagal mendaftar. Silakan coba lagi.');
            }
        } finally {
            setSedangMemuat(false);
        }
    };

    // Handler Daftar dengan Google (hanya untuk Pelamar)
    const menanganiGoogleDaftar = async () => {
        setSedangMemuatGoogle(true);
        setPesanGalat('');

        try {
            const hasilGoogle = await masukDenganGoogle();
            const user = hasilGoogle.user;

            // Kirim data ke backend Laravel untuk registrasi/login
            const respons = await layananAutentikasi.googleAuth({
                nama_pengguna: user.displayName || user.email.split('@')[0],
                email: user.email,
            });

            if (respons.token) {
                localStorage.setItem('token', respons.token);
                localStorage.setItem('peran', respons.data?.peran || 'Pelamar');
                localStorage.setItem('pengguna', JSON.stringify(respons.data));

                const userPeran = respons.data?.peran;
                if (userPeran === 'Admin_Perusahaan') {
                    navigate('/admin');
                } else {
                    navigate('/profil');
                }
            }
        } catch (error) {
            console.error('Google register error:', error);
            if (error.code === 'auth/popup-closed-by-user') {
                setPesanGalat('Popup Google ditutup. Silakan coba lagi.');
            } else {
                setPesanGalat(error.response?.data?.message || 'Gagal mendaftar dengan Google. Silakan coba lagi.');
            }
        } finally {
            setSedangMemuatGoogle(false);
        }
    };

    return (
        <div className="wadah-halaman-daftar min-h-screen bg-[#F3EDE6] font-poppins flex flex-col overflow-x-hidden overflow-y-auto">
            <Navbar />
            
            {/* Main Content Area */}
            <div className="area-konten-utama flex-1 flex flex-col md:flex-row w-full max-w-[1440px] mx-auto py-8">
                
                {/* Sisi Kiri: Sidebar Cokelat (Menempel di kiri) */}
                <div className="sisi-kiri-sidebar hidden md:flex w-[40%] max-w-[413px] min-h-[500px] bg-[#4B2E2B] rounded-r-3xl flex-col justify-start pt-[130px] px-8 shadow-lg">
                    <div className="teks-ajakan w-full">
                        <span className="teks-baris-1 text-[#C69C6D] text-2xl lg:text-3xl font-jakarta font-[800] leading-[1.4] break-words block">
                            Gabung bersama
                        </span>
                        <span className="teks-baris-2 text-[#F3EDE6] text-2xl lg:text-3xl font-jakarta italic font-[800] leading-[1.4] break-words block mt-[-5px]">
                            di cofe job.
                        </span>
                    </div>
                </div>

                {/* Sisi Kanan: Area Tabs & Form */}
                <div className="sisi-kanan-form w-full md:w-[60%] flex flex-col items-center justify-center p-6 lg:p-8">
                    <div className="wadah-konten flex flex-col items-center w-full max-w-md mx-auto gap-6">
                        
                        {/* Tab Seleksi Peran */}
                        <div className="tab-seleksi-peran w-full h-[60px] bg-[#C69C6D] rounded-full flex p-[4px] items-center shadow-sm">
                            <button
                                type="button"
                                onClick={() => setPeran('Pelamar')}
                                className={`tombol-tab flex-1 h-full rounded-full flex items-center justify-center transition-all ${
                                    peran === 'Pelamar' ? 'bg-white text-[#4B2E2B] shadow-sm' : 'text-[#4B2E2B] hover:bg-white/20'
                                }`}
                            >
                                <span className="teks-tombol text-[18px] font-bold">Pelamar</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setPeran('Admin_Perusahaan')}
                                className={`tombol-tab flex-1 h-full rounded-full flex items-center justify-center transition-all ${
                                    peran === 'Admin_Perusahaan' ? 'bg-white text-[#4B2E2B] shadow-sm' : 'text-[#4B2E2B] hover:bg-white/20'
                                }`}
                            >
                                <span className="teks-tombol text-[18px] font-bold">Perusahaan</span>
                            </button>
                        </div>

                        {/* Form Daftar */}
                        <div className="wadah-form-daftar w-full bg-white rounded-3xl p-6 md:p-8 shadow-lg">
                            <div className="header-form mb-6 text-center md:text-left">
                                <h1 className="judul-form text-[22px] font-bold text-[#4B2E2B] mb-1">
                                    {peran === 'Pelamar' ? 'Buat Akun untuk Careermu!' : 'Buat Akun untuk Bisnismu!'}
                                </h1>
                                <p className="sub-judul text-[15px] font-medium text-[#4B2E2B]">Gabung di cofe job</p>
                            </div>

                            {pesanGalat && (
                                <div className="area-galat bg-red-50 border-l-4 border-red-500 p-4 mb-5 rounded-lg">
                                    <p className="teks-galat text-red-700 text-sm">{pesanGalat}</p>
                                </div>
                            )}

                            {pesanSukses && (
                                <div className="area-sukses bg-green-50 border-l-4 border-green-500 p-4 mb-5 rounded-lg">
                                    <p className="teks-sukses text-green-700 text-sm">{pesanSukses}</p>
                                </div>
                            )}

                            <form onSubmit={menanganiDaftar} className="form-utama space-y-4">
                                {peran === 'Pelamar' ? (
                                    <>
                                        <div className="grup-input">
                                            <label className="label-input block text-[15px] text-[#4B2E2B] font-semibold mb-2" htmlFor="username">Username</label>
                                            <div className="relative">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4B2E2B]/50">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                                    </svg>
                                                </div>
                                                <input
                                                    id="username"
                                                    type="text"
                                                    value={namaLengkap}
                                                    onChange={(e) => setNamaLengkap(e.target.value)}
                                                    placeholder="Contoh: Budi Santoso"
                                                    className="input-field w-full pl-12 pr-5 py-3 h-[46px] rounded-[10px] border border-[#4B2E2B] focus:outline-none focus:ring-2 focus:ring-[#C69C6D]/50 focus:border-[#C69C6D] transition-all text-[#4B2E2B]"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="baris-input flex flex-col md:flex-row gap-4">
                                            <div className="grup-input flex-1">
                                                <label className="label-input block text-[15px] text-[#4B2E2B] font-semibold mb-2" htmlFor="namaCafe">Nama Cafe</label>
                                                <div className="relative">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4B2E2B]/50">
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.891 0 1.696-.394 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.891 0 1.696-.394 2.25-1.016a3.001 3.001 0 0 0 3.75.615m-16.5 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.891 0 1.696-.394 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.891 0 1.696-.394 2.25-1.016a3.001 3.001 0 0 0 3.75.615m-16.5 0V4.875c0-.621.504-1.125 1.125-1.125h14.25c.621 0 1.125.504 1.125 1.125V9.35m-16.5 0V21" />
                                                        </svg>
                                                    </div>
                                                    <input
                                                        id="namaCafe"
                                                        type="text"
                                                        value={namaCafe}
                                                        onChange={(e) => setNamaCafe(e.target.value)}
                                                        placeholder="Nama Kafe"
                                                        className="input-field w-full pl-12 pr-5 py-3 h-[46px] rounded-[10px] border border-[#4B2E2B] focus:outline-none focus:ring-2 focus:ring-[#C69C6D]/50 focus:border-[#C69C6D] transition-all text-[#4B2E2B]"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="grup-input flex-1">
                                                <label className="label-input block text-[15px] text-[#4B2E2B] font-semibold mb-2" htmlFor="namaPengelola">Nama Pengelola</label>
                                                <div className="relative">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4B2E2B]/50">
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                        </svg>
                                                    </div>
                                                    <input
                                                        id="namaPengelola"
                                                        type="text"
                                                        value={namaPengelola}
                                                        onChange={(e) => setNamaPengelola(e.target.value)}
                                                        placeholder="Nama HRD/Pengelola"
                                                        className="input-field w-full pl-12 pr-5 py-3 h-[46px] rounded-[10px] border border-[#4B2E2B] focus:outline-none focus:ring-2 focus:ring-[#C69C6D]/50 focus:border-[#C69C6D] transition-all text-[#4B2E2B]"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="grup-input">
                                    <label className="label-input block text-[15px] text-[#4B2E2B] font-semibold mb-2" htmlFor="email">
                                        {peran === 'Pelamar' ? 'Email' : 'Email Bisnis'}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4B2E2B]/50">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                                            </svg>
                                        </div>
                                        <input
                                            id="email"
                                            type="email"
                                            value={surel}
                                            onChange={(e) => setSurel(e.target.value)}
                                            placeholder="contoh@email.com"
                                            className="input-field w-full pl-12 pr-5 py-3 h-[46px] rounded-[10px] border border-[#4B2E2B] focus:outline-none focus:ring-2 focus:ring-[#C69C6D]/50 focus:border-[#C69C6D] transition-all text-[#4B2E2B]"
                                            required
                                        />
                                    </div>
                                </div>
                                
                                <div className="grup-input">
                                    <label className="label-input block text-[15px] text-[#4B2E2B] font-semibold mb-2" htmlFor="password">Password</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4B2E2B]/50">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                                            </svg>
                                        </div>
                                        <input
                                            id="password"
                                            type={tampilkanKataSandi ? "text" : "password"}
                                            value={kataSandi}
                                            onChange={(e) => setKataSandi(e.target.value)}
                                            placeholder="Minimal 8 karakter"
                                            className="input-field w-full pl-12 pr-12 py-3 h-[46px] rounded-[10px] border border-[#4B2E2B] focus:outline-none focus:ring-2 focus:ring-[#C69C6D]/50 focus:border-[#C69C6D] transition-all text-[#4B2E2B]"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setTampilkanKataSandi(!tampilkanKataSandi)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4B2E2B] hover:text-[#C69C6D] focus:outline-none"
                                        >
                                            {tampilkanKataSandi ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="grup-input">
                                    <label className="label-input block text-[15px] text-[#4B2E2B] font-semibold mb-2" htmlFor="konfirmasiPassword">Konfirmasi Password</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4B2E2B]/50">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                                            </svg>
                                        </div>
                                        <input
                                            id="konfirmasiPassword"
                                            type={tampilkanKonfirmasiSandi ? "text" : "password"}
                                            value={konfirmasiKataSandi}
                                            onChange={(e) => setKonfirmasiKataSandi(e.target.value)}
                                            placeholder="Ulangi password"
                                            className="input-field w-full pl-12 pr-12 py-3 h-[46px] rounded-[10px] border border-[#4B2E2B] focus:outline-none focus:ring-2 focus:ring-[#C69C6D]/50 focus:border-[#C69C6D] transition-all text-[#4B2E2B]"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setTampilkanKonfirmasiSandi(!tampilkanKonfirmasiSandi)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4B2E2B] hover:text-[#C69C6D] focus:outline-none"
                                        >
                                            {tampilkanKonfirmasiSandi ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {peran === 'Admin_Perusahaan' && (
                                    <>
                                        <div className="grup-input">
                                            <label className="label-input block text-[15px] text-[#4B2E2B] font-semibold mb-2" htmlFor="alamat">Alamat</label>
                                            <div className="relative">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4B2E2B]/50">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1 1 15 0Z" />
                                                    </svg>
                                                </div>
                                                <input
                                                    id="alamat"
                                                    type="text"
                                                    value={alamat}
                                                    onChange={(e) => setAlamat(e.target.value)}
                                                    placeholder="Alamat lengkap kafe"
                                                    className="input-field w-full pl-12 pr-5 py-3 h-[46px] rounded-[10px] border border-[#4B2E2B] focus:outline-none focus:ring-2 focus:ring-[#C69C6D]/50 focus:border-[#C69C6D] transition-all text-[#4B2E2B]"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grup-input">
                                            <label className="label-input block text-[15px] text-[#4B2E2B] font-semibold mb-2">Dokumen Izin Usaha/NIB</label>
                                            <div className="area-upload relative w-full h-[120px] bg-[#F5E8DF] rounded-[10px] border border-[#4B2E2B] flex flex-col items-center justify-center cursor-pointer hover:bg-[#ebdccc] transition-colors overflow-hidden">
                                                <input 
                                                    type="file" 
                                                    onChange={(e) => setDokumen(e.target.files[0])} 
                                                    className="input-file absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                                    accept=".pdf,.jpg,.jpeg,.png" 
                                                    required 
                                                />
                                                <div className="konten-upload flex flex-col items-center z-0">
                                                    <img src={CloudUploadFill} alt="Upload Icon" className="ikon-upload w-[40px] h-[40px]" />
                                                    <span className="teks-upload text-[13px] text-[#4B2E2B] mt-2 font-medium px-4 text-center">
                                                        {dokumen ? dokumen.name : 'Upload dengan format Pdf (max 10mb)'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="area-navigasi-bawah flex items-center gap-1 mt-1">
                                    <span className="teks-bawah text-[13px] font-medium text-[#4B2E2B]">Sudah punya akun? </span>
                                    <Link to="/masuk" className="tautan-masuk text-[#C69C6D] text-[13px] font-medium hover:underline">
                                        Login disini
                                    </Link>
                                </div>

                                <div className="area-tombol pt-3">
                                    <button
                                        type="submit"
                                        disabled={sedangMemuat}
                                        className="tombol-daftar w-full bg-[#C69C6D] h-[46px] text-[#4B2E2B] font-bold text-[16px] rounded-full hover:bg-[#b88c5d] transition-all shadow-md active:scale-[0.98] disabled:opacity-70 flex items-center justify-center"
                                    >
                                        {sedangMemuat ? 'Memproses...' : 'Daftar'}
                                    </button>
                                </div>
                            </form>

                            {/* Google Sign Up — hanya tampil untuk Pelamar */}
                            {peran === 'Pelamar' && (
                                <>
                                    {/* Divider */}
                                    <div className="pemisah flex items-center my-5">
                                        <div className="flex-1 h-[1px] bg-[#D5C4B3]"></div>
                                        <span className="teks-pemisah px-4 text-[13px] text-[#8B7355] font-medium">atau</span>
                                        <div className="flex-1 h-[1px] bg-[#D5C4B3]"></div>
                                    </div>

                                    {/* Tombol Daftar Google */}
                                    <button
                                        type="button"
                                        onClick={menanganiGoogleDaftar}
                                        disabled={sedangMemuatGoogle}
                                        className="tombol-google w-full h-[46px] bg-white border-2 border-[#4B2E2B] rounded-full flex items-center justify-center gap-3 hover:bg-[#F9F5F0] transition-all shadow-sm active:scale-[0.98] disabled:opacity-70 cursor-pointer"
                                    >
                                        {/* Google Icon SVG */}
                                        <svg width="20" height="20" viewBox="0 0 48 48">
                                            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                                            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                                            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                                            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                                        </svg>
                                        <span className="teks-google text-[15px] font-semibold text-[#4B2E2B]">
                                            {sedangMemuatGoogle ? 'Memproses...' : 'Daftar dengan Google'}
                                        </span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Daftar;
