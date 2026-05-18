import React from 'react';
import { ChevronRight } from 'lucide-react';

const dataAntrian = [
    { nama: 'Kopi Kenangan Senopati', lokasi: 'Jatibarang' },
    { nama: 'Fore Coffe', lokasi: 'Hargeulis' },
    { nama: 'Janji Jiwa', lokasi: 'Losarang' },
];

const AntrianVerifikasi = () => {
    return (
        <div className="wadah-antrian-verifikasi w-full">
            <div className="bg-[#F3EDE6] rounded-[5px] border border-[#4B2E2B] p-3 flex flex-col gap-3 h-full">
                <div className="flex flex-col gap-2 flex-1">
                    {dataAntrian.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 transition-all hover:translate-x-1 cursor-pointer">
                            <div className="w-[40px] h-[40px] bg-[#D9D9D9] rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.33 4 18V20H20V18C20 15.33 14.67 14 12 14Z" fill="#A9A9A9"/>
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-poppins font-bold text-[13px] text-[#4B2E2B] leading-tight">
                                    {item.nama}
                                </h4>
                                <p className="font-poppins text-[11px] text-[#4B2E2B]/70 mt-0.5">
                                    {item.lokasi}
                                </p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-[#4B2E2B]" strokeWidth={1.5} />
                        </div>
                    ))}
                </div>
                
                <button className="w-full bg-[#4B2E2B] text-[#F3EDE6] font-poppins font-bold text-[11px] py-2.5 rounded-[10px] mt-1 hover:bg-[#3D2523] transition-colors">
                    Lihat Semua Antrian
                </button>
            </div>
        </div>
    );
};

export default AntrianVerifikasi;
