import React, { useState, useEffect, useRef } from 'react'; // [UPDATE LOGIC]
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logoGambar from '../../aset/logo navbar.png';
import api from '../../layanan/api'; // [UPDATE LOGIC]

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // [UPDATE LOGIC]
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const gearRef = useRef(null);
  const [showGearMenu, setShowGearMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const mobileMenuRef = useRef(null);

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
      if (gearRef.current && !gearRef.current.contains(event.target)) {
        setShowGearMenu(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setShowMobileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="wadah-navbar flex w-full justify-center mt-4 md:mt-6 px-4">
      <nav className="navigasi-utama flex items-center justify-between w-full max-w-5xl min-h-[56px] md:min-h-[64px] rounded-2xl md:rounded-[40px] bg-[#4b2e2b] px-3 md:px-6 py-2 md:py-0 gap-2 md:gap-0">

        {/* Grup Kiri: Logo + Tautan Navigasi */}
        <div className="grup-kiri flex items-center gap-3 md:gap-8 flex-1 min-w-0 justify-start">

          {/* Logo */}
          <div className="area-logo flex flex-col items-center justify-center w-[32px] h-[40px] md:w-[40px] md:h-[48px] shrink-0">
              <img src={logoGambar} alt="Logo CAFE JOB" className="gambar-logo w-full h-full object-contain" />
              <span className="sr-only">CAFE JOB</span>
          </div>

          {/* Tautan Navigasi — tampil di desktop */}
          <div className="tautan-desktop hidden md:flex items-center gap-6 h-[21px] justify-center">
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
        <div className="grup-kanan flex items-center gap-2 md:gap-[20px] shrink-0 justify-end">

          {/* Tombol Hamburger — tampil di mobile */}
          <div className="md:hidden relative flex items-center" ref={mobileMenuRef}>
            <button
              onClick={() => setShowMobileMenu((prev) => !prev)}
              className="flex items-center justify-center w-8 h-8 rounded-full text-[#f3ede6] hover:text-[#c69c6d] hover:bg-white/5 transition-all focus:outline-none shrink-0"
              aria-label="Menu Navigasi"
              title="Menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                {showMobileMenu ? (
                  <><path d="M18 6L6 18" /><path d="M6 6l12 12" /></>
                ) : (
                  <><path d="M3 12h18" /><path d="M3 6h18" /><path d="M3 18h18" /></>
                )}
              </svg>
            </button>

            {showMobileMenu && (
              <div className="absolute right-0 top-full mt-2 w-44 rounded-xl bg-[#4b2e2b]/95 backdrop-blur-md border border-[#c69c6d]/30 shadow-2xl z-50 overflow-hidden font-poppins">
                <Link to="/" onClick={() => setShowMobileMenu(false)}
                  className="flex items-center gap-3 px-4 py-3 text-[#f3ede6] text-sm font-medium hover:bg-white/5 transition-colors">
                  <svg className="w-4 h-4 text-[#c69c6d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Beranda
                </Link>
                <Link to="/lowongan" onClick={() => setShowMobileMenu(false)}
                  className="flex items-center gap-3 px-4 py-3 text-[#f3ede6] text-sm font-medium hover:bg-white/5 transition-colors">
                  <svg className="w-4 h-4 text-[#c69c6d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Lowongan
                </Link>
                <Link to="/perusahaan" onClick={() => setShowMobileMenu(false)}
                  className="flex items-center gap-3 px-4 py-3 text-[#f3ede6] text-sm font-medium hover:bg-white/5 transition-colors">
                  <svg className="w-4 h-4 text-[#c69c6d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Perusahaan
                </Link>
                {isLoggedIn && userRole === 'Pelamar' && (
                  <Link to="/status-lamaran" onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3 px-4 py-3 text-[#f3ede6] text-sm font-medium hover:bg-white/5 transition-colors">
                    <svg className="w-4 h-4 text-[#c69c6d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    Status Lamaran
                  </Link>
                )}
                {isLoggedIn && (
                  <Link to={userRole === 'Pelamar' ? '/profil' : (userRole === 'Admin_Perusahaan' ? '/admin' : '/super-admin')}
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3 px-4 py-3 text-[#f3ede6] text-sm font-medium hover:bg-white/5 transition-colors border-t border-[#c69c6d]/20">
                    <svg className="w-4 h-4 text-[#c69c6d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {userRole === 'Pelamar' ? 'Profile' : 'Dashboard'}
                  </Link>
                )}
                {!isLoggedIn && (
                  <>
                    <hr className="border-[#c69c6d]/20" />
                    <Link to="/masuk" onClick={() => setShowMobileMenu(false)}
                      className="flex items-center gap-3 px-4 py-3 text-[#f3ede6] text-sm font-medium hover:bg-white/5 transition-colors">
                      <svg className="w-4 h-4 text-[#c69c6d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h2" />
                      </svg>
                      Masuk
                    </Link>
                    <Link to="/daftar" onClick={() => setShowMobileMenu(false)}
                      className="flex items-center gap-3 px-4 py-3 text-[#f3ede6] text-sm font-medium hover:bg-white/5 transition-colors">
                      <svg className="w-4 h-4 text-[#c69c6d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      Daftar
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {!isLoggedIn ? (
            <>
              {/* Tombol Masuk — hanya desktop */}
              <Link
                to="/masuk"
                className="tombol-masuk font-poppins font-[700] text-[14px] leading-[21px] text-[#f3ede6] hover:opacity-80 transition-opacity shrink-0 hidden md:inline"
              >
                Masuk
              </Link>

              {/* Tombol Daftar — hanya desktop */}
              <Link
                to="/daftar"
                className="tombol-daftar hidden md:flex flex-row items-center justify-center bg-[#c69c6d] rounded-[15px] w-[66px] h-[31px] hover:bg-opacity-90 transition-opacity shrink-0"
              >
                 <span className="teks-daftar font-poppins font-[700] text-[14px] leading-[21px] text-[#4b2e2b] block">Daftar</span>
              </Link>
            </>
          ) : (
            /* Tombol Profil (Tampil jika sudah login) */
            <>
              {/* Wadah Ikon Lonceng & Gir agar letaknya berdekatan dan tidak menggeser lonceng */}
              <div className="flex items-center gap-1 mr-2">
                {/* [UPDATE LOGIC] Tombol Lonceng & Panel Dropdown Notifikasi */}
                <div className="relative flex items-center" ref={dropdownRef}>
                  <button
                    onClick={() => {
                      const nextShow = !showNotifications;
                      setShowNotifications(nextShow);
                      if (nextShow) {
                        fetchNotifications();
                      }
                    }}
                    className="tombol-lonceng relative flex items-center justify-center w-8 h-8 rounded-full text-[#f3ede6] hover:text-[#c69c6d] hover:bg-white/5 transition-all focus:outline-none shrink-0"
                    aria-label="Notifikasi"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolut-badge absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm ring-1 ring-red-400">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="panel-notifikasi absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-xl bg-[#4b2e2b]/95 backdrop-blur-md border border-[#c69c6d]/30 shadow-2xl z-50 overflow-hidden font-poppins text-left">
                      <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#c69c6d]/20 bg-[#3d2523]">
                        <span className="text-[#f3ede6] font-bold text-xs">Notifikasi</span>
                        {unreadCount > 0 && (
                          <button onClick={handleMarkAllAsRead} className="text-[#c69c6d] text-[10px] font-semibold hover:opacity-80 transition-opacity">
                            Tandai semua dibaca
                          </button>
                        )}
                      </div>
                      <div className="max-h-60 overflow-y-auto divide-y divide-[#c69c6d]/10">
                        {notifications.length === 0 ? (
                          <div className="px-3 py-6 text-center text-[#f3ede6]/50 text-xs italic">
                            Tidak ada notifikasi
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div key={n.id} onClick={() => handleKlikNotifikasi(n)}
                              className={`px-3 py-2.5 cursor-pointer transition-colors flex items-start gap-2 ${n.dibaca ? 'hover:bg-white/5 bg-transparent' : 'bg-white/5 hover:bg-white/10'}`}
                            >
                              {!n.dibaca && <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#c69c6d]" />}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-1">
                                  <h4 className={`text-xs text-[#f3ede6] truncate ${!n.dibaca ? 'font-bold' : 'font-medium'}`}>{n.judul}</h4>
                                  {n.url && (
                                    <svg className="w-3 h-3 text-[#c69c6d] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                  )}
                                </div>
                                <p className="text-[11px] text-[#f3ede6]/70 mt-0.5 break-words line-clamp-2">{n.pesan}</p>
                                <span className="text-[9px] text-[#f3ede6]/40 block mt-0.5">{formatTime(n.dibuat_pada)}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Tombol Gir — dropdown Chatbot & Ganti Password (Pelamar only) */}
                {isLoggedIn && userRole === 'Pelamar' && (
                  <div className="relative flex items-center" ref={gearRef}>
                    <button
                      onClick={() => setShowGearMenu((prev) => !prev)}
                      className="tombol-pengaturan flex items-center justify-center w-8 h-8 rounded-full text-[#f3ede6] hover:text-[#c69c6d] hover:bg-white/5 transition-all focus:outline-none cursor-pointer shrink-0"
                      aria-label="Menu"
                      title="Menu"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>

                    {showGearMenu && (
                      <div className="absolute right-0 top-full mt-2 w-44 rounded-xl bg-[#4b2e2b]/95 backdrop-blur-md border border-[#c69c6d]/30 shadow-2xl z-50 overflow-hidden font-poppins">
                        <Link
                          to="/bantuan-ai"
                          onClick={() => setShowGearMenu(false)}
                          className="flex items-center gap-3 px-4 py-3 text-[#f3ede6] text-sm font-medium hover:bg-white/5 transition-colors"
                        >
                          <svg className="w-4 h-4 text-[#c69c6d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                          Chatbot AI
                        </Link>
                        <hr className="border-[#c69c6d]/20" />
                        <button
                          onClick={() => {
                            setShowGearMenu(false);
                            navigate('/profil', { state: { bukaGantiPassword: true } });
                          }}
                          className="flex items-center gap-3 w-full px-4 py-3 text-[#f3ede6] text-sm font-medium hover:bg-white/5 transition-colors text-left"
                        >
                          <svg className="w-4 h-4 text-[#c69c6d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                          Ganti Password
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Link
                to={userRole === 'Pelamar' ? '/profil' : (userRole === 'Admin_Perusahaan' ? '/admin' : '/super-admin')}
                className="tombol-profil hidden md:flex flex-row items-center justify-center bg-[#c69c6d] rounded-[15px] px-4 h-[31px] hover:bg-opacity-90 transition-opacity shrink-0"
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
