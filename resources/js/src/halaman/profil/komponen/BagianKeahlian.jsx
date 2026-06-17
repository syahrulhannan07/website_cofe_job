import React, { useState, useEffect } from 'react';
import plusIcon from '../../../aset/profil/Plus Math.png';
import backgroundVector from '../../../aset/profil/Vector.png';
import layananProfil from '../../../layanan/layananProfil';

const BagianKeahlian = ({ initialData, onRefresh }) => {
    const [listSkill, setListSkill] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newSkill, setNewSkill] = useState('');

    // Sinkronisasi dengan data dari parent
    useEffect(() => {
        if (initialData) {
            setListSkill(initialData);
        }
    }, [initialData]);

    const handleTambah = async () => {
        if (!newSkill.trim()) {
            setIsAdding(false);
            return;
        }
        try {
            await layananProfil.tambahSkill({ nama_skill: newSkill });
            setNewSkill('');
            setIsAdding(false);
            if (onRefresh) onRefresh(); // Segarkan data global
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
            if (onRefresh) onRefresh();
        } catch (error) {
            console.error("Gagal menghapus skill:", error);
        }
    };

    return (
        <div className="bagian-keahlian bg-[#C69C6D] rounded-2xl p-6 relative overflow-hidden shadow-sm w-full flex flex-col justify-center">
            <div className="vektor-latar absolute inset-0 w-full h-full opacity-20 pointer-events-none z-0">
                <img src={backgroundVector} alt="" className="w-full h-full object-cover" />
            </div>

            <div className="area-header relative z-10 flex justify-between items-center mb-5">
                <h2 className="judul-seksi font-poppins font-semibold text-xl md:text-2xl text-[#4B2E2B]">
                    Skill
                </h2>
                
                <button 
                    onClick={() => setIsAdding(true)}
                    className="tombol-tambah flex items-center gap-2 border-[3px] border-[#4B2E2B] rounded-xl px-4 py-1.5 hover:bg-[#4B2E2B]/10 transition-colors"
                >
                    <img src={plusIcon} alt="" className="w-5 h-5" />
                    <span className="font-poppins font-bold text-sm md:text-base text-[#4B2E2B]">Tambah</span>
                </button>
            </div>

            <div className="area-keahlian relative z-10 flex flex-wrap gap-x-4 gap-y-4">
                {listSkill.map((skill) => (
                    <div 
                        key={skill.id_skill} 
                        className="badge-keahlian bg-[#4B2E2B] px-5 py-2 rounded-xl flex items-center shadow-md relative group animate-in fade-in zoom-in duration-300"
                    >
                        <span className="font-poppins font-semibold text-sm md:text-base text-[#C69C6D]">
                            {skill.nama_skill}
                        </span>
                        
                        <button 
                            onClick={() => handleHapus(skill.id_skill)}
                            className="tombol-hapus-skil absolute top-[-8px] right-[-8px] bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-lg opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all hover:bg-red-700 text-xs"
                            title="Hapus Skill"
                        >
                            ×
                        </button>
                    </div>
                ))}

                {isAdding && (
                    <div className="wadah-input-profesional flex items-center bg-[#E3CEB6] border-2 border-[#4B2E2B]/30 rounded-xl px-3 py-1.5 shadow-inner min-w-[180px] animate-in slide-in-from-left duration-300">
                        <input 
                            className="input-skill-baru bg-transparent border-none outline-none font-poppins font-semibold text-sm text-[#4B2E2B] w-full placeholder:text-[#4B2E2B]/40"
                            placeholder="Ketik skill..."
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleTambah()}
                            autoFocus
                        />
                        <button onClick={handleTambah} className="ml-2 bg-[#4B2E2B] text-[#C69C6D] px-3 py-1 rounded-full text-xs font-bold hover:bg-[#3d2523] transition-colors">
                            OK
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BagianKeahlian;
