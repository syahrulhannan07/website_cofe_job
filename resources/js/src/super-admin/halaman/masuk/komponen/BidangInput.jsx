import React from 'react';

/**
 * BidangInput — Komponen atom untuk setiap field dalam form login Super Admin.
 * Menampilkan label, input, dan pesan error validasi.
 *
 * Props:
 *  - id: string — id unik untuk aksesibilitas
 *  - label: string — teks label di atas input
 *  - type: string — tipe input (text/password)
 *  - nilai: string — nilai terkontrol
 *  - onChange: func — handler perubahan nilai
 *  - pesan: string — pesan error (opsional)
 *  - placeholder: string — placeholder teks
 */
const BidangInput = ({ id, label, type = 'text', nilai, onChange, pesan, placeholder }) => {
    return (
        <div className="wadah-bidang-input flex flex-col gap-[6px]">
            <label
                htmlFor={id}
                className="label-bidang font-poppins font-semibold text-[14px] text-[#4B2E2B]"
            >
                {label}
            </label>
            <input
                id={id}
                type={type}
                value={nilai}
                onChange={onChange}
                placeholder={placeholder}
                autoComplete={type === 'password' ? 'current-password' : 'username'}
                className={`input-bidang-login w-full h-[48px] px-[16px] bg-[#F3EDE6] border rounded-[8px] font-poppins text-[14px] text-[#4B2E2B] transition-all duration-200 focus:outline-none placeholder:text-[#A08070] ${
                    pesan
                        ? 'border-red-500 ring-1 ring-red-500/30'
                        : 'border-[#C69C6D]/60 focus:border-[#F5B759] focus:ring-1 focus:ring-[#F5B759]/30'
                }`}
            />
            {pesan && (
                <p className="pesan-error-bidang font-poppins text-[12px] text-red-600 mt-[2px]">
                    {pesan}
                </p>
            )}
        </div>
    );
};

export default BidangInput;
