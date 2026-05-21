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
                                    <input
                                        id="email"
                                        type="text"
                                        value={formLogin.email}
                                        onChange={ubahInput}
                                        className="input-field w-full px-5 py-3 h-[46px] rounded-[10px] border border-[#4B2E2B] focus:outline-none focus:ring-2 focus:ring-[#C69C6D]/50 focus:border-[#C69C6D] transition-all text-[#4B2E2B]"
                                        required
                                    />
                                </div>
                                
                                <div className="grup-input">
                                    <label className="label-input block text-[15px] text-[#4B2E2B] font-semibold mb-2" htmlFor="password">Password</label>
                                    <input
                                        id="password"
                                        type="password"
                                        value={formLogin.password}
                                        onChange={ubahInput}
                                        className="input-field w-full px-5 py-3 h-[46px] rounded-[10px] border border-[#4B2E2B] focus:outline-none focus:ring-2 focus:ring-[#C69C6D]/50 focus:border-[#C69C6D] transition-all text-[#4B2E2B]"
                                        required
                                    />
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
