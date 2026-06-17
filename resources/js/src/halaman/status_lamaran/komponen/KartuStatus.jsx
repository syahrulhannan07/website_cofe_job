import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import placeholderProfile from '../../../aset/profil/placeholder_profil.jpg';

const KartuStatus = ({ data }) => {
    const navigate = useNavigate();
    const [imgError, setImgError] = useState(false);
    const warnaAksen = '#FBB041';
    const warnaLatar = '#3D2722';
    const warnaTeksUtama = '#F6E6D9';
    const warnaTeksSekunder = '#F6E6D9';

    return (
        <div className="kartu-lamaran-premium flex flex-col md:flex-row items-center rounded-xl p-3 mb-1.5 relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 group"
             style={{ backgroundColor: warnaLatar }}>
            <div className="aksen-kiri absolute left-0 top-0 bottom-0 w-[6px]"
                 style={{ backgroundColor: warnaAksen }}></div>
            <div className="flex items-center flex-grow w-full md:w-auto mb-2 md:mb-0 ml-2 md:ml-3">
                <div className="wadah-logo w-10 h-10 md:w-11 md:h-11 bg-[#1A1110] rounded-lg flex items-center justify-center mr-3 shadow-lg border border-white/5 flex-shrink-0">
                    {data.logo_perusahaan && !imgError ? (
                        <img src={data.logo_perusahaan.startsWith('http') || data.logo_perusahaan.startsWith('/') ? data.logo_perusahaan : `/storage/${data.logo_perusahaan}`} alt={data.nama_perusahaan} className="w-full h-full object-cover rounded-xl" onError={() => setImgError(true)} />
                    ) : (
                        <img src={placeholderProfile} alt="Placeholder" className="w-full h-full object-cover rounded-xl" />
                    )}
                </div>
                <div className="konten-teks flex-grow">
                    <h3 className="font-poppins font-bold text-sm leading-tight mb-0.5"
                        style={{ color: warnaTeksUtama }}>
                        {data.posisi}
                    </h3>
                    <div className="info-tambahan space-y-0.5">
                        <p className="font-poppins font-medium text-xs opacity-80"
                           style={{ color: warnaTeksSekunder }}>
                            {data.nama_perusahaan}
                        </p>
                        <p className="font-poppins text-[10px] opacity-60"
                           style={{ color: warnaTeksSekunder }}>
                            Dikirim pada {data.tanggal_lamar}
                        </p>
                    </div>
                </div>
            </div>
            <div className="area-kanan-premium flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center w-full md:w-auto gap-2 md:min-w-[120px] border-t border-white/5 md:border-none pt-2 md:pt-0 mt-1 md:mt-0 pr-2">
                <div className="pill-status px-3 py-1 rounded-full font-poppins font-bold text-[10px] shadow-md whitespace-nowrap"
                    style={{ backgroundColor: warnaAksen, color: '#3D2722' }}>
                    {data.status}
                </div>
                <button onClick={() => navigate(`/status-lamaran/${data.id}`)}
                    className="flex items-center font-poppins font-semibold text-[10px] hover:opacity-80 transition-all whitespace-nowrap"
                    style={{ color: warnaAksen }}>
                    Lihat Detail
                    <svg className="ml-1 w-2.5 h-2.5 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default KartuStatus;
