import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../layanan/api';
import LoadingKopi from '../../komponen/LoadingKopi';

// Icons
import PeringatanIcon from '../../aset/lowongan/peringantan.svg';
import LocationIcon from '../../aset/lowongan/location.svg';
import DropdownIcon from '../../aset/lowongan/dropdown.svg';
import TipsIcon from '../../aset/lowongan/tips.svg';
import DurationIcon from '../../aset/lowongan/duration.svg';
import TransparansiIcon from '../../aset/lowongan/transpansi.svg';
import NoteIcon from '../../aset/lowongan/note.svg';
import TrashIcon from '../../aset/lowongan/TrashFill.svg';
import PlusIcon from '../../aset/lowongan/Plus.svg';

const TambahLowongan = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [profileIncomplete, setProfileIncomplete] = useState(false);
    const [formData, setFormData] = useState({
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
        ],
        dokumen_dibutuhkan: [] // New field
    });

    const [availableDocuments, setAvailableDocuments] = useState([]);
    const [customDocName, setCustomDocName] = useState('');
    const [showCustomDocInput, setShowCustomDocInput] = useState(false);

    const systemQuestions = [
        "Mengapa Anda ingin bergabung dengan kami?",
        "Berapa ekspektasi gaji anda?",
        "Apakah bersedia bekerja di hari libur/shift?",
        "Apakah Anda memiliki pengalaman di bidang ini sebelumnya?",
        "Apakah Anda memiliki kendaraan pribadi?",
        "Kapan Anda bisa mulai bergabung?"
    ];

    const { id } = useParams();
    const isEdit = !!id;

    useEffect(() => {
        checkProfileStatus();
        fetchJenisDokumen();
        if (isEdit) {
            fetchVacancy();
        }
    }, [id]);

    const fetchJenisDokumen = async () => {
        try {
            const response = await api.get('/jenis-dokumen');
            setAvailableDocuments(response.data.data);
        } catch (error) {
            console.error("Gagal mengambil jenis dokumen:", error);
        }
    };

    const fetchVacancy = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/admin/lowongan/${id}`);
            const lowongan = response.data.data.lowongan;
            
            // Map data to form structure
            setFormData({
                posisi: lowongan.posisi || '',
                deskripsi: lowongan.deskripsi || '',
                persyaratan: lowongan.persyaratan || '',
                lokasi: lowongan.lokasi || '',
                gaji: lowongan.gaji || '',
                batas_awal: lowongan.batas_awal ? lowongan.batas_awal.split('T')[0].split(' ')[0] : '',
                batas_akhir: lowongan.batas_akhir ? lowongan.batas_akhir.split('T')[0].split(' ')[0] : '',
                status: lowongan.status_raw || 'Draft', // Use raw status for internal state
                jumlah_pertanyaan: (lowongan.pertanyaan?.length || 0).toString(),
                pertanyaan: lowongan.pertanyaan?.map(q => q.pertanyaan) || [],
                dokumen_dibutuhkan: lowongan.dokumen?.map(d => ({
                    id_jenis_dokumen: d.id_jenis_dokumen,
                    nama_dokumen: d.jenis_dokumen?.nama_dokumen,
                    wajib: !!d.wajib
                })) || []
            });
        } catch (error) {
            console.error("Gagal mengambil data lowongan:", error);
            alert("Gagal mengambil data lowongan.");
        } finally {
            setLoading(false);
        }
    };

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

    const handleAddDocument = (id_jenis, nama) => {
        if (formData.dokumen_dibutuhkan.some(d => d.id_jenis_dokumen === id_jenis)) return;
        
        setFormData(prev => ({
            ...prev,
            dokumen_dibutuhkan: [
                ...prev.dokumen_dibutuhkan,
                { id_jenis_dokumen: id_jenis, nama_dokumen: nama, wajib: true }
            ]
        }));
    };

    const handleRemoveDocument = (id_jenis) => {
        setFormData(prev => ({
            ...prev,
            dokumen_dibutuhkan: prev.dokumen_dibutuhkan.filter(d => d.id_jenis_dokumen !== id_jenis)
        }));
    };

    const handleToggleWajib = (id_jenis) => {
        setFormData(prev => ({
            ...prev,
            dokumen_dibutuhkan: prev.dokumen_dibutuhkan.map(d => 
                d.id_jenis_dokumen === id_jenis ? { ...d, wajib: !d.wajib } : d
            )
        }));
    };

    const handleCreateCustomDoc = async () => {
        if (!customDocName.trim()) return;
        try {
            const response = await api.post('/jenis-dokumen', { nama_dokumen: customDocName });
            const newDoc = response.data.data;
            setAvailableDocuments(prev => [...prev, newDoc]);
            handleAddDocument(newDoc.id_jenis_dokumen, newDoc.nama_dokumen);
            setCustomDocName('');
            setShowCustomDocInput(false);
        } catch (error) {
            console.error("Gagal membuat dokumen custom:", error);
            alert(error.response?.data?.message || "Gagal membuat dokumen");
        }
    };

    const handleSubmit = async (statusIntent) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const start = formData.batas_awal ? new Date(formData.batas_awal) : null;
        const end = formData.batas_akhir ? new Date(formData.batas_akhir) : null;

        // Validasi Khusus Simpan Draft (Harus tanggal mendatang)
        if (statusIntent === 'Draft' && start) {
            if (start <= today) {
                alert("Untuk menyimpan sebagai Draft, Tanggal Buka harus lebih besar dari hari ini.");
                return;
            }
        }

        // Validasi Umum Rentang Tanggal
        if (start && end) {
            if (end < start) {
                alert("Tanggal Tutup tidak boleh lebih kecil dari Tanggal Buka.");
                return;
            }
        }

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
                status: statusIntent,
                pertanyaan: formattedQuestions,
                dokumen_dibutuhkan: formData.dokumen_dibutuhkan.map(d => ({
                    id_jenis_dokumen: d.id_jenis_dokumen,
                    wajib: d.wajib
                }))
            };

            if (isEdit) {
                await api.put(`/admin/lowongan/${id}`, dataToSubmit);
            } else {
                await api.post('/admin/lowongan', dataToSubmit);
            }
            navigate('/admin/lowongan');
        } catch (error) {
            console.error("Gagal menyimpan lowongan:", error);
            alert(error.response?.data?.message || "Terjadi kesalahan");
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEdit && formData.posisi === '') {
        return <LoadingKopi />;
    }

    return (
        <div className="min-h-screen bg-[#F3EDE6] flex flex-col items-center py-12 px-4">
            
            {/* Header / Back Button */}
            <div className="w-full max-w-[896px] mb-6 flex items-center justify-between">
                <button 
                    onClick={() => navigate('/admin/lowongan')}
                    className="flex items-center gap-2 text-[#4B2E2B]/60 hover:text-[#4B2E2B] transition-colors font-poppins font-medium"
                >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15.8333 10H4.16667M4.16667 10L10 15.8333M4.16667 10L10 4.16667" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Kembali ke Daftar
                </button>
            </div>

            {/* Warning Banner (222:1080) - Positioned Above Form */}
            {profileIncomplete && (
                <div className="w-full max-w-[896px] mb-8 bg-[#FFFBF5] rounded-[16px] p-8 flex items-start gap-6 border border-[#4B2E2B]/10 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="bg-[#FEF3C7] w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                        <svg width="22" height="19" viewBox="0 0 22 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11 0L21.3923 18H0.607696L11 0Z" fill="#B45309"/>
                            <rect x="10" y="6" width="2" height="7" fill="white"/>
                            <rect x="10" y="14" width="2" height="2" fill="white"/>
                        </svg>
                    </div>
                    <div className="flex flex-col gap-2 flex-1">
                        <h3 className="font-jakarta font-semibold text-[16px] text-[#432C23]">Profil Belum Lengkap</h3>
                        <p className="font-poppins text-[#57534E] text-[14px] leading-[20px]">
                            Lengkapi profil kafe Anda terlebih dahulu sebelum dapat memposting lowongan. Ini memastikan calon pelamar mendapatkan informasi yang akurat mengenai lingkungan kerja Anda.
                        </p>
                        <button 
                            onClick={() => navigate('/admin/profil')}
                            className="mt-1 font-poppins text-[#B45309] text-[14px] font-semibold flex items-center gap-1 hover:underline w-fit"
                        >
                            Lengkapi Profil Sekarang
                            <svg width="14" height="14" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2.25 6H9.75M9.75 6L6 2.25M9.75 6L6 9.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Form Card */}
            <div className="relative bg-white w-full max-w-[896px] rounded-[24px] shadow-sm flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 border border-[#4B2E2B]/5">
                
                {/* Header (222:1101) */}
                <div className="bg-[#4B2E2B] px-10 py-8 flex items-center justify-between border-b border-[#F5F5F4]">
                    <div className="flex flex-col gap-1">
                        <h2 className="font-poppins font-semibold text-[28px] text-white leading-tight">
                            {isEdit ? 'Edit Lowongan' : 'Tambah Lowongan Baru'}
                        </h2>
                        <p className="font-poppins text-white/70 text-[15px]">
                            {isEdit ? 'Perbarui detail pekerjaan Anda.' : 'Isi detail pekerjaan dengan teliti untuk menarik kandidat terbaik.'}
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 px-10 py-10 flex flex-col gap-10">
                    
                    {/* Form Fields */}
                    <div className="flex flex-col gap-8">
                        
                        {/* 1. Posisi Pekerjaan */}
                        <div className="flex flex-col gap-3">
                            <label className="font-poppins font-semibold text-[15px] text-[#2B1810]">Posisi Pekerjaan</label>
                            <div className="h-[56px] px-5 bg-white border border-[#E7E5E4] rounded-[12px] flex items-center focus-within:border-[#4B2E2B]/40 focus-within:ring-2 focus-within:ring-[#4B2E2B]/5 transition-all">
                                <input 
                                    type="text"
                                    name="posisi"
                                    value={formData.posisi}
                                    onChange={handleChange}
                                    placeholder="Contoh: Senior Barista, Head Chef, Waiter..."
                                    className="w-full bg-transparent font-poppins text-[16px] text-[#2B1810] placeholder:text-[#A8A29E] outline-none"
                                />
                            </div>
                        </div>

                        {/* 2. Deskripsi Pekerjaan */}
                        <div className="flex flex-col gap-3">
                            <label className="font-poppins font-semibold text-[15px] text-[#2B1810]">Deskripsi Pekerjaan</label>
                            <textarea 
                                name="deskripsi"
                                value={formData.deskripsi}
                                onChange={handleChange}
                                rows="6"
                                placeholder="Jelaskan peran dan tanggung jawab harian secara mendalam agar pelamar memahami pekerjaan dengan jelas..."
                                className="w-full p-5 bg-white border border-[#E7E5E4] rounded-[12px] font-poppins text-[16px] text-[#2B1810] placeholder:text-[#A8A29E] outline-none resize-none focus:border-[#4B2E2B]/40 focus-within:ring-2 focus-within:ring-[#4B2E2B]/5 transition-all"
                            ></textarea>
                        </div>

                        {/* 3. Persyaratan & Kualifikasi */}
                        <div className="flex flex-col gap-3">
                            <label className="font-poppins font-semibold text-[15px] text-[#2B1810]">Persyaratan & Kualifikasi</label>
                            <textarea 
                                name="persyaratan"
                                value={formData.persyaratan}
                                onChange={handleChange}
                                rows="6"
                                placeholder="Sebutkan keahlian yang dibutuhkan, pengalaman minimum, sikap kerja, dan kualifikasi pendidikan..."
                                className="w-full p-5 bg-white border border-[#E7E5E4] rounded-[12px] font-poppins text-[16px] text-[#2B1810] placeholder:text-[#A8A29E] outline-none resize-none focus:border-[#4B2E2B]/40 focus-within:ring-2 focus-within:ring-[#4B2E2B]/5 transition-all"
                            ></textarea>
                        </div>

                        {/* 4. Range Gaji, Tanggal Buka & Tanggal Tutup */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            <div className="md:col-span-2 flex flex-col gap-3">
                                <label className="font-poppins font-semibold text-[15px] text-[#2B1810]">Range Gaji (IDR)</label>
                                <div className="h-[56px] px-5 bg-white border border-[#E7E5E4] rounded-[12px] flex items-center focus-within:border-[#4B2E2B]/40 transition-all">
                                    <span className="font-poppins text-[#A8A29E] font-medium mr-3">Rp</span>
                                    <input 
                                        type="text"
                                        name="gaji"
                                        value={formData.gaji}
                                        onChange={handleChange}
                                        placeholder="3.500.000 - 5.000.000"
                                        className="w-full bg-transparent font-poppins text-[16px] text-[#2B1810] placeholder:text-[#A8A29E] outline-none"
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-1 flex flex-col gap-3">
                                <label className="font-poppins font-semibold text-[15px] text-[#2B1810]">Tanggal Buka</label>
                                <div className="h-[56px] px-5 bg-white border border-[#E7E5E4] rounded-[12px] flex items-center">
                                    <input 
                                        type="date"
                                        name="batas_awal"
                                        value={formData.batas_awal}
                                        onChange={handleChange}
                                        className="w-full bg-transparent font-poppins text-[15px] text-[#2B1810] outline-none cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-1 flex flex-col gap-3">
                                <label className="font-poppins font-semibold text-[15px] text-[#2B1810]">Tanggal Tutup</label>
                                <div className="h-[56px] px-5 bg-white border border-[#E7E5E4] rounded-[12px] flex items-center">
                                    <input 
                                        type="date"
                                        name="batas_akhir"
                                        value={formData.batas_akhir}
                                        onChange={handleChange}
                                        className="w-full bg-transparent font-poppins text-[15px] text-[#2B1810] outline-none cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 5. Lokasi Penempatan */}
                        <div className="flex flex-col gap-3">
                            <label className="font-poppins font-semibold text-[15px] text-[#2B1810]">Lokasi Penempatan</label>
                            <div className="relative h-[56px] bg-white border border-[#E7E5E4] rounded-[12px] flex items-center focus-within:border-[#4B2E2B]/40 transition-all">
                                <div className="absolute left-5">
                                    <img src={LocationIcon} alt="Location" className="w-[18px] h-[22px]" />
                                </div>
                                <input 
                                    type="text"
                                    name="lokasi"
                                    value={formData.lokasi}
                                    onChange={handleChange}
                                    placeholder="Contoh: Jl. Senopati No. 12, Jakarta Selatan"
                                    className="w-full h-full pl-[56px] pr-5 bg-transparent font-poppins text-[16px] text-[#2B1810] placeholder:text-[#A8A29E] outline-none"
                                />
                            </div>
                        </div>

                        {/* 5.5. Dokumen yang Diperlukan (NEW SECTION) */}
                        <div className="flex flex-col gap-6 p-8 bg-[#FDFCFB] rounded-[20px] border border-[#4B2E2B]/10">
                            <div className="flex flex-col gap-1">
                                <h3 className="font-poppins font-bold text-[20px] text-[#2B1810]">Dokumen yang Diperlukan</h3>
                                <p className="font-poppins text-[#78716C] text-[14px]">
                                    Pilih dokumen apa saja yang harus diunggah oleh pelamar saat mendaftar.
                                </p>
                            </div>

                            {/* List Selected Documents */}
                            <div className="flex flex-col gap-3">
                                {formData.dokumen_dibutuhkan.map((doc) => (
                                    <div key={doc.id_jenis_dokumen} className="flex items-center justify-between p-4 bg-white border border-[#E7E5E4] rounded-[12px] shadow-sm animate-in fade-in zoom-in-95 duration-200">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-full bg-[#4B2E2B]/5 flex items-center justify-center">
                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M9 1.5H3.5C3.10218 1.5 2.72064 1.65804 2.43934 1.93934C2.15804 2.22064 2 2.60218 2 3V13C2 13.3978 2.15804 13.7794 2.43934 14.0607C2.72064 14.342 3.10218 14.5 3.5 14.5H12.5C12.8978 14.5 13.2794 14.342 13.5607 14.0607C13.842 13.7794 14 13.3978 14 13V6.5L9 1.5Z" stroke="#4B2E2B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                    <path d="M9 1.5V6.5H14" stroke="#4B2E2B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </div>
                                            <span className="font-poppins font-semibold text-[#2B1810] text-[15px]">{doc.nama_dokumen}</span>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <div 
                                                    onClick={() => handleToggleWajib(doc.id_jenis_dokumen)}
                                                    className={`w-10 h-6 rounded-full transition-all relative ${doc.wajib ? 'bg-[#4B2E2B]' : 'bg-[#E7E5E4]'}`}
                                                >
                                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${doc.wajib ? 'left-5' : 'left-1'}`}></div>
                                                </div>
                                                <span className="font-poppins text-[13px] text-[#4B2E2B] font-medium">Wajib</span>
                                            </label>
                                            <button 
                                                onClick={() => handleRemoveDocument(doc.id_jenis_dokumen)}
                                                className="p-2 hover:bg-red-50 rounded-full transition-colors group"
                                            >
                                                <img src={TrashIcon} alt="Hapus" className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Add Document Section */}
                            <div className="flex flex-col gap-4 mt-2">
                                <div className="flex flex-wrap gap-2">
                                    {availableDocuments
                                        .filter(ad => !formData.dokumen_dibutuhkan.some(fd => fd.id_jenis_dokumen === ad.id_jenis_dokumen))
                                        .map((ad) => (
                                            <button
                                                key={ad.id_jenis_dokumen}
                                                onClick={() => handleAddDocument(ad.id_jenis_dokumen, ad.nama_dokumen)}
                                                className="px-4 py-2 bg-white border border-[#E7E5E4] rounded-full font-poppins text-[13px] text-[#4B2E2B] hover:border-[#4B2E2B] hover:bg-[#4B2E2B]/5 transition-all flex items-center gap-2"
                                            >
                                                <img src={PlusIcon} className="w-3 h-3" alt="" />
                                                {ad.nama_dokumen}
                                            </button>
                                        ))}
                                    <button 
                                        onClick={() => setShowCustomDocInput(true)}
                                        className="px-4 py-2 bg-[#F3EDE6] border border-dashed border-[#4B2E2B]/30 rounded-full font-poppins text-[13px] text-[#4B2E2B] hover:bg-[#F3EDE6]/80 transition-all flex items-center gap-2"
                                    >
                                        <img src={PlusIcon} className="w-3 h-3" alt="" />
                                        Tambah Dokumen Lainnya
                                    </button>
                                </div>

                                {showCustomDocInput && (
                                    <div className="flex items-center gap-3 p-4 bg-[#F3EDE6]/30 border border-[#4B2E2B]/10 rounded-[12px] animate-in slide-in-from-top-2 duration-300">
                                        <input 
                                            type="text" 
                                            placeholder="Nama dokumen baru (misal: Sertifikat Halal)..." 
                                            value={customDocName}
                                            onChange={(e) => setCustomDocName(e.target.value)}
                                            className="flex-1 bg-white h-[44px] px-4 rounded-[8px] border border-[#E7E5E4] font-poppins text-[14px] outline-none focus:border-[#4B2E2B]/40"
                                            onKeyDown={(e) => e.key === 'Enter' && handleCreateCustomDoc()}
                                        />
                                        <button 
                                            onClick={handleCreateCustomDoc}
                                            className="h-[44px] px-6 bg-[#4B2E2B] text-white font-poppins font-bold text-[13px] rounded-[8px] hover:bg-[#4B2E2B]/90 transition-all"
                                        >
                                            Tambah
                                        </button>
                                        <button 
                                            onClick={() => { setShowCustomDocInput(false); setCustomDocName(''); }}
                                            className="h-[44px] px-4 text-[#4B2E2B]/60 font-poppins text-[13px] hover:text-[#4B2E2B]"
                                        >
                                            Batal
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 6. Pertanyaan Perusahaan */}
                        <div className="mt-6 flex flex-col gap-8">
                            <div className="flex flex-col gap-2">
                                <h3 className="font-poppins font-bold text-[22px] text-[#2B1810]">Pertanyaan Perusahaan</h3>
                                <p className="font-poppins text-[#78716C] text-[14px]">
                                    Tambahkan pertanyaan khusus yang harus dijawab oleh pelamar untuk membantu proses seleksi Anda.
                                </p>
                            </div>

                            <div className="flex flex-col gap-8">
                                <div className="flex flex-col gap-3">
                                    <label className="font-poppins font-semibold text-[15px] text-[#2B1810]">Jumlah Pertanyaan</label>
                                    <div className="relative h-[56px] bg-white border border-[#E7E5E4] rounded-[12px] flex items-center">
                                        <select 
                                            name="jumlah_pertanyaan"
                                            value={formData.jumlah_pertanyaan}
                                            onChange={handleChange}
                                            className="w-full h-full px-5 appearance-none bg-transparent font-poppins text-[16px] text-[#1C1C19] outline-none z-10 cursor-pointer"
                                        >
                                            <option value="1">1 Pertanyaan</option>
                                            <option value="2">2 Pertanyaan</option>
                                            <option value="3">3 Pertanyaan</option>
                                        </select>
                                        <div className="absolute right-5 pointer-events-none">
                                            <img src={DropdownIcon} alt="Dropdown" className="w-[14px] h-[14px]" />
                                        </div>
                                    </div>
                                </div>

                                {Array.from({ length: parseInt(formData.jumlah_pertanyaan) }).map((_, idx) => (
                                    <div key={idx} className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <label className="font-poppins font-semibold text-[15px] text-[#2B1810]">Pertanyaan {idx + 1}</label>
                                        <div className="relative h-[56px] bg-white border border-[#E7E5E4] rounded-[12px] flex items-center">
                                            <select 
                                                value={formData.pertanyaan[idx]}
                                                onChange={(e) => handleQuestionChange(idx, e.target.value)}
                                                className="w-full h-full px-5 appearance-none bg-transparent font-poppins text-[16px] text-[#1C1C19] outline-none z-10 cursor-pointer"
                                            >
                                                <option value="">-- Pilih Pertanyaan Seleksi --</option>
                                                {systemQuestions.map((q, qIdx) => (
                                                    <option key={qIdx} value={q}>{q}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-5 pointer-events-none">
                                                <img src={DropdownIcon} alt="Dropdown" className="w-[14px] h-[14px]" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-start gap-4 p-5 bg-[#FAFAFA] rounded-[16px] border border-[#E7E5E4]/60">
                                <img src={NoteIcon} alt="Note" className="w-[20px] h-[20px] mt-0.5" />
                                <p className="font-poppins italic text-[13px] text-[#78716C] leading-relaxed">
                                    Catatan: Pelamar akan menjawab pertanyaan ini menggunakan kolom teks (text area) saat melamar melalui aplikasi Cofe-Job.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="bg-[#F9FAFB] px-10 md:pl-12 md:pr-20 py-8 flex flex-col md:flex-row items-center justify-between gap-8 border-t border-[#E7E5E4]">
                    <div className="flex flex-col max-w-[480px]">
                        <p className="font-poppins text-[#4B2E2B]/60 text-[13px] leading-relaxed">
                            Pastikan semua informasi sudah sesuai. Dengan mengklik <span className="font-bold text-[#4B2E2B]">Publikasikan</span>, lowongan akan segera ditayangkan dan dapat dilamar oleh kandidat.
                        </p>
                    </div>
                    <div className="flex items-center gap-6 w-full md:w-auto">
                        <button 
                            disabled={loading}
                            onClick={() => handleSubmit('Draft')}
                            className="flex-1 md:flex-none h-[48px] px-8 border-2 border-[#432C23] text-[#432C23] font-poppins font-bold text-[14px] rounded-full hover:bg-[#432C23] hover:text-white transition-all disabled:opacity-50"
                        >
                            Simpan Draft
                        </button>
                        <button 
                            disabled={loading}
                            onClick={() => handleSubmit('Active')}
                            className="flex-1 md:flex-none h-[48px] px-10 bg-[#FEB02C] text-[#6B4500] font-poppins font-bold text-[14px] rounded-full hover:bg-[#FEB02C]/90 transition-all shadow-lg shadow-[#FEB02C]/20 disabled:opacity-50"
                        >
                            {loading ? 'Memproses...' : isEdit ? 'Simpan' : 'Publikasikan'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Guidance Section */}
            <div className="w-full max-w-[896px] mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200 mb-16">
                {/* Card 1: Tips Judul */}
                <div className="bg-[#F5F5F4]/50 rounded-[12px] p-6 flex flex-col gap-2 border border-[#4B2E2B]/5">
                    <div className="mb-2">
                        <img src={TipsIcon} alt="Tips" className="w-6 h-6" />
                    </div>
                    <h5 className="font-poppins font-semibold text-[14px] text-[#2B1810]">Tips Judul</h5>
                    <p className="font-poppins text-[#57534E] text-[12px] leading-[1.6]">
                        Gunakan judul yang spesifik. "Barista Speciality Coffee" lebih baik daripada hanya "Barista".
                    </p>
                </div>

                {/* Card 2: Transparansi Gaji */}
                <div className="bg-[#F5F5F4]/50 rounded-[12px] p-6 flex flex-col gap-2 border border-[#4B2E2B]/5">
                    <div className="mb-2">
                        <img src={TransparansiIcon} alt="Salary" className="w-6 h-6" />
                    </div>
                    <h5 className="font-poppins font-semibold text-[14px] text-[#2B1810]">Transparansi Gaji</h5>
                    <p className="font-poppins text-[#57534E] text-[12px] leading-[1.6]">
                        Lowongan dengan range gaji yang jelas mendapatkan ketertarikan 40% lebih tinggi dari kandidat berkualitas.
                    </p>
                </div>

                {/* Card 3: Durasi Lowongan */}
                <div className="bg-[#F5F5F4]/50 rounded-[12px] p-6 flex flex-col gap-2 border border-[#4B2E2B]/5">
                    <div className="mb-2">
                        <img src={DurationIcon} alt="Duration" className="w-6 h-6" />
                    </div>
                    <h5 className="font-poppins font-semibold text-[14px] text-[#2B1810]">Durasi Lowongan</h5>
                    <p className="font-poppins text-[#57534E] text-[12px] leading-[1.6]">
                        Kami merekomendasikan durasi aktif selama 14-30 hari untuk mendapatkan jumlah pelamar yang optimal.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TambahLowongan;
