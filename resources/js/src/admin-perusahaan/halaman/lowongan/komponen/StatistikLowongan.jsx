import React from 'react';

const StatistikLowongan = () => {
    const stats = [
        { 
            title: 'Lowongan', 
            value: '12', 
            icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4B2E2B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg> 
        },
        { 
            title: 'Total Pelamar', 
            value: '24', 
            icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4B2E2B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg> 
        },
    ];

    return (
        <div className="flex flex-row gap-6 mb-8">
            {stats.map((stat, index) => (
                <div key={index} className="bg-[#EAE4DC] rounded-[20px] p-6 flex flex-col justify-between w-[240px] h-[120px] shadow-sm">
                    <div className="flex justify-between items-start">
                        <span className="text-[#4B2E2B] font-jakarta font-semibold text-[16px]">{stat.title}</span>
                        <div className="p-2 bg-white/40 rounded-full">
                            {stat.icon}
                        </div>
                    </div>
                    <span className="text-[#4B2E2B] font-poppins font-bold text-[32px] mt-2">{stat.value}</span>
                </div>
            ))}
        </div>
    );
};

export default StatistikLowongan;
