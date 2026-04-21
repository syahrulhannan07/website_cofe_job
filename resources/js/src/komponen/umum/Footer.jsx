import React from 'react';

const Footer = () => {
  return (
    <div className="w-full flex justify-center bg-[#4b2e2b]">
      <footer className="flex flex-col items-center w-full max-w-[1440px] py-12 gap-12 px-6 lg:px-12">

        {/* Kolom-kolom Atas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 w-full max-w-[1280px]">

          {/* Kolom 1: Brand */}
          <div className="flex flex-col gap-4">
            <span className="font-inter font-normal text-xl text-[#c69c6d]">CAFE</span>
            <p className="font-inter font-normal text-sm leading-relaxed text-[#f3ede6]">
              Platform rekrutmen khusus untuk<br className="hidden lg:block"/>
              ekosistem industri kopi di Kabupaten<br className="hidden lg:block"/>
              Indramayu. Brewing careers since 2024.
            </p>
          </div>

          {/* Kolom 2: Navigasi */}
          <div className="flex flex-col gap-4">
            <h4 className="font-inter font-normal text-base text-[#c69c6d]">Navigasi</h4>
            <div className="flex flex-col gap-3">
                <a href="#" className="font-inter font-normal text-sm text-[#f3ede6] hover:text-[#c69c6d] transition-colors">Tentang Kami</a>
                <a href="#" className="font-inter font-normal text-sm text-[#f3ede6] hover:text-[#c69c6d] transition-colors">Tips Karir</a>
                <a href="#" className="font-inter font-normal text-sm text-[#f3ede6] hover:text-[#c69c6d] transition-colors">Pasang Lowongan</a>
            </div>
          </div>

          {/* Kolom 3: Bantuan */}
          <div className="flex flex-col gap-4">
            <h4 className="font-inter font-normal text-base text-[#c69c6d]">Bantuan</h4>
            <div className="flex flex-col gap-3">
                <a href="#" className="font-inter font-normal text-sm text-[#f3ede6] hover:text-[#c69c6d] transition-colors">Pusat Bantuan</a>
                <a href="#" className="font-inter font-normal text-sm text-[#f3ede6] hover:text-[#c69c6d] transition-colors">Kebijakan Privasi</a>
                <a href="#" className="font-inter font-normal text-sm text-[#f3ede6] hover:text-[#c69c6d] transition-colors">Syarat & Ketentuan</a>
            </div>
          </div>

          {/* Kolom 4: Sosial Media */}
          <div className="flex flex-col gap-4">
            <h4 className="font-inter font-normal text-base text-[#c69c6d]">Sosial Media</h4>
            <div className="flex gap-4">
              {/* Ikon Twitter/X */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#553722] cursor-pointer hover:bg-opacity-80 transition-opacity">
                <svg width="14" height="12" viewBox="0 0 24 24" fill="#c69c6d" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </div>
              {/* Ikon Telegram */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#553722] cursor-pointer hover:bg-opacity-80 transition-opacity">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="#c69c6d" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.68c.223-.198-.054-.31-.346-.116l-6.405 4.02-2.766-.864c-.602-.188-.616-.602.126-.893l10.826-4.17c.5-.184.945.116.825.928z"/>
                </svg>
              </div>
            </div>
          </div>

        </div>

        {/* Baris Bawah: Copyright & Bahasa */}
        <div className="flex flex-col-reverse md:flex-row justify-between items-center w-full max-w-[1280px] pt-8 border-t border-[#e6dcd3] gap-4">
          <span className="font-inter font-normal text-sm text-[#f3ede6] text-center md:text-left">
            © 2024 CAFE Indramayu. Brewing Careers Daily.
          </span>
          <div className="flex gap-6">
            <span className="font-inter font-normal text-xs text-[#f3ede6] cursor-pointer hover:text-[#c69c6d]">Bahasa Indonesia</span>
            <span className="font-inter font-normal text-xs text-[#f3ede6] cursor-pointer hover:text-[#c69c6d]">IDR - Rupiah</span>
          </div>
        </div>

      </footer>
    </div>
  );
};

export default Footer;
