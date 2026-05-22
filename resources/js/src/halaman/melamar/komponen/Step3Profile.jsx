import React, { useEffect, useState } from 'react';
import iconEdit from '../../../aset/melamar/PencilSquare (3).svg';
import placeholderProfile from '../../../aset/profil/placeholder_profil.jpg';
import layananProfil from '../../../layanan/layananProfil';
import BagianPendidikan from '../../profil/komponen/BagianPendidikan';
import BagianKeahlian from '../../profil/komponen/BagianKeahlian';
import BagianPengalaman from '../../profil/komponen/BagianPengalaman';

const FieldTextarea = ({ label, field, value, onChange, onBlur, placeholder, rows = 8 }) => (
    <div className="bg-[#C69C6D] rounded-[10px] p-8 flex flex-col gap-4 w-full">
        <label className="font-poppins font-semibold text-[20px] text-[#4B2E2B]">{label}</label>
        <textarea
            rows={rows}
            value={value || ''}
            onChange={(e) => onChange(field, e.target.value)}
            onBlur={() => onBlur(field, value)}
            placeholder={placeholder}
            className="w-full bg-white rounded-[10px] px-6 py-4 font-poppins font-medium text-[14px] text-[#4B2E2B] placeholder:text-[#4B2E2B]/30 focus:outline-none focus:ring-2 focus:ring-[#4B2E2B]/10 resize-none transition-all border-none"
        />
    </div>
);

const FieldInput = ({ label, field, value, isEditing, onChange, placeholder }) => (
    <div className="flex flex-col gap-2 w-full">
        <label className="font-poppins font-semibold text-[20px] text-[#4B2E2B]">{label}</label>
        <input
            type="text"
            value={value || ''}
            onChange={(e) => isEditing && onChange(field, e.target.value)}
            placeholder={placeholder}
            readOnly={!isEditing}
            className={`w-full rounded-[10px] px-6 py-3 font-poppins font-medium text-[16px] text-[#4B2E2B] placeholder:text-[#4B2E2B]/30 focus:outline-none transition-all ${
                isEditing 
                    ? 'bg-white border-2 border-[#4B2E2B]/30 focus:border-[#4B2E2B]' 
                    : 'bg-white/80 border-none opacity-90'
            }`}
        />
    </div>
);

const Step3Profile = ({ data, onChange }) => {
    const [profilData, setProfilData] = useState(null);
    const [loadingProfil, setLoadingProfil] = useState(true);

    const [isEditingDasar, setIsEditingDasar] = useState(false);
    const [editData, setEditData] = useState({});

    const fetchProfil = async () => {
        try {
            const res = await layananProfil.ambilProfil();
            if (res.status === 'success') {
                setProfilData(res.data);
                if (!data.tentangSaya && res.data.tentang_saya) {
                    onChange({ ...data, tentangSaya: res.data.tentang_saya });
                }
            }
        } catch (err) {
            console.error('Gagal memuat profil:', err);
        } finally {
            setLoadingProfil(false);
        }
    };

    useEffect(() => {
        fetchProfil();
    }, []);

    const handleChange = (field, value) => {
        onChange({ ...data, [field]: value });
    };

    const handleBlurTentangSaya = async (field, value) => {
        try {
            await layananProfil.updateProfil({ tentang_saya: value });
        } catch (error) {
            console.error("Gagal update tentang saya:", error);
        }
    };

    // Handler Form Info Dasar Inline
    const toggleEditDasar = (e) => {
        e.preventDefault();
        if (!isEditingDasar) {
            setEditData({
                nama_lengkap: profilData?.nama_lengkap || '',
                ttl: profilData?.ttl || '',
                jenis_kelamin: profilData?.jenis_kelamin || '',
                nomor_telepon: profilData?.nomor_telepon || '',
                alamat: profilData?.alamat || ''
            });
            setIsEditingDasar(true);
        } else {
            setIsEditingDasar(false); // Batalkan
        }
    };

    const handleEditDasarChange = (field, value) => {
        setEditData(prev => ({ ...prev, [field]: value }));
    };

    const handleSimpanDasar = async (e) => {
        e.preventDefault();
        try {
            await layananProfil.updateProfil(editData);
            setIsEditingDasar(false);
            fetchProfil(); // Refresh data dari server
        } catch (error) {
            console.error("Gagal update info dasar:", error);
            alert("Gagal menyimpan data.");
        }
    };

    return (
        <div className="pembungkus-tahap-profil w-full flex flex-col gap-10">
            {/* Banner Instruksi Hijau */}
            <div className="w-full bg-[#6B8E23] rounded-[50px] px-12 py-10">
                <h2 className="font-poppins font-semibold text-[32px] text-white leading-tight">
                    Perbarui Profile
                </h2>
                <p className="font-poppins font-medium text-[20px] text-white/90 mt-4 leading-relaxed max-w-[1100px]">
                    Harap periksa kelengkapan data diri, memperbaruinya jika perlu untuk melengkapi lamaran Anda. Profile Anda sangat diperlukan untuk perusahaan yang akan ditinjau oleh HRD
                </p>
            </div>

            {/* Layout 2 Kolom */}
            <div className="flex flex-col lg:flex-row gap-8 items-start">
                
                {/* Kolom Kiri — Form Dinamis Profil */}
                <div className="pembungkus-kolom-kiri flex-1 bg-[#F5F1EA] rounded-[40px] p-8 border border-[#4B2E2B]/10 flex flex-col gap-8 w-full">
                    
                    {/* Tentang Saya (Textarea biasa, tapi di-save onBlur) */}
                    <FieldTextarea 
                        label="Tentang Saya" 
                        field="tentangSaya" 
                        value={data.tentangSaya} 
                        onChange={handleChange}
                        onBlur={handleBlurTentangSaya}
                        placeholder="Ceritakan diri Anda secara singkat..." 
                        rows={8} 
                    />
                    
                    <BagianPendidikan 
                        initialData={profilData?.pendidikan || []} 
                        onRefresh={fetchProfil} 
                    />
                    
                    <BagianKeahlian 
                        initialData={profilData?.skills || []} 
                        onRefresh={fetchProfil} 
                    />
                    
                    <BagianPengalaman 
                        initialData={profilData?.pengalaman_kerja || []} 
                        onRefresh={fetchProfil} 
                    />
                </div>

                {/* Kolom Kanan — Kartu Info Personal */}
                <div className="pembungkus-kolom-kanan w-full lg:w-[480px] bg-[#C69C6D] rounded-[40px] p-10 flex flex-col gap-8">
                    {/* Avatar Section */}
                    <div className="flex justify-center mb-2">
                        <div className="relative">
                            <div className="w-[158px] h-[158px] rounded-full border-4 border-[#4B2E2B]/20 overflow-hidden flex items-center justify-center bg-[#F3EDE6]">
                                <img 
                                    src={profilData?.foto_profil 
                                        ? (profilData.foto_profil.startsWith('http') ? profilData.foto_profil : `/storage/${profilData.foto_profil}`)
                                        : placeholderProfile}
                                    alt="Foto" 
                                    className="w-full h-full object-cover" 
                                />
                            </div>
                            <button 
                                onClick={toggleEditDasar}
                                className="absolute bottom-1 right-1 bg-white p-2 rounded-full border border-[#4B2E2B]/10 hover:bg-gray-50 transition-colors shadow-sm cursor-pointer z-10"
                                title="Edit Info Dasar"
                            >
                                <img src={iconEdit} alt="edit" className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Personal Info Fields */}
                    <div className="flex flex-col gap-6">
                        <FieldInput 
                            label="Nama Lengkap" 
                            field="nama_lengkap"
                            value={isEditingDasar ? editData.nama_lengkap : profilData?.nama_lengkap} 
                            isEditing={isEditingDasar}
                            onChange={handleEditDasarChange}
                            placeholder="Nama belum diisi" 
                        />
                        <FieldInput 
                            label="Tempat, tanggal lahir" 
                            field="ttl"
                            value={isEditingDasar ? editData.ttl : profilData?.ttl} 
                            isEditing={isEditingDasar}
                            onChange={handleEditDasarChange}
                            placeholder="Tempat, Tgl lahir belum diisi" 
                        />
                        <FieldInput 
                            label="Jenis Kelamin" 
                            field="jenis_kelamin"
                            value={isEditingDasar ? editData.jenis_kelamin : profilData?.jenis_kelamin} 
                            isEditing={isEditingDasar}
                            onChange={handleEditDasarChange}
                            placeholder="Jenis kelamin belum diisi" 
                        />
                        <FieldInput 
                            label="Nomor Telepon" 
                            field="nomor_telepon"
                            value={isEditingDasar ? editData.nomor_telepon : profilData?.nomor_telepon} 
                            isEditing={isEditingDasar}
                            onChange={handleEditDasarChange}
                            placeholder="Nomor belum diisi" 
                        />
                        <FieldInput 
                            label="Alamat" 
                            field="alamat"
                            value={isEditingDasar ? editData.alamat : profilData?.alamat} 
                            isEditing={isEditingDasar}
                            onChange={handleEditDasarChange}
                            placeholder="Alamat belum diisi" 
                        />
                    </div>

                    {/* Tombol Simpan jika mode Edit */}
                    {isEditingDasar ? (
                        <div className="flex flex-col gap-3 mt-4">
                            <button 
                                onClick={handleSimpanDasar}
                                className="w-full bg-[#4B2E2B] text-white py-4 rounded-[50px] font-poppins font-semibold text-[20px] text-center hover:bg-[#3d2523] transition-all active:scale-95"
                            >
                                Simpan Perubahan
                            </button>
                            <button 
                                onClick={toggleEditDasar}
                                className="w-full bg-transparent border-2 border-[#4B2E2B] text-[#4B2E2B] py-4 rounded-[50px] font-poppins font-semibold text-[20px] text-center hover:bg-[#4B2E2B]/5 transition-all active:scale-95"
                            >
                                Batal
                            </button>
                        </div>
                    ) : (
                        <>
                            <p className="font-poppins text-center text-white mt-4 text-[14px]">
                                Klik ikon pensil di atas foto untuk mengubah info dasar tanpa perlu berpindah halaman.
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Step3Profile;
