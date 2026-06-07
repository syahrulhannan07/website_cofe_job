import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifikasiKodeReset, konfirmasiResetPassword } from '../../layanan/firebase';

const AturUlangSandi = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // State
    const [status, setStatus] = useState('memverifikasi'); // memverifikasi | form | berhasil | gagal
    const [emailPengguna, setEmailPengguna] = useState('');
    const [passwordBaru, setPasswordBaru] = useState('');
    const [konfirmasiPassword, setKonfirmasiPassword] = useState('');
    const [sedangMemproses, setSedangMemproses] = useState(false);
    const [pesanGalat, setPesanGalat] = useState('');
    const [oobCode, setOobCode] = useState('');

    // Ambil oobCode dari URL saat halaman dimuat
    useEffect(() => {
        const code = searchParams.get('oobCode');
        if (!code) {
            setStatus('gagal');
            setPesanGalat('Link reset password tidak valid. Parameter kode tidak ditemukan.');
            return;
        }
        setOobCode(code);

        // Verifikasi kode reset
        const verifikasi = async () => {
            try {
                const email = await verifikasiKodeReset(code);
                setEmailPengguna(email);
                setStatus('form');
            } catch (error) {
                console.error('Verifikasi kode reset gagal:', error);
                setStatus('gagal');
                if (error.code === 'auth/expired-action-code') {
                    setPesanGalat('Link reset password sudah kadaluarsa. Silakan minta link baru dari halaman login.');
                } else if (error.code === 'auth/invalid-action-code') {
                    setPesanGalat('Link reset password tidak valid atau sudah pernah digunakan. Silakan minta link baru.');
                } else {
                    setPesanGalat('Terjadi kesalahan saat memverifikasi link. Silakan coba lagi.');
                }
            }
        };
        verifikasi();
    }, [searchParams]);

    // Handler submit form kata sandi baru
    const menanganiSubmit = async (e) => {
        e.preventDefault();
        setPesanGalat('');

        // Validasi
        if (passwordBaru.length < 6) {
            setPesanGalat('Kata sandi minimal 6 karakter.');
            return;
        }
        if (passwordBaru !== konfirmasiPassword) {
            setPesanGalat('Konfirmasi kata sandi tidak cocok.');
            return;
        }

        setSedangMemproses(true);
        try {
            await konfirmasiResetPassword(oobCode, passwordBaru);
            setStatus('berhasil');
        } catch (error) {
            console.error('Reset password gagal:', error);
            if (error.code === 'auth/expired-action-code') {
                setPesanGalat('Link sudah kadaluarsa. Silakan minta link baru dari halaman login.');
            } else if (error.code === 'auth/weak-password') {
                setPesanGalat('Kata sandi terlalu lemah. Gunakan minimal 6 karakter.');
            } else {
                setPesanGalat('Gagal mengatur ulang kata sandi. Silakan coba lagi.');
            }
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

                    {/* Status: Memverifikasi */}
                    {status === 'memverifikasi' && (
                        <div className="text-center py-8">
                            <div className="inline-block w-10 h-10 border-4 border-[#C69C6D] border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-[#4B2E2B] font-medium">Memverifikasi link reset password...</p>
                        </div>
                    )}

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
                                    <input
                                        id="passwordBaru"
                                        type="password"
                                        value={passwordBaru}
                                        onChange={(e) => setPasswordBaru(e.target.value)}
                                        placeholder="Minimal 6 karakter"
                                        className="w-full px-5 py-3 h-[46px] rounded-[10px] border border-[#4B2E2B] focus:outline-none focus:ring-2 focus:ring-[#C69C6D]/50 focus:border-[#C69C6D] transition-all text-[#4B2E2B]"
                                        required
                                        minLength={6}
                                    />
                                </div>

                                <div>
                                    <label className="block text-[15px] text-[#4B2E2B] font-semibold mb-2" htmlFor="konfirmasiPassword">
                                        Konfirmasi Kata Sandi
                                    </label>
                                    <input
                                        id="konfirmasiPassword"
                                        type="password"
                                        value={konfirmasiPassword}
                                        onChange={(e) => setKonfirmasiPassword(e.target.value)}
                                        placeholder="Ulangi kata sandi baru"
                                        className="w-full px-5 py-3 h-[46px] rounded-[10px] border border-[#4B2E2B] focus:outline-none focus:ring-2 focus:ring-[#C69C6D]/50 focus:border-[#C69C6D] transition-all text-[#4B2E2B]"
                                        required
                                        minLength={6}
                                    />
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
