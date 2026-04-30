import React from 'react';

const StatistikPelamar = () => {
    const stats = [
        {
            title: 'Total Pelamar',
            count: 24,
            bgColor: 'bg-[#eae4dc]',
            textColor: 'text-[#4b2e2b]',
            iconColor: 'text-[#4b2e2b]',
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
            )
        },
        {
            title: 'Diproses',
            count: 10,
            bgColor: 'bg-[#eef2f6]',
            textColor: 'text-[#496b99]',
            iconColor: 'text-[#496b99]',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            title: 'Diterima',
            count: 3,
            bgColor: 'bg-[#edf7ee]',
            textColor: 'text-[#3d7a40]',
            iconColor: 'text-[#3d7a40]',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            )
        },
        {
            title: 'Ditolak',
            count: 7,
            bgColor: 'bg-[#fbeeed]',
            textColor: 'text-[#b73a3a]',
            iconColor: 'text-[#b73a3a]',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            )
        },
        {
            title: 'Wawancara',
            count: 4,
            bgColor: 'bg-[#fef8eb]',
            textColor: 'text-[#b8860b]',
            iconColor: 'text-[#b8860b]',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            )
        }
    ];

    return (
        <div className="flex flex-wrap gap-4 mb-6">
            {stats.map((stat, index) => (
                <div key={index} className={`${stat.bgColor} rounded-xl p-4 flex items-center justify-between min-w-[200px] flex-1`}>
                    <div className="flex items-center gap-3">
                        <div className={`${stat.iconColor} p-2 rounded-full bg-white bg-opacity-50`}>
                            {stat.icon}
                        </div>
                        <span className={`font-poppins font-medium ${stat.textColor}`}>{stat.title}</span>
                    </div>
                    <span className={`font-poppins font-bold text-2xl ${stat.textColor}`}>{stat.count}</span>
                </div>
            ))}
        </div>
    );
};

export default StatistikPelamar;
