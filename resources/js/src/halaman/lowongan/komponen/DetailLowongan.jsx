import React, { useEffect } from 'react';
import starbucksLogo from '../../../aset/beranda/starbucks.png';
import iconLocation from '../../../aset/lowongan/Location.png';
import leftArrow from '../../../aset/lowongan/Left Arrow.png';
import iconLokasiMini from '../../../aset/lowongan/Icon2.svg';
import calendarIcon from '../../../aset/lowongan/Calendar.png';
import briefcaseIcon from '../../../aset/lowongan/School Briefcase.png';

const DetailLowongan = ({ lowongan, onBack }) => {
    useEffect(() => {
        // Sembunyikan navbar dan footer saat komponen ini muncul
        const navbar = document.getElementById('app-navbar');
        const footer = document.getElementById('app-footer');
        if (navbar) navbar.style.display = 'none';
        if (footer) footer.style.display = 'none';

        // Kembalikan seperti semula saat komponen unmount
        return () => {
            if (navbar) navbar.style.display = '';
            if (footer) footer.style.display = '';
        };
    }, []);

    return (
        <div className="w-full min-h-screen bg-[#F3EDE6] font-poppins pb-[100px] flex flex-col">
            {/* Top Banner */}
            <div className="w-full h-[300px] bg-[#4B2E2B] flex items-center justify-center shrink-0">
                <div className="w-full max-w-[1440px] px-[50px] flex justify-between items-center">
                    
                    {/* Left: Logo & Info */}
                    <div className="flex items-center gap-[50px]">
                        <div className="w-[150px] h-[150px] bg-[#F3EDE6] rounded-[15px] flex items-center justify-center p-[10px]">
                            <img src={starbucksLogo} alt="Company Logo" className="w-full h-full object-contain" />
                        </div>
                        
                        <div className="flex flex-col gap-[8px]">
                            <h1 className="font-poppins font-extrabold text-[36px] text-[#F3EDE6] leading-[1.2]">
                                {lowongan.judul}
                            </h1>
                            <p className="font-poppins font-normal text-[20px] text-[#F3EDE6] leading-[1.2]">
                                {lowongan.perusahaan}
                            </p>
                            
                            {/* Location Badge */}
                            <div className="bg-[#F3EDE6] rounded-[25px] h-[24px] inline-flex items-center justify-center px-[12px] w-fit mt-[4px]">
                                <div className="flex items-center gap-[6px]">
                                    <img src={iconLokasiMini} alt="Location" className="w-[10px] h-[12px] object-contain" />
                                    <span className="font-inter font-normal text-[12px] text-[#4B2E2B] leading-[1]">
                                        {lowongan.lokasi}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Buttons */}
                    <div className="flex flex-col gap-[20px]">
                        <button className="w-[200px] h-[61px] bg-[#C69C6D] rounded-[12px] font-inter font-bold text-[20px] text-[#F3EDE6] hover:bg-[#b0895f] transition-colors flex items-center justify-center">
                            Lamar Sekarang
                        </button>
                        <button 
                            onClick={onBack}
                            className="w-[200px] h-[61px] border border-[#F3EDE6] rounded-[12px] font-inter font-bold text-[24px] text-[#C69C6D] hover:bg-[#F3EDE6]/10 transition-colors flex items-center justify-center gap-[10px]"
                        >
                            <img src={leftArrow} alt="Back" className="w-[37px] h-[50px] object-contain" />
                            Kembali...
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="w-full max-w-[1440px] mx-auto px-[50px] mt-[40px] flex flex-col lg:flex-row gap-[50px] lg:gap-[113px]">
                
                {/* Left: Descriptions */}
                <div className="flex-1 flex flex-col max-w-[788px]">
                    <h2 className="font-poppins font-extrabold text-[24px] text-[#4B2E2B] mb-[9px]">
                        Deskripsi Pekerjaan
                    </h2>
                    <p className="font-poppins font-normal text-[15px] text-[#C69C6D] leading-[1.8] mb-[64px] text-justify whitespace-pre-line">
                        Sebagai Marketing Intern, Anda akan berperan penting dalam menceritakan kisah di balik setiap cangkir kopi kami. Anda akan membantu memperkuat identitas brand Indra Coffee Roasters melalui kreativitas digital dan interaksi langsung.
                        {'\n\n'}Tanggung Jawab Utama:{'\n'}
                        Produksi Konten Kreatif: Mengambil foto, merekam video (Reels/TikTok), dan mendesain visual menarik untuk media sosial.{'\n'}
                        Copywriting: Menyusun takarir (caption) yang kreatif dan informatif yang mencerminkan karakter brand.{'\n'}
                        Social Media Management: Mengelola jadwal posting harian dan berinteraksi dengan audiens untuk membangun komunitas yang loyal.{'\n'}
                        Riset Tren: Memantau tren terbaru di industri kopi dan media sosial untuk diadaptasi ke dalam strategi pemasaran.{'\n'}
                        Dukungan Kampanye: Membantu tim dalam perencanaan dan pelaksanaan promo bulanan serta acara-acara khusus di kafe.
                    </p>

                    <h2 className="font-poppins font-extrabold text-[24px] text-[#4B2E2B] mb-[21px]">
                        Persyaratan & Kualifikasi
                    </h2>
                    <p className="font-poppins font-normal text-[15px] text-[#C69C6D] leading-[1.8] text-justify whitespace-pre-line">
                        Kami mencari individu yang dinamis, memiliki selera visual yang baik, dan tentunya seorang pencinta kopi!
                        {'\n\n'}Kualifikasi:{'\n'}
                        Pendidikan: Mahasiswa tingkat akhir atau lulusan baru (Fresh Graduate) dari jurusan Pemasaran, Ilmu Komunikasi, DKV, atau bidang terkait.{'\n'}
                        Keahlian Teknis: Mahir menggunakan aplikasi editing di ponsel (seperti Canva, CapCut, atau Adobe Express).{'\n'}
                        Kreativitas: Memiliki kemampuan storytelling melalui tulisan (copywriting) dan visual.{'\n'}
                        Pengetahuan Media Sosial: Memahami cara kerja algoritma Instagram dan TikTok.{'\n'}
                        Kepribadian: Proaktif, jujur, mampu bekerja sesuai tenggat waktu (deadline), dan senang berkolaborasi dalam tim.{'\n'}
                        Minat: Memiliki ketertarikan mendalam pada budaya kopi dan industri kreatif.{'\n'}
                        Lokasi: Bersedia ditempatkan atau melakukan mobilitas di area Karangampel, Indramayu.
                    </p>
                </div>

                {/* Right: Company Profile Card */}
                <div className="w-[550px] shrink-0 flex flex-col">
                    <div className="w-full h-[802px] border-[3px] border-[#C69C6D] rounded-[50px] overflow-hidden bg-transparent flex flex-col relative">
                        
                        {/* Top Banner of Card */}
                        <div className="w-full h-[173px] bg-[#C69C6D] shrink-0" />
                        
                        {/* Logo overlapping banner */}
                        <div className="absolute top-[82px] left-[40px] w-[160px] h-[160px] bg-[#F3EDE6] rounded-[15px] flex items-center justify-center p-[10px]">
                            <img src={starbucksLogo} alt="Company Logo" className="w-[140px] h-[140px] object-contain" />
                        </div>

                        {/* Card Content */}
                        <div className="flex flex-col px-[40px] mt-[90px] h-full relative">
                            <h3 className="font-poppins font-extrabold text-[24px] text-[#C69C6D] mb-[15px]">
                                {lowongan.perusahaan}
                            </h3>
                            <p className="font-poppins font-normal text-[16px] text-[#C69C6D] leading-[24px] mb-[30px] w-[410px]">
                                “Indra Coffee Roasters adalah pemanggang kopi artisan yang berdedikasi di Karangampel, Jawa Barat.”
                            </p>
                            
                            <div className="w-full border-t border-[#C69C6D] pt-[30px] flex flex-col gap-[25px] flex-grow">
                                
                                {/* Info Items */}
                                <div className="flex items-center gap-[25px]">
                                    <div className="w-[50px] h-[50px] flex items-center justify-center">
                                        <img src={calendarIcon} alt="Calendar" className="w-[30px] h-[30px] object-contain" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-poppins font-semibold text-[15px] text-[#C69C6D]">Berdiri</span>
                                        <span className="font-poppins font-normal text-[14px] text-[#4B2E2B]">5 April 2007</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-[25px]">
                                    <div className="w-[50px] h-[50px] flex items-center justify-center">
                                        <img src={iconLocation} alt="Location" className="w-[30px] h-[30px] object-contain" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-poppins font-semibold text-[15px] text-[#C69C6D]">Lokasi</span>
                                        <span className="font-poppins font-normal text-[14px] text-[#4B2E2B]">{lowongan.lokasi}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-[25px]">
                                    <div className="w-[50px] h-[50px] flex items-center justify-center">
                                        <img src={briefcaseIcon} alt="Jobs" className="w-[30px] h-[30px] object-contain" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-poppins font-semibold text-[15px] text-[#C69C6D]">Lowongan Aktif</span>
                                        <span className="font-poppins font-normal text-[14px] text-[#4B2E2B]">80 Lowongan</span>
                                    </div>
                                </div>

                            </div>

                            {/* Profil Button */}
                            <button className="w-[467px] h-[51px] bg-[#C69C6D] rounded-[25px] font-poppins font-extrabold text-[24px] text-[#F3EDE6] mb-[40px] mt-auto hover:bg-[#b0895f] transition-colors self-center">
                                Lihat Profil Perusahaan
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DetailLowongan;
