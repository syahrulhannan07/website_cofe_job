import React from 'react';
import ikonCafe from '../../../aset/akun admin/ikon cafe.svg';

const CardKafeAktif = ({ nilai }) => (
    <div
        className="rounded-[12px] flex flex-col items-center justify-center text-center gap-2"
        style={{ background: '#FEAE2C', padding: '24px', minHeight: '160px', flex: '1 1 0' }}
    >
        {/* Ikon kafe di tengah atas */}
        <div className="flex items-center justify-center">
            <img src={ikonCafe} alt="kafe" className="w-[31px] h-[28px]" />
        </div>

        <div className="flex flex-col items-center gap-1">
            {/* Label */}
            <p className="font-semibold text-[14px] tracking-wider"
               style={{ color: '#6B4500', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                KAFE AKTIF
            </p>
            {/* Nilai */}
            <p className="font-semibold text-[24px]"
               style={{ color: '#6B4500', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {nilai}
            </p>
        </div>
    </div>
);

export default CardKafeAktif;
