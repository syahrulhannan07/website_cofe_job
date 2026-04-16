import React from 'react';
import logoGambar from '../assets/logo.png';

const Navbar = () => {
  return (
    <div className="flex w-full justify-center mt-10">
      {/* Navbar Container: Width 908px, Height 90px, Radius 100px, bg #4b2e2b */}
      <nav className="flex items-center justify-between w-[908px] h-[90px] rounded-[100px] bg-[#4b2e2b] px-[40px]">
        
        {/* Group Kiri: Logo + Tautan Navigasi */}
        <div className="flex items-center gap-[50px]">
          
          {/* Logo (Frame 13 1) Width 49px Height 60px */}
          <div className="flex flex-col items-center justify-center w-[49px] h-[60px]">
              <img src={logoGambar} alt="CAFE JOB Logo" className="w-full h-full object-contain" />
              <span className="sr-only">CAFE JOB</span>
          </div>

          {/* Tautan Navigasi */}
          <div className="flex items-center gap-[30px] h-[21px] justify-center">
            {/* Beranda */}
            <a href="#" className="font-poppins font-[700] text-[14px] leading-[21px] text-[#f3ede6] w-[62px] h-[21px] flex items-center justify-center hover:opacity-80 transition-opacity">
              Beranda
            </a>
            {/* Lowongan */}
            <a href="#" className="font-poppins font-[700] text-[14px] leading-[21px] text-[#f3ede6] w-[84px] h-[21px] flex items-center justify-center hover:opacity-80 transition-opacity">
              Lowongan
            </a>
            {/* Perusahaan */}
            <a href="#" className="font-poppins font-[700] text-[14px] leading-[21px] text-[#f3ede6] w-[88px] h-[21px] flex items-center justify-center hover:opacity-80 transition-opacity">
              Perusahaan
            </a>
          </div>

        </div>

        {/* Kolom Kanan: Masuk & Frame 64 (Daftar) */}
        <div className="flex items-center gap-[20px]">
          {/* Masuk */}
          <button className="font-poppins font-[700] text-[14px] leading-[21px] text-[#f3ede6] w-[49px] h-[21px] hover:opacity-80 transition-opacity">
            Masuk
          </button>
          
          {/* Frame 64 / Daftar Container */}
          <button className="flex flex-row items-center justify-center gap-[10px] px-[10px] py-[10px] bg-[#c69c6d] rounded-[15px] w-[66px] h-[31px] hover:bg-opacity-90 transition-opacity">
             <span className="font-poppins font-[700] text-[14px] leading-[21px] text-[#4b2e2b] w-[46px] h-[21px] block">
               Daftar
             </span>
          </button>
        </div>
        
      </nav>
    </div>
  );
};

export default Navbar;
