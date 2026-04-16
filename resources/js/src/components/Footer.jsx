import React from 'react';

const Footer = () => {
  return (
    <div className="w-full flex justify-center bg-[#000000] mt-20">
      {/* Container Utilitarian untuk Center Alignment di layar lebar jika diperlukan */}
      <footer className="flex flex-col items-center bg-[#4b2e2b] w-[1440px] h-[322px] py-[48px] gap-[48px] border-t border-[#e6dcd3]">
        
        {/* Top 4 Columns Container W=1280px H=124px */}
        <div className="flex justify-between w-[1280px] h-[124px] px-[32px]">
          
          {/* Column 1: Brand */}
          <div className="flex flex-col w-[280px] h-[123.5px] pb-[3.75px] gap-[22.75px]">
            <div className="w-[280px] h-[28px]">
                <span className="font-inter font-normal text-[20px] leading-[28px] text-[#c69c6d]">CAFE</span>
            </div>
            <div className="w-[280px] h-[69px]">
                <p className="font-inter font-normal text-[14px] leading-[22.75px] text-[#f3ede6]">
                  Platform rekrutmen khusus untuk<br />
                  ekosistem industri kopi di Kabupaten<br />
                  Indramayu. Brewing careers since 2024.
                </p>
            </div>
          </div>

          {/* Column 2: Navigasi */}
          <div className="flex flex-col w-[280px] h-[124px] gap-[16px]">
            <div className="w-[280px] h-[24px]">
                <h4 className="font-inter font-normal text-[16px] leading-[24px] text-[#c69c6d]">Navigasi</h4>
            </div>
            <div className="flex flex-col w-[280px] h-[84px] gap-[12px]">
                <a href="#" className="font-inter font-normal text-[14px] leading-[20px] text-[#f3ede6] w-[280px] h-[20px] hover:text-[#c69c6d] transition-colors">Tentang Kami</a>
                <a href="#" className="font-inter font-normal text-[14px] leading-[20px] text-[#f3ede6] w-[280px] h-[20px] hover:text-[#c69c6d] transition-colors">Tips Karir</a>
                <a href="#" className="font-inter font-normal text-[14px] leading-[20px] text-[#f3ede6] w-[280px] h-[20px] hover:text-[#c69c6d] transition-colors">Pasang Lowongan</a>
            </div>
          </div>

          {/* Column 3: Bantuan */}
          <div className="flex flex-col w-[280px] h-[124px] gap-[16px]">
            <div className="w-[280px] h-[24px]">
                <h4 className="font-inter font-normal text-[16px] leading-[24px] text-[#c69c6d]">Bantuan</h4>
            </div>
            <div className="flex flex-col w-[280px] h-[84px] gap-[12px]">
                <a href="#" className="font-inter font-normal text-[14px] leading-[20px] text-[#f3ede6] w-[280px] h-[20px] hover:text-[#c69c6d] transition-colors">Pusat Bantuan</a>
                <a href="#" className="font-inter font-normal text-[14px] leading-[20px] text-[#f3ede6] w-[280px] h-[20px] hover:text-[#c69c6d] transition-colors">Kebijakan Privasi</a>
                <a href="#" className="font-inter font-normal text-[14px] leading-[20px] text-[#f3ede6] w-[280px] h-[20px] hover:text-[#c69c6d] transition-colors">Syarat & Ketentuan</a>
            </div>
          </div>

          {/* Column 4: Sosial Media */}
          <div className="flex flex-col w-[280px] h-[124px] pb-[44px] gap-[16px]">
            <div className="w-[280px] h-[24px]">
                <h4 className="font-inter font-normal text-[16px] leading-[24px] text-[#c69c6d]">Sosial Media</h4>
            </div>
            <div className="flex w-[280px] h-[40px] gap-[16px]">
                {/* Icon 1 LinkedIn/Ig */}
                <div className="flex items-center justify-center w-[40px] h-[40px] rounded-full bg-[#553722] cursor-pointer hover:bg-opacity-80 transition-opacity">
                  <div className="w-[12.75px] h-[12px] bg-[#c69c6d]" style={{ maskImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' width=\'100%25\' height=\'100%25\'%3E%3Cpath d=\'M24 4.557.../\'/%3E%3C/svg%3E")', WebkitMaskImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' width=\'100%25\' height=\'100%25\'%3E%3Cpath d=\'M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z\'/%3E%3C/svg%3E")' }}></div>
                </div>

                {/* Icon 2 Fb */}
                <div className="flex items-center justify-center w-[40px] h-[40px] rounded-full bg-[#553722] cursor-pointer hover:bg-opacity-80 transition-opacity">
                  <div className="w-[15px] h-[15px] bg-[#c69c6d]" style={{ maskImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' width=\'100%25\' height=\'100%25\'%3E%3Cpath d=\'M12 0C5.373 0 0 5.373 0 12.../\'/%3E%3C/svg%3E")', WebkitMaskImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' width=\'100%25\' height=\'100%25\'%3E%3Cpath d=\'M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.68c.223-.198-.054-.31-.346-.116l-6.405 4.02-2.766-.864c-.602-.188-.616-.602.126-.893l10.826-4.17c.5-.184.945.116.825.928z\'/%3E%3C/svg%3E")' }}></div>
                </div>
            </div>
          </div>

        </div>

        {/* Horizontal Border & Bottom Text Container W=1280px H=53px */}
        <div className="flex justify-between w-[1280px] h-[53px] px-[32px] pt-[32px] border-t border-[#e6dcd3]">
            
            {/* Copyright */}
            <div className="w-[323.31px] h-[20px]">
              <span className="font-inter font-normal text-[14px] leading-[20px] text-[#f3ede6]">© 2024 CAFE Indramayu. Brewing Careers Daily.</span>
            </div>

            {/* Language & Currency */}
            <div className="flex gap-[24px] w-[194.58px] h-[16px]">
              <div className="w-[99.8px] h-[16px]">
                  <span className="font-inter font-normal text-[12px] leading-[16px] text-[#f3ede6] cursor-pointer hover:text-[#c69c6d]">Bahasa Indonesia</span>
              </div>
              <div className="w-[70.78px] h-[16px]">
                  <span className="font-inter font-normal text-[12px] leading-[16px] text-[#f3ede6] cursor-pointer hover:text-[#c69c6d]">IDR - Rupiah</span>
              </div>
            </div>
            
        </div>

      </footer>
    </div>
  );
};

export default Footer;
