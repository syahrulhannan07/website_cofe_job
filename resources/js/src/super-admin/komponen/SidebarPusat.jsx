import React from 'react';
import { NavLink } from 'react-router-dom';
import logoPng from '../../aset/logo.png';

// Import Ikon
import ikonDashboard from '../aset/sidebar/ikon-dashboard.svg';
import ikonVerifikasi from '../aset/sidebar/ikon-verifikasi.svg';
import ikonAkunAdmin  from '../aset/sidebar/ikon-akun-admin.png';
import ikonLogout     from '../aset/sidebar/ikon-logout.svg';

const SidebarPusat = ({ menuAktif, setMenuAktif, menanganiLogout, sidebarTerbuka, setSidebarTerbuka }) => {
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
        {
            id: 'ai-deteksi',
            label: 'Deteksi AI',
            ikon: null,
            tautan: '/super-admin/ai-deteksi',
        },
    ];

    const tutupSidebarMobile = () => {
        if (window.innerWidth < 1024) {
            setSidebarTerbuka(false);
        }
    };

    return (
        <>
            {/* Overlay backdrop mobile */}
            {sidebarTerbuka && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarTerbuka(false)}
                />
            )}

            <aside
                className={`
                    wadah-sidebar-pusat w-[280px] min-w-[280px] min-h-screen bg-[#4B2E2B] rounded-r-[24px] flex flex-col overflow-y-auto
                    fixed inset-y-0 left-0 z-50 transform transition-transform duration-300
                    lg:relative lg:translate-x-0 lg:z-auto
                    ${sidebarTerbuka ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
            >
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
                                        onClick={() => {
                                            setMenuAktif(menu.id);
                                            tutupSidebarMobile();
                                        }}
                                        className={`tautan-menu flex items-center gap-[16px] w-full px-[16px] py-[14px] rounded-[8px] transition-all duration-200 ${
                                            isActive
                                                ? 'bg-[#F5B759] shadow-sm'
                                                : 'bg-[#C69C6D] hover:bg-[#D5AA7B]'
                                        }`}
                                    >
                                        {menu.ikon ? (
                                            <img 
                                                src={menu.ikon} 
                                                alt={menu.label}
                                                className="ikon-menu w-[24px] h-[24px] object-contain"
                                                style={{ filter: isActive || menu.id === 'kelola-akun' ? 'none' : 'brightness(0) saturate(100%) invert(14%) sepia(18%) saturate(1469%) hue-rotate(326deg) brightness(91%) contrast(88%)' }}
                                            />
                                        ) : (
                                            <svg className="ikon-menu w-[24px] h-[24px]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke={isActive ? '#4B2E2B' : '#4B2E2B'} strokeWidth="2" strokeLinejoin="round"/>
                                                <path d="M2 17L12 22L22 17" stroke={isActive ? '#4B2E2B' : '#4B2E2B'} strokeWidth="2" strokeLinejoin="round"/>
                                                <path d="M2 12L12 17L22 12" stroke={isActive ? '#4B2E2B' : '#4B2E2B'} strokeWidth="2" strokeLinejoin="round"/>
                                                <circle cx="12" cy="12" r="3" fill={isActive ? '#4B2E2B' : '#4B2E2B'} opacity="0.5"/>
                                            </svg>
                                        )}
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
        </>
    );
};

export default SidebarPusat;
