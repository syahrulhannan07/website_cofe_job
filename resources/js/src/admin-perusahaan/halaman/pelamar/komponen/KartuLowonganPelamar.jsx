import React from 'react';

const KartuLowonganPelamar = ({ lowongan, onDetail }) => {
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    // Map status dari API ke theme internal
    const statusMap = {
        'Aktif': 'active',
        'Draft': 'draft',
        'Ditutup': 'closed'
    };
    const statusKey = statusMap[lowongan.status] || 'draft';

    // Map status to specific color themes based on Figma design
    const themes = {
        active: {
            cardBg: 'bg-[#F7B750]',
            titleText: 'text-[#4B2E2B]',
            dateText: 'text-[#4B2E2B]',
            tagBg: 'bg-[#92E3A9]',
            tagText: 'text-[#3FAD5E]',
            statsText: 'text-[#4B2E2B]',
            btnBg: 'bg-[#4B2E2B]',
            btnText: 'text-[#F3EDE6]'
        },
        draft: {
            cardBg: 'bg-[#EAE4DC]',
            titleText: 'text-[#4B2E2B]',
            dateText: 'text-[#4B2E2B]',
            tagBg: 'bg-[#CBCBCB]',
            tagText: 'text-[#708075]',
            statsText: 'text-[#4B2E2B]',
            btnBg: 'bg-[#4B2E2B]',
            btnText: 'text-[#F3EDE6]'
        },
        closed: {
            cardBg: 'bg-[#4B2E2B]',
            titleText: 'text-[#C69C6D]',
            dateText: 'text-[#C69C6D]',
            tagBg: 'bg-[#E89B9B]',
            tagText: 'text-[#A04A4A]',
            statsText: 'text-[#C69C6D]',
            btnBg: 'bg-[#C69C6D]',
            btnText: 'text-[#F3EFE6]'
        }
    };

    const theme = themes[statusKey];

    return (
        <div className={`w-full max-w-[1055px] min-h-[104px] ${theme.cardBg} border border-[#CCCCCC]/80 rounded-[10px] px-6 md:px-[28px] py-4 md:py-[20px] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-300 hover:shadow-lg group`}>
            {/* Left Section: Info */}
            <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-3">
                    <h3 className={`font-poppins font-bold text-[18px] md:text-[20px] leading-tight ${theme.titleText}`}>
                        {lowongan.posisi}
                    </h3>
                    <div className={`px-4 py-1 rounded-full text-[10px] font-poppins font-medium ${theme.tagBg} ${theme.tagText}`}>
                        {lowongan.status === 'Aktif' ? 'Active' : lowongan.status === 'Ditutup' ? 'Closed' : 'Draft'}
                    </div>
                </div>
                <p className={`font-poppins text-[12px] md:text-[13px] ${theme.dateText}`}>
                    Dipublikasi pada {formatDate(lowongan.batas_awal)}
                </p>
            </div>

            {/* Right Section: Action (Stacked) */}
            <div className="flex flex-col items-center md:items-end w-full md:w-auto">
                <span className={`font-poppins font-semibold text-[18px] md:text-[20px] ${theme.statsText} whitespace-nowrap mb-0`}>
                    Total Pelamar {lowongan.jumlah_pelamar}
                </span>
                <button 
                    onClick={onDetail}
                    className={`w-full md:w-[162px] ${theme.btnBg} ${theme.btnText} px-[24px] h-[34px] rounded-[10px] font-poppins font-semibold text-[15px] hover:opacity-90 transition-all duration-200 shadow-sm whitespace-nowrap`}
                >
                    Lihat Pelamar
                </button>
            </div>
        </div>
    );
};

export default KartuLowonganPelamar;
