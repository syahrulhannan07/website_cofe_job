import React, { useState, useEffect } from 'react';
import plusIcon from '../../../aset/profil/Plus Math.png';
import backgroundVector from '../../../aset/profil/Vector.png';
import layananProfil from '../../../layanan/layananProfil';

const BagianKeahlian = () => {
    const [listSkill, setListSkill] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newSkill, setNewSkill] = useState('');

    const fetchSkill = async () => {
        try {
            const data = await layananProfil.ambilProfil();
            if (data.status === 'success') {
                // Gunakan 'skills' (jamak) sesuai nama relasi di Laravel
                setListSkill(data.data.skills || []);
            }
        } catch (error) {
            console.error("Gagal mengambil data skill:", error);
        }
    };

    useEffect(() => {
        fetchSkill();
    }, []);

    const handleTambah = async () => {
        if (!newSkill.trim()) return;
        try {
            await layananProfil.tambahSkill({ nama_skill: newSkill });
            setNewSkill('');
            setIsAdding(false);
            fetchSkill();
        } catch (error) {
            console.error("Gagal menambah skill:", error);
            if (error.response?.data?.errors) {
                alert("Gagal menambah skill: " + Object.values(error.response.data.errors).flat().join(", "));
            }
        }
    };

    const handleHapus = async (id) => {
        try {
            await layananProfil.hapusSkill(id);
            fetchSkill();
        } catch (error) {
            console.error("Gagal menghapus skill:", error);
        }
    };

    return (
        <div className="bagian-keahlian bg-[#C69C6D] rounded-[25px] p-8 md:p-10 relative overflow-hidden shadow-sm w-full min-h-[200px] flex flex-col justify-center">
            <div className="vektor-latar absolute bottom-0 left-0 w-full opacity-30 pointer-events-none z-0">
                <img src={backgroundVector} alt="" className="w-full h-auto object-cover" />
            </div>

            <div className="area-header relative z-10 flex justify-between items-center mb-8">
                <h2 className="judul-seksi font-poppins font-semibold text-[28px] md:text-[32px] text-[#4B2E2B]">
                    Skill
                </h2>
                <div className="grup-aksi-skill flex items-center gap-4">
                    {isAdding && (
                        <div className="wadah-input-inline flex items-center gap-2 bg-[#E3CEB6] p-2 rounded-lg shadow-inner">
                            <input 
                                className="input-skill-baru bg-transparent border-none outline-none font-poppins text-[#4B2E2B] px-2 w-[150px]"
                                placeholder="Skill baru..."
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleTambah()}
                                autoFocus
                            />
                            <button onClick={handleTambah} className="text-[#4B2E2B] font-bold">OK</button>
                        </div>
                    )}
                    <button 
                        onClick={() => setIsAdding(!isAdding)}
                        className="tombol-tambah flex items-center gap-2 border-[3px] border-[#4B2E2B] rounded-[20px] px-6 py-2 hover:bg-[#4B2E2B]/10 transition-colors"
                    >
                        <img src={plusIcon} alt="" className="w-8 h-8" />
                        <span className="font-poppins font-bold text-[20px] md:text-[24px] text-[#4B2E2B]">Tambah</span>
                    </button>
                </div>
            </div>

            <div className="area-keahlian relative z-10 flex flex-wrap gap-4 md:gap-6">
                {listSkill.map((skill) => (
                    <div 
                        key={skill.id} 
                        className="badge-keahlian bg-[#4B2E2B] px-6 md:px-8 py-3 rounded-[20px] flex items-center justify-between gap-4 shadow-md group transition-all"
                    >
                        <span className="font-poppins font-semibold text-[18px] md:text-[20px] text-[#C69C6D]">
                            {skill.nama_skill}
                        </span>
                        <button 
                            onClick={() => handleHapus(skill.id)}
                            className="tombol-hapus-skill text-[#C69C6D] opacity-0 group-hover:opacity-100 font-black hover:text-red-400 transition-all"
                        >
                            X
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BagianKeahlian;
