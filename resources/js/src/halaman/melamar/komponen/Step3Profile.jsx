import React, { useEffect, useState } from 'react';
import iconEdit from '../../../aset/melamar/PencilSquare (3).svg';
import layananProfil from '../../../layanan/layananProfil';

const FieldTextarea = ({ label, field, value, onChange, placeholder, rows = 4 }) => (
    <div className="bg-[#C69C6D] rounded-[10px] p-8 flex flex-col gap-4 w-full">
        <label className="font-poppins font-semibold text-[20px] text-[#4B2E2B]">{label}</label>
        <textarea
            rows={rows}
            value={value || ''}
            onChange={(e) => onChange(field, e.target.value)}
            placeholder={placeholder}
            className="w-full bg-white rounded-[10px] px-6 py-4 font-poppins font-medium text-[16px] text-[#4B2E2B] placeholder:text-[#4B2E2B]/30 focus:outline-none focus:ring-2 focus:ring-[#4B2E2B]/10 resize-none transition-all border-none"
        />
    </div>
);

const FieldInput = ({ label, value, placeholder, readOnly = true }) => (
    <div className="flex flex-col gap-2 w-full">
        <label className="font-poppins font-semibold text-[20px] text-[#4B2E2B]">{label}</label>
        <input
            type="text"
            value={value || ''}
            placeholder={placeholder}
            readOnly={readOnly}
            className="w-full bg-white rounded-[10px] px-6 py-3 font-poppins font-medium text-[16px] text-[#4B2E2B] placeholder:text-[#4B2E2B]/30 focus:outline-none border-none"
        />
    </div>
);

const Step3Profile = ({ data, onChange }) => {
    const [profilData, setProfilData] = useState(null);
    const [loadingProfil, setLoadingProfil] = useState(true);

    useEffect(() => {
        const fetchProfil = async () => {
            try {
                const res = await layananProfil.ambilProfil();
                if (res.status === 'success') setProfilData(res.data);
            } catch (err) {
                console.error('Gagal memuat profil:', err);
            } finally {
                setLoadingProfil(false);
            }
        };
        fetchProfil();
    }, []);

    const handleChange = (field, value) => {
        onChange({ ...data, [field]: value });
    };

    return (
        <div className="w-full flex flex-col gap-10">
            {/* Banner Instruksi Hijau (Figma Node 53:3044) */}
            <div className="w-full bg-[#6B8E23] rounded-[50px] px-12 py-10">
                <h2 className="font-poppins font-semibold text-[32px] text-white leading-tight">
                    Perbarui Profile
                </h2>
                <p className="font-poppins font-medium text-[20px] text-white/90 mt-4 leading-relaxed max-w-[1100px]">
                    Harap periksa kelengkapan data diri, memperbaruinya jika perlu untuk melengkapi lamaran Anda pada posisi Marketing Intern. Profile Anda sangat diperlukan untuk perusahaan yang akan ditinjau oleh HRD
                </p>
            </div>

            {/* Layout 2 Kolom (Figma 53:3047 & 53:3060) */}
            <div className="flex flex-col lg:flex-row gap-8 items-start">
                
                {/* Kolom Kiri — Textarea Form (Frame 131) */}
                <div className="flex-1 bg-[#F5F1EA] rounded-[40px] p-8 border border-[#4B2E2B]/10 flex flex-col gap-8 w-full">
                    <FieldTextarea 
                        label="Tentang Saya" 
                        field="tentangSaya" 
                        value={data.tentangSaya} 
                        onChange={handleChange}
                        placeholder="Ceritakan diri Anda secara singkat..." 
                        rows={6} 
                    />
                    
                    <FieldTextarea 
                        label="Pendidikan" 
                        field="pendidikan" 
                        value={data.pendidikan} 
                        onChange={handleChange}
                        placeholder="Riwayat pendidikan terakhir..." 
                        rows={3} 
                    />
                    
                    <FieldTextarea 
                        label="Skill" 
                        field="keahlian" 
                        value={data.keahlian} 
                        onChange={handleChange}
                        placeholder="Keahlian yang Anda miliki..." 
                        rows={3} 
                    />
                    
                    <FieldTextarea 
                        label="Pengalaman Kerja" 
                        field="pengalamanKerjaDetail" 
                        value={data.pengalamanKerjaDetail}
                        onChange={handleChange} 
                        placeholder="Detail riwayat pekerjaan..." 
                        rows={6} 
                    />
                </div>

                {/* Kolom Kanan — Kartu Info Personal (Frame 113) */}
                <div className="w-full lg:w-[480px] bg-[#C69C6D] rounded-[40px] p-10 flex flex-col gap-8">
                    {/* Avatar Section */}
                    <div className="flex justify-center mb-2">
                        <div className="relative">
                            <div className="w-[158px] h-[158px] rounded-full bg-[#D9D9D9] border-4 border-[#4B2E2B]/20 overflow-hidden flex items-center justify-center">
                                {profilData?.foto_profil ? (
                                    <img 
                                        src={profilData.foto_profil.startsWith('http') ? profilData.foto_profil : `/storage/${profilData.foto_profil}`}
                                        alt="Foto" 
                                        className="w-full h-full object-cover" 
                                    />
                                ) : (
                                    <div className="w-20 h-20 bg-[#A9A9A9] rounded-md" />
                                )}
                            </div>
                            <a href="/profil" target="_blank" className="absolute bottom-1 right-1 bg-white p-2 rounded-full border border-[#4B2E2B]/10 hover:bg-gray-50 transition-colors">
                                <img src={iconEdit} alt="edit" className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Personal Info Fields */}
                    <div className="flex flex-col gap-6">
                        <FieldInput label="Nama Lengkap" value={profilData?.nama_lengkap} placeholder="Nama belum diisi" />
                        <FieldInput label="Tempat, tanggal lahir" value={profilData?.ttl} placeholder="Tempat, Tgl lahir belum diisi" />
                        <FieldInput label="Jenis Kelamin" value={profilData?.jenis_kelamin} placeholder="Jenis kelamin belum diisi" />
                        <FieldInput label="Nomor Telepon" value={profilData?.nomor_telepon} placeholder="Nomor belum diisi" />
                        <FieldInput label="Alamat" value={profilData?.alamat} placeholder="Alamat belum diisi" />
                    </div>

                    {/* Perbarui Button */}
                    <a 
                        href="/profil" 
                        target="_blank"
                        className="w-full bg-[#4B2E2B] text-white py-5 rounded-[50px] font-poppins font-semibold text-[25px] text-center hover:bg-[#3d2523] transition-all active:scale-95 mt-4"
                    >
                        Perbarui
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Step3Profile;
