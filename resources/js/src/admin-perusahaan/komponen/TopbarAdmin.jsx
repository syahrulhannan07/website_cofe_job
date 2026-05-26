import React, { useState, useEffect, useRef } from 'react';
import { useAdmin } from '../konteks/AdminContext';
import api from '../../layanan/api';

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

    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/notifikasi');
            if (response.data && response.data.status === 'success') {
                setNotifications(response.data.data || []);
                setUnreadCount(response.data.meta?.unread_count || 0);
            }
        } catch (error) {
            console.error('Gagal mengambil notifikasi:', error);
        }
    };

    const handleMarkAsRead = async (id, dibaca) => {
        if (dibaca) return;
        try {
            setNotifications(prev =>
                prev.map(n => (n.id === id ? { ...n, dibaca: 1 } : n))
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
            await api.put(`/notifikasi/${id}/baca`);
        } catch (error) {
            console.error('Gagal menandai notifikasi sebagai dibaca:', error);
            fetchNotifications();
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            setNotifications(prev => prev.map(n => ({ ...n, dibaca: 1 })));
            setUnreadCount(0);
            await api.put('/notifikasi/baca-semua');
        } catch (error) {
            console.error('Gagal menandai semua notifikasi sebagai dibaca:', error);
            fetchNotifications();
        }
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            const now = new Date();
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMins / 60);
            const diffDays = Math.floor(diffHours / 24);

            if (diffMins < 1) return 'Baru saja';
            if (diffMins < 60) return `${diffMins} menit yang lalu`;
            if (diffHours < 24) return `${diffHours} jam yang lalu`;
            return `${diffDays} hari yang lalu`;
        } catch (e) {
            return dateStr;
        }
    };

    useEffect(() => {
        fetchNotifications();
        const intervalId = setInterval(fetchNotifications, 10000);
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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
                        <div className="relative flex items-center" ref={dropdownRef}>
                            <button
                                onClick={() => {
                                    const nextShow = !showNotifications;
                                    setShowNotifications(nextShow);
                                    if (nextShow) {
                                        fetchNotifications();
                                    }
                                }}
                                className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/5 transition-all focus:outline-none cursor-pointer"
                                aria-label="Notifikasi"
                            >
                                <img src={notificationPng} alt="Notifikasi" className="ikon-notifikasi w-[32px] h-[32px] object-contain" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm ring-1 ring-red-400">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {showNotifications && (
                                <div className="panel-notifikasi absolute left-0 top-full mt-2 w-72 md:w-80 rounded-2xl bg-[#4b2e2b]/95 backdrop-blur-md border border-[#c69c6d]/30 shadow-2xl z-50 overflow-hidden font-poppins text-left">
                                    {/* Header */}
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#c69c6d]/20 bg-[#3d2523]">
                                        <span className="text-[#f3ede6] font-bold text-xs md:text-sm">Notifikasi</span>
                                        {unreadCount > 0 && (
                                            <button
                                                onClick={handleMarkAllAsRead}
                                                className="text-[#c69c6d] text-[10px] md:text-xs font-semibold hover:opacity-80 transition-opacity cursor-pointer"
                                            >
                                                Tandai semua dibaca
                                            </button>
                                        )}
                                    </div>

                                    {/* List */}
                                    <div className="max-h-64 md:max-h-72 overflow-y-auto divide-y divide-[#c69c6d]/10 scrollbar-thin scrollbar-thumb-[#c69c6d]/20">
                                        {notifications.length === 0 ? (
                                            <div className="px-4 py-8 text-center text-[#f3ede6]/50 text-xs md:text-sm italic">
                                                Tidak ada notifikasi
                                            </div>
                                        ) : (
                                            notifications.map((n) => (
                                                <div
                                                    key={n.id}
                                                    onClick={() => handleMarkAsRead(n.id, n.dibaca)}
                                                    className={`px-4 py-3 cursor-pointer transition-colors flex items-start gap-2 ${
                                                        n.dibaca ? 'hover:bg-white/5 bg-transparent' : 'bg-white/5 hover:bg-white/10'
                                                    }`}
                                                >
                                                    {!n.dibaca && (
                                                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#c69c6d]" />
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className={`text-xs text-[#f3ede6] truncate ${!n.dibaca ? 'font-bold' : 'font-medium'}`}>
                                                            {n.judul}
                                                        </h4>
                                                        <p className="text-[11px] text-[#f3ede6]/70 mt-0.5 break-words line-clamp-3">
                                                            {n.pesan}
                                                        </p>
                                                        <span className="text-[9px] text-[#f3ede6]/40 block mt-1">
                                                            {formatTime(n.dibuat_pada)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
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
