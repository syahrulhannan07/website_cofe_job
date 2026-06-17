import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../komponen/umum/Navbar';
import layananAutentikasi from '../../layanan/layananAutentikasi';
import { masukDenganGoogle } from '../../layanan/firebase';

const Masuk = () => {
    const [surel, setSurel] = useState('');
    const [kataSandi, setKataSandi] = useState('');
    const [tampilkanKataSandi, setTampilkanKataSandi] = useState(false);
    const [sedangMemuat, setSedangMemuat] = useState(false);
    const [sedangMemuatGoogle, setSedangMemuatGoogle] = useState(false);
    const [pesanGalat, setPesanGalat] = useState('');
    const navigate = useNavigate();

    // State untuk modal Lupa Password
    const [tampilkanLupaPassword, setTampilkanLupaPassword] = useState(false);
    const [emailReset, setEmailReset] = useState('');
    const [sedangKirimReset, setSedangKirimReset] = useState(false);
    const [pesanResetSukses, setPesanResetSukses] = useState('');
    const [pesanResetGalat, setPesanResetGalat] = useState('');

    const menanganiMasuk = async (e) => {
        e.preventDefault();
        setSedangMemuat(true);
        setPesanGalat('');

        try {
            const respons = await layananAutentikasi.masuk({
                email: surel,
                kata_sandi: kataSandi
            });

            // Simpan token dan data pengguna
            if (respons.data && respons.data.token) {
                localStorage.setItem('token', respons.data.token);
                localStorage.setItem('peran', respons.data.pengguna.peran);
                localStorage.setItem('pengguna', JSON.stringify(respons.data.pengguna));
                
                // Redirect based on role
                const userPeran = respons.data.pengguna.peran;
                if (userPeran === 'Pelamar') {
                    navigate('/profil');
                } else if (userPeran === 'Admin_Perusahaan') {
                    navigate('/admin');
                } else if (userPeran === 'Super_Admin') {
                    navigate('/super-admin');
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            setPesanGalat(error.response?.data?.message || 'Gagal masuk. Periksa kembali email dan kata sandi Anda.');
        } finally {
            setSedangMemuat(false);
        }
    };

    // Handler Login dengan Google
    const menanganiGoogleLogin = async () => {
        setSedangMemuatGoogle(true);
        setPesanGalat('');

        try {
            const hasilGoogle = await masukDenganGoogle();
            const user = hasilGoogle.user;

            // Kirim data ke backend Laravel untuk mendapatkan JWT token
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
                } else if (userPeran === 'Super_Admin') {
                    navigate('/super-admin');
                } else {
                    navigate('/profil');
                }
            }
        } catch (error) {
            console.error('Google login error:', error);
            if (error.code === 'auth/popup-closed-by-user') {
                setPesanGalat('Popup Google ditutup. Silakan coba lagi.');
            } else {
                setPesanGalat(error.response?.data?.message || 'Gagal masuk dengan Google. Silakan coba lagi.');
            }
        } finally {
            setSedangMemuatGoogle(false);
        }
    };

    // Handler Lupa Password
    const menanganiLupaPassword = async (e) => {
        e.preventDefault();
        setSedangKirimReset(true);
        setPesanResetGalat('');
        setPesanResetSukses('');

        try {
            await layananAutentikasi.forgotPassword(emailReset);
            setPesanResetSukses('Email reset password telah dikirim! Silakan cek inbox atau folder spam Anda.');
            setTimeout(() => {
                setTampilkanLupaPassword(false);
                setPesanResetSukses('');
                setEmailReset('');
            }, 4000);
        } catch (error) {
            console.error('Reset password error:', error);
            setPesanResetGalat(error.response?.data?.message || 'Gagal mengirim email reset. Silakan coba lagi.');
        } finally {
            setSedangKirimReset(false);
        }
    };

    return (
        <div className="wadah-halaman-masuk min-h-screen bg-[#F3EDE6] font-poppins flex flex-col overflow-x-hidden overflow-y-auto">
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
                        
                        {/* Tab Static (Masuk) */}
                        <div className="tab-masuk w-full h-[60px] bg-[#C69C6D] rounded-full flex items-center justify-center shadow-sm">
                            <span className="teks-tab text-[18px] font-bold text-[#4B2E2B]">Masuk</span>
                        </div>

                        {/* Form Login */}
                        <div className="wadah-form-login w-full bg-white rounded-3xl p-6 md:p-8 shadow-lg">
                            <div className="header-form mb-6 text-center md:text-left">
                                <h1 className="judul-form text-[22px] font-bold text-[#4B2E2B] mb-1">Masuk dan temukan Careermu!</h1>
                            </div>

                            {pesanGalat && (
                                <div className="area-galat bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
                                    <p className="teks-galat text-red-700 text-sm">{pesanGalat}</p>
                                </div>
                            )}

                            <form onSubmit={menanganiMasuk} className="form-utama space-y-5">
                                <div className="grup-input">
                                    <label className="label-input block text-[15px] text-[#4B2E2B] font-semibold mb-2" htmlFor="email">Email</label>
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
                                            placeholder="Masukkan email Anda"
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
                                            placeholder="Masukkan password"
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

                                {/* Lupa Password & Daftar Links */}
                                <div className="area-navigasi-bawah flex items-center justify-between mt-1">
                                    <div className="flex items-center gap-1">
                                        <span className="teks-bawah text-[13px] font-medium text-[#4B2E2B]">Belum punya akun? </span>
                                        <Link to="/daftar" className="tautan-daftar text-[#C69C6D] text-[13px] font-medium hover:underline">
                                            Daftar disini
                                        </Link>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setTampilkanLupaPassword(true);
                                            setPesanResetGalat('');
                                            setPesanResetSukses('');
                                            setEmailReset('');
                                        }}
                                        className="tautan-lupa-password text-[#C69C6D] text-[13px] font-medium hover:underline cursor-pointer bg-transparent border-none"
                                    >
                                        Lupa Password?
                                    </button>
                                </div>

                                <div className="area-tombol pt-3">
                                    <button
                                        type="submit"
                                        disabled={sedangMemuat}
                                        className="tombol-masuk w-full bg-[#C69C6D] h-[46px] text-[#4B2E2B] font-bold text-[16px] rounded-full hover:bg-[#b88c5d] transition-all shadow-md active:scale-[0.98] disabled:opacity-70 flex items-center justify-center"
                                    >
                                        {sedangMemuat ? 'Memproses...' : 'Masuk'}
                                    </button>
                                </div>
                            </form>

                            {/* Divider */}
                            <div className="pemisah flex items-center my-5">
                                <div className="flex-1 h-[1px] bg-[#D5C4B3]"></div>
                                <span className="teks-pemisah px-4 text-[13px] text-[#8B7355] font-medium">atau</span>
                                <div className="flex-1 h-[1px] bg-[#D5C4B3]"></div>
                            </div>

                            {/* Tombol Login Google */}
                            <button
                                type="button"
                                onClick={menanganiGoogleLogin}
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
                                    {sedangMemuatGoogle ? 'Memproses...' : 'Masuk dengan Google'}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Lupa Password */}
            {tampilkanLupaPassword && (
                <div className="modal-overlay fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="modal-konten bg-white rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl relative animate-[fadeIn_0.3s_ease-out]">
                        {/* Tombol Tutup */}
                        <button
                            type="button"
                            onClick={() => {
                                setTampilkanLupaPassword(false);
                                setPesanResetGalat('');
                                setPesanResetSukses('');
                            }}
                            className="tombol-tutup-modal absolute top-4 right-5 text-[#4B2E2B] hover:text-[#C69C6D] text-[24px] font-bold bg-transparent border-none cursor-pointer transition-colors"
                        >
                            ✕
                        </button>

                        {/* Header */}
                        <div className="header-modal mb-6">
                            <h2 className="judul-modal text-[22px] font-bold text-[#4B2E2B] mb-2">Lupa Password?</h2>
                            <p className="deskripsi-modal text-[14px] text-[#7A6555] leading-relaxed">
                                Masukkan alamat email yang terdaftar. Kami akan mengirimkan link untuk mereset password Anda melalui Firebase.
                            </p>
                        </div>

                        {/* Pesan Sukses */}
                        {pesanResetSukses && (
                            <div className="area-sukses bg-green-50 border-l-4 border-green-500 p-4 mb-5 rounded-lg">
                                <p className="teks-sukses text-green-700 text-sm">{pesanResetSukses}</p>
                            </div>
                        )}

                        {/* Pesan Error */}
                        {pesanResetGalat && (
                            <div className="area-galat bg-red-50 border-l-4 border-red-500 p-4 mb-5 rounded-lg">
                                <p className="teks-galat text-red-700 text-sm">{pesanResetGalat}</p>
                            </div>
                        )}

                        {/* Form Reset */}
                        <form onSubmit={menanganiLupaPassword} className="form-reset space-y-5">
                            <div className="grup-input">
                                <label className="label-input block text-[15px] text-[#4B2E2B] font-semibold mb-2" htmlFor="emailReset">
                                    Email
                                </label>
                                <input
                                    id="emailReset"
                                    type="email"
                                    value={emailReset}
                                    onChange={(e) => setEmailReset(e.target.value)}
                                    placeholder="contoh@email.com"
                                    className="input-field w-full px-5 py-3 h-[46px] rounded-[10px] border border-[#4B2E2B] focus:outline-none focus:ring-2 focus:ring-[#C69C6D]/50 focus:border-[#C69C6D] transition-all text-[#4B2E2B]"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={sedangKirimReset}
                                className="tombol-kirim-reset w-full bg-[#C69C6D] h-[46px] text-[#4B2E2B] font-bold text-[16px] rounded-full hover:bg-[#b88c5d] transition-all shadow-md active:scale-[0.98] disabled:opacity-70 flex items-center justify-center"
                            >
                                {sedangKirimReset ? 'Mengirim...' : 'Kirim Link Reset'}
                            </button>
                        </form>

                        <div className="kembali-login mt-4 text-center">
                            <button
                                type="button"
                                onClick={() => setTampilkanLupaPassword(false)}
                                className="tautan-kembali text-[#C69C6D] text-[13px] font-medium hover:underline cursor-pointer bg-transparent border-none"
                            >
                                ← Kembali ke halaman masuk
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CSS Animation for Modal */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
};

export default Masuk;
