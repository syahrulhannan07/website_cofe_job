import React from 'react';

const KartuLowongan = ({ lowongan }) => {
    // Style Mapping based on status
    const statusStyles = {
        'Active': {
            cardBg: 'bg-[#F7B750]',
            titleColor: 'text-[#4B2E2B]',
            subColor: 'text-[#4B2E2B]',
            badgeBg: 'bg-[#92E3A9]',
            badgeText: 'text-[#3FAD5E]',
            btnBg: 'bg-[#4B2E2B]',
            btnText: 'text-[#F3EDE6]',
            separator: 'border-[#4B2E2B]/20'
        },
        'Draft': {
            cardBg: 'bg-[#EAE4DC]',
            titleColor: 'text-[#4B2E2B]',
            subColor: 'text-[#4B2E2B]',
            badgeBg: 'bg-[#CBCBCB]',
            badgeText: 'text-[#708075]',
            btnBg: 'bg-[#4B2E2B]',
            btnText: 'text-[#F3EDE6]',
            separator: 'border-[#4B2E2B]/20'
        },
        'Closed': {
            cardBg: 'bg-[#4B2E2B]',
            titleColor: 'text-[#C69C6D]',
            subColor: 'text-[#C69C6D]',
            badgeBg: 'bg-[#E89B9B]',
            badgeText: 'text-[#A04A4A]',
            btnBg: 'bg-[#C69C6D]',
            btnText: 'text-[#F3EDE6]',
            separator: 'border-[#C69C6D]/20'
        }
    };

    const style = statusStyles[lowongan.status] || statusStyles['Draft'];

    return (
        <div className={`rounded-[30px] p-8 flex flex-col justify-between min-h-[220px] transition-all hover:-translate-y-1 shadow-sm ${style.cardBg}`}>
            {/* Top Section */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className={`font-jakarta font-bold text-[22px] mb-2 ${style.titleColor}`}>
                        {lowongan.posisi}
                    </h3>
                    <p className={`font-poppins text-[14px] ${style.subColor}`}>
                        Dipublikasi pada {lowongan.tanggalPublikasi}
                    </p>
                </div>
                <div className={`px-4 py-1.5 rounded-[50px] font-semibold text-[13px] ${style.badgeBg} ${style.badgeText}`}>
                    {lowongan.status}
                </div>
            </div>

            {/* Separator */}
            <div className={`w-full border-t mb-5 ${style.separator}`}></div>

            {/* Bottom Section */}
            <div className="flex justify-between items-center mt-auto">
                <div className={`font-poppins font-medium text-[15px] ${style.subColor}`}>
                    Total Pelamar <span className="font-bold ml-1">{lowongan.totalPelamar}</span>
                </div>
                <button className={`px-6 py-2.5 rounded-[50px] font-bold text-[14px] transition-transform active:scale-95 hover:opacity-90 ${style.btnBg} ${style.btnText}`}>
                    Lihat Pelamar
                </button>
            </div>
        </div>
    );
};

export default KartuLowongan;
