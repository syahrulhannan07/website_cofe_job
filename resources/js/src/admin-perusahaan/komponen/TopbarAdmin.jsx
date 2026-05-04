import React from 'react';
import { useAdmin } from '../konteks/AdminContext';

// Aset Topbar
import logoPng               from '../../aset/logo.png';
import placeholderProfilePng from '../aset/profil-perusahaan/placeholder_profile.png';
import personCircleSvg       from '../aset/sidebar/PersonCircle.svg';
import notificationPng       from '../aset/sidebar/Notification.png';
import checkMarkPng          from '../aset/sidebar/Instagram Check Mark.png';

const TopbarAdmin = ({ identitas }) => {
    const { topbarAction } = useAdmin();

    // Mapping data identitas
    const namaPengelola = identitas?.nama_pengguna || "Admin Cafe";
    const namaPerusahaan = identitas?.nama_perusahaan || "Memuat...";
    const isVerified = identitas?.status_verifikasi === 'Diterima'; // Di database 'Diterima' berarti verified
    const avatarUrl = identitas?.logo_perusahaan || placeholderProfilePng;

    return (
        <header className="topbar-admin w-full h-[85px] flex flex-col justify-center px-[32px] bg-[#F3EDE6] flex-shrink-0 relative">
            <div className="isi-topbar flex items-center justify-between w-full">
                <div className="area-notifikasi flex items-center">
                    {topbarAction ? (
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={topbarAction.onBack}
                                className="p-1 hover:bg-[#4B2E2B]/10 rounded-full transition-colors flex items-center justify-center cursor-pointer"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#4B2E2B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                            <h2 className="font-poppins font-semibold text-[20px] text-[#4B2E2B]">
                                {topbarAction.prefix} <span className="font-bold">{topbarAction.highlight}</span>
                            </h2>
                        </div>
                    ) : (
                        <img src={notificationPng} alt="Notifikasi" className="ikon-notifikasi w-[32px] h-[32px] object-contain cursor-pointer" />
                    )}
                </div>

                <div className="area-profil-admin flex items-center gap-4">
                    <div className="teks-profil flex flex-col items-end">
                        <span className="nama-pengelola font-poppins font-bold text-[18px] leading-tight text-black">
                            {namaPengelola}
                        </span>
                        <div className="wadah-nama-perusahaan flex items-center gap-1">
                            {isVerified && (
                                <img src={checkMarkPng} alt="Verified" className="w-[14px] h-[14px] object-contain" />
                            )}
                            <span className="nama-perusahaan font-poppins font-medium text-[14px] text-[#4B2E2B]">
                                {namaPerusahaan}
                            </span>
                        </div>
                    </div>
                    <div className="avatar-admin w-[55px] h-[55px] rounded-[12px] overflow-hidden flex items-center justify-center">
                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                </div>
            </div>

            <div className="wadah-garis-bawah-nav absolute bottom-0 left-[32px] right-[32px]">
                <div className="garis-bawah-nav w-full border-t border-black border-opacity-60" />
            </div>
        </header>
    );
};

export default TopbarAdmin;
