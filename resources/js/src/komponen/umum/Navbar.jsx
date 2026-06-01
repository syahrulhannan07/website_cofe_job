import React, { useState, useEffect, useRef } from 'react'; // [UPDATE LOGIC]
import { Link, useLocation } from 'react-router-dom';
import logoGambar from '../../aset/logo.png';
import api from '../../layanan/api'; // [UPDATE LOGIC]
import ikonNotifikasi from '../../super-admin/aset/sidebar/Notification.png';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const location = useLocation();

  // [UPDATE LOGIC]
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  // [UPDATE LOGIC]
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
      // 2. Kirim ke backend (fire-and-forget, UI sudah update)
      api.put(`/notifikasi/${notif.id}/baca`).catch(() => fetchNotifications());
    }
    // 3. Buka URL deep-link di tab baru sesuai aturan MULTI-CHANNEL & MOBILE READY
    if (notif.url) {
      window.open(notif.url, '_blank', 'noopener,noreferrer');
      setShowNotifications(false);
    }
  };

  // [UPDATE LOGIC]
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

  // [UPDATE LOGIC]
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

  // [UPDATE LOGIC]
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('peran');
    setIsLoggedIn(!!token);
    setUserRole(role);

    if (token) {
      fetchNotifications();
      
      // Menggunakan Laravel Echo untuk Notifikasi Real-Time via Reverb
      const userId = localStorage.getItem('id_pengguna');
      if (userId && window.Echo) {
          window.Echo.private(`App.Models.Pengguna.${userId}`)
              .notification((notification) => {
                  console.log("Notifikasi Baru Real-Time!", notification);
                  // Refresh notifikasi dari API atau tambahkan ke list secara manual
                  fetchNotifications(); 
              });
      }

      // Hapus interval polling manual karena sudah pakai WebSocket
      // const intervalId = setInterval(fetchNotifications, 10000);
      return () => {
          if (userId && window.Echo) {
              window.Echo.leaveChannel(`App.Models.Pengguna.${userId}`);
          }
      };
    }
  }, [location]);

  // [UPDATE LOGIC]
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
    <div className="wadah-navbar flex w-full justify-center mt-4 md:mt-10 px-4">
      <nav className="navigasi-utama flex flex-wrap md:flex-nowrap items-center justify-between w-full max-w-[908px] min-h-[90px] rounded-[30px] md:rounded-[100px] bg-[#4b2e2b] px-6 py-4 md:px-[40px] md:py-0 gap-4 md:gap-0">

        {/* Grup Kiri: Logo + Tautan Navigasi */}
        <div className="grup-kiri flex items-center gap-6 md:gap-[50px] w-full md:w-auto justify-between md:justify-start">

          {/* Logo */}
          <div className="area-logo flex flex-col items-center justify-center w-[40px] h-[49px] md:w-[49px] md:h-[60px] shrink-0">
              <img src={logoGambar} alt="Logo CAFE JOB" className="gambar-logo w-full h-full object-contain" />
              <span className="sr-only">CAFE JOB</span>
          </div>

          {/* Tautan Navigasi — tampil di desktop */}
          <div className="tautan-desktop hidden md:flex items-center gap-[50px] h-[21px] justify-center">
            <Link to="/" className="tautan-nav font-poppins font-[700] text-[14px] leading-[21px] text-[#f3ede6] hover:opacity-80 transition-opacity whitespace-nowrap">
              Beranda
            </Link>
            <Link to="/lowongan" className="tautan-nav font-poppins font-[700] text-[14px] leading-[21px] text-[#f3ede6] hover:opacity-80 transition-opacity whitespace-nowrap">
              Lowongan
            </Link>
            <Link to="/perusahaan" className="tautan-nav font-poppins font-[700] text-[14px] leading-[21px] text-[#f3ede6] hover:opacity-80 transition-opacity whitespace-nowrap">
              Perusahaan
            </Link>
            {isLoggedIn && userRole === 'Pelamar' && (
              <Link 
                to="/status-lamaran" 
                className="tautan-nav font-poppins font-[700] text-[14px] leading-[21px] text-[#f3ede6] hover:opacity-80 transition-opacity whitespace-nowrap"
              >
                Status Lamaran
              </Link>
            )}
          </div>
        </div>

        {/* Grup Kanan: Masuk & Daftar / Profil */}
        <div className="grup-kanan flex items-center gap-4 md:gap-[20px] w-full md:w-auto justify-center md:justify-start">

          {/* Tautan Navigasi — tampil di mobile (scroll horizontal) */}
          <div className="tautan-mobile md:hidden flex flex-1 overflow-x-auto gap-4 scrollbar-hide mr-4">
             <Link to="/" className="font-poppins font-[600] text-[12px] text-[#f3ede6] whitespace-nowrap">Beranda</Link>
             <Link to="/lowongan" className="font-poppins font-[600] text-[12px] text-[#f3ede6] whitespace-nowrap">Lowongan</Link>
             <Link to="/perusahaan" className="font-poppins font-[600] text-[12px] text-[#f3ede6] whitespace-nowrap">Perusahaan</Link>
             {isLoggedIn && userRole === 'Pelamar' && (
               <Link to="/status-lamaran" className="font-poppins font-[600] text-[12px] text-[#f3ede6] whitespace-nowrap">Status</Link>
             )}
          </div>

          {!isLoggedIn ? (
            <>
              {/* Tombol Masuk */}
              <Link
                to="/masuk"
                className="tombol-masuk font-poppins font-[700] text-[14px] leading-[21px] text-[#f3ede6] hover:opacity-80 transition-opacity shrink-0"
              >
                Masuk
              </Link>

              {/* Tombol Daftar */}
              <Link
                to="/daftar"
                className="tombol-daftar flex flex-row items-center justify-center bg-[#c69c6d] rounded-[15px] w-[66px] h-[31px] hover:bg-opacity-90 transition-opacity shrink-0"
              >
                 <span className="teks-daftar font-poppins font-[700] text-[14px] leading-[21px] text-[#4b2e2b] block">Daftar</span>
              </Link>
            </>
          ) : (
            /* Tombol Profil (Tampil jika sudah login) */
            <>
              {/* [UPDATE LOGIC] Tombol Lonceng & Panel Dropdown Notifikasi */}
              <div className="relative mr-2 flex items-center" ref={dropdownRef}>
                <button
                  onClick={() => {
                    const nextShow = !showNotifications;
                    setShowNotifications(nextShow);
                    if (nextShow) {
                      fetchNotifications();
                    }
                  }}
                  className="tombol-lonceng relative flex items-center justify-center w-8 h-8 rounded-full text-[#f3ede6] hover:text-[#c69c6d] hover:bg-white/5 transition-all focus:outline-none shrink-0 mr-2"
                  aria-label="Notifikasi"
                >
                  <img
                    src={ikonNotifikasi}
                    alt="Notifikasi"
                    className="w-[32px] h-[32px] object-contain cursor-pointer"
                    style={{ filter: 'invert(1) brightness(2)' }}
                  />
                  {unreadCount > 0 && (
                    <span className="absolut-badge absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm ring-1 ring-red-400">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="panel-notifikasi absolute right-0 top-full mt-2 w-72 md:w-80 rounded-2xl bg-[#4b2e2b]/95 backdrop-blur-md border border-[#c69c6d]/30 shadow-2xl z-50 overflow-hidden font-poppins text-left">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#c69c6d]/20 bg-[#3d2523]">
                      <span className="text-[#f3ede6] font-bold text-xs md:text-sm">Notifikasi</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="text-[#c69c6d] text-[10px] md:text-xs font-semibold hover:opacity-80 transition-opacity"
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

              <Link
                to={userRole === 'Pelamar' ? '/profil' : (userRole === 'Admin_Perusahaan' ? '/admin' : '/super-admin')}
                className="tombol-profil flex flex-row items-center justify-center bg-[#c69c6d] rounded-[15px] px-4 h-[31px] hover:bg-opacity-90 transition-opacity shrink-0"
              >
                <span className="teks-profil font-poppins font-[700] text-[14px] leading-[21px] text-[#4b2e2b] block">
                  {userRole === 'Pelamar' ? 'Profile' : 'Dashboard'}
                </span>
              </Link>
            </>
          )}
        </div>

      </nav>
    </div>
  );
};

export default Navbar;
