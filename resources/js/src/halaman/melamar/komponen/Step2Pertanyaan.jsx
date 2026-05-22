import React from 'react';

const Step2Pertanyaan = ({ data, onChange, pertanyaanSeleksi = [] }) => {
    const handleChange = (id_pertanyaan, value) => {
        // Cari apakah jawaban untuk id_pertanyaan ini sudah ada di array data
        const index = data.findIndex(item => item.id_pertanyaan === id_pertanyaan);
        let newData = [...data];
        
        if (index >= 0) {
            newData[index].jawaban = value;
        } else {
            newData.push({ id_pertanyaan, jawaban: value });
        }
        
        onChange(newData);
    };

    const getJawaban = (id_pertanyaan) => {
        const item = data.find(p => p.id_pertanyaan === id_pertanyaan);
        return item ? item.jawaban : '';
    };

    const inputStyle = "w-full border border-[#4B2E2B]/30 rounded-[5px] px-6 py-3 font-poppins font-medium text-[16px] text-[#4B2E2B] placeholder:text-[#4B2E2B]/20 bg-transparent focus:outline-none focus:ring-1 focus:ring-[#C69C6D] transition-all";
    const labelStyle = "font-poppins font-bold text-[22px] text-[#4B2E2B] mb-2 block";

    return (
        <div className="pembungkus-tahap-pertanyaan w-full flex flex-col gap-10">
            {/* Banner Instruksi Hijau */}
            <div className="w-full bg-[#6B8E23] rounded-[50px] px-12 py-10">
                <h2 className="font-poppins font-bold text-[32px] text-white leading-tight">
                    Jawab Pertanyaan Perusahaan
                </h2>
                <p className="font-poppins font-medium text-[20px] text-white/90 mt-4 leading-relaxed max-w-[1100px]">
                    Harap jawab pertanyaan dari perusahaan untuk melengkapi lamaran Anda. Jawaban Anda dari pertanyaan perusahaan akan ditinjau oleh HRD
                </p>
            </div>

            {/* Kontainer Form */}
            <div className="flex flex-col gap-8">
                {pertanyaanSeleksi.length === 0 ? (
                    <p className="font-poppins text-[16px] text-[#4B2E2B] opacity-70">
                        Tidak ada pertanyaan spesifik dari perusahaan untuk lowongan ini. Anda dapat melanjutkan ke tahap berikutnya.
                    </p>
                ) : (
                    pertanyaanSeleksi.map((pertanyaan, idx) => (
                        <div key={pertanyaan.id_pertanyaan} className="pembungkus-input-pertanyaan">
                            <label className={labelStyle}>
                                {idx + 1}. {pertanyaan.pertanyaan}
                            </label>
                            <input
                                type="text"
                                value={getJawaban(pertanyaan.id_pertanyaan)}
                                onChange={(e) => handleChange(pertanyaan.id_pertanyaan, e.target.value)}
                                className={inputStyle}
                                placeholder="Ketik jawaban Anda di sini..."
                            />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Step2Pertanyaan;
