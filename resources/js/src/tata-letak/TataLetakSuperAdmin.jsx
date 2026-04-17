import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const TataLetakSuperAdmin = () => {
    const menuNavigasi = [
        { label: 'Dashboard', tautan: '/super-admin' },
        { label: 'Kelola Pengguna', tautan: '/super-admin/pengguna' },
        { label: 'Kelola Perusahaan', tautan: '/super-admin/perusahaan' },
        { label: 'Semua Lowongan', tautan: '/super-admin/lowongan' },
        { label: 'Laporan', tautan: '/super-admin/laporan' },
        { label: 'Pengaturan', tautan: '/super-admin/pengaturan' },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex font-poppins">
            {/* Sidebar Super Admin */}
            <aside className="w-64 bg-[#2d1810] min-h-screen flex flex-col shrink-0">
                <div className="p-6 border-b border-[#3d2218]">
                    <span className="text-[#c69c6d] font-bold text-xl">CAFE JOB</span>
                    <p className="text-[#f3ede6] text-xs mt-1 opacity-70">Super Admin</p>
                </div>

                <nav className="flex-1 p-4">
                    <ul className="space-y-2">
                        {menuNavigasi.map((menu, indeks) => (
                            <li key={indeks}>
                                <Link
                                    to={menu.tautan}
                                    className="block px-4 py-3 text-[#f3ede6] text-sm rounded-lg hover:bg-[#3d2218] transition-colors"
                                >
                                    {menu.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>

            {/* Konten Utama */}
            <main className="flex-1 p-8 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default TataLetakSuperAdmin;
