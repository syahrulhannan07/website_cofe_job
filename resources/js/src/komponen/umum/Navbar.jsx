import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logoGambar from '../../aset/logo.png';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('peran');
    setIsLoggedIn(!!token);
    setUserRole(role);
  }, [location]);

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
              <Link to="/status-lamaran" className="tautan-nav font-poppins font-[700] text-[14px] leading-[21px] text-[#f3ede6] hover:opacity-80 transition-opacity whitespace-nowrap">
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
            <Link
              to={userRole === 'Pelamar' ? '/profil' : (userRole === 'Admin_Perusahaan' ? '/admin' : '/super-admin')}
              className="tombol-profil flex flex-row items-center justify-center bg-[#c69c6d] rounded-[15px] px-4 h-[31px] hover:bg-opacity-90 transition-opacity shrink-0"
            >
               <span className="teks-profil font-poppins font-[700] text-[14px] leading-[21px] text-[#4b2e2b] block">
                 {userRole === 'Pelamar' ? 'Profile' : 'Dashboard'}
               </span>
            </Link>
          )}
        </div>

      </nav>
    </div>
  );
};

export default Navbar;
