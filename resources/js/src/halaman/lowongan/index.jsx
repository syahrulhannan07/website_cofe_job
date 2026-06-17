import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import HeaderHero from "./komponen/HeaderHero";
import JobCard from "./komponen/JobCard";
import Pagination from "./komponen/Pagination";
import api from "../../layanan/api";
import HalamanErrorKopi from "../../komponen/umum/HalamanErrorKopi";
import LoadingKopi from "../../komponen/umum/LoadingKopi";

const Lowongan = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [currentPage, setCurrentPage] = useState(1);
    const [lowonganData, setLowonganData] = useState([]);
    const [sedangMemuat, setSedangMemuat] = useState(true);
    const [error, setError] = useState(null);

    // Pengambilan data lowongan dari API Laravel
    useEffect(() => {
        const ambilData = async () => {
            try {
                setSedangMemuat(true);
                // Kita ambil data dalam jumlah besar agar fitur filter & pagination frontend tetap bekerja sesuai desain asli
                const respons = await api.get('/lowongan', { 
                    params: { per_page: 100 },
                    timeout: 15000 
                });
                if (respons.data && respons.data.data) {
                    setLowonganData(respons.data.data);
                    setError(null);
                }
            } catch (err) {
                console.error("Gagal mengambil data lowongan:", err);
                if (err.code === 'ECONNABORTED' || !err.response) {
                    setError('timeout');
                } else {
                    setError('error');
                }
            } finally {
                setSedangMemuat(false);
            }
        };

        ambilData();
    }, []);

    // State untuk input yang sedang diketik/dipilih
    const [searchQuery, setSearchQuery] = useState("");
    const [locationQuery, setLocationQuery] = useState("");

    // State untuk filter yang aktif (setelah tombol Cari ditekan)
    const [activeSearchQuery, setActiveSearchQuery] = useState("");
    const [activeLocationQuery, setActiveLocationQuery] = useState("");

    const itemsPerPage = 12;

    // Hitung kemunculan lokasi dari semua lowongan yang tersedia untuk filter cepat di Hero
    const locationCounts = lowonganData.reduce((acc, job) => {
        const loc = job.kecamatan || job.lokasi;
        acc[loc] = (acc[loc] || 0) + 1;
        return acc;
    }, {});

    // Ambil maksimal 5 kecamatan dengan lowongan terbanyak
    const topLocations = Object.keys(locationCounts)
        .sort((a, b) => locationCounts[b] - locationCounts[a])
        .slice(0, 5);

    // Filter lowongan berdasarkan pencarian AKTIF (posisi dan lokasi/kecamatan)
    const filteredJobs = lowonganData.filter((job) => {
        const matchSearch = job.posisi
            .toLowerCase()
            .includes(activeSearchQuery.toLowerCase());
        const matchLocation =
            activeLocationQuery === "" || 
            job.kecamatan === activeLocationQuery || 
            job.lokasi === activeLocationQuery;
        return matchSearch && matchLocation;
    });

    const handleSearch = () => {
        setActiveSearchQuery(searchQuery);
        setActiveLocationQuery(locationQuery);
        setCurrentPage(1); // Reset halaman ke 1 saat pencarian baru dilakukan
    };

    const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
    const validCurrentPage = Math.min(
        Math.max(currentPage, 1),
        Math.max(totalPages, 1),
    );

    const currentJobs = filteredJobs.slice(
        (validCurrentPage - 1) * itemsPerPage,
        validCurrentPage * itemsPerPage,
    );

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Tampilkan Halaman Error jika terjadi masalah koneksi atau server
    if (error === 'timeout' || error === 'error') {
        return <HalamanErrorKopi code="500" message="Koneksi Terganggu" subMessage="Gagal memuat daftar lowongan. Silakan periksa koneksi internet Anda." />;
    }

    return (
        <div className="w-full flex-1 bg-[#F3EDE6] flex flex-col font-poppins relative overflow-x-hidden">
            <HeaderHero
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                locationQuery={locationQuery}
                setLocationQuery={setLocationQuery}
                topLocations={topLocations}
                onSearch={handleSearch}
            />

            {/* Explore Section (Frame 81) - Dark Background */}
            <div className="w-full bg-[#4B2E2B] py-12 flex-1">
                <div className="max-w-5xl mx-auto px-4 flex flex-col items-center lg:items-start">
                    <h2 className="font-poppins font-bold text-3xl leading-snug text-[#F3EDE6] mb-6 text-left">
                        Eksplorasi Karir
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full min-h-72">
                        {sedangMemuat ? (
                            <div className="col-span-1 md:col-span-2 lg:col-span-3">
                                <LoadingKopi fullScreen={false} gelapBg={true} pesan="Menyeduh Lowongan Terbaik..." />
                            </div>
                        ) : currentJobs.length > 0 ? (

                            currentJobs.map((lowongan) => (
                                <div key={lowongan.id} className="kartu-item-lowongan">
                                    <JobCard
                                        lowongan={lowongan}
                                        onDetail={(job) => {
                                            // Navigasi ke halaman detail dengan ID spesifik
                                            navigate(`/lowongan/${job.id}`, { state: { job: job } });
                                            window.scrollTo({
                                                top: 0,
                                                behavior: "smooth",
                                            });
                                        }}
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-center items-center h-[200px]">
                                <p className="font-poppins text-sm text-[#F3EDE6]/70">
                                    Tidak ada lowongan yang sesuai dengan kriteria pencarian Anda.
                                </p>
                            </div>
                        )}
                    </div>

                    {totalPages > 1 && (
                        <Pagination
                            currentPage={validCurrentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Lowongan;
