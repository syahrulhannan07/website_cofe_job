import React from 'react';

// Aset Topbar
import logoPng         from '../../aset/logo.png';
import notificationPng from '../aset/sidebar/Notification.png';
import checkMarkPng    from '../aset/sidebar/Instagram Check Mark.png';

const TopbarAdmin = () => {
    return (
        <header className="topbar-admin w-full h-[85px] flex flex-col justify-center px-[32px] bg-[#F3EDE6] flex-shrink-0 relative">
            <div className="isi-topbar flex items-center justify-between w-full">
                <div className="area-notifikasi flex items-center">
                    <img src={notificationPng} alt="Notifikasi" className="ikon-notifikasi w-[32px] h-[32px] object-contain cursor-pointer" />
                </div>

                <div className="area-profil-admin flex items-center gap-4">
                    <div className="teks-profil flex flex-col items-end">
                        <span className="nama-pengelola font-poppins font-bold text-[18px] leading-tight text-black">
                            Admin Dermayu Beans
                        </span>
                        <div className="wadah-nama-perusahaan flex items-center gap-1">
                            <img src={checkMarkPng} alt="Verified" className="w-[14px] h-[14px] object-contain" />
                            <span className="nama-perusahaan font-poppins font-medium text-[14px] text-[#4B2E2B]">
                                Dermayu Beans & Co.
                            </span>
                        </div>
                    </div>
                    <div className="avatar-admin w-[55px] h-[55px] bg-[#C69C6D] rounded-[12px] overflow-hidden border border-[#4B2E2B] flex items-center justify-center">
                        <img src={logoPng} alt="Avatar" className="w-full h-full object-cover" />
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
