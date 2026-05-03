import React, { useState, useEffect } from 'react';
import api from '../../../layanan/api';

// Icons
import PeringatanIcon from '../../aset/lowongan/peringantan.svg';
import LocationIcon from '../../aset/lowongan/location.svg';
import DropdownIcon from '../../aset/lowongan/dropdown.svg';
import TipsIcon from '../../aset/lowongan/tips.svg';

const ModalTambahLowongan = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [profileIncomplete, setProfileIncomplete] = useState(false);
    const [formData, setFormData] = useState({
        posisi: '',
        deskripsi: '',
        persyaratan: '',
        lokasi: '',
        gaji: '', // Single string field
        batas_awal: '',
        batas_akhir: '',
        status: 'Draft',
        jumlah_pertanyaan: '3',
        pertanyaan: [
            "Mengapa Anda ingin bergabung dengan kami?",
            "Berapa ekspektasi gaji anda?",
            "Apakah bersedia bekerja di hari libur/shift?"
        ]
    });

    const systemQuestions = [
        "Mengapa Anda ingin bergabung dengan kami?",
        "Berapa ekspektasi gaji anda?",
        "Apakah bersedia bekerja di hari libur/shift?",
        "Apakah Anda memiliki pengalaman di bidang ini sebelumnya?",
        "Apakah Anda memiliki kendaraan pribadi?",
        "Kapan Anda bisa mulai bergabung?"
    ];

    useEffect(() => {
        if (isOpen) {
            checkProfileStatus();
        }
    }, [isOpen]);

    const checkProfileStatus = async () => {
        try {
            const response = await api.get('/admin/profil-perusahaan');
            const profil = response.data.data;
            if (!profil.nama_perusahaan || !profil.alamat_perusahaan || !profil.logo_perusahaan) {
                setProfileIncomplete(true);
            } else {
                setProfileIncomplete(false);
            }
        } catch (error) {
            console.error("Gagal mengecek status profil:", error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleQuestionChange = (index, value) => {
        const newQuestions = [...formData.pertanyaan];
        newQuestions[index] = value;
        setFormData(prev => ({ ...prev, pertanyaan: newQuestions }));
    };

    const handleSubmit = async (status) => {
        setLoading(true);
        try {
            const formattedQuestions = formData.pertanyaan
                .slice(0, parseInt(formData.jumlah_pertanyaan))
                .filter(q => q.trim() !== '')
                .map(q => ({
                    pertanyaan: q,
                    tipe_jawaban: 'text'
                }));

            const dataToSubmit = { 
                ...formData, 
                status,
                pertanyaan: formattedQuestions 
            };

            await api.post('/admin/lowongan', dataToSubmit);
            onSuccess();
            onClose();
            
            // Reset form
            setFormData({
                posisi: '',
                deskripsi: '',
                persyaratan: '',
                lokasi: '',
                gaji: '',
                batas_awal: '',
                batas_akhir: '',
                status: 'Draft',
                jumlah_pertanyaan: '3',
                pertanyaan: [
                    "Mengapa Anda ingin bergabung dengan kami?",
                    "Berapa ekspektasi gaji anda?",
                    "Apakah bersedia bekerja di hari libur/shift?"
                ]
            });
        } catch (error) {
            console.error("Gagal menyimpan lowongan:", error);
            alert(error.response?.data?.message || "Terjadi kesalahan");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Container */}
            <div className="relative bg-white w-full max-w-[896px] max-h-[95vh] rounded-[12px] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
                
                {/* Header (222:1101) */}
                <div className="bg-[#4B2E2B] px-8 py-6 flex items-center justify-between border-b border-[#F5F5F4]">
                    <div className="flex flex-col gap-1">
                        <h2 className="font-poppins font-semibold text-[24px] text-white leading-[31px]">Tambah Lowongan Baru</h2>
                        <p className="font-poppins text-white/80 text-[14px]">
                            Isi detail pekerjaan dengan teliti untuk menarik kandidat terbaik.
                        </p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/80 hover:text-white"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto px-8 py-8 flex flex-col gap-8 custom-scrollbar">
                    
                    {/* Warning Banner (222:1080) */}
                    {profileIncomplete && (
                        <div className="bg-[#FFFBF5] rounded-[12px] p-6 flex items-start gap-4 border border-[#4B2E2B]/10 shadow-sm">
                            <div className="bg-[#FEF0C7] w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                                <img src={PeringatanIcon} alt="Warning" className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col gap-1 flex-1">
                                <h3 className="font-poppins font-semibold text-[16px] text-[#432C23]">Profil Belum Lengkap</h3>
                                <p className="font-poppins text-[#57534E] text-[14px] leading-[20px]">
                                    Lengkapi profil kafe Anda terlebih dahulu sebelum dapat memposting lowongan. Ini memastikan calon pelamar mendapatkan informasi yang akurat mengenai lingkungan kerja Anda.
                                </p>
                                <button className="mt-2 font-poppins text-[#B45309] text-[14px] font-semibold flex items-center gap-1 hover:underline">
                                    Lengkapi Profil Sekarang
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M2.25 6H9.75M9.75 6L6 2.25M9.75 6L6 9.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Form Section */}
                    <div className="flex flex-col gap-6">
                        
                        {/* 1. Posisi Pekerjaan */}
                        <div className="flex flex-col gap-2">
                            <label className="font-poppins font-medium text-[14px] text-[#2B1810]">Posisi Pekerjaan</label>
                            <div className="h-[53px] px-4 bg-white border border-[#E7E5E4] rounded-[8px] flex items-center focus-within:border-[#4B2E2B]/30 transition-all shadow-sm">
                                <input 
                                    type="text"
                                    name="posisi"
                                    value={formData.posisi}
                                    onChange={handleChange}
                                    placeholder="Contoh: Senior Barista, Head Chef, Waiter..."
                                    className="w-full bg-transparent font-poppins text-[16px] text-[#2B1810] placeholder:text-[#6B7280] outline-none"
                                />
                            </div>
                        </div>

                        {/* 2. Deskripsi Pekerjaan */}
                        <div className="flex flex-col gap-2">
                            <label className="font-poppins font-medium text-[14px] text-[#2B1810]">Deskripsi Pekerjaan</label>
                            <textarea 
                                name="deskripsi"
                                value={formData.deskripsi}
                                onChange={handleChange}
                                rows="4"
                                placeholder="Jelaskan peran dan tanggung jawab harian..."
                                className="w-full p-4 bg-white border border-[#E7E5E4] rounded-[8px] font-poppins text-[16px] text-[#2B1810] placeholder:text-[#6B7280] outline-none resize-none focus:border-[#4B2E2B]/30 transition-all shadow-sm"
></textarea>
                        </div>

                        {/* 3. Persyaratan & Kualifikasi */}
                        <div className="flex flex-col gap-2">
                            <label className="font-poppins font-medium text-[14px] text-[#2B1810]">Persyaratan & Kualifikasi</label>
                            <textarea 
                                name="persyaratan"
                                value={formData.persyaratan}
                                onChange={handleChange}
                                rows="4"
                                placeholder="Sebutkan keahlian yang dibutuhkan, pengalaman minimum, dll..."
                                className="w-full p-4 bg-white border border-[#E7E5E4] rounded-[8px] font-poppins text-[16px] text-[#2B1810] placeholder:text-[#6B7280] outline-none resize-none focus:border-[#4B2E2B]/30 transition-all shadow-sm"
                            ></textarea>
                        </div>

                        {/* 4. Range Gaji, Tanggal Buka & Tanggal Tutup (Satu Baris - 2:1:1 Ratio) */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {/* Salary Range (Spans 2 columns) */}
                            <div className="md:col-span-2 flex flex-col gap-2">
                                <label className="font-poppins font-medium text-[14px] text-[#2B1810]">Range Gaji (IDR)</label>
                                <div className="h-[53px] px-4 bg-white border border-[#E7E5E4] rounded-[8px] flex items-center focus-within:border-[#4B2E2B]/30 transition-all shadow-sm">
                                    <span className="font-poppins text-[#A8A29E] font-medium mr-3">Rp</span>
                                    <input 
                                        type="text"
                                        name="gaji"
                                        value={formData.gaji}
                                        onChange={handleChange}
                                        placeholder="3.500.000 - 5.000.000"
                                        className="w-full bg-transparent font-poppins text-[16px] text-[#2B1810] placeholder:text-[#6B7280] outline-none"
                                    />
                                </div>
                            </div>

                            {/* Tanggal Buka (Spans 1 column) */}
                            <div className="md:col-span-1 flex flex-col gap-2">
                                <label className="font-poppins font-medium text-[14px] text-[#2B1810]">Tanggal Buka</label>
                                <div className="h-[53px] px-4 bg-white border border-[#E7E5E4] rounded-[8px] flex items-center shadow-sm">
                                    <input 
                                        type="date"
                                        name="batas_awal"
                                        value={formData.batas_awal}
                                        onChange={handleChange}
                                        className="w-full bg-transparent font-poppins text-[14px] text-[#2B1810] outline-none"
                                    />
                                </div>
                            </div>

                            {/* Tanggal Tutup (Spans 1 column) */}
                            <div className="md:col-span-1 flex flex-col gap-2">
                                <label className="font-poppins font-medium text-[14px] text-[#2B1810]">Tanggal Tutup</label>
                                <div className="h-[53px] px-4 bg-white border border-[#E7E5E4] rounded-[8px] flex items-center shadow-sm">
                                    <input 
                                        type="date"
                                        name="batas_akhir"
                                        value={formData.batas_akhir}
                                        onChange={handleChange}
                                        className="w-full bg-transparent font-poppins text-[14px] text-[#2B1810] outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 5. Lokasi Penempatan */}
                        <div className="flex flex-col gap-2">
                            <label className="font-poppins font-medium text-[14px] text-[#2B1810]">Lokasi Penempatan</label>
                            <div className="relative h-[53px] bg-white border border-[#E7E5E4] rounded-[8px] flex items-center focus-within:border-[#4B2E2B]/30 transition-all shadow-sm">
                                <div className="absolute left-4">
                                    <img src={LocationIcon} alt="Location" className="w-[16px] h-[20px]" />
                                </div>
                                <input 
                                    type="text"
                                    name="lokasi"
                                    value={formData.lokasi}
                                    onChange={handleChange}
                                    placeholder="Contoh: Jl. Senopati No. 12, Jakarta Selatan"
                                    className="w-full h-full pl-[48px] pr-4 bg-transparent font-poppins text-[16px] text-[#2B1810] placeholder:text-[#6B7280] outline-none"
                                />
                            </div>
                        </div>

                        {/* 6. Pertanyaan Perusahaan */}
                        <div className="mt-4 flex flex-col gap-6">
                            <div className="flex flex-col gap-1">
                                <h3 className="font-poppins font-semibold text-[18px] text-[#2B1810]">Pertanyaan Perusahaan</h3>
                                <p className="font-poppins text-[#78716C] text-[12px]">
                                    Tambahkan pertanyaan khusus yang harus dijawab oleh pelamar untuk membantu proses seleksi Anda.
                                </p>
                            </div>

                            <div className="flex flex-col gap-6">
                                {/* Jumlah Pertanyaan Dropdown */}
                                <div className="flex flex-col gap-2">
                                    <label className="font-poppins font-medium text-[14px] text-[#2B1810]">Jumlah Pertanyaan</label>
                                    <div className="relative h-[50px] bg-white border border-[#E7E5E4] rounded-[8px] flex items-center shadow-sm">
                                        <select 
                                            name="jumlah_pertanyaan"
                                            value={formData.jumlah_pertanyaan}
                                            onChange={handleChange}
                                            className="w-full h-full px-4 appearance-none bg-transparent font-poppins text-[16px] text-[#1C1C19] outline-none z-10"
                                        >
                                            <option value="1">1 Pertanyaan</option>
                                            <option value="2">2 Pertanyaan</option>
                                            <option value="3">3 Pertanyaan</option>
                                        </select>
                                        <div className="absolute right-4 pointer-events-none">
                                            <img src={DropdownIcon} alt="Dropdown" className="w-[12px] h-[12px]" />
                                        </div>
                                    </div>
                                </div>

                                {/* Dynamic Question Dropdowns */}
                                {Array.from({ length: parseInt(formData.jumlah_pertanyaan) }).map((_, idx) => (
                                    <div key={idx} className="flex flex-col gap-2">
                                        <label className="font-poppins font-medium text-[14px] text-[#2B1810]">Pertanyaan {idx + 1}</label>
                                        <div className="relative h-[50px] bg-white border border-[#E7E5E4] rounded-[8px] flex items-center shadow-sm">
                                            <select 
                                                value={formData.pertanyaan[idx]}
                                                onChange={(e) => handleQuestionChange(idx, e.target.value)}
                                                className="w-full h-full px-4 appearance-none bg-transparent font-poppins text-[16px] text-[#1C1C19] outline-none z-10"
                                            >
                                                <option value="">-- Pilih Pertanyaan Seleksi --</option>
                                                {systemQuestions.map((q, qIdx) => (
                                                    <option key={qIdx} value={q}>{q}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 pointer-events-none">
                                                <img src={DropdownIcon} alt="Dropdown" className="w-[12px] h-[12px]" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Note Section */}
                            <div className="mt-2 flex items-start gap-3">
                                <img src={TipsIcon} alt="Tips" className="w-[18px] h-[18px] mt-0.5" />
                                <p className="font-poppins italic text-[12px] text-[#78716C] leading-relaxed">
                                    Catatan: Pelamar akan menjawab pertanyaan ini menggunakan kolom teks (text area) saat melamar.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <style dangerouslySetInnerHTML={{ __html: `
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 6px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: #F9FAFB;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: #E7E5E4;
                        border-radius: 10px;
                    }
                `}} />

                {/* Footer (Action Buttons) */}
                <div className="bg-[#FAFAFA] px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-[#E7E5E4]">
                    <div className="flex flex-col max-w-[480px]">
                        <p className="font-poppins text-[#4B2E2B]/70 text-[13px] leading-relaxed">
                            Pastikan semua informasi sudah sesuai. Dengan mengklik <span className="font-semibold text-[#4B2E2B]">Publikasikan</span>, lowongan akan segera ditayangkan ke publik.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button 
                            disabled={loading}
                            onClick={() => handleSubmit('Draft')}
                            className="flex-1 md:flex-none h-[48px] px-8 border border-[#432C23] text-[#432C23] font-poppins font-semibold rounded-full hover:bg-[#432C23]/5 transition-all disabled:opacity-50"
                        >
                            Simpan Draft
                        </button>
                        <button 
                            disabled={loading || profileIncomplete}
                            onClick={() => handleSubmit('Active')}
                            className="flex-1 md:flex-none h-[48px] px-8 bg-[#FEB02C] text-[#6B4500] font-poppins font-semibold rounded-full hover:bg-[#FEB02C]/90 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Memproses...' : 'Publikasikan'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalTambahLowongan;
