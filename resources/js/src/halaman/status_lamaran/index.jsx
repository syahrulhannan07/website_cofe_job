import React, { useState, useEffect } from 'react'; // [UPDATE LOGIC]
import PenyaringStatus from './komponen/PenyaringStatus';
import GarisWaktuStatus from './komponen/GarisWaktuStatus';
import api from '../../layanan/api'; // [UPDATE LOGIC]

const StatusLamaran = () => {
    const [statusAktif, setStatusAktif] = useState('Semua');
    const [kataKunci, setKataKunci] = useState('');
    // [UPDATE LOGIC]
    const [dataLamaran, setDataLamaran] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // [UPDATE LOGIC]
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await api.get('/pelamar/lamaran');
                if (response.data && response.data.status === 'success') {
                    const rawData = response.data.data || [];
                    const mappedData = rawData.map(item => ({
                        id: item.id_lamaran,
                        posisi: item.posisi || 'Posisi Tidak Diketahui',
                        nama_perusahaan: item.nama_kafe || 'Kafe Tidak Diketahui',
                        logo_perusahaan: item.logo_kafe,
                        tanggal_lamar: item.dibuat_pada 
                            ? new Date(item.dibuat_pada).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                            : 'Tanggal tidak tersedia',
                        status: item.status || 'Diproses'
                    }));
                    setDataLamaran(mappedData);
                } else {
                    setError('Gagal memuat data lamaran.');
                }
            } catch (err) {
                console.error(err);
                setError('Terjadi kesalahan saat memuat data lamaran.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Fungsi pemfilteran data secara real-time
    const dataTerpilih = dataLamaran.filter(item => {
        const cocokStatus = statusAktif === 'Semua' || item.status.toLowerCase().includes(statusAktif.toLowerCase());
        const cocokTeks = item.posisi.toLowerCase().includes(kataKunci.toLowerCase()) || 
                          item.nama_perusahaan.toLowerCase().includes(kataKunci.toLowerCase());
        return cocokStatus && cocokTeks;
    });

    return (
        <div className="halaman-status-lamaran-induk w-full min-h-screen bg-[#F3EDE6]">
            {/* Konten Utama Terpusat */}
            <main className="wadah-konten-maksimal w-full max-w-[1300px] mx-auto px-6 py-16 md:py-24">
                
                {/* Bagian Filter & Pencarian */}
                <section className="area-interaksi-status relative z-30">
                    <PenyaringStatus 
                        statusAktif={statusAktif} 
                        setStatusAktif={setStatusAktif} 
                        kataKunci={kataKunci}
                        setKataKunci={setKataKunci}
                    />
                </section>

                {/* Bagian Timeline & Kartu Status */}
                <section className="area-garis-waktu-lamaran mt-4">
                    {/* [UPDATE LOGIC] */}
                    {loading ? (
                        <div className="flex justify-center items-center py-20 text-[#4B2E2B]/60 font-medium font-poppins text-lg italic">
                            Sedang memuat riwayat lamaran...
                        </div>
                    ) : error ? (
                        <div className="flex justify-center items-center py-20 text-[#4B2E2B]/60 font-medium font-poppins text-lg italic">
                            {error}
                        </div>
                    ) : (
                        <GarisWaktuStatus lamaran={dataTerpilih} />
                    )}
                </section>
            </main>

            {/* Dekorasi Latar Belakang Halus */}
            <div className="dekorasi-lingkaran absolute top-0 right-0 w-[500px] h-[500px] bg-[#4B2E2B]/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
            <div className="dekorasi-lingkaran-2 absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#C69C6D]/10 rounded-full blur-[80px] -z-10 pointer-events-none"></div>
        </div>
    );
};

export default StatusLamaran;
