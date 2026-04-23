import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../komponen/umum/Navbar';
import layananAutentikasi from '../../layanan/layananAutentikasi';

const Masuk = () => {
    const [surel, setSurel] = useState('');
    const [kataSandi, setKataSandi] = useState('');
    const [sedangMemuat, setSedangMemuat] = useState(false);
    const [pesanGalat, setPesanGalat] = useState('');
    const navigate = useNavigate();

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
                    navigate('/');
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
                        
                        {/* Tab Static (Masuk) */}
                        <div className="w-full h-[60px] bg-[#C69C6D] rounded-[50px] flex items-center justify-center shadow-sm">
                            <span className="text-[18px] font-bold text-[#4B2E2B]">Masuk</span>
                        </div>

                        {/* Form Login */}
                        <div className="w-full bg-white rounded-[40px] p-8 md:p-10 shadow-lg">
                            <div className="mb-6 text-center md:text-left">
                                <h1 className="text-[22px] font-bold text-[#4B2E2B] mb-1">Masuk dan temukan Careermu!</h1>
                            </div>

                            {pesanGalat && (
                                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
                                    <p className="text-red-700 text-sm">{pesanGalat}</p>
                                </div>
                            )}

                            <form onSubmit={menanganiMasuk} className="space-y-5">
                                <div>
                                    <label className="block text-[15px] text-[#4B2E2B] font-semibold mb-2" htmlFor="email">Email</label>
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

                                <div className="flex items-center gap-1 mt-1">
                                    <span className="text-[13px] font-medium text-[#4B2E2B]">Belum punya akun? </span>
                                    <Link to="/daftar" className="text-[#C69C6D] text-[13px] font-medium hover:underline">
                                        Daftar disini
                                    </Link>
                                </div>

                                <div className="pt-3">
                                    <button
                                        type="submit"
                                        disabled={sedangMemuat}
                                        className="w-full bg-[#C69C6D] h-[46px] text-[#4B2E2B] font-bold text-[16px] rounded-[50px] hover:bg-[#b88c5d] transition-all shadow-md active:scale-[0.98] disabled:opacity-70 flex items-center justify-center"
                                    >
                                        {sedangMemuat ? 'Memproses...' : 'Masuk'}
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

export default Masuk;
