import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../komponen/umum/Navbar';
import layananAutentikasi from '../../layanan/layananAutentikasi';
import { masukDenganGoogle, kirimEmailResetPassword } from '../../layanan/firebase';

const Masuk = () => {
    const [surel, setSurel] = useState('');
    const [kataSandi, setKataSandi] = useState('');
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
            await kirimEmailResetPassword(emailReset);
            setPesanResetSukses('Email reset password telah dikirim! Silakan cek inbox atau folder spam Anda.');
            setTimeout(() => {
                setTampilkanLupaPassword(false);
                setPesanResetSukses('');
                setEmailReset('');
            }, 4000);
        } catch (error) {
            console.error('Reset password error:', error);
            if (error.code === 'auth/user-not-found') {
                setPesanResetGalat('Email tidak ditemukan di sistem Firebase.');
            } else if (error.code === 'auth/invalid-email') {
                setPesanResetGalat('Format email tidak valid.');
            } else if (error.code === 'auth/too-many-requests') {
                setPesanResetGalat('Terlalu banyak permintaan. Coba lagi nanti.');
            } else {
                setPesanResetGalat('Gagal mengirim email reset. Silakan coba lagi.');
            }
        } finally {
            setSedangKirimReset(false);
        }
    };

    return (
        <div className="wadah-halaman-masuk min-h-screen bg-[#F3EDE6] font-poppins flex flex-col overflow-x-hidden">
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
                        
                        {/* Tab Static (Masuk) */}
                        <div className="tab-masuk w-full h-[60px] bg-[#C69C6D] rounded-[50px] flex items-center justify-center shadow-sm">
                            <span className="teks-tab text-[18px] font-bold text-[#4B2E2B]">Masuk</span>
                        </div>

                        {/* Form Login */}
                        <div className="wadah-form-login w-full bg-white rounded-[40px] p-8 md:p-10 shadow-lg">
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
                                        className="tombol-masuk w-full bg-[#C69C6D] h-[46px] text-[#4B2E2B] font-bold text-[16px] rounded-[50px] hover:bg-[#b88c5d] transition-all shadow-md active:scale-[0.98] disabled:opacity-70 flex items-center justify-center"
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
                    <div className="modal-konten bg-white rounded-[30px] p-8 md:p-10 w-full max-w-[450px] shadow-2xl relative animate-[fadeIn_0.3s_ease-out]">
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
                                className="tombol-kirim-reset w-full bg-[#C69C6D] h-[46px] text-[#4B2E2B] font-bold text-[16px] rounded-[50px] hover:bg-[#b88c5d] transition-all shadow-md active:scale-[0.98] disabled:opacity-70 flex items-center justify-center"
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
