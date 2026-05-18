import React from 'react';
import { NavLink } from 'react-router-dom';
import logoPng from '../../aset/logo.png';

// Import Ikon
import ikonDashboard from '../aset/sidebar/ikon-dashboard.svg';
import ikonVerifikasi from '../aset/sidebar/ikon-verifikasi.svg';
import ikonAkunAdmin  from '../aset/sidebar/ikon-akun-admin.png';
import ikonLogout     from '../aset/sidebar/ikon-logout.svg';

const SidebarPusat = ({ menuAktif, setMenuAktif, menanganiLogout }) => {
    const menuNavigasi = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            ikon: ikonDashboard,
            tautan: '/super-admin',
        },
        {
            id: 'verifikasi',
            label: 'Verifikasi',
            ikon: ikonVerifikasi,
            tautan: '/super-admin/verifikasi',
        },
        {
            id: 'kelola-akun',
            label: 'Akun Admin',
            ikon: ikonAkunAdmin,
            tautan: '/super-admin/kelola-akun',
        },
    ];

    return (
        <aside className="wadah-sidebar-pusat w-[280px] min-w-[280px] min-h-screen bg-[#4B2E2B] rounded-r-[24px] flex flex-col relative z-10 overflow-y-auto">
            {/* Branding */}
            <div className="area-branding flex items-center gap-[12px] px-[28px] pt-[40px] pb-[40px]">
                <div className="wadah-logo w-[46px] h-[52px] bg-[#F4ECE9] rounded-[8px] flex items-center justify-center shadow-md overflow-hidden">
                    <img
                        src={logoPng}
                        alt="C.A.F.E Job Logo"
                        className="gambar-logo w-full h-full object-cover"
                    />
                </div>
                <span className="teks-nama-aplikasi font-jakarta font-extrabold italic text-[24px] text-[#C69C6D]">
                    CAFE JOB
                </span>
            </div>

            {/* Menu Navigasi */}
            <nav className="area-navigasi flex-1 px-[16px] mt-4">
                <ul className="daftar-menu flex flex-col gap-[12px]">
                    {menuNavigasi.map((menu) => {
                        const isActive = menuAktif === menu.id;
                        return (
                            <li key={menu.id} className="item-menu">
                                <NavLink
                                    to={menu.tautan}
                                    onClick={() => setMenuAktif(menu.id)}
                                    className={`tautan-menu flex items-center gap-[16px] w-full px-[16px] py-[14px] rounded-[8px] transition-all duration-200 ${
                                        isActive
                                            ? 'bg-[#F5B759] shadow-sm'
                                            : 'bg-[#C69C6D] hover:bg-[#D5AA7B]'
                                    }`}
                                >
                                    <img 
                                        src={menu.ikon} 
                                        alt={menu.label}
                                        className="ikon-menu w-[24px] h-[24px] object-contain"
                                        style={{ filter: isActive || menu.id === 'kelola-akun' ? 'none' : 'brightness(0) saturate(100%) invert(14%) sepia(18%) saturate(1469%) hue-rotate(326deg) brightness(91%) contrast(88%)' }}
                                    />
                                    <span className="label-menu font-poppins font-semibold text-[16px] text-[#4B2E2B]">
                                        {menu.label}
                                    </span>
                                </NavLink>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Tombol Logout */}
            <div className="area-logout px-[28px] pb-[40px] mt-auto">
                <div className="garis-pemisah w-full border-t border-[#C69C6D]/40 mb-[24px]" />
                <button
                    onClick={menanganiLogout}
                    className="tombol-keluar w-full flex items-center gap-[12px] transition-all duration-200 group"
                >
                    <img 
                        src={ikonLogout} 
                        alt="Logout"
                        className="ikon-keluar w-[24px] h-[24px] object-contain group-hover:filter group-hover:brightness-0 group-hover:invert-[.5] group-hover:sepia group-hover:saturate-[10000%] group-hover:hue-rotate-[0deg]"
                    />
                    <span className="label-keluar font-poppins font-bold text-[16px] text-[#C69C6D] group-hover:text-red-400 transition-colors">
                        Logout
                    </span>
                </button>
            </div>
        </aside>
    );
};

export default SidebarPusat;
