import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import layananAutentikasi from '../layanan/layananAutentikasi';

/**
 * gunakanMasuk — Custom Hook (Behavioral: Facade Pattern + Container Pattern).
 *
 * FACADE PATTERN:
 * Hook ini menyembunyikan kompleksitas alur masuk dari komponen UI.
 * Komponen `Masuk.jsx` tidak perlu tahu tentang:
 * - Bagaimana token disimpan di localStorage.
 * - Logika routing berdasarkan peran (Pelamar, Admin_Perusahaan, dll).
 * - Bagaimana state loading dan error dikelola.
 * Cukup panggil `menanganiMasuk(email, kataSandi)` dan tampilkan hasilnya.
 *
 * CONTAINER PATTERN:
 * Hook ini bertindak sebagai lapisan "Container" yang memisahkan
 * logika bisnis dari tampilan (Presentational Component).
 * Komponen `Masuk.jsx` menjadi murni Presentational setelah
 * menggunakan hook ini.
 *
 * @returns {Object} State dan handler yang dibutuhkan komponen login.
 */
const gunakanMasuk = () => {
    // --- State Management ---
    const [sedangMemuat, setSedangMemuat] = useState(false);
    const [pesanGalat, setPesanGalat] = useState('');

    const navigate = useNavigate();

    /**
     * Peta routing berdasarkan peran pengguna.
     * Menggunakan pola lookup object (lebih bersih dari if-else berantai).
     * Menambahkan peran baru cukup dengan menambahkan entri di sini.
     */
    const petaRoutingPeran = {
        'Pelamar':          '/',
        'Admin_Perusahaan': '/admin',
        'Super_Admin':      '/super-admin',
    };

    /**
     * Menyimpan data sesi pengguna ke penyimpanan lokal.
     * Dipusatkan di sini agar mudah diubah (misal: ganti ke sessionStorage).
     *
     * @param {Object} data Data pengguna dan token dari API.
     */
    const simpanSesiPengguna = (data) => {
        localStorage.setItem('token',    data.token);
        localStorage.setItem('peran',    data.pengguna.peran);
        localStorage.setItem('pengguna', JSON.stringify(data.pengguna));
    };

    /**
     * Menangani seluruh alur proses masuk pengguna.
     * Dipanggil oleh komponen saat formulir disubmit.
     *
     * @param {string} email     Alamat email pengguna.
     * @param {string} kataSandi Kata sandi pengguna.
     */
    const menanganiMasuk = async (email, kataSandi) => {
        // Reset pesan galat sebelum mencoba masuk
        setSedangMemuat(true);
        setPesanGalat('');

        try {
            // Panggil layanan autentikasi (Facade ke API)
            const respons = await layananAutentikasi.masuk({
                email,
                kata_sandi: kataSandi,
            });

            // Jika respons memiliki token, sesi berhasil dibuat
            if (respons && respons.data?.token) {
                // Simpan data sesi ke penyimpanan lokal
                simpanSesiPengguna(respons.data);

                // Arahkan ke halaman yang sesuai berdasarkan peran
                const tujuan = petaRoutingPeran[respons.data.pengguna.peran] ?? '/';
                navigate(tujuan);
            }
        } catch (galat) {
            // Tangani galat dari API dan tampilkan pesan yang ramah pengguna
            console.error('[gunakanMasuk] Galat saat masuk:', galat);
            setPesanGalat(
                galat.response?.data?.message
                    ?? 'Gagal masuk. Periksa kembali email dan kata sandi Anda.'
            );
        } finally {
            // Pastikan indikator loading selalu dimatikan, apapun hasilnya
            setSedangMemuat(false);
        }
    };

    // Kembalikan state dan handler yang dibutuhkan oleh komponen Presentational
    return {
        sedangMemuat,
        pesanGalat,
        menanganiMasuk,
    };
};

export default gunakanMasuk;
