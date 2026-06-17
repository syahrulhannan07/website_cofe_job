import React, { useState, useEffect } from 'react';
import graduationCapIcon from '../../../aset/profil/Graduation Cap.png';
import pencilIcon from '../../../aset/profil/Pencil.png';
import backgroundVector from '../../../aset/profil/Vector.png';
import layananProfil from '../../../layanan/layananProfil';

const BagianPendidikan = ({ initialData, onRefresh }) => {
    const [listPendidikan, setListPendidikan] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({
        institusi: '',
        jurusan: '',
        tingkat: '',
        tahun_mulai: '',
        tahun_selesai: ''
    });

    // Sinkronisasi dengan data dari parent
    useEffect(() => {
        if (initialData) {
            setListPendidikan(initialData);
        }
    }, [initialData]);

    const formatTanggal = (tanggalStr) => {
        if (!tanggalStr) return '';
        return tanggalStr.split('T')[0];
    };

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditId(item.id_pendidikan);
            setForm({
                institusi: item.institusi,
                jurusan: item.jurusan,
                tingkat: item.tingkat,
                tahun_mulai: formatTanggal(item.tahun_mulai),
                tahun_selesai: formatTanggal(item.tahun_selesai)
            });
        } else {
            setEditId(null);
            setForm({ institusi: '', jurusan: '', tingkat: '', tahun_mulai: '', tahun_selesai: '' });
        }
        setIsModalOpen(true);
    };

    const handleSimpan = async () => {
        try {
            if (editId) {
                await layananProfil.updatePendidikan(editId, form);
            } else {
                await layananProfil.tambahPendidikan(form);
            }
            setIsModalOpen(false);
            if (onRefresh) onRefresh(); // Segarkan data global
        } catch (error) {
            console.error("Gagal menyimpan pendidikan:", error);
            if (error.response?.data?.errors) {
                alert("Gagal menyimpan: " + Object.values(error.response.data.errors).flat().join(", "));
            }
        }
    };

    const handleHapus = async (id) => {
        if (window.confirm("Hapus riwayat pendidikan ini?")) {
            try {
                await layananProfil.hapusPendidikan(id);
                if (onRefresh) onRefresh();
            } catch (error) {
                console.error("Gagal menghapus pendidikan:", error);
            }
        }
    };

    return (
        <div className="bagian-pendidikan bg-[#C69C6D] rounded-2xl p-6 relative overflow-hidden shadow-sm w-full flex flex-col justify-center">
            <div className="vektor-latar absolute inset-0 w-full h-full opacity-20 pointer-events-none z-0">
                <img src={backgroundVector} alt="" className="w-full h-full object-cover" />
            </div>

            <div className="area-header relative z-10 flex justify-between items-center mb-5">
                <h2 className="judul-seksi font-poppins font-semibold text-xl md:text-2xl text-[#4B2E2B]">
                    Pendidikan
                </h2>
                <button 
                    onClick={() => handleOpenModal()}
                    className="tombol-tambah flex items-center gap-2 border-[3px] border-[#4B2E2B] rounded-xl px-4 py-1.5 hover:bg-[#4B2E2B]/10 transition-colors"
                >
                    <img src={pencilIcon} alt="" className="w-5 h-5" />
                    <span className="font-poppins font-bold text-sm md:text-base text-[#4B2E2B]">Tambah</span>
                </button>
            </div>

            <div className="area-konten-list relative z-10 flex flex-col gap-4">
                {listPendidikan.map((item, index) => (
                    <div key={item.id_pendidikan} className="pendidikan-item flex gap-4 relative group">
                        <div className="timeline-pendidikan flex flex-col items-center relative">
                            <div className="wadah-ikon w-10 h-10 bg-white border-2 border-[#4B2E2B] rounded-xl flex items-center justify-center z-10 shadow-sm">
                                <img src={graduationCapIcon} alt="" className="w-6 h-6" />
                            </div>
                            {index !== listPendidikan.length - 1 && (
                                <div className="garis-timeline absolute top-10 bottom-[-16px] w-[2px] bg-[#4B2E2B] opacity-50 z-0"></div>
                            )}
                        </div>

                        <div className="info-pendidikan pt-0.5 flex flex-col justify-center flex-1">
                            <div className="flex justify-between items-start">
                                <h3 className="nama-institusi font-poppins font-semibold text-sm md:text-base text-[#4B2E2B] leading-tight">
                                    {item.institusi} - {item.tingkat} {item.jurusan}
                                </h3>
                                <div className="opsi-item flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => handleOpenModal(item)} 
                                        className="tombol-opsi-edit bg-[#4B2E2B] text-[#C69C6D] px-3 py-0.5 rounded-full font-poppins text-xs font-bold hover:scale-105 transition-all shadow-sm"
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => handleHapus(item.id_pendidikan)} 
                                        className="tombol-opsi-hapus bg-red-700 text-white w-5 h-5 flex items-center justify-center rounded-full font-bold hover:scale-110 transition-all shadow-sm text-xs"
                                        title="Hapus"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                            <p className="rentang-waktu font-poppins font-medium text-xs md:text-sm text-[#4B2E2B]/80 mt-0.5">
                                {formatTanggal(item.tahun_mulai)} - {item.tahun_selesai ? formatTanggal(item.tahun_selesai) : 'Sekarang'}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Pendidikan */}
            {isModalOpen && (
                <div className="modal-overlay fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                    <div className="modal-konten bg-[#F3EDE6] rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <h3 className="judul-modal font-poppins font-bold text-lg text-[#4B2E2B] mb-4">
                            {editId ? 'Edit Pendidikan' : 'Tambah Pendidikan'}
                        </h3>
                        <div className="flex flex-col gap-3">
                            <input className="input-modal h-10 px-3 rounded-lg bg-[#E3CEB6] border-none outline-none text-sm" placeholder="Institusi" value={form.institusi} onChange={(e) => setForm({...form, institusi: e.target.value})} />
                            <input className="input-modal h-10 px-3 rounded-lg bg-[#E3CEB6] border-none outline-none text-sm" placeholder="Jurusan" value={form.jurusan} onChange={(e) => setForm({...form, jurusan: e.target.value})} />
                            <input className="input-modal h-10 px-3 rounded-lg bg-[#E3CEB6] border-none outline-none text-sm" placeholder="Tingkat (Contoh: S1, SMK)" value={form.tingkat} onChange={(e) => setForm({...form, tingkat: e.target.value})} />
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="text-xs text-[#4B2E2B] mb-0.5 block">Tanggal Mulai</label>
                                    <input type="date" className="input-modal w-full h-10 px-3 rounded-lg bg-[#E3CEB6] border-none outline-none text-sm" value={form.tahun_mulai} onChange={(e) => setForm({...form, tahun_mulai: e.target.value})} />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs text-[#4B2E2B] mb-0.5 block">Tanggal Selesai</label>
                                    <input type="date" className="input-modal w-full h-10 px-3 rounded-lg bg-[#E3CEB6] border-none outline-none text-sm" value={form.tahun_selesai} onChange={(e) => setForm({...form, tahun_selesai: e.target.value})} />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-3">
                                <button onClick={() => setIsModalOpen(false)} className="px-4 py-1.5 rounded-lg border border-[#4B2E2B] text-[#4B2E2B] text-sm">Batal</button>
                                <button onClick={handleSimpan} className="px-4 py-1.5 rounded-lg bg-[#4B2E2B] text-white text-sm">Simpan</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BagianPendidikan;
