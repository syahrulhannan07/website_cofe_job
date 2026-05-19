import React from 'react';

const Step2Pertanyaan = ({ data, onChange }) => {
    const handleChange = (field, value) => {
        onChange({ ...data, [field]: value });
    };

    const inputStyle = "w-full border border-[#4B2E2B]/30 rounded-[5px] px-6 py-3 font-poppins font-medium text-[16px] text-[#4B2E2B] placeholder:text-[#4B2E2B]/20 bg-transparent focus:outline-none focus:ring-1 focus:ring-[#C69C6D] transition-all";
    const labelStyle = "font-poppins font-bold text-[22px] text-[#4B2E2B] mb-2 block";

    return (
        <div className="w-full flex flex-col gap-10">
            {/* Banner Instruksi Hijau */}
            <div className="w-full bg-[#6B8E23] rounded-[50px] px-12 py-10">
                <h2 className="font-poppins font-bold text-[32px] text-white leading-tight">
                    Jawab Pertanyaan Perusahaan
                </h2>
                <p className="font-poppins font-medium text-[20px] text-white/90 mt-4 leading-relaxed max-w-[1100px]">
                    Harap jawab pertanyaan dari perusahaan untuk melengkapi lamaran Anda pada posisi Marketing Intern. Jawaban Anda dari pertanyaan perusahaan akan ditinjau oleh HRD
                </p>
            </div>

            {/* Kontainer Form */}
            <div className="flex flex-col gap-8">
                {/* Pertanyaan 1 */}
                <div>
                    <label className={labelStyle}>Berapa gaji bulanan yang diinginkan?</label>
                    <input
                        type="text"
                        value={data.gajiDiinginkan || ''}
                        onChange={(e) => handleChange('gajiDiinginkan', e.target.value)}
                        className={inputStyle}
                    />
                </div>

                {/* Pertanyaan 2 */}
                <div>
                    <label className={labelStyle}>Kualifikasi mana yang anda miliki?</label>
                    <input
                        type="text"
                        value={data.kualifikasi || ''}
                        onChange={(e) => handleChange('kualifikasi', e.target.value)}
                        className={inputStyle}
                    />
                </div>

                {/* Pertanyaan 3 */}
                <div>
                    <label className={labelStyle}>Apakah anda mempunyai pengalaman kerja?</label>
                    <input
                        type="text"
                        value={data.pengalamanKerja || ''}
                        onChange={(e) => handleChange('pengalamanKerja', e.target.value)}
                        className={inputStyle}
                    />
                </div>
            </div>
        </div>
    );
};

export default Step2Pertanyaan;
