import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import layananAutentikasi from '../../../layanan/layananAutentikasi';

/**
 * UC-10: Halaman Login Super Admin
 * Halaman login rahasia — hanya diakses oleh Super Admin C.A.F.E.
 * Desain diselaraskan dengan halaman Masuk utama.
 */

const HalamanLoginSuperAdmin = () => {
    const [formLogin, setFormLogin] = useState({ email: '', password: '' });
    const [tampilkanKataSandi, setTampilkanKataSandi] = useState(false);
    const [pesanError, setPesanError] = useState('');
    const [sedangMemuat, setSedangMemuat] = useState(false);
    const navigate = useNavigate();

    const ubahInput = (e) => {
        const { id, value } = e.target;
        setFormLogin((prev) => ({ ...prev, [id]: value }));
        if (pesanError) setPesanError('');
    };

    const tanganiKirim = async (e) => {
        e.preventDefault();

        // [UPDATE LOGIC]
        if (!formLogin.email.trim() || !formLogin.password) {
            setPesanError('Email / Username dan password wajib diisi.');
            return;
        }

        setSedangMemuat(true);
        setPesanError('');

        try {
            // [UPDATE LOGIC] - Panggil API masukSuperAdmin yang mengirim username_email & kata_sandi
            const respons = await layananAutentikasi.masukSuperAdmin({
                username_email: formLogin.email,
                kata_sandi: formLogin.password
            });

            if (respons.data && respons.data.token) {
                // [UPDATE LOGIC]
                localStorage.setItem('token', respons.data.token);
                localStorage.setItem('peran', respons.data.pengguna.peran);
                localStorage.setItem('pengguna', JSON.stringify(respons.data.pengguna));

                // Arahkan ke dashboard utama pusat
                window.location.href = '/super-admin/dashboard';
            }
        } catch (error) {
            // [UPDATE LOGIC] - Tangkap respons error 401 dan tampilkan pesan presisi
            if (error.response?.status === 401) {
                setPesanError('Username atau password salah');
            } else {
                setPesanError(error.response?.data?.message || 'Terjadi kesalahan. Silakan coba lagi.');
            }
        } finally {
            // [UPDATE LOGIC]
            if (window.location.pathname === '/auth/portal-pusat/login') {
                setSedangMemuat(false);
            }
        }
    };

    return (
        <div className="wadah-halaman-masuk min-h-screen bg-[#F3EDE6] font-poppins flex flex-col overflow-x-hidden">
            
            {/* Main Content Area */}
            <div className="area-konten-utama flex-1 flex flex-col md:flex-row w-full max-w-[1440px] mx-auto py-8 lg:py-16">
                
                {/* Sisi Kiri: Sidebar Cokelat (Menempel di kiri) */}
                <div className="sisi-kiri-sidebar hidden md:flex w-[40%] max-w-[413px] min-h-[600px] bg-[#4B2E2B] rounded-r-[50px] flex-col justify-start pt-[130px] px-10 shadow-lg">
                    <div className="teks-ajakan w-full">
                        <span className="teks-baris-1 text-[#C69C6D] text-[32px] lg:text-[36px] font-jakarta font-[800] leading-[1.4] break-words block">
                            Otoritas Pusat
                        </span>
                        <span className="teks-baris-2 text-[#F3EDE6] text-[32px] lg:text-[36px] font-jakarta italic font-[800] leading-[1.4] break-words block mt-[-5px]">
                            cofe job.
                        </span>
                        <div className="garis-hias w-[60px] h-[4px] bg-[#F5B759] mt-6 rounded-full"></div>
                        <p className="teks-deskripsi text-[#F3EDE6]/80 text-[14px] mt-6 leading-relaxed font-poppins">
                            Panel khusus pengelola sistem untuk memverifikasi kafe dan mengelola akun admin.
                        </p>
                    </div>
                </div>

                {/* Sisi Kanan: Area Tabs & Form */}
                <div className="sisi-kanan-form w-full md:w-[60%] flex flex-col items-center justify-center p-6 lg:p-10">
                    <div className="wadah-konten flex flex-col items-center w-full max-w-[500px] mx-auto gap-6">
                        
                        {/* Tab Static (Masuk Super Admin) */}
                        <div className="tab-masuk w-full h-[60px] bg-[#C69C6D] rounded-[50px] flex items-center justify-center shadow-sm">
                            <span className="teks-tab text-[18px] font-bold text-[#4B2E2B]">Super Admin Login</span>
                        </div>

                        {/* Form Login */}
                        <div className="wadah-form-login w-full bg-white rounded-[40px] p-8 md:p-10 shadow-lg">
                            <div className="header-form mb-6 text-center md:text-left">
                                <h1 className="judul-form text-[22px] font-bold text-[#4B2E2B] mb-1">Masuk ke Panel</h1>
                            </div>

                            {pesanError && (
                                <div className="area-galat bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
                                    <p className="teks-galat text-red-700 text-sm">{pesanError}</p>
                                </div>
                            )}

                            <form onSubmit={tanganiKirim} className="form-utama space-y-5">
                                <div className="grup-input">
                                    <label className="label-input block text-[15px] text-[#4B2E2B] font-semibold mb-2" htmlFor="email">Email / Username</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4B2E2B]/50">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                            </svg>
                                        </div>
                                        <input
                                            id="email"
                                            type="text"
                                            value={formLogin.email}
                                            onChange={ubahInput}
                                            placeholder="Username atau Email"
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
                                            value={formLogin.password}
                                            onChange={ubahInput}
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

                                <div className="area-tombol pt-6">
                                    <button
                                        type="submit"
                                        disabled={sedangMemuat}
                                        className="tombol-masuk w-full bg-[#C69C6D] h-[46px] text-[#4B2E2B] font-bold text-[16px] rounded-[50px] hover:bg-[#b88c5d] transition-all shadow-md active:scale-[0.98] disabled:opacity-70 flex items-center justify-center"
                                    >
                                        {sedangMemuat ? 'Memverifikasi...' : 'Masuk Panel'}
                                    </button>
                                </div>
                            </form>
                        </div>
                        
                        {/* Peringatan Keamanan */}
                        <p className="teks-peringatan text-[12px] text-[#A08070] text-center mt-4 px-4">
                            Halaman ini khusus untuk staf otoritas pusat C.A.F.E. Segala aktivitas di dalam panel direkam.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HalamanLoginSuperAdmin;
