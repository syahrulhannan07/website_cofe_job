import React from 'react';
import KartuLowongan from './KartuLowongan';

const DaftarLowongan = () => {
    // Dummy data mimicking the Figma design
    const dummyData = [
        {
            id: 1,
            posisi: 'Senior Barista',
            tanggalPublikasi: '15 Maret 2026',
            status: 'Active',
            totalPelamar: 4
        },
        {
            id: 2,
            posisi: 'Head Roaster',
            tanggalPublikasi: '12 Maret 2026',
            status: 'Draft',
            totalPelamar: 4
        },
        {
            id: 3,
            posisi: 'Service Atten',
            tanggalPublikasi: '09 Maret 2026',
            status: 'Closed',
            totalPelamar: 4
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {dummyData.map(lowongan => (
                <KartuLowongan key={lowongan.id} lowongan={lowongan} />
            ))}
        </div>
    );
};

export default DaftarLowongan;
