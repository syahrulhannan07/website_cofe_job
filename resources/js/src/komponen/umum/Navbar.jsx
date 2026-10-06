import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logoGambar from '../../aset/logo navbar.png';
import api from '../../layanan/api';
import GearIcon from './GearIcon';
import HamburgerIcon from './HamburgerIcon';
import BellIcon from './BellIcon';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const gearRef = useRef(null);
  const [showGearMenu, setShowGearMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const mobileMenuRef = useRef(null);

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

  const handleKlikNotifikasi = async (notif) => {
    if (!notif.dibaca) {
      setNotifications(prev =>
        prev.map(n => (n.id === notif.id ? { ...n, dibaca: 1 } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      api.put(`/notifikasi/${notif.id}/baca`).catch(() => fetchNotifications());
    }
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
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('peran');
    setIsLoggedIn(!!token);
    setUserRole(role);

    if (token) {
      fetchNotifications();
      const userId = localStorage.getItem('id_pengguna');
      if (userId && window.Echo) {
        window.Echo.private(`App.Models.Pengguna.${userId}`)
          .notification((notification) => {
            fetchNotifications();
          });
      }
      return () => {
        if (userId && window.Echo) {
          window.Echo.leaveChannel(`App.Models.Pengguna.${userId}`);
        }
      };
    }
  }, [location]);

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

        <div className="grup-kiri flex items-center gap-3 md:gap-8 flex-1 min-w-0 justify-start">
          <div className="area-logo flex flex-col items-center justify-center w-[32px] h-[40px] md:w-[40px] md:h-[48px] shrink-0">
              <img src={logoGambar} alt="Logo CAFE JOB" className="gambar-logo w-full h-full object-contain" />
              <span className="sr-only">CAFE JOB</span>
          </div>

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
              <Link to="/status-lamaran" className="tautan-nav font-poppins font-[700] text-[14px] leading-[21px] text-[#f3ede6] hover:opacity-80 transition-opacity whitespace-nowrap">
                Status Lamaran
              </Link>
            )}
          </div>
        </div>

        <div className="grup-kanan flex items-center gap-2 md:gap-[20px] shrink-0 justify-end">

          <div className="md:hidden relative flex items-center" ref={mobileMenuRef}>
            <button
              onClick={() => setShowMobileMenu((prev) => !prev)}
              className="flex items-center justify-center w-8 h-8 rounded-full text-[#f3ede6] hover:text-[#c69c6d] hover:bg-white/5 transition-all focus:outline-none shrink-0"
              aria-label="Menu Navigasi"
              title="Menu"
            >
              <HamburgerIcon isOpen={showMobileMenu} className="w-5 h-5" />
            </button>

            {showMobileMenu && (
              <div className="absolute right-0 top-full mt-2 w-44 rounded-xl bg-[#4b2e2b]/95 backdrop-blur-md border border-[#c69c6d]/30 shadow-2xl z-50 overflow-hidden font-poppins">
                <Link to="/" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 px-4 py-3 text-[#f3ede6] text-sm font-medium hover:bg-white/5 transition-colors">
                  Beranda
                </Link>
                <Link to="/lowongan" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 px-4 py-3 text-[#f3ede6] text-sm font-medium hover:bg-white/5 transition-colors">
                  Lowongan
                </Link>
                <Link to="/perusahaan" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 px-4 py-3 text-[#f3ede6] text-sm font-medium hover:bg-white/5 transition-colors">
                  Perusahaan
                </Link>
                {isLoggedIn && userRole === 'Pelamar' && (
                  <Link to="/status-lamaran" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 px-4 py-3 text-[#f3ede6] text-sm font-medium hover:bg-white/5 transition-colors">
                    Status Lamaran
                  </Link>
                )}
                {isLoggedIn && (
                  <Link to={userRole === 'Pelamar' ? '/profil' : (userRole === 'Admin_Perusahaan' ? '/admin' : '/super-admin')} onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 px-4 py-3 text-[#f3ede6] text-sm font-medium hover:bg-white/5 transition-colors border-t border-[#c69c6d]/20">
                    {userRole === 'Pelamar' ? 'Profile' : 'Dashboard'}
                  </Link>
                )}
                {!isLoggedIn && (
                  <>
                    <hr className="border-[#c69c6d]/20" />
                    <Link to="/masuk" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 px-4 py-3 text-[#f3ede6] text-sm font-medium hover:bg-white/5 transition-colors">
                      Masuk
                    </Link>
                    <Link to="/daftar" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 px-4 py-3 text-[#f3ede6] text-sm font-medium hover:bg-white/5 transition-colors">
                      Daftar
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {!isLoggedIn ? (
            <>
              <Link to="/masuk" className="tombol-masuk font-poppins font-[700] text-[14px] leading-[21px] text-[#f3ede6] hover:opacity-80 transition-opacity shrink-0 hidden md:inline">
                Masuk
              </Link>
              <Link to="/daftar" className="tombol-daftar hidden md:flex flex-row items-center justify-center bg-[#c69c6d] rounded-[15px] w-[66px] h-[31px] hover:bg-opacity-90 transition-opacity shrink-0">
                <span className="teks-daftar font-poppins font-[700] text-[14px] leading-[21px] text-[#4b2e2b] block">Daftar</span>
              </Link>
            </>
          ) : (
            <div>
              <div className="flex items-center gap-1 mr-2">
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
                    <BellIcon className="w-5 h-5" />
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
                            <div key={n.id} onClick={() => handleKlikNotifikasi(n)} className={`px-3 py-2.5 cursor-pointer transition-colors flex items-start gap-2 ${n.dibaca ? 'hover:bg-white/5 bg-transparent' : 'bg-white/5 hover:bg-white/10'}`}>
                              {!n.dibaca && <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#c69c6d]" />}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-1">
                                  <h4 className={`text-xs text-[#f3ede6] truncate ${!n.dibaca ? 'font-bold' : 'font-medium'}`}>{n.judul}</h4>
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

                {userRole === 'Pelamar' && (
                  <div className="relative flex items-center" ref={gearRef}>
                    <button
                      onClick={() => setShowGearMenu((prev) => !prev)}
                      className="tombol-pengaturan flex items-center justify-center w-8 h-8 rounded-full text-[#f3ede6] hover:text-[#c69c6d] hover:bg-white/5 transition-all focus:outline-none cursor-pointer shrink-0"
                      aria-label="Menu"
                      title="Menu"
                    >
                      <GearIcon className="w-5 h-5" />
                    </button>

                    {showGearMenu && (
                      <div className="absolute right-0 top-full mt-2 w-44 rounded-xl bg-[#4b2e2b]/95 backdrop-blur-md border border-[#c69c6d]/30 shadow-2xl z-50 overflow-hidden font-poppins">
                        <hr className="border-[#c69c6d]/20" />
                        <button
                          onClick={() => {
                            setShowGearMenu(false);
                            navigate('/profil', { state: { bukaGantiPassword: true } });
                          }}
                          className="flex items-center gap-3 w-full px-4 py-3 text-[#f3ede6] text-sm font-medium hover:bg-white/5 transition-colors text-left"
                        >
                          <GearIcon className="w-4 h-4 text-[#c69c6d]" />
                          Ganti Password
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <Link
                  to={userRole === 'Pelamar' ? '/profil' : (userRole === 'Admin_Perusahaan' ? '/admin' : '/super-admin')}
                  className="tombol-profil hidden md:flex flex-row items-center justify-center bg-[#c69c6d] rounded-[15px] px-4 h-[31px] hover:bg-opacity-90 transition-opacity shrink-0"
                >
                  <span className="teks-profil font-poppins font-[700] text-[14px] leading-[21px] text-[#4b2e2b] block">
                    {userRole === 'Pelamar' ? 'Profile' : 'Dashboard'}
                  </span>
                </Link>
              </div>
            </div>
          )}
        </div>

      </nav>
    </div>
  );
};

export default Navbar;