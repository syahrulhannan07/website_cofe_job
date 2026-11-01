import React from 'react';
import MapLokasi from './MapLokasi';
import { getCompanyAddress, getCompanyCoordinates } from '../../layanan/koordinatLokasi';

const LokasiPerusahaan = ({ perusahaan, onEdit }) => {
    const koordinat = getCompanyCoordinates(perusahaan);
    const alamat = getCompanyAddress(perusahaan);

    return (
        <section className="w-full min-w-0 rounded-2xl border border-[#4B2E2B]/15 bg-white p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-poppins font-semibold text-xl sm:text-2xl text-[#4B2E2B]">
                    Lokasi Kafe
                </h2>
                {onEdit && (
                    <button
                        type="button"
                        onClick={onEdit}
                        className="min-h-11 rounded-xl border border-[#4B2E2B]/20 px-4 py-2 font-poppins text-sm font-semibold text-[#4B2E2B] hover:bg-[#F3EDE6] cursor-pointer"
                    >
                        Edit Lokasi
                    </button>
                )}
            </div>
            {alamat && (
                <p className="mt-2 font-poppins text-sm leading-relaxed text-[#4B2E2B]/80 break-words">
                    {alamat}
                </p>
            )}
            {koordinat ? (
                <>
                    <div className="relative z-0 mt-4 h-64 sm:h-80 w-full overflow-hidden rounded-xl border border-[#4B2E2B]/15">
                        <MapLokasi
                            latitude={koordinat.latitude}
                            longitude={koordinat.longitude}
                            zoom={17}
                            height="100%"
                            popupText={perusahaan?.nama_perusahaan || 'Lokasi kafe'}
                        />
                    </div>
                    <p className="mt-3 font-poppins text-xs leading-relaxed text-[#4B2E2B]/70 break-words">
                        Titik lokasi tersimpan: {koordinat.latitude.toFixed(6)}, {koordinat.longitude.toFixed(6)}
                    </p>
                </>
            ) : (
                <p className="mt-4 rounded-xl bg-[#F3EDE6] p-4 font-poppins text-sm leading-relaxed text-[#4B2E2B]/80">
                    Titik lokasi kafe belum tersedia. Peta akan ditampilkan setelah koordinat lokasi tersimpan.
                </p>
            )}
        </section>
    );
};

export default LokasiPerusahaan;
