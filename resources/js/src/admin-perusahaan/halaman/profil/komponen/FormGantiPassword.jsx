import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import api from '../../../../layanan/api';

const FormGantiPassword = ({ variants }) => {
    const [passwordLama, setPasswordLama] = useState('');
    const [passwordBaru, setPasswordBaru] = useState('');
    const [konfirmasiPassword, setKonfirmasiPassword] = useState('');
    const [sedangMemuat, setSedangMemuat] = useState(false);
    const [pesanSukses, setPesanSukses] = useState('');
    const [pesanGalat, setPesanGalat] = useState('');

    // Toggle visibility
    const [tampilLama, setTampilLama] = useState(false);
    const [tampilBaru, setTampilBaru] = useState(false);
    const [tampilKonfirmasi, setTampilKonfirmasi] = useState(false);

    const menanganiGantiPassword = async (e) => {
        e.preventDefault();
        setPesanGalat('');
        setPesanSukses('');

        if (passwordBaru.length < 8) {
            setPesanGalat('Password baru minimal 8 karakter.');
            return;
        }

        if (passwordBaru !== konfirmasiPassword) {
            setPesanGalat('Konfirmasi password tidak cocok.');
            return;
        }

        setSedangMemuat(true);

        try {
            const respons = await api.post('/admin/profil-perusahaan/update-password', {
                current_password: passwordLama,
                password: passwordBaru,
                password_confirmation: konfirmasiPassword,
            });

            setPesanSukses(respons.data.message || 'Password berhasil diubah!');
            setPasswordLama('');
            setPasswordBaru('');
            setKonfirmasiPassword('');
        } catch (error) {
            console.error('Gagal ganti password:', error);
            setPesanGalat(error.response?.data?.message || 'Gagal mengubah password. Silakan coba lagi.');
        } finally {
            setSedangMemuat(false);
        }
    };

    return (
        <motion.div
            variants={variants}
            className="form-ganti-password-admin w-full bg-white rounded-[20px] p-6 md:p-8 shadow-md border border-[#E8DDD1]"
        >
            {/* Header */}
            <div className="header-bagian flex items-center gap-3 mb-6">
                <div className="ikon-header w-[42px] h-[42px] bg-[#4B2E2B] rounded-[12px] flex items-center justify-center">
                    <Lock size={20} className="text-[#C69C6D]" />
                </div>
                <div>
                    <h3 className="judul-bagian font-poppins font-bold text-[18px] text-[#4B2E2B]">Ganti Password</h3>
                    <p className="sub-bagian font-poppins text-[13px] text-[#8B7355]">Ubah kata sandi akun perusahaan Anda</p>
                </div>
            </div>

            {/* Pesan Sukses */}
            {pesanSukses && (
                <div className="area-sukses bg-green-50 border-l-4 border-green-500 p-4 mb-5 rounded-lg flex items-center gap-2">
                    <ShieldCheck size={18} className="text-green-600" />
                    <p className="teks-sukses text-green-700 text-sm font-poppins">{pesanSukses}</p>
                </div>
            )}

            {/* Pesan Error */}
            {pesanGalat && (
                <div className="area-galat bg-red-50 border-l-4 border-red-500 p-4 mb-5 rounded-lg">
                    <p className="teks-galat text-red-700 text-sm font-poppins">{pesanGalat}</p>
                </div>
            )}

            {/* Form */}
            <form onSubmit={menanganiGantiPassword} className="form-password space-y-4">
                {/* Password Lama */}
                <div className="grup-input">
                    <label className="label-input block text-[14px] text-[#4B2E2B] font-semibold mb-2 font-poppins">
                        Password Saat Ini
                    </label>
                    <div className="wadah-input relative">
                        <input
                            type={tampilLama ? 'text' : 'password'}
                            value={passwordLama}
                            onChange={(e) => setPasswordLama(e.target.value)}
                            placeholder="Masukkan password saat ini"
                            className="input-field w-full px-4 py-3 pr-12 h-[46px] rounded-[10px] border border-[#D5C4B3] focus:outline-none focus:ring-2 focus:ring-[#C69C6D]/50 focus:border-[#C69C6D] transition-all text-[#4B2E2B] text-[14px] font-poppins"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setTampilLama(!tampilLama)}
                            className="tombol-tampil absolute right-3 top-1/2 -translate-y-1/2 text-[#8B7355] hover:text-[#4B2E2B] transition-colors bg-transparent border-none cursor-pointer"
                        >
                            {tampilLama ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                {/* Password Baru */}
                <div className="grup-input">
                    <label className="label-input block text-[14px] text-[#4B2E2B] font-semibold mb-2 font-poppins">
                        Password Baru
                    </label>
                    <div className="wadah-input relative">
                        <input
                            type={tampilBaru ? 'text' : 'password'}
                            value={passwordBaru}
                            onChange={(e) => setPasswordBaru(e.target.value)}
                            placeholder="Minimal 8 karakter"
                            className="input-field w-full px-4 py-3 pr-12 h-[46px] rounded-[10px] border border-[#D5C4B3] focus:outline-none focus:ring-2 focus:ring-[#C69C6D]/50 focus:border-[#C69C6D] transition-all text-[#4B2E2B] text-[14px] font-poppins"
                            required
                            minLength={8}
                        />
                        <button
                            type="button"
                            onClick={() => setTampilBaru(!tampilBaru)}
                            className="tombol-tampil absolute right-3 top-1/2 -translate-y-1/2 text-[#8B7355] hover:text-[#4B2E2B] transition-colors bg-transparent border-none cursor-pointer"
                        >
                            {tampilBaru ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                {/* Konfirmasi Password */}
                <div className="grup-input">
                    <label className="label-input block text-[14px] text-[#4B2E2B] font-semibold mb-2 font-poppins">
                        Konfirmasi Password Baru
                    </label>
                    <div className="wadah-input relative">
                        <input
                            type={tampilKonfirmasi ? 'text' : 'password'}
                            value={konfirmasiPassword}
                            onChange={(e) => setKonfirmasiPassword(e.target.value)}
                            placeholder="Ulangi password baru"
                            className="input-field w-full px-4 py-3 pr-12 h-[46px] rounded-[10px] border border-[#D5C4B3] focus:outline-none focus:ring-2 focus:ring-[#C69C6D]/50 focus:border-[#C69C6D] transition-all text-[#4B2E2B] text-[14px] font-poppins"
                            required
                            minLength={8}
                        />
                        <button
                            type="button"
                            onClick={() => setTampilKonfirmasi(!tampilKonfirmasi)}
                            className="tombol-tampil absolute right-3 top-1/2 -translate-y-1/2 text-[#8B7355] hover:text-[#4B2E2B] transition-colors bg-transparent border-none cursor-pointer"
                        >
                            {tampilKonfirmasi ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                {/* Tombol Submit */}
                <div className="area-tombol pt-2">
                    <button
                        type="submit"
                        disabled={sedangMemuat}
                        className="tombol-ganti w-full bg-[#4B2E2B] h-[46px] text-white font-bold text-[15px] rounded-[50px] hover:bg-[#3a2320] transition-all shadow-md active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 font-poppins"
                    >
                        <Lock size={16} />
                        {sedangMemuat ? 'Menyimpan...' : 'Ubah Password'}
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default FormGantiPassword;
