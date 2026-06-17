import React from 'react';

const LABEL_STEP = ['Upload Dokumen', 'Pertanyaan', 'Profil', 'Review'];

const ProgressBar = ({ stepSaatIni }) => {
    return (
        <div className="w-full flex flex-col items-center gap-4 mb-8">
            {/* Label Step */}
            <p className="font-poppins font-semibold text-lg text-[#4B2E2B] text-center">
                Step {stepSaatIni} of 4
            </p>

            {/* Bar Indikator */}
            <div className="flex gap-3 w-full justify-center overflow-x-auto pb-1 scrollbar-hide">
                {[1, 2, 3, 4].map((step) => (
                    <div
                        key={step}
                        className={`min-w-[80px] h-[8px] rounded-full border transition-all duration-500 ${
                            step <= stepSaatIni
                                ? 'bg-[#C69C6D] border-[#4B2E2B]'
                                : 'bg-white border-[#4B2E2B]'
                        }`}
                    />
                ))}
            </div>

            {/* Label Nama Tahap */}
            <div className="flex gap-3 w-full justify-center overflow-x-auto scrollbar-hide">
                {LABEL_STEP.map((label, idx) => (
                    <p
                        key={idx}
                        className={`min-w-[80px] text-center font-poppins text-[11px] font-medium transition-colors duration-300 ${
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
