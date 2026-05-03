import React, { useState, useEffect, useCallback } from 'react';
import { useAdmin } from '../../konteks/AdminContext';
import HeaderPelamar from './komponen/HeaderPelamar';
import KartuLowonganPelamar from './komponen/KartuLowonganPelamar';
import DetailPelamar from './komponen/DetailPelamar';
import ProfilPelamar from './komponen/ProfilPelamar';
import api from '../../../layanan/api';

import LoadingKopi from '../../komponen/LoadingKopi';

const HalamanPelamar = () => {
    const { setTopbarAction } = useAdmin();
    const [activeFilter, setActiveFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [dataLowongan, setDataLowongan] = useState([]);
    const [stats, setStats] = useState({ totalLowongan: 0, totalPelamar: 0 });
    const [loading, setLoading] = useState(true);

    const [selectedLowongan, setSelectedLowongan] = useState(null);
    const [selectedPelamar, setSelectedPelamar] = useState(null);

    // Fetch data dari API
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (activeFilter !== 'All') {
                // Map status ke bahasa database (Aktif/Ditutup)
                params.status = activeFilter === 'Active' ? 'Aktif' : 
                               activeFilter === 'Closed' ? 'Ditutup' : 
                               activeFilter;
            }
            if (searchQuery) {
                params.search = searchQuery;
            }

            const response = await api.get('/admin/lowongan', { params });
            setDataLowongan(response.data.data);
            
            // Ambil statistik dari meta response
            if (response.data.meta?.statistik) {
                setStats({
                    totalLowongan: response.data.meta.statistik.total_lowongan,
                    totalPelamar: response.data.meta.statistik.total_pelamar
                });
            }
        } catch (error) {
            console.error("Gagal mengambil data lowongan:", error);
        } finally {
            setLoading(false);
        }
    }, [activeFilter, searchQuery]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (selectedPelamar) {
            setTopbarAction({
                prefix: `Lowongan / ${selectedLowongan?.judul || selectedLowongan?.posisi} / `,
                highlight: 'Pelamar',
                onBack: () => setSelectedPelamar(null)
            });
        } else if (selectedLowongan) {
            setTopbarAction({
                prefix: 'Lowongan / ',
                highlight: selectedLowongan.posisi || selectedLowongan.judul,
                onBack: () => setSelectedLowongan(null)
            });
        } else {
            setTopbarAction(null);
        }
    }, [selectedLowongan, selectedPelamar, setTopbarAction]);

    const handleSelectPelamar = (pelamar) => {
        setSelectedPelamar(pelamar);
    };

    if (selectedPelamar) {
        return (
            <div className="flex-1 w-full flex flex-col p-5 md:p-8 lg:p-10 bg-[#F4ECE9] min-h-screen overflow-x-hidden">
                <ProfilPelamar pelamar={selectedPelamar} />
            </div>
        );
    }

    if (selectedLowongan) {
        return (
            <div className="flex-1 w-full flex flex-col p-5 md:p-8 lg:p-10 bg-[#F4ECE9] min-h-screen overflow-x-hidden">
                <DetailPelamar 
                    lowongan={selectedLowongan} 
                    onBack={() => setSelectedLowongan(null)}
                    onSelectPelamar={handleSelectPelamar}
                />
            </div>
        );
    }

    return (
        <div className="flex-1 w-full flex flex-col p-5 md:p-8 lg:p-10 bg-[#F4ECE9] min-h-screen overflow-x-hidden">
            {/* Statistik, Search & Filter */}
            <HeaderPelamar 
                stats={stats} 
                activeFilter={activeFilter} 
                setActiveFilter={setActiveFilter} 
                onSearch={setSearchQuery}
            />

            {/* List Lowongan */}
            <div className="flex flex-col gap-[20px] w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                {loading ? (
                    <LoadingKopi fullScreen={false} />
                ) : dataLowongan.length > 0 ? (
                    dataLowongan.map((lowongan) => (
                        <KartuLowonganPelamar 
                            key={lowongan.id} 
                            lowongan={lowongan} 
                            onDetail={() => setSelectedLowongan(lowongan)}
                        />
                    ))
                ) : (
                    <div className="bg-[#EAE4DC] border border-dashed border-[#CCCCCC] rounded-[10px] p-20 flex flex-col items-center justify-center">
                        <p className="font-poppins text-[#4B2E2B]/50 text-center italic">
                            {searchQuery ? `Tidak ada lowongan ditemukan untuk "${searchQuery}"` : `Tidak ada lowongan dengan status "${activeFilter}"`}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HalamanPelamar;
