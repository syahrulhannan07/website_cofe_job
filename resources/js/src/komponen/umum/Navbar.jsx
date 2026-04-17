import React from 'react';
import { Link } from 'react-router-dom';
import logoGambar from '../../aset/logo.png';

const Navbar = () => {
  return (
    <div className="flex w-full justify-center mt-4 md:mt-10 px-4">
      <nav className="flex flex-wrap md:flex-nowrap items-center justify-between w-full max-w-[908px] min-h-[90px] rounded-[30px] md:rounded-[100px] bg-[#4b2e2b] px-6 py-4 md:px-[40px] md:py-0 gap-4 md:gap-0">

        {/* Grup Kiri: Logo + Tautan Navigasi */}
        <div className="flex items-center gap-6 md:gap-[50px] w-full md:w-auto justify-between md:justify-start">

          {/* Logo */}
          <div className="flex flex-col items-center justify-center w-[40px] h-[49px] md:w-[49px] md:h-[60px] shrink-0">
              <img src={logoGambar} alt="Logo CAFE JOB" className="w-full h-full object-contain" />
              <span className="sr-only">CAFE JOB</span>
          </div>

          {/* Tautan Navigasi — tampil di desktop */}
          <div className="hidden md:flex items-center gap-[30px] h-[21px] justify-center">
            <Link to="/" className="font-poppins font-[700] text-[14px] leading-[21px] text-[#f3ede6] hover:opacity-80 transition-opacity whitespace-nowrap">
              Beranda
            </Link>
            <Link to="/lowongan" className="font-poppins font-[700] text-[14px] leading-[21px] text-[#f3ede6] hover:opacity-80 transition-opacity whitespace-nowrap">
              Lowongan
            </Link>
            <Link to="/perusahaan" className="font-poppins font-[700] text-[14px] leading-[21px] text-[#f3ede6] hover:opacity-80 transition-opacity whitespace-nowrap">
              Perusahaan
            </Link>
          </div>
        </div>

        {/* Grup Kanan: Masuk & Daftar */}
        <div className="flex items-center gap-4 md:gap-[20px] w-full md:w-auto justify-center md:justify-start">

          {/* Tautan Navigasi — tampil di mobile (scroll horizontal) */}
          <div className="md:hidden flex flex-1 overflow-x-auto gap-4 scrollbar-hide mr-4">
             <Link to="/" className="font-poppins font-[600] text-[12px] text-[#f3ede6] whitespace-nowrap">Beranda</Link>
             <Link to="/lowongan" className="font-poppins font-[600] text-[12px] text-[#f3ede6] whitespace-nowrap">Lowongan</Link>
             <Link to="/perusahaan" className="font-poppins font-[600] text-[12px] text-[#f3ede6] whitespace-nowrap">Perusahaan</Link>
          </div>

          {/* Tombol Masuk */}
          <Link
            to="/masuk"
            className="font-poppins font-[700] text-[14px] leading-[21px] text-[#f3ede6] hover:opacity-80 transition-opacity shrink-0"
          >
            Masuk
          </Link>

          {/* Tombol Daftar */}
          <Link
            to="/daftar"
            className="flex flex-row items-center justify-center bg-[#c69c6d] rounded-[15px] px-4 py-2 hover:bg-opacity-90 transition-opacity shrink-0"
          >
             <span className="font-poppins font-[700] text-[14px] leading-[21px] text-[#4b2e2b] block">Daftar</span>
          </Link>
        </div>

      </nav>
    </div>
  );
};

export default Navbar;
