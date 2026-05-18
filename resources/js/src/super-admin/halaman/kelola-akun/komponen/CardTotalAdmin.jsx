import React from 'react';
import ikonTren from '../../../aset/akun admin/tren.svg';

const CardTotalAdmin = ({ nilai, tren }) => (
    <div
        className="relative overflow-hidden rounded-[12px] flex flex-col justify-between"
        style={{ background: '#432C23', padding: '24px', minHeight: '159px', flex: '2 1 0' }}
    >
        {/* Dekoratif lingkaran pojok kanan atas */}
        <div
            className="absolute"
            style={{ width: 180, height: 90, top: 0, right: 0, background: 'rgba(255,255,255,0.04)', borderBottomLeftRadius: '100%' }}
        />

        <div className="flex flex-col gap-1">
            {/* Label */}
            <p className="font-semibold text-[14px] tracking-wide"
               style={{ color: '#F7B750', fontFamily: 'Poppins, sans-serif' }}>
                TOTAL ADMINISTRATOR
            </p>
            {/* Nilai */}
            <p className="font-bold text-[36px] leading-[1.2]"
               style={{ color: '#F3EDE6', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {nilai}
            </p>
        </div>

        {/* Badge tren */}
        <div className="flex mt-4">
            <div
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full"
                style={{ background: '#FFDDBA' }}
            >
                <img src={ikonTren} alt="tren" className="w-[10px] h-[6px]" />
                <span className="font-medium text-[12px]"
                      style={{ color: '#835500', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    {tren}
                </span>
            </div>
        </div>
    </div>
);

export default CardTotalAdmin;
