import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../komponen/umum/Navbar';
import layananAutentikasi from '../../layanan/layananAutentikasi';

const Masuk = () => {
    const [peran, setPeran] = useState('Pelamar');
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
                surel,
                kata_sandi: kataSandi,
                peran: peran // Optional depending on backend requirements
            });

            // Simpan token (biasanya di layananAutentikasi sudah ditangani atau perlu manual)
            if (respons.data && respons.data.token) {
                localStorage.setItem('token', respons.data.token);
                localStorage.setItem('peran', respons.data.user.peran);
                
                // Redirect based on role
                const userPeran = respons.data.user.peran;
                if (userPeran === 'Pelamar') {
                    navigate('/');
                } else if (userPeran === 'Admin_Perusahaan') {
                    navigate('/admin/dashboard');
                } else if (userPeran === 'Super_Admin') {
                    navigate('/super-admin/dashboard');
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
        <div className="min-h-screen bg-cafe-white font-poppins">
            <Navbar />
            
            <div className="flex justify-center items-center py-10 px-4">
                <div className="w-full max-w-[1240px] flex flex-col md:flex-row bg-white rounded-[50px] overflow-hidden shadow-xl min-h-[539px]">
                    
                    {/* Sisi Kiri: Sidebar Cokelat */}
                    <div className="w-full md:w-[413px] bg-cafe-dark p-12 flex flex-col justify-center text-cafe-white">
                        <div className="space-y-6">
                            <h2 className="font-jakarta font-[800] text-[36px] leading-[1.2] tracking-[-0.05em]">
                                Gabung bersama <br />
                                <span className="text-cafe-light">di cofe job.</span>
                            </h2>
                            <p className="text-cafe-white/80 text-lg">
                                Temukan peluang karir terbaik di industri kopi dan cafe di seluruh Indonesia.
                            </p>
                        </div>
                    </div>

                    {/* Sisi Kanan: Form Login */}
                    <div className="flex-1 p-8 md:p-16 bg-white flex flex-col">
                        <div className="max-w-[543px] mx-auto w-full">
                            
                            {/* Tab Seleksi Peran */}
                            <div className="flex bg-cafe-light/10 rounded-full p-1 mb-8">
                                {['Pelamar', 'Perusahaan', 'Admin'].map((item) => (
                                    <button
                                        key={item}
                                        onClick={() => setPeran(item === 'Perusahaan' ? 'Admin_Perusahaan' : item === 'Admin' ? 'Super_Admin' : 'Pelamar')}
                                        className={`flex-1 py-3 px-6 rounded-full text-sm font-bold transition-all ${
                                            (item === 'Pelamar' && peran === 'Pelamar') || 
                                            (item === 'Perusahaan' && peran === 'Admin_Perusahaan') || 
                                            (item === 'Admin' && peran === 'Super_Admin')
                                            ? 'bg-cafe-light text-cafe-dark shadow-md'
                                            : 'text-cafe-dark/60 hover:text-cafe-dark'
                                        }`}
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>

                            <div className="mb-8">
                                <h1 className="text-2xl font-bold text-cafe-dark mb-2">Masuk</h1>
                                <p className="text-cafe-dark/60">Masuk dan temukan Careermu!</p>
                            </div>

                            {pesanGalat && (
                                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                                    <p className="text-red-700 text-sm">{pesanGalat}</p>
                                </div>
                            )}

                            <form onSubmit={menanganiMasuk} className="space-y-6">
                                <div>
                                    <label className="block text-cafe-dark font-semibold mb-2" htmlFor="email">Email</label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={surel}
                                        onChange={(e) => setSurel(e.target.value)}
                                        placeholder="Masukkan email Anda"
                                        className="w-full px-5 py-3 rounded-xl border border-cafe-dark/20 focus:outline-none focus:ring-2 focus:ring-cafe-light/50 focus:border-cafe-light transition-all"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-cafe-dark font-semibold mb-2" htmlFor="password">Password</label>
                                    <input
                                        id="password"
                                        type="password"
                                        value={kataSandi}
                                        onChange={(e) => setKataSandi(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full px-5 py-3 rounded-xl border border-cafe-dark/20 focus:outline-none focus:ring-2 focus:ring-cafe-light/50 focus:border-cafe-light transition-all"
                                        required
                                    />
                                </div>

                                <div className="flex flex-col gap-4 pt-2">
                                    <button
                                        type="submit"
                                        disabled={sedangMemuat}
                                        className="w-full bg-cafe-light text-cafe-dark font-bold py-4 rounded-full hover:bg-[#b88c5d] transition-all shadow-lg active:scale-[0.98] disabled:opacity-70"
                                    >
                                        {sedangMemuat ? 'Memproses...' : 'Masuk'}
                                    </button>
                                    
                                    <p className="text-center text-sm text-cafe-dark/80">
                                        Belum punya akun?{' '}
                                        <Link to="/daftar" className="text-cafe-light font-bold hover:underline">
                                            Daftar disini
                                        </Link>
                                    </p>
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

