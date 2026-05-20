import React from 'react';
import BadgeStatus from './BadgeStatus';
import ikonView from '../../../aset/akun admin/view.svg';

const DaftarAdmin = ({ data, onSuspend, onAktifkan, onLihatDetail }) => {
    if (data.length === 0) {
        return (
            <div className="bg-white rounded-[12px] border border-[#EAE4DC] flex flex-col items-center justify-center py-16 gap-3">
                <p className="text-[16px] font-semibold text-[#4B2E2B]"
                   style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Tidak ada data ditemukan
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[10px] border border-[#EAE4DC] overflow-hidden shadow-sm">
            {/* Header - Frame 253 */}
            <div
                className="grid items-center px-6"
                style={{
                    gridTemplateColumns: '1.8fr 1.8fr 2.2fr 1fr 0.8fr',
                    background: '#EAE4DC',
                    height: '63px',
                }}
            >
                {['Nama Pengelola', 'Kafe Terkait', 'Email', 'Status', 'Aksi'].map((h) => (
                    <span key={h}
                          className="font-semibold text-[13px] text-[#4B2E2B]"
                          style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {h}
                    </span>
                ))}
            </div>

            {/* Rows - Frame 254 */}
            {data.map((admin) => (
                <div
                    key={admin.id}
                    className="grid items-center px-6 border-b border-[#EAE4DC] last:border-b-0 hover:bg-[#F9F6F3] transition-colors"
                    style={{
                        gridTemplateColumns: '1.8fr 1.8fr 2.2fr 1fr 0.8fr',
                        height: '63px',
                    }}
                >
                    {/* Nama Pengelola */}
                    <span className="font-semibold text-[13px] text-[#4B2E2B] truncate pr-2"
                          style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {admin.nama_pengguna}
                    </span>

                    {/* Kafe Terkait */}
                    <span className="font-semibold text-[13px] text-[#4B2E2B] truncate pr-2"
                          style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {admin.nama_perusahaan}
                    </span>

                    {/* Email */}
                    <span className="font-semibold text-[13px] text-[#4B2E2B] truncate pr-2"
                          style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {admin.email}
                    </span>

                    {/* Status */}
                    <div>
                        <BadgeStatus status={admin.status} />
                    </div>

                    {/* Aksi - view.svg without border */}
                    <div className="flex items-center">
                        <button
                            onClick={() => onLihatDetail(admin)}
                            className="w-[30px] h-[30px] flex items-center justify-center hover:bg-[#EAE4DC]/40 rounded-full transition-all focus:outline-none"
                            title="Lihat Detail Admin"
                        >
                            <img
                                src={ikonView}
                                alt="Lihat Detail"
                                className="w-[30px] h-[30px]"
                                style={{
                                    filter: 'none', // Raw svg has fill:rgb(75,46,43) matching our design
                                }}
                            />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DaftarAdmin;
