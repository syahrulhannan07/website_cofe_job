import React from 'react';
import { NavLink } from 'react-router-dom';

// Aset Sidebar
import logoPng         from '../../aset/logo.png';
import frameLogoSvg    from '../aset/sidebar/dashboard.svg';
import personCircleSvg from '../aset/sidebar/PersonCircle.svg';
import schedulePng     from '../aset/sidebar/Schedule.png';
import logoutSvg       from '../aset/sidebar/logout.svg';
import groupSidebarPng from '../aset/sidebar/Group.png';
import schoolBriefcasePng from '../aset/sidebar/School Briefcase.png';

const SidebarAdmin = ({ menuAktif, setMenuAktif, menanganiLogout }) => {
    
    const menuNavigasi = [
        { id: 'profil',    label: 'Profile Cafe', ikon: personCircleSvg, tautan: '/admin/profil'    },
        { id: 'dashboard', label: 'Dashboard',    ikon: frameLogoSvg,    tautan: '/admin'           },
        { id: 'lowongan',  label: 'Lowongan',     ikon: schoolBriefcasePng, tautan: '/admin/lowongan' },
        { id: 'wawancara', label: 'Wawancara',    ikon: schedulePng,     tautan: '/admin/wawancara' },
    ];

    return (
        <aside className="sidebar-admin w-[280px] min-w-[280px] h-full bg-[#4B2E2B] flex flex-col rounded-r-[20px] relative z-10 overflow-y-auto">
            <div className="sidebar-branding flex items-center gap-[12px] px-[24px] pt-[30px] pb-[40px]">
                <div className="wadah-logo w-[50px] h-[60px] flex items-center justify-center flex-shrink-0">
                    <img src={logoPng} alt="CAFE JOB" className="ikon-logo-kafe w-[40px] h-[50px] object-contain" />
                </div>
                <span className="teks-nama-aplikasi font-['Plus_Jakarta_Sans'] font-extrabold italic text-[24px] leading-tight text-[#C69C6D]">
                    CAFE JOB
                </span>
            </div>

            <nav className="navigasi-sidebar flex-1 px-[8px]">
                <ul className="daftar-menu-sidebar flex flex-col gap-[8px]">
                    {menuNavigasi.map((menu) => (
                        <li key={menu.id} className="item-menu-sidebar">
                            <NavLink
                                to={menu.tautan}
                                end={menu.id === 'dashboard'}
                                onClick={() => setMenuAktif(menu.id)}
                                className={({ isActive }) =>
                                    `tautan-menu-sidebar flex items-center gap-[12px] w-full h-[50px] px-[10px] rounded-[5px] transition-all duration-200 ${
                                        isActive ? 'bg-[#F5B759] shadow-md' : 'bg-[#C69C6D] opacity-90 hover:opacity-100'
                                    }`
                                }
                            >
                                <span className="pembungkus-ikon-menu flex items-center justify-center w-[32px] h-[32px] flex-shrink-0">
                                    <img src={menu.ikon} alt={menu.label} className="ikon-menu w-[26px] h-[26px] object-contain" />
                                </span>
                                <span className="label-menu-sidebar font-poppins font-semibold text-[16px] text-[#4B2E2B]">
                                    {menu.label}
                                </span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="wadah-tombol-logout w-full px-[15px] mt-auto pb-[20px]">
                <div className="garis-pembatas-logout w-full border-t border-[#C69C6D] opacity-50 mb-2" />
                <button onClick={menanganiLogout} className="tombol-logout flex items-center gap-[12px] w-full h-[50px] px-[10px] hover:opacity-80 transition-opacity">
                    <span className="pembungkus-ikon-logout flex items-center justify-center w-[32px] h-[32px] flex-shrink-0">
                        <img src={logoutSvg} alt="Logout" className="ikon-logout w-[26px] h-[26px] object-contain" />
                    </span>
                    <span className="label-tombol-logout font-poppins font-semibold text-[16px] text-[#C69C6D]">
                        Logout
                    </span>
                </button>
            </div>
        </aside>
    );
};

export default SidebarAdmin;
