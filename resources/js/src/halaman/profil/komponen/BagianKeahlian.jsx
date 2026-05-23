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
        <div className="bagian-keahlian bg-[#C69C6D] rounded-[25px] p-8 md:p-10 relative overflow-hidden shadow-sm w-full min-h-[200px] flex flex-col justify-center">
            <div className="vektor-latar absolute bottom-0 left-0 w-full opacity-30 pointer-events-none z-0">
                <img src={backgroundVector} alt="" className="w-full h-auto object-cover" />
            </div>

            <div className="area-header relative z-10 flex justify-between items-center mb-8">
                <h2 className="judul-seksi font-poppins font-semibold text-[28px] md:text-[32px] text-[#4B2E2B]">
                    Skill
                </h2>
                
                <button 
                    onClick={() => setIsAdding(true)}
                    className="tombol-tambah flex items-center gap-2 border-[3px] border-[#4B2E2B] rounded-[20px] px-6 py-2 hover:bg-[#4B2E2B]/10 transition-colors"
                >
                    <img src={plusIcon} alt="" className="w-8 h-8" />
                    <span className="font-poppins font-bold text-[20px] md:text-[24px] text-[#4B2E2B]">Tambah</span>
                </button>
            </div>

            <div className="area-keahlian relative z-10 flex flex-wrap gap-x-6 gap-y-8">
                {listSkill.map((skill) => (
                    <div 
                        key={skill.id_skill} 
                        className="badge-keahlian bg-[#4B2E2B] px-8 py-3 rounded-[20px] flex items-center shadow-md relative group animate-in fade-in zoom-in duration-300"
                    >
                        <span className="font-poppins font-semibold text-[18px] md:text-[20px] text-[#C69C6D]">
                            {skill.nama_skill}
                        </span>
                        
                        <button 
                            onClick={() => handleHapus(skill.id_skill)}
                            className="tombol-hapus-skil absolute top-[-10px] right-[-10px] bg-red-600 text-white w-[26px] h-[26px] rounded-full flex items-center justify-center font-bold shadow-lg opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all hover:bg-red-700"
                            title="Hapus Skill"
                        >
                            ×
                        </button>
                    </div>
                ))}

                {isAdding && (
                    <div className="wadah-input-profesional flex items-center bg-[#E3CEB6] border-2 border-[#4B2E2B]/30 rounded-[20px] px-4 py-2 shadow-inner min-w-[200px] animate-in slide-in-from-left duration-300">
                        <input 
                            className="input-skill-baru bg-transparent border-none outline-none font-poppins font-semibold text-[18px] text-[#4B2E2B] w-full placeholder:text-[#4B2E2B]/40"
                            placeholder="Ketik skill..."
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleTambah()}
                            autoFocus
                        />
                        <button onClick={handleTambah} className="ml-2 bg-[#4B2E2B] text-[#C69C6D] px-3 py-1 rounded-full text-[14px] font-bold hover:bg-[#3d2523] transition-colors">
                            OK
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BagianKeahlian;
