import React, { useState, useEffect } from 'react';
import buildingIcon from '../../../aset/profil/Building.png';
import plusIcon from '../../../aset/profil/Plus Math.png';
import backgroundVector from '../../../aset/profil/Vector.png';
import layananProfil from '../../../layanan/layananProfil';

const BagianPengalaman = () => {
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

    const fetchPengalaman = async () => {
        try {
            const data = await layananProfil.ambilProfil();
            if (data.status === 'success') {
                setListPengalaman(data.data.pengalaman_kerja || []);
            }
        } catch (error) {
            console.error("Gagal mengambil data pengalaman:", error);
        }
    };

    useEffect(() => {
        fetchPengalaman();
    }, []);

    const formatTanggal = (tanggalStr) => {
        if (!tanggalStr) return '';
        return tanggalStr.split('T')[0];
    };

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditId(item.id_pengalaman); // Menggunakan id_pengalaman sesuai model
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
            fetchPengalaman();
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
                fetchPengalaman();
            } catch (error) {
                console.error("Gagal menghapus pengalaman:", error);
            }
        }
    };

    return (
        <div className="bagian-pengalaman bg-[#C69C6D] rounded-[25px] p-8 md:p-10 relative overflow-hidden shadow-sm w-full min-h-[300px] flex flex-col justify-center">
            <div className="vektor-latar absolute bottom-0 left-0 w-full opacity-30 pointer-events-none z-0">
                <img src={backgroundVector} alt="" className="w-full h-auto object-cover" />
            </div>

            <div className="area-header relative z-10 flex justify-between items-center mb-8">
                <h2 className="judul-seksi font-poppins font-semibold text-[28px] md:text-[32px] text-[#4B2E2B]">
                    Pengalaman
                </h2>
                <button 
                    onClick={() => handleOpenModal()}
                    className="tombol-tambah flex items-center gap-2 border-[3px] border-[#4B2E2B] rounded-[20px] px-6 py-2 hover:bg-[#4B2E2B]/10 transition-colors"
                >
                    <img src={plusIcon} alt="" className="w-8 h-8" />
                    <span className="font-poppins font-bold text-[20px] md:text-[24px] text-[#4B2E2B]">Tambah</span>
                </button>
            </div>

            <div className="area-konten-list relative z-10 flex flex-col gap-8">
                {listPengalaman.map((item, index) => (
                    <div key={item.id_pengalaman} className="pengalaman-item flex gap-6 relative group">
                        <div className="timeline-pengalaman flex flex-col items-center relative">
                            <div className="wadah-ikon w-[60px] h-[60px] bg-white border-2 border-[#4B2E2B] rounded-[20px] flex items-center justify-center z-10 shadow-sm">
                                <img src={buildingIcon} alt="" className="w-10 h-10" />
                            </div>
                            {index !== listPengalaman.length - 1 && (
                                <div className="garis-timeline absolute top-[60px] bottom-[-32px] w-[2px] bg-[#4B2E2B] opacity-50 z-0"></div>
                            )}
                        </div>

                        <div className="info-pengalaman pt-1 flex flex-col flex-1">
                            <div className="flex justify-between items-start">
                                <h3 className="nama-perusahaan-jabatan font-poppins font-semibold text-[18px] md:text-[22px] text-[#4B2E2B] leading-tight">
                                    {item.nama_perusahaan} - {item.posisi}
                                </h3>
                                <div className="opsi-item flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => handleOpenModal(item)} 
                                        className="tombol-opsi-edit bg-[#4B2E2B] text-[#C69C6D] px-4 py-1 rounded-full font-poppins text-[14px] font-bold hover:scale-105 transition-all shadow-sm"
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => handleHapus(item.id_pengalaman)} 
                                        className="tombol-opsi-hapus bg-red-700 text-white w-[28px] h-[28px] flex items-center justify-center rounded-full font-bold hover:scale-110 transition-all shadow-sm"
                                        title="Hapus"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                            <p className="rentang-waktu font-poppins font-medium text-[16px] md:text-[18px] text-[#4B2E2B]/80 mt-1">
                                {formatTanggal(item.tanggal_mulai)} - {item.tanggal_selesai ? formatTanggal(item.tanggal_selesai) : 'Sekarang'}
                            </p>
                            <p className="deskripsi-pengalaman font-poppins text-[14px] md:text-[16px] text-[#F3EDE6] mt-3 max-w-[850px] leading-relaxed">
                                {item.deskripsi}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Pengalaman */}
            {isModalOpen && (
                <div className="modal-overlay fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                    <div className="modal-konten bg-[#F3EDE6] rounded-[25px] p-8 w-full max-w-[600px] shadow-2xl">
                        <h3 className="judul-modal font-poppins font-bold text-[24px] text-[#4B2E2B] mb-6">
                            {editId ? 'Edit Pengalaman' : 'Tambah Pengalaman'}
                        </h3>
                        <div className="flex flex-col gap-4">
                            <input 
                                className="input-modal h-[50px] px-4 rounded-lg bg-[#E3CEB6] border-none outline-none" 
                                placeholder="Instansi/Perusahaan" 
                                value={form.nama_perusahaan}
                                onChange={(e) => setForm({...form, nama_perusahaan: e.target.value})}
                            />
                            <input 
                                className="input-modal h-[50px] px-4 rounded-lg bg-[#E3CEB6] border-none outline-none" 
                                placeholder="Jabatan" 
                                value={form.posisi}
                                onChange={(e) => setForm({...form, posisi: e.target.value})}
                            />
                            <textarea 
                                className="input-modal h-[100px] p-4 rounded-lg bg-[#E3CEB6] border-none outline-none resize-none" 
                                placeholder="Deskripsi Pekerjaan" 
                                value={form.deskripsi}
                                onChange={(e) => setForm({...form, deskripsi: e.target.value})}
                            />
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-[14px] text-[#4B2E2B] mb-1 block">Tanggal Mulai</label>
                                    <input 
                                        type="date"
                                        className="input-modal w-full h-[50px] px-4 rounded-lg bg-[#E3CEB6] border-none outline-none" 
                                        value={form.tanggal_mulai}
                                        onChange={(e) => setForm({...form, tanggal_mulai: e.target.value})}
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-[14px] text-[#4B2E2B] mb-1 block">Tanggal Selesai</label>
                                    <input 
                                        type="date"
                                        className="input-modal w-full h-[50px] px-4 rounded-lg bg-[#E3CEB6] border-none outline-none" 
                                        value={form.tanggal_selesai}
                                        onChange={(e) => setForm({...form, tanggal_selesai: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-4 mt-4">
                                <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-lg border border-[#4B2E2B] text-[#4B2E2B]">Batal</button>
                                <button onClick={handleSimpan} className="px-6 py-2 rounded-lg bg-[#4B2E2B] text-white">Simpan</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BagianPengalaman;
