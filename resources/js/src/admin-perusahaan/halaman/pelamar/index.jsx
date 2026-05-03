import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../konteks/AdminContext';
import HeaderPelamar from './komponen/HeaderPelamar';
import KartuLowonganPelamar from './komponen/KartuLowonganPelamar';
import DetailPelamar from './komponen/DetailPelamar';
import ProfilPelamar from './komponen/ProfilPelamar';

const HalamanPelamar = () => {
    const { setTopbarAction } = useAdmin();
    const [activeFilter, setActiveFilter] = useState('All');

    // Data Dummy realistis sesuai desain Figma
    const dataLowongan = [
        {
            id: 1,
            judul: 'Senior Barista',
            tanggalPublikasi: '15 Maret 2026',
            status: 'Active',
            jumlahPelamar: 4
        },
        {
            id: 2,
            judul: 'Head Roaster',
            tanggalPublikasi: '12 Maret 2026',
            status: 'Draft',
            jumlahPelamar: 4
        },
        {
            id: 3,
            judul: 'Service Attendant',
            tanggalPublikasi: '09 Maret 2026',
            status: 'Closed',
            jumlahPelamar: 4
        }
    ];

    const [selectedLowongan, setSelectedLowongan] = useState(null);
    const [selectedPelamar, setSelectedPelamar] = useState(null);

    const filteredLowongan = dataLowongan.filter(item => 
        activeFilter === 'All' || item.status === activeFilter
    );

    const stats = {
        totalLowongan: 12,
        totalPelamar: 24
    };

    useEffect(() => {
        if (selectedPelamar) {
            setTopbarAction({
                prefix: `Lowongan / ${selectedLowongan?.judul} / `,
                highlight: 'Pelamar',
                onBack: () => setSelectedPelamar(null)
            });
        } else if (selectedLowongan) {
            setTopbarAction({
                prefix: 'Lowongan / ',
                highlight: selectedLowongan.judul,
                onBack: () => setSelectedLowongan(null)
            });
        } else {
            setTopbarAction(null);
        }
    }, [selectedLowongan, selectedPelamar, setTopbarAction]);

    const handleSelectLowongan = (id) => {
        const lowongan = dataLowongan.find(l => l.id === id);
        setSelectedLowongan(lowongan);
    };

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
            />

            {/* List Lowongan */}
            <div className="flex flex-col gap-[20px] w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                {filteredLowongan.length > 0 ? (
                    filteredLowongan.map((lowongan) => (
                        <KartuLowonganPelamar 
                            key={lowongan.id} 
                            lowongan={lowongan} 
                            onDetail={() => setSelectedLowongan(lowongan)}
                        />
                    ))
                ) : (
                    <div className="bg-[#EAE4DC] border border-dashed border-[#CCCCCC] rounded-[10px] p-20 flex flex-col items-center justify-center">
                        <p className="font-poppins text-[#4B2E2B]/50 text-center italic">
                            Tidak ada lowongan dengan status "{activeFilter}"
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HalamanPelamar;
