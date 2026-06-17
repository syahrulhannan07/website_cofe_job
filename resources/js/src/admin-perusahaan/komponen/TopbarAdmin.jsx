import React, { useState, useEffect, useRef } from 'react';
import { useAdmin } from '../konteks/AdminContext';
import api from '../../layanan/api';
import FormGantiPassword from '../halaman/profil/komponen/FormGantiPassword';

// Aset Topbar
import logoPng               from '../../aset/logo.png';
import placeholderProfilePng from '../aset/profil-perusahaan/placeholder_profile.png';
import personCircleSvg       from '../aset/sidebar/PersonCircle.svg';
import notificationPng       from '../aset/sidebar/Notification.png';
import checkMarkPng          from '../aset/sidebar/Instagram Check Mark.png';

const TopbarAdmin = ({ identitas, setSidebarTerbuka }) => {
    const { topbarAction } = useAdmin();

    // Mapping data identitas
    const namaPengelola = identitas?.nama_pengguna || "Admin Cafe";
    const namaPerusahaan = identitas?.nama_perusahaan || "Memuat...";
    const isVerified = identitas?.status_verifikasi === 'Diterima'; // Di database 'Diterima' berarti verified
    const avatarUrl = identitas?.logo_perusahaan || placeholderProfilePng;

    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showGantiPassword, setShowGantiPassword] = useState(false);
    const dropdownRef = useRef(null);

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.95, y: 10 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2 } },
    };

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
        
        // Menggunakan Laravel Echo untuk Notifikasi Real-Time via Reverb
        const userId = localStorage.getItem('id_pengguna');
        if (userId && window.Echo) {
            window.Echo.private(`App.Models.Pengguna.${userId}`)
                .notification((notification) => {
                    console.log("Notifikasi Admin Baru Real-Time!", notification);
                    fetchNotifications();
                });
        }

        // Hapus interval polling manual
        // const intervalId = setInterval(fetchNotifications, 10000);
        return () => {
            // clearInterval(intervalId);
            if (userId && window.Echo) {
                window.Echo.leaveChannel(`App.Models.Pengguna.${userId}`);
            }
        };
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
                    {/* Hamburger mobile */}
                    <button
                        onClick={() => setSidebarTerbuka((prev) => !prev)}
                        className="lg:hidden mr-3 w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#4B2E2B]/10 transition-colors"
                        aria-label="Buka menu"
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 6H21" stroke="#4B2E2B" strokeWidth="2.5" strokeLinecap="round"/>
                            <path d="M6 12H18" stroke="#4B2E2B" strokeWidth="2.5" strokeLinecap="round"/>
                            <path d="M10 18H14" stroke="#4B2E2B" strokeWidth="2.5" strokeLinecap="round"/>
                        </svg>
                    </button>
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
                        <div className="flex items-center gap-2">
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

                            <div className="relative flex items-center">
                                <button
                                    onClick={() => setShowGantiPassword(true)}
                                    className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/5 transition-all focus:outline-none cursor-pointer"
                                    aria-label="Ganti Password"
                                >
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4B2E2B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="3" />
                                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                                    </svg>
                                </button>
                            </div>
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

            {showGantiPassword && (
                <div
                    className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
                    onClick={() => setShowGantiPassword(false)}
                >
                    <div
                        className="w-full max-w-md max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="relative bg-white rounded-[20px] shadow-xl">
                            <button
                                onClick={() => setShowGantiPassword(false)}
                                className="absolute top-4 right-4 z-10 w-8 h-8 bg-[#4B2E2B] rounded-full flex items-center justify-center text-white hover:bg-[#3a2320] transition-colors shadow-md cursor-pointer"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 6L6 18" />
                                    <path d="M6 6l12 12" />
                                </svg>
                            </button>
                            <FormGantiPassword variants={modalVariants} />
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default TopbarAdmin;
