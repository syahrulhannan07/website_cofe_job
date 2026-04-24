import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import HeaderHero from './components/HeaderHero';
import JobCard from './components/JobCard';
import Pagination from './components/Pagination';
import DetailLowongan from './components/DetailLowongan';
import { daftarLowongan } from './data/dummyJobs';

const Lowongan = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    const [currentPage, setCurrentPage] = useState(1);
    
    // Initialize state from router location.state if it exists, otherwise null
    const [selectedJob, setSelectedJob] = useState(location.state?.selectedJob || null); 
    const [sourcePage, setSourcePage] = useState(location.state?.from || '/lowongan');
    
    // Clear location state after reading it so that a page refresh doesn't force us back into detail view unexpectedly,
    // though keeping it isn't strictly harmful, it's better practice to manage it locally once loaded.
    useEffect(() => {
        if (location.state?.selectedJob) {
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, navigate, location.pathname]);
    
    // State untuk input yang sedang diketik/dipilih
    const [searchQuery, setSearchQuery] = useState('');
    const [locationQuery, setLocationQuery] = useState('');
    
    // State untuk filter yang aktif (setelah tombol Cari ditekan)
    const [activeSearchQuery, setActiveSearchQuery] = useState('');
    const [activeLocationQuery, setActiveLocationQuery] = useState('');
    
    const itemsPerPage = 12;
    
    // Hitung kemunculan lokasi dari semua lowongan yang tersedia (aktif)
    const locationCounts = daftarLowongan.reduce((acc, job) => {
        acc[job.lokasi] = (acc[job.lokasi] || 0) + 1;
        return acc;
    }, {});
    
    // Ambil maksimal 5 kecamatan dengan lowongan terbanyak
    const topLocations = Object.keys(locationCounts)
        .sort((a, b) => locationCounts[b] - locationCounts[a])
        .slice(0, 5);

    // Filter lowongan berdasarkan pencarian AKTIF (judul dan lokasi)
    const filteredJobs = daftarLowongan.filter(job => {
        const matchSearch = job.judul.toLowerCase().includes(activeSearchQuery.toLowerCase());
        const matchLocation = activeLocationQuery === '' || job.lokasi === activeLocationQuery;
        return matchSearch && matchLocation;
    });

    const handleSearch = () => {
        setActiveSearchQuery(searchQuery);
        setActiveLocationQuery(locationQuery);
        setCurrentPage(1); // Reset halaman ke 1 saat pencarian baru dilakukan
    };

    const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
    const validCurrentPage = Math.min(Math.max(currentPage, 1), Math.max(totalPages, 1));
    
    const currentJobs = filteredJobs.slice(
        (validCurrentPage - 1) * itemsPerPage,
        validCurrentPage * itemsPerPage
    );

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    console.log("Status Lowongan saat ini. selectedJob:", selectedJob);

    // Render komponen Detail jika ada lowongan yang dipilih
    if (selectedJob) {
        return (
            <DetailLowongan 
                lowongan={selectedJob} 
                onBack={() => {
                    if (sourcePage === '/') {
                        navigate('/'); // Kembali ke beranda jika asalnya dari beranda
                    } else {
                        setSelectedJob(null); // Jika asalnya dari lowongan, cukup hilangkan detail
                    }
                }} 
            />
        );
    }

    return (
        <div className="w-full min-h-screen bg-[#F3EDE6] flex flex-col font-poppins relative overflow-x-hidden">
            <HeaderHero 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                locationQuery={locationQuery}
                setLocationQuery={setLocationQuery}
                topLocations={topLocations}
                onSearch={handleSearch}
            />

            {/* Explore Section (Frame 81) - Dark Background */}
            <div className="w-full bg-[#4B2E2B] py-[80px] pb-[128px]">
                <div className="max-w-[1232px] mx-auto px-4 flex flex-col items-center lg:items-start">
                    
                    <h2 className="font-poppins font-bold text-[36px] leading-[54px] text-[#F3EDE6] mb-[40px] text-left">
                        Eksplorasi Karir
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px] w-full min-h-[500px]">
                        {currentJobs.length > 0 ? (
                            currentJobs.map((lowongan) => (
                                <JobCard 
                                    key={lowongan.id} 
                                    lowongan={lowongan} 
                                    onDetail={(job) => {
                                        setSourcePage('/lowongan'); // Pastikan asalnya diset ke /lowongan
                                        setSelectedJob(job);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }} 
                                />
                            ))
                        ) : (
                            <div className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-center items-center h-[300px]">
                                <p className="font-poppins text-[20px] text-[#F3EDE6]/70">Tidak ada lowongan yang sesuai dengan kriteria pencarian Anda.</p>
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


