import React, { useState, useEffect } from 'react';
import buildingIcon from '../../../aset/profil/Building.png';
import plusIcon from '../../../aset/profil/Plus Math.png';
import backgroundVector from '../../../aset/profil/Vector.png';
import layananProfil from '../../../layanan/layananProfil';

const BagianPengalaman = ({ initialData, onRefresh }) => {
    const [listPengalaman, setListPengalaman] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({
        nama_perusahaan: '',
        posisi: '',
        deskripsi: '',
        tanggal_mulai: '',
        tanggal_selesai: ''
    });

    // Sinkronisasi dengan data dari parent
    useEffect(() => {
        if (initialData) {
            setListPengalaman(initialData);
        }
    }, [initialData]);

    const formatTanggal = (tanggalStr) => {
        if (!tanggalStr) return '';
        return tanggalStr.split('T')[0];
    };

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditId(item.id_pengalaman);
            setForm({
                nama_perusahaan: item.nama_perusahaan,
                posisi: item.posisi,
                deskripsi: item.deskripsi || '',
                tanggal_mulai: formatTanggal(item.tanggal_mulai),
                tanggal_selesai: formatTanggal(item.tanggal_selesai)
            });
        } else {
            setEditId(null);
            setForm({ nama_perusahaan: '', posisi: '', deskripsi: '', tanggal_mulai: '', tanggal_selesai: '' });
        }
        setIsModalOpen(true);
    };

    const handleSimpan = async () => {
        try {
            if (editId) {
                await layananProfil.updatePengalaman(editId, form);
            } else {
                await layananProfil.tambahPengalaman(form);
            }
            setIsModalOpen(false);
            if (onRefresh) onRefresh(); // Segarkan data global
        } catch (error) {
            console.error("Gagal menyimpan pengalaman:", error);
            if (error.response?.data?.errors) {
                alert("Gagal menyimpan: " + Object.values(error.response.data.errors).flat().join(", "));
            }
        }
    };

    const handleHapus = async (id) => {
        if (window.confirm("Hapus riwayat pengalaman ini?")) {
            try {
                await layananProfil.hapusPengalaman(id);
                if (onRefresh) onRefresh();
            } catch (error) {
                console.error("Gagal menghapus pengalaman:", error);
            }
        }
    };

    return (
        <div className="bagian-pengalaman bg-[#C69C6D] rounded-2xl p-6 relative overflow-hidden shadow-sm w-full flex flex-col justify-center">
            <div className="vektor-latar absolute inset-0 w-full h-full opacity-20 pointer-events-none z-0">
                <img src={backgroundVector} alt="" className="w-full h-full object-cover" />
            </div>

            <div className="area-header relative z-10 flex justify-between items-center mb-5">
                <h2 className="judul-seksi font-poppins font-semibold text-xl md:text-2xl text-[#4B2E2B]">
                    Pengalaman
                </h2>
                <button 
                    onClick={() => handleOpenModal()}
                    className="tombol-tambah flex items-center gap-2 border-[3px] border-[#4B2E2B] rounded-xl px-4 py-1.5 hover:bg-[#4B2E2B]/10 transition-colors"
                >
                    <img src={plusIcon} alt="" className="w-5 h-5" />
                    <span className="font-poppins font-bold text-sm md:text-base text-[#4B2E2B]">Tambah</span>
                </button>
            </div>

            <div className="area-konten-list relative z-10 flex flex-col gap-4">
                {listPengalaman.map((item, index) => (
                    <div key={item.id_pengalaman} className="pengalaman-item flex gap-4 relative group">
                        <div className="timeline-pengalaman flex flex-col items-center relative">
                            <div className="wadah-ikon w-10 h-10 bg-white border-2 border-[#4B2E2B] rounded-xl flex items-center justify-center z-10 shadow-sm">
                                <img src={buildingIcon} alt="" className="w-5 h-5" />
                            </div>
                            {index !== listPengalaman.length - 1 && (
                                <div className="garis-timeline absolute top-10 bottom-[-16px] w-[2px] bg-[#4B2E2B] opacity-50 z-0"></div>
                            )}
                        </div>

                        <div className="info-pengalaman pt-0.5 flex flex-col flex-1">
                            <div className="flex justify-between items-start">
                                <h3 className="nama-perusahaan-jabatan font-poppins font-semibold text-sm md:text-base text-[#4B2E2B] leading-tight">
                                    {item.nama_perusahaan} - {item.posisi}
                                </h3>
                                <div className="opsi-item flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => handleOpenModal(item)} 
                                        className="tombol-opsi-edit bg-[#4B2E2B] text-[#C69C6D] px-3 py-0.5 rounded-full font-poppins text-xs font-bold hover:scale-105 transition-all shadow-sm"
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => handleHapus(item.id_pengalaman)} 
                                        className="tombol-opsi-hapus bg-red-700 text-white w-5 h-5 flex items-center justify-center rounded-full font-bold hover:scale-110 transition-all shadow-sm text-xs"
                                        title="Hapus"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                            <p className="rentang-waktu font-poppins font-medium text-xs md:text-sm text-[#4B2E2B]/80 mt-0.5">
                                {formatTanggal(item.tanggal_mulai)} - {item.tanggal_selesai ? formatTanggal(item.tanggal_selesai) : 'Sekarang'}
                            </p>
                            <p className="deskripsi-pengalaman font-poppins text-sm md:text-base text-[#F3EDE6] mt-3 leading-relaxed">
                                {item.deskripsi}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Pengalaman */}
            {isModalOpen && (
                <div className="modal-overlay fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                    <div className="modal-konten bg-[#F3EDE6] rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <h3 className="judul-modal font-poppins font-bold text-lg text-[#4B2E2B] mb-4">
                            {editId ? 'Edit Pengalaman' : 'Tambah Pengalaman'}
                        </h3>
                        <div className="flex flex-col gap-3">
                            <input 
                                className="input-modal h-10 px-3 rounded-lg bg-[#E3CEB6] border-none outline-none text-sm" 
                                placeholder="Instansi/Perusahaan" 
                                value={form.nama_perusahaan}
                                onChange={(e) => setForm({...form, nama_perusahaan: e.target.value})}
                            />
                            <input 
                                className="input-modal h-10 px-3 rounded-lg bg-[#E3CEB6] border-none outline-none text-sm" 
                                placeholder="Jabatan" 
                                value={form.posisi}
                                onChange={(e) => setForm({...form, posisi: e.target.value})}
                            />
                            <textarea 
                                className="input-modal h-20 p-3 rounded-lg bg-[#E3CEB6] border-none outline-none resize-none text-sm" 
                                placeholder="Deskripsi Pekerjaan" 
                                value={form.deskripsi}
                                onChange={(e) => setForm({...form, deskripsi: e.target.value})}
                            />
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="text-xs text-[#4B2E2B] mb-0.5 block">Tanggal Mulai</label>
                                    <input 
                                        type="date"
                                        className="input-modal w-full h-10 px-3 rounded-lg bg-[#E3CEB6] border-none outline-none text-sm" 
                                        value={form.tanggal_mulai}
                                        onChange={(e) => setForm({...form, tanggal_mulai: e.target.value})}
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs text-[#4B2E2B] mb-0.5 block">Tanggal Selesai</label>
                                    <input 
                                        type="date"
                                        className="input-modal w-full h-10 px-3 rounded-lg bg-[#E3CEB6] border-none outline-none text-sm" 
                                        value={form.tanggal_selesai}
                                        onChange={(e) => setForm({...form, tanggal_selesai: e.target.value})}
                                    />
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

export default BagianPengalaman;
