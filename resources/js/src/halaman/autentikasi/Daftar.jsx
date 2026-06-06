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
        <div className="wadah-halaman-daftar min-h-screen bg-[#F3EDE6] font-poppins flex flex-col overflow-x-hidden">
            <Navbar />
            
            {/* Main Content Area */}
            <div className="area-konten-utama flex-1 flex flex-col md:flex-row w-full max-w-[1440px] mx-auto py-8">
                
                {/* Sisi Kiri: Sidebar Cokelat (Menempel di kiri) */}
                <div className="sisi-kiri-sidebar hidden md:flex w-[40%] max-w-[413px] min-h-[600px] bg-[#4B2E2B] rounded-r-[50px] flex-col justify-start pt-[130px] px-10 shadow-lg">
                    <div className="teks-ajakan w-full">
                        <span className="teks-baris-1 text-[#C69C6D] text-[32px] lg:text-[36px] font-jakarta font-[800] leading-[1.4] break-words block">
                            Gabung bersama
                        </span>
                        <span className="teks-baris-2 text-[#F3EDE6] text-[32px] lg:text-[36px] font-jakarta italic font-[800] leading-[1.4] break-words block mt-[-5px]">
                            di cofe job.
                        </span>
                    </div>
                </div>

                {/* Sisi Kanan: Area Tabs & Form */}
                <div className="sisi-kanan-form w-full md:w-[60%] flex flex-col items-center justify-center p-6 lg:p-10">
                    <div className="wadah-konten flex flex-col items-center w-full max-w-[500px] mx-auto gap-6">
                        
                        {/* Tab Seleksi Peran */}
                        <div className="tab-seleksi-peran w-full h-[60px] bg-[#C69C6D] rounded-[50px] flex p-[4px] items-center shadow-sm">
                            <button
                                type="button"
                                onClick={() => setPeran('Pelamar')}
                                className={`tombol-tab flex-1 h-full rounded-[50px] flex items-center justify-center transition-all ${
                                    peran === 'Pelamar' ? 'bg-white text-[#4B2E2B] shadow-sm' : 'text-[#4B2E2B] hover:bg-white/20'
                                }`}
                            >
                                <span className="teks-tombol text-[18px] font-bold">Pelamar</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setPeran('Admin_Perusahaan')}
                                className={`tombol-tab flex-1 h-full rounded-[50px] flex items-center justify-center transition-all ${
                                    peran === 'Admin_Perusahaan' ? 'bg-white text-[#4B2E2B] shadow-sm' : 'text-[#4B2E2B] hover:bg-white/20'
                                }`}
                            >
                                <span className="teks-tombol text-[18px] font-bold">Perusahaan</span>
                            </button>
                        </div>

                        {/* Form Daftar */}
                        <div className="wadah-form-daftar w-full bg-white rounded-[40px] p-8 md:p-10 shadow-lg">
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
                                            <input
                                                id="username"
                                                type="text"
                                                value={namaLengkap}
                                                onChange={(e) => setNamaLengkap(e.target.value)}
                                                className="input-field w-full px-5 py-3 h-[46px] rounded-[10px] border border-[#4B2E2B] focus:outline-none focus:ring-2 focus:ring-[#C69C6D]/50 focus:border-[#C69C6D] transition-all text-[#4B2E2B]"
                                                required
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="baris-input flex flex-col md:flex-row gap-4">
                                            <div className="grup-input flex-1">
                                                <label className="label-input block text-[15px] text-[#4B2E2B] font-semibold mb-2" htmlFor="namaCafe">Nama Cafe</label>
                                                <input
                                                    id="namaCafe"
                                                    type="text"
                                                    value={namaCafe}
                                                    onChange={(e) => setNamaCafe(e.target.value)}
                                                    className="input-field w-full px-5 py-3 h-[46px] rounded-[10px] border border-[#4B2E2B] focus:outline-none focus:ring-2 focus:ring-[#C69C6D]/50 focus:border-[#C69C6D] transition-all text-[#4B2E2B]"
                                                    required
                                                />
                                            </div>
                                            <div className="grup-input flex-1">
                                                <label className="label-input block text-[15px] text-[#4B2E2B] font-semibold mb-2" htmlFor="namaPengelola">Nama Pengelola/HRD</label>
                                                <input
                                                    id="namaPengelola"
                                                    type="text"
                                                    value={namaPengelola}
                                                    onChange={(e) => setNamaPengelola(e.target.value)}
                                                    className="input-field w-full px-5 py-3 h-[46px] rounded-[10px] border border-[#4B2E2B] focus:outline-none focus:ring-2 focus:ring-[#C69C6D]/50 focus:border-[#C69C6D] transition-all text-[#4B2E2B]"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="grup-input">
                                    <label className="label-input block text-[15px] text-[#4B2E2B] font-semibold mb-2" htmlFor="email">
                                        {peran === 'Pelamar' ? 'Email' : 'Email Bisnis'}
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={surel}
                                        onChange={(e) => setSurel(e.target.value)}
                                        className="input-field w-full px-5 py-3 h-[46px] rounded-[10px] border border-[#4B2E2B] focus:outline-none focus:ring-2 focus:ring-[#C69C6D]/50 focus:border-[#C69C6D] transition-all text-[#4B2E2B]"
                                        required
                                    />
                                </div>
                                
                                <div className="grup-input">
                                    <label className="label-input block text-[15px] text-[#4B2E2B] font-semibold mb-2" htmlFor="password">Password</label>
                                    <input
                                        id="password"
                                        type="password"
                                        value={kataSandi}
                                        onChange={(e) => setKataSandi(e.target.value)}
                                        className="input-field w-full px-5 py-3 h-[46px] rounded-[10px] border border-[#4B2E2B] focus:outline-none focus:ring-2 focus:ring-[#C69C6D]/50 focus:border-[#C69C6D] transition-all text-[#4B2E2B]"
                                        required
                                    />
                                </div>

                                <div className="grup-input">
                                    <label className="label-input block text-[15px] text-[#4B2E2B] font-semibold mb-2" htmlFor="konfirmasiPassword">Konfirmasi Password</label>
                                    <input
                                        id="konfirmasiPassword"
                                        type="password"
                                        value={konfirmasiKataSandi}
                                        onChange={(e) => setKonfirmasiKataSandi(e.target.value)}
                                        className="input-field w-full px-5 py-3 h-[46px] rounded-[10px] border border-[#4B2E2B] focus:outline-none focus:ring-2 focus:ring-[#C69C6D]/50 focus:border-[#C69C6D] transition-all text-[#4B2E2B]"
                                        required
                                    />
                                </div>

                                {peran === 'Admin_Perusahaan' && (
                                    <>
                                        <div className="grup-input">
                                            <label className="label-input block text-[15px] text-[#4B2E2B] font-semibold mb-2" htmlFor="alamat">Alamat</label>
                                            <input
                                                id="alamat"
                                                type="text"
                                                value={alamat}
                                                onChange={(e) => setAlamat(e.target.value)}
                                                className="input-field w-full px-5 py-3 h-[46px] rounded-[10px] border border-[#4B2E2B] focus:outline-none focus:ring-2 focus:ring-[#C69C6D]/50 focus:border-[#C69C6D] transition-all text-[#4B2E2B]"
                                                required
                                            />
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
                                        className="tombol-daftar w-full bg-[#C69C6D] h-[46px] text-[#4B2E2B] font-bold text-[16px] rounded-[50px] hover:bg-[#b88c5d] transition-all shadow-md active:scale-[0.98] disabled:opacity-70 flex items-center justify-center"
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
                                        className="tombol-google w-full h-[46px] bg-white border-2 border-[#4B2E2B] rounded-[50px] flex items-center justify-center gap-3 hover:bg-[#F9F5F0] transition-all shadow-sm active:scale-[0.98] disabled:opacity-70 cursor-pointer"
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
