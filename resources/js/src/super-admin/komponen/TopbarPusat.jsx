import React, { useState, useEffect, useRef } from 'react';
import ikonNotifikasi from '../aset/sidebar/Notification.png';
import api from '../../layanan/api';

const TopbarPusat = () => {
    // Di aplikasi nyata, data ini mungkin dari localStorage atau API
    const sapaan = "Hai CEO Ramadhan";
    const peranSuperAdmin = "Super Admin";

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

    // Tandai notifikasi sebagai dibaca, lalu buka URL deep-link di tab baru (jika ada)
    const handleKlikNotifikasi = async (notif) => {
        // 1. Optimistic UI update
        if (!notif.dibaca) {
            setNotifications(prev =>
                prev.map(n => (n.id === notif.id ? { ...n, dibaca: 1 } : n))
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
            // 2. Kirim ke backend (fire-and-forget)
            api.put(`/notifikasi/${notif.id}/baca`).catch(() => fetchNotifications());
        }
        // 3. Buka URL deep-link di tab baru
        if (notif.url) {
            window.open(notif.url, '_blank', 'noopener,noreferrer');
            setShowNotifications(false);
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
        <header className="wadah-topbar-pusat w-full h-[100px] flex flex-col justify-center px-[40px] bg-transparent flex-shrink-0 relative">
            <div className="area-konten-topbar flex items-center justify-between w-full h-full pb-[10px]">
                
                {/* Ikon Notifikasi Kiri & Dropdown */}
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
                        <img src={ikonNotifikasi} alt="Notifikasi" className="w-[32px] h-[32px] object-contain" />
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
                                            onClick={() => handleKlikNotifikasi(n)}
                                            className={`px-4 py-3 cursor-pointer transition-colors flex items-start gap-2 ${
                                                n.dibaca ? 'hover:bg-white/5 bg-transparent' : 'bg-white/5 hover:bg-white/10'
                                            }`}
                                        >
                                            {!n.dibaca && (
                                                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#c69c6d]" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-1">
                                                    <h4 className={`text-xs text-[#f3ede6] truncate ${!n.dibaca ? 'font-bold' : 'font-medium'}`}>
                                                        {n.judul}
                                                    </h4>
                                                    {/* Indikator panah jika notif punya deep-link */}
                                                    {n.url && (
                                                        <svg className="w-3 h-3 text-[#c69c6d] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                        </svg>
                                                    )}
                                                </div>
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

                {/* Info Profil Kanan (Tanpa Avatar) */}
                <div className="area-profil-admin flex flex-col items-end justify-center">
                    <span className="teks-peran-admin font-inter font-semibold text-[16px] leading-tight text-black">
                        {peranSuperAdmin}
                    </span>
                    <span className="teks-sapaan-admin font-inter font-normal text-[14px] text-black mt-1">
                        {sapaan}
                    </span>
                </div>
            </div>

            {/* Garis Bawah (Pemisah) */}
            <div className="wadah-garis-pemisah absolute bottom-0 left-[32px] right-[32px]">
                <div className="garis-pemisah-topbar w-full border-t border-black border-opacity-80" />
            </div>
        </header>
    );
};

export default TopbarPusat;
