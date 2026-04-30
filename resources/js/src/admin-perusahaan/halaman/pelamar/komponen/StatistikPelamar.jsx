import React from 'react';

const StatistikPelamar = () => {
    const stats = [
        { 
            label: 'Total Pelamar', 
            value: '1,245', 
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>, 
            color: 'bg-blue-500' 
        },
        { 
            label: 'Diproses', 
            value: '157', 
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, 
            color: 'bg-yellow-500' 
        },
        { 
            label: 'Diterima', 
            value: '12', 
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, 
            color: 'bg-green-500' 
        },
        { 
            label: 'Ditolak', 
            value: '43', 
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, 
            color: 'bg-red-500' 
        },
        { 
            label: 'Wawancara', 
            value: '38', 
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>, 
            color: 'bg-purple-500' 
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {stats.map((stat, i) => (
                <div key={i} className="bg-[#EAE4DC] border border-[#4B2E2B]/10 p-4 rounded-[12px] flex flex-col gap-2">
                    <div className={`w-10 h-10 ${stat.color} text-white rounded-full flex items-center justify-center text-[20px]`}>
                        {stat.icon}
                    </div>
                    <div>
                        <p className="font-poppins text-[12px] text-[#7A6153] uppercase tracking-wider">{stat.label}</p>
                        <p className="font-poppins font-bold text-[24px] text-[#4B2E2B]">{stat.value}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StatistikPelamar;
