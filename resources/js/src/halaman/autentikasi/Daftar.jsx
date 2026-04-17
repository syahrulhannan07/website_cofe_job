import React from 'react';
import { Link } from 'react-router-dom';

const Daftar = () => {
    return (
        <div className="min-h-screen bg-[#F3EDE6] flex items-center justify-center px-4 py-12">
            <div className="bg-white rounded-[30px] shadow-lg p-8 md:p-12 w-full max-w-md">
                <h1 className="font-poppins font-[700] text-3xl text-[#4B2E2B] mb-2">Buat Akun</h1>
                <p className="font-['Lato'] text-sm text-[#7A6153] mb-8">
                    Sudah punya akun?{' '}
                    <Link to="/masuk" className="text-[#C19A6B] hover:underline font-medium">Masuk di sini</Link>
                </p>

                <form className="flex flex-col gap-5">
                    <div>
                        <label className="block font-poppins text-sm font-[600] text-[#4B2E2B] mb-2">Nama Lengkap</label>
                        <input
                            type="text"
                            placeholder="Nama Anda"
                            className="w-full border border-[#D4C4B4] rounded-[10px] px-4 py-3 font-['Lato'] text-sm focus:outline-none focus:border-[#C19A6B]"
                        />
                    </div>
                    <div>
                        <label className="block font-poppins text-sm font-[600] text-[#4B2E2B] mb-2">Surel</label>
                        <input
                            type="email"
                            placeholder="contoh@email.com"
                            className="w-full border border-[#D4C4B4] rounded-[10px] px-4 py-3 font-['Lato'] text-sm focus:outline-none focus:border-[#C19A6B]"
                        />
                    </div>
                    <div>
                        <label className="block font-poppins text-sm font-[600] text-[#4B2E2B] mb-2">Kata Sandi</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full border border-[#D4C4B4] rounded-[10px] px-4 py-3 font-['Lato'] text-sm focus:outline-none focus:border-[#C19A6B]"
                        />
                    </div>
                    <div>
                        <label className="block font-poppins text-sm font-[600] text-[#4B2E2B] mb-2">Peran</label>
                        <select className="w-full border border-[#D4C4B4] rounded-[10px] px-4 py-3 font-['Lato'] text-sm focus:outline-none focus:border-[#C19A6B] bg-white">
                            <option value="">Pilih peran Anda</option>
                            <option value="pelamar">Pelamar</option>
                            <option value="perusahaan">Admin Perusahaan</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-[#4B2E2B] text-white font-poppins font-[600] text-base py-3 rounded-[10px] hover:bg-[#5c3d39] transition-colors mt-2"
                    >
                        Daftar Sekarang
                    </button>
                </form>

                <div className="text-center mt-6">
                    <Link to="/" className="font-['Lato'] text-sm text-[#C19A6B] hover:underline">← Kembali ke Beranda</Link>
                </div>
            </div>
        </div>
    );
};

export default Daftar;
