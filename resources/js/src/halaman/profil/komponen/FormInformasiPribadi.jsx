import React, { useState, useEffect } from 'react';
import backgroundVector from '../../../aset/profil/Vector.png';
import pencilSquareIcon from '../../../aset/profil/PencilSquare.svg';
import layananProfil from '../../../layanan/layananProfil';

const FormInformasiPribadi = ({ initialData, onRefresh }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [profil, setProfil] = useState({
        nama_lengkap: '', tentang_saya: '', alamat: '', email: '',
        nomor_telepon: '', jenis_kelamin: '', tanggal_lahir: ''
    });

    useEffect(() => {
        if (initialData) {
            setProfil({
                nama_lengkap: initialData.nama_lengkap || '',
                tentang_saya: initialData.tentang_saya || '',
                alamat: initialData.alamat || '',
                email: initialData.pengguna?.email || '',
                nomor_telepon: initialData.nomor_telepon || '',
                jenis_kelamin: initialData.jenis_kelamin || '',
                tanggal_lahir: initialData.tanggal_lahir || ''
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfil(prev => ({ ...prev, [name]: value }));
    };

    const handleSimpan = async () => {
        try {
            const respons = await layananProfil.updateProfil(profil);
            if (respons.status === 'success') {
                setIsEditing(false);
                alert("Profil dan Email berhasil diperbarui!");
                if (onRefresh) onRefresh();
            }
        } catch (error) {
            console.error("Gagal memperbarui profil:", error);
            if (error.response?.data?.errors) {
                const pesanError = Object.values(error.response.data.errors).flat().join("\n");
                alert("Kesalahan Validasi:\n" + pesanError);
            } else {
                alert("Terjadi kesalahan saat menyimpan perubahan.");
            }
        }
    };

    return (
        <div className="form-informasi-pribadi bg-[#C69C6D] rounded-2xl p-6 shadow-lg w-full relative overflow-hidden z-10 flex flex-col">
            <div className="vektor-latar absolute bottom-0 left-0 w-full opacity-50 pointer-events-none z-0">
                <img src={backgroundVector} alt="" className="w-full h-auto object-cover" />
            </div>
            <div className="area-header relative z-10 flex justify-between items-center mb-6">
                <h2 className="judul-seksi font-poppins font-semibold text-xl md:text-2xl text-[#4B2E2B]">
                    Informasi Pribadi
                </h2>
                <div className="grup-aksi flex items-center gap-4">
                    {isEditing && (
                        <button onClick={handleSimpan}
                            className="tombol-simpan bg-[#4B2E2B] text-[#F3EDE6] font-poppins font-semibold text-sm px-6 py-2 rounded-full hover:bg-[#3d2523] transition-all shadow-md active:scale-95"
                        >
                            Simpan Perubahan
                        </button>
                    )}
                    <button onClick={() => setIsEditing(!isEditing)}
                        className={`tombol-edit-ikon group ${isEditing ? 'bg-[#4B2E2B]/20' : ''} rounded-lg`}>
                        <div className="wadah-ikon-edit w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#4B2E2B]/10 transition-colors">
                            <img src={pencilSquareIcon} alt="Edit" className="w-7 h-7" />
                        </div>
                    </button>
                </div>
            </div>

            <form className="area-form relative z-10 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 flex-1" onSubmit={(e) => e.preventDefault()}>
                <div className="flex flex-col gap-4">
                    <div className="grup-input flex flex-col gap-1">
                        <label className="label-input font-poppins font-semibold text-sm md:text-base text-[#4B2E2B]">Nama Lengkap</label>
                        <input name="nama_lengkap" value={profil.nama_lengkap} onChange={handleChange} disabled={!isEditing}
                            type="text" className="input-field h-10 bg-[#E3CEB6] border-none rounded-lg px-3 font-poppins text-sm text-[#4B2E2B] focus:ring-2 focus:ring-[#4B2E2B]/20 outline-none placeholder:text-[#4B2E2B]/40 transition-shadow disabled:opacity-70" />
                    </div>
                    <div className="grup-input flex flex-col gap-1">
                        <label className="label-input font-poppins font-semibold text-sm md:text-base text-[#4B2E2B]">Tentang Saya</label>
                        <textarea name="tentang_saya" value={profil.tentang_saya} onChange={handleChange} disabled={!isEditing}
                            className="input-field h-[100px] text-sm leading-relaxed bg-[#E3CEB6] border-none rounded-lg p-3 font-poppins text-[#4B2E2B] focus:ring-2 focus:ring-[#4B2E2B]/20 outline-none resize-none placeholder:text-[#4B2E2B]/40 transition-shadow disabled:opacity-70" />
                    </div>
                    <div className="grup-input flex flex-col gap-1">
                        <label className="label-input font-poppins font-semibold text-sm md:text-base text-[#4B2E2B]">Alamat</label>
                        <textarea name="alamat" value={profil.alamat} onChange={handleChange} disabled={!isEditing}
                            className="input-field h-[80px] bg-[#E3CEB6] border-none rounded-lg p-3 font-poppins text-sm text-[#4B2E2B] focus:ring-2 focus:ring-[#4B2E2B]/20 outline-none resize-none placeholder:text-[#4B2E2B]/40 transition-shadow disabled:opacity-70" />
                    </div>
                </div>
                <div className="flex flex-col gap-4">
                    <div className="grup-input flex flex-col gap-1">
                        <label className="label-input font-poppins font-semibold text-sm md:text-base text-[#4B2E2B]">Email</label>
                        <input name="email" value={profil.email} onChange={handleChange} disabled={!isEditing}
                            type="email" className="input-field h-10 bg-[#E3CEB6] border-none rounded-lg px-3 font-poppins text-sm text-[#4B2E2B] focus:ring-2 focus:ring-[#4B2E2B]/20 outline-none placeholder:text-[#4B2E2B]/40 transition-shadow disabled:opacity-70" />
                    </div>
                    <div className="grup-input flex flex-col gap-1">
                        <label className="label-input font-poppins font-semibold text-sm md:text-base text-[#4B2E2B]">No Telepon</label>
                        <input name="nomor_telepon" value={profil.nomor_telepon} onChange={handleChange} disabled={!isEditing}
                            type="text" className="input-field h-10 bg-[#E3CEB6] border-none rounded-lg px-3 font-poppins text-sm text-[#4B2E2B] focus:ring-2 focus:ring-[#4B2E2B]/20 outline-none placeholder:text-[#4B2E2B]/40 transition-shadow disabled:opacity-70" />
                    </div>
                    <div className="grup-input flex flex-col gap-1">
                        <label className="label-input font-poppins font-semibold text-sm md:text-base text-[#4B2E2B]">Jenis Kelamin</label>
                        <select name="jenis_kelamin" value={profil.jenis_kelamin} onChange={handleChange} disabled={!isEditing}
                            className="input-field h-10 bg-[#E3CEB6] border-none rounded-lg px-3 font-poppins text-sm text-[#4B2E2B] focus:ring-2 focus:ring-[#4B2E2B]/20 outline-none appearance-none cursor-pointer transition-shadow disabled:opacity-70">
                            <option value="">Pilih Jenis Kelamin</option>
                            <option value="Laki-laki">Laki-laki</option>
                            <option value="Perempuan">Perempuan</option>
                        </select>
                    </div>
                    <div className="grup-input flex flex-col gap-1">
                        <label className="label-input font-poppins font-semibold text-sm md:text-base text-[#4B2E2B]">Tanggal Lahir</label>
                        <input name="tanggal_lahir" value={profil.tanggal_lahir} onChange={handleChange} disabled={!isEditing}
                            type="date" className="input-field w-full h-10 bg-[#E3CEB6] border-none rounded-lg px-3 font-poppins text-sm text-[#4B2E2B] focus:ring-2 focus:ring-[#4B2E2B]/20 outline-none transition-shadow disabled:opacity-70" />
                    </div>
                </div>
            </form>
        </div>
    );
};

export default FormInformasiPribadi;
