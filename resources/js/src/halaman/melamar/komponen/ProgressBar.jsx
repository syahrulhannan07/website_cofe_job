import React from 'react';

const LABEL_STEP = ['Upload Dokumen', 'Pertanyaan', 'Profil', 'Review'];

const ProgressBar = ({ stepSaatIni }) => {
    return (
        <div className="w-full flex flex-col items-center gap-6 mb-12">
            {/* Label Step (Figma Node 53:2953) */}
            <p className="font-poppins font-semibold text-[32px] text-[#4B2E2B] text-center">
                Step {stepSaatIni} of 4
            </p>

            {/* Bar Indikator (Figma Node 53:2954) */}
            <div className="flex gap-5 w-full justify-center overflow-x-auto pb-2 scrollbar-hide">
                {[1, 2, 3, 4].map((step) => (
                    <div
                        key={step}
                        className={`min-w-[120px] h-[10px] rounded-full border transition-all duration-500 ${
                            step <= stepSaatIni
                                ? 'bg-[#C69C6D] border-[#4B2E2B]'
                                : 'bg-white border-[#4B2E2B]'
                        }`}
                    />
                ))}
            </div>

            {/* Label Nama Tahap */}
            <div className="flex gap-5 w-full justify-center overflow-x-auto scrollbar-hide">
                {LABEL_STEP.map((label, idx) => (
                    <p
                        key={idx}
                        className={`min-w-[120px] text-center font-poppins text-[13px] font-medium transition-colors duration-300 ${
                            idx + 1 === stepSaatIni ? 'text-[#4B2E2B] font-semibold opacity-100' : 'text-[#4B2E2B] opacity-40'
                        }`}
                    >
                        {label}
                    </p>
                ))}
            </div>
        </div>
    );
};

export default ProgressBar;
