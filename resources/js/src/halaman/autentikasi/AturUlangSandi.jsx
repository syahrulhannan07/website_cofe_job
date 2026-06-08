import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import layananAutentikasi from '../../layanan/layananAutentikasi';

const AturUlangSandi = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // State
    const [status, setStatus] = useState('form'); // Langsung ke form karena verifikasi token dilakukan saat submit
    const [emailPengguna, setEmailPengguna] = useState('');
    const [passwordBaru, setPasswordBaru] = useState('');
    const [konfirmasiPassword, setKonfirmasiPassword] = useState('');
    const [tampilkanSandiBaru, setTampilkanSandiBaru] = useState(false);
    const [tampilkanKonfirmasiSandi, setTampilkanKonfirmasiSandi] = useState(false);
    const [sedangMemproses, setSedangMemproses] = useState(false);
    const [pesanGalat, setPesanGalat] = useState('');
    const [token, setToken] = useState('');

    // Ambil token dan email dari URL saat halaman dimuat
    useEffect(() => {
        const urlToken = searchParams.get('token');
        const urlEmail = searchParams.get('email');
        
        if (!urlToken || !urlEmail) {
            setStatus('gagal');
            setPesanGalat('Link reset password tidak valid. Parameter token atau email tidak ditemukan.');
            return;
        }
        
        setToken(urlToken);
        setEmailPengguna(urlEmail);
    }, [searchParams]);

    // Handler submit form kata sandi baru
    const menanganiSubmit = async (e) => {
        e.preventDefault();
        setPesanGalat('');

        // Validasi
        if (passwordBaru.length < 8) {
            setPesanGalat('Kata sandi minimal 8 karakter.');
            return;
        }
        if (passwordBaru !== konfirmasiPassword) {
            setPesanGalat('Konfirmasi kata sandi tidak cocok.');
            return;
        }

        setSedangMemproses(true);
        try {
            await layananAutentikasi.resetPassword({
                token: token,
                email: emailPengguna,
                password: passwordBaru,
                password_confirmation: konfirmasiPassword
            });
            setStatus('berhasil');
        } catch (error) {
            console.error('Reset password gagal:', error);
            setPesanGalat(error.response?.data?.message || 'Gagal mengatur ulang kata sandi. Link mungkin sudah kadaluarsa.');
        } finally {
            setSedangMemproses(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F3EDE6] font-poppins flex items-center justify-center p-4">
            <div className="w-full max-w-[450px]">

                {/* Logo / Branding */}
                <div className="text-center mb-6">
                    <h1 className="text-[28px] font-bold text-[#4B2E2B] font-jakarta">
                        Cofe <span className="text-[#C69C6D]">Job</span>
                    </h1>
                </div>

                {/* Card */}
                <div className="bg-white rounded-[30px] p-8 md:p-10 shadow-lg">

                    {/* Status: Form (kode valid) */}
                    {status === 'form' && (
                        <>
                            <div className="mb-6">
                                <h2 className="text-[22px] font-bold text-[#4B2E2B] mb-2">Atur Ulang Kata Sandi</h2>
                                <p className="text-[14px] text-[#7A6555] leading-relaxed">
                                    Masukkan kata sandi baru untuk akun <strong className="text-[#4B2E2B]">{emailPengguna}</strong>
                                </p>
                            </div>

                            {pesanGalat && (
                                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-5 rounded-lg">
                                    <p className="text-red-700 text-sm">{pesanGalat}</p>
                                </div>
                            )}

                            <form onSubmit={menanganiSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-[15px] text-[#4B2E2B] font-semibold mb-2" htmlFor="passwordBaru">
                                        Kata Sandi Baru
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="passwordBaru"
                                            type={tampilkanSandiBaru ? "text" : "password"}
                                            value={passwordBaru}
                                            onChange={(e) => setPasswordBaru(e.target.value)}
                                            placeholder="Minimal 8 karakter"
                                            className="w-full px-5 py-3 h-[46px] rounded-[10px] border border-[#4B2E2B] focus:outline-none focus:ring-2 focus:ring-[#C69C6D]/50 focus:border-[#C69C6D] transition-all text-[#4B2E2B] pr-12"
                                            required
                                            minLength={8}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setTampilkanSandiBaru(!tampilkanSandiBaru)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4B2E2B] hover:text-[#C69C6D] focus:outline-none"
                                        >
                                            {tampilkanSandiBaru ? (
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

                                <div>
                                    <label className="block text-[15px] text-[#4B2E2B] font-semibold mb-2" htmlFor="konfirmasiPassword">
                                        Konfirmasi Kata Sandi
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="konfirmasiPassword"
                                            type={tampilkanKonfirmasiSandi ? "text" : "password"}
                                            value={konfirmasiPassword}
                                            onChange={(e) => setKonfirmasiPassword(e.target.value)}
                                            placeholder="Ulangi kata sandi baru"
                                            className="w-full px-5 py-3 h-[46px] rounded-[10px] border border-[#4B2E2B] focus:outline-none focus:ring-2 focus:ring-[#C69C6D]/50 focus:border-[#C69C6D] transition-all text-[#4B2E2B] pr-12"
                                            required
                                            minLength={8}
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

                                <button
                                    type="submit"
                                    disabled={sedangMemproses}
                                    className="w-full bg-[#C69C6D] h-[46px] text-[#4B2E2B] font-bold text-[16px] rounded-[50px] hover:bg-[#b88c5d] transition-all shadow-md active:scale-[0.98] disabled:opacity-70 flex items-center justify-center cursor-pointer"
                                >
                                    {sedangMemproses ? 'Memproses...' : 'Simpan Kata Sandi Baru'}
                                </button>
                            </form>
                        </>
                    )}

                    {/* Status: Berhasil */}
                    {status === 'berhasil' && (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </div>
                            <h2 className="text-[22px] font-bold text-[#4B2E2B] mb-2">Berhasil!</h2>
                            <p className="text-[14px] text-[#7A6555] mb-6 leading-relaxed">
                                Kata sandi Anda berhasil diubah. Silakan masuk dengan kata sandi baru Anda.
                            </p>
                            <button
                                onClick={() => navigate('/masuk')}
                                className="w-full bg-[#C69C6D] h-[46px] text-[#4B2E2B] font-bold text-[16px] rounded-[50px] hover:bg-[#b88c5d] transition-all shadow-md active:scale-[0.98] flex items-center justify-center cursor-pointer"
                            >
                                Masuk Sekarang
                            </button>
                        </div>
                    )}

                    {/* Status: Gagal */}
                    {status === 'gagal' && (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </div>
                            <h2 className="text-[22px] font-bold text-[#4B2E2B] mb-2">Link Tidak Valid</h2>
                            <p className="text-[14px] text-[#7A6555] mb-6 leading-relaxed">
                                {pesanGalat}
                            </p>
                            <button
                                onClick={() => navigate('/masuk')}
                                className="w-full bg-[#C69C6D] h-[46px] text-[#4B2E2B] font-bold text-[16px] rounded-[50px] hover:bg-[#b88c5d] transition-all shadow-md active:scale-[0.98] flex items-center justify-center cursor-pointer"
                            >
                                Kembali ke Halaman Login
                            </button>
                        </div>
                    )}
                </div>

                {/* Kembali ke login */}
                {status === 'form' && (
                    <div className="text-center mt-4">
                        <button
                            onClick={() => navigate('/masuk')}
                            className="text-[#C69C6D] text-[13px] font-medium hover:underline cursor-pointer bg-transparent border-none"
                        >
                            ← Kembali ke halaman masuk
                        </button>
                    </div>
                )}
            </div>

            {/* CSS Animation */}
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default AturUlangSandi;
