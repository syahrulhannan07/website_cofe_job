import React, { useState } from 'react';
import BadgeStatus from './BadgeStatus';
import ikonView from '../../../aset/akun admin/view.svg';

const DaftarAdmin = ({ data, onSuspend, onAktifkan, onLihatDetail, sedangMuatDetail }) => {
    const [sedangMuatId, setSedangMuatId] = useState(null);

    if (data.length === 0) {
        return (
            <div className="wadah-daftar-kosong bg-white rounded-[12px] border border-[#EAE4DC] flex flex-col items-center justify-center py-16 gap-3">
                <p className="teks-kosong text-[16px] font-semibold text-[#4B2E2B]"
                   style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Data akun kafe tidak ditemukan
                </p>
            </div>
        );
    }

    const tanganiLihatDetail = async (admin) => {
        setSedangMuatId(admin.id);
        await onLihatDetail(admin);
        setSedangMuatId(null);
    };

    return (
        <div className="wadah-tabel-admin bg-white rounded-[10px] border border-[#EAE4DC] overflow-hidden shadow-sm">
            {/* Header tabel */}
            <div
                className="header-tabel grid items-center px-6"
                style={{
                    gridTemplateColumns: '1.8fr 1.8fr 2.2fr 1fr 0.8fr',
                    background: '#EAE4DC',
                    height: '63px',
                }}
            >
                {['Nama Pengelola', 'Kafe Terkait', 'Email', 'Status', 'Aksi'].map((h) => (
                    <span key={h}
                          className="kolom-header font-semibold text-[13px] text-[#4B2E2B]"
                          style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {h}
                    </span>
                ))}
            </div>

            {/* Baris data */}
            {data.map((admin) => (
                <div
                    key={admin.id}
                    className="baris-admin grid items-center px-6 border-b border-[#EAE4DC] last:border-b-0 hover:bg-[#F9F6F3] transition-colors"
                    style={{
                        gridTemplateColumns: '1.8fr 1.8fr 2.2fr 1fr 0.8fr',
                        height: '63px',
                    }}
                >
                    {/* Nama Pengelola */}
                    <span className="sel-nama-pengelola font-semibold text-[13px] text-[#4B2E2B] truncate pr-2"
                          style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {admin.nama_pengguna}
                    </span>

                    {/* Kafe Terkait */}
                    <span className="sel-nama-kafe font-semibold text-[13px] text-[#4B2E2B] truncate pr-2"
                          style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {admin.nama_perusahaan}
                    </span>

                    {/* Email */}
                    <span className="sel-email font-semibold text-[13px] text-[#4B2E2B] truncate pr-2"
                          style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {admin.email}
                    </span>

                    {/* Status */}
                    <div className="sel-status">
                        <BadgeStatus status={admin.status} />
                    </div>

                    {/* Aksi — ikon mata memicu fetch detail dan membuka modal */}
                    <div className="sel-aksi flex items-center">
                        <button
                            onClick={() => tanganiLihatDetail(admin)}
                            disabled={sedangMuatId === admin.id}
                            className="tombol-lihat-detail w-[30px] h-[30px] flex items-center justify-center hover:bg-[#EAE4DC]/40 rounded-full transition-all focus:outline-none disabled:opacity-50"
                            title="Lihat Detail Admin"
                            aria-label={`Lihat detail ${admin.nama_perusahaan}`}
                        >
                            {sedangMuatId === admin.id ? (
                                <svg className="w-4 h-4 animate-spin text-[#4B2E2B]" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                </svg>
                            ) : (
                                <img src={ikonView} alt="Lihat Detail" className="w-[30px] h-[30px]" />
                            )}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DaftarAdmin;

