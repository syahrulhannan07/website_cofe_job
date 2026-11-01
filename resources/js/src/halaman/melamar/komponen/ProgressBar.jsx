import React from 'react';

const LABEL_STEP = ['Upload Dokumen', 'Pertanyaan', 'Profil', 'Review', 'Verifikasi Wajah'];

const ProgressBar = ({ stepSaatIni }) => {
    return (
        <div className="w-full flex flex-col items-center gap-4 mb-8">
            {/* Label Step */}
            <p className="font-poppins font-semibold text-lg text-[#4B2E2B] text-center">
                Step {stepSaatIni} of 5
            </p>

            {/* Indikator dan label berbagi kolom agar tetap sejajar saat teks membungkus. */}
            <div className="grid grid-cols-5 gap-1.5 sm:gap-3 w-full min-w-0">
                {LABEL_STEP.map((label, idx) => (
                    <div
                        key={label}
                        aria-current={idx + 1 === stepSaatIni ? 'step' : undefined}
                        className="min-w-0 flex flex-col gap-3 sm:gap-4"
                    >
                        <div
                            className={`w-full h-2 rounded-full border transition-all duration-500 ${
                                idx + 1 <= stepSaatIni
                                    ? 'bg-[#C69C6D] border-[#4B2E2B]'
                                    : 'bg-white border-[#4B2E2B]'
                            }`}
                        />
                        <p
                            className={`text-center font-poppins text-[10px] sm:text-[11px] leading-snug break-words font-medium transition-colors duration-300 ${
                                idx + 1 === stepSaatIni ? 'text-[#4B2E2B] font-semibold opacity-100' : 'text-[#4B2E2B] opacity-40'
                            }`}
                        >
                            {label}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProgressBar;
