import React, { useState, useRef, useEffect } from 'react'; // [UPDATE LOGIC]
import { useNavigate } from 'react-router-dom';
import { FileText, Eye, Download, CheckCircle } from 'lucide-react';
import ArrowRepeatIcon from '../../../aset/pelamar/ArrowRepeat.svg';
import ChevronDownIcon from '../../../aset/pelamar/ChevronDown.svg';
import PersonIcon from '../../../aset/pelamar/person.svg';
import TentangIcon from '../../../aset/pelamar/person.svg';
import IdentitasIcon from '../../../aset/pelamar/identitas.svg';
import KualifikasiIcon from '../../../aset/pelamar/ikon-ijasah.svg';
import PengalamanIcon from '../../../aset/pelamar/penglaman.svg';
import DokumenIcon from '../../../aset/pelamar/ikon-cv-dan-dokumenlain.svg';
import SuratIcon from '../../../aset/pelamar/ikon-surat-lamaran.svg';
import SertifikatIcon from '../../../aset/pelamar/ikon-sertifikat.svg';
import FolderIcon from '../../../aset/pelamar/folder.svg';
import PendidikanIcon from '../../../aset/pelamar/ikon-ijasah.svg';
import PertanyaanIcon from '../../../aset/pelamar/pertanyaan.svg';
import SkillIcon from '../../../aset/pelamar/petir.svg';
import DownloadIcon from '../../../aset/pelamar/Download.svg';
import PlaceholderProfile from '../../../aset/profil-perusahaan/placeholder_profile.png';
import api from '../../../../layanan/api'; // [UPDATE LOGIC]

const ProfilPelamar = ({ pelamar }) => {
    // [UPDATE LOGIC] - State untuk status yang dapat diubah secara reaktif
    const navigate = useNavigate();
    const STATUS_OPTIONS = ['Diproses', 'Wawancara', 'Diterima', 'Ditolak'];
    const [selectedStatus, setSelectedStatus] = useState(pelamar?.status || 'Diproses');
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState(null); // { type: 'success'|'error', text: string }
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const [fullDetail, setFullDetail] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    useEffect(() => {
        const fetchDetail = async () => {
            if (!pelamar?.id_lamaran) return;
            setLoadingDetail(true);
            try {
                const response = await api.get(`/admin/lamaran/${pelamar.id_lamaran}`);
                setFullDetail(response.data.data);
            } catch (error) {
                console.error("Gagal load detail lamaran", error);
            } finally {
                setLoadingDetail(false);
            }
        };
        fetchDetail();
    }, [pelamar?.id_lamaran]);

    // [UPDATE LOGIC] - Tutup dropdown saat klik di luar
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // [UPDATE LOGIC] - Fungsi simpan perubahan status ke API
    const handleSimpanStatus = async () => {
        if (selectedStatus === pelamar?.status) {
            setSaveMessage({ type: 'info', text: 'Status tidak berubah.' });
            setTimeout(() => setSaveMessage(null), 3000);
            return;
        }
        setIsSaving(true);
        setSaveMessage(null);
        try {
            const response = await api.put(`/admin/lamaran/${pelamar.id_lamaran}/status`, {
                status: selectedStatus,
            });
            // Update state reaktif tanpa refresh halaman
            const statusTerbaru = response.data?.data?.status || selectedStatus;
            pelamar.status = statusTerbaru;
            setSelectedStatus(statusTerbaru);

            // Jika status diubah ke Wawancara, arahkan langsung ke halaman jadwal wawancara
            // dan buka modal tambah jadwal dengan kandidat ini sudah terpilih
            if (statusTerbaru === 'Wawancara') {
                setSaveMessage({ type: 'success', text: 'Status Wawancara disimpan. Mengarahkan ke halaman penjadwalan...' });
                setTimeout(() => {
                    navigate('/admin/wawancara', {
                        state: {
                            bukaModal: true,
                            idLamaran: pelamar.id_lamaran,
                            namaPelamar: pelamar?.pelamar?.nama_lengkap || 'Pelamar',
                        }
                    });
                }, 1200);
            } else {
                setSaveMessage({ type: 'success', text: 'Status berhasil diperbarui. Notifikasi telah dikirim ke pelamar.' });
            }
        } catch (error) {
            const msg = error.response?.data?.message || 'Gagal memperbarui status. Coba lagi.';
            setSaveMessage({ type: 'error', text: msg });
        } finally {
            setIsSaving(false);
            setTimeout(() => setSaveMessage(null), 4000);
        }
    };

    // [UPDATE LOGIC] - Gunakan data real dari props pelamar
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const sourceData = fullDetail || pelamar;

    const detail = {
        nama:    sourceData?.pelamar?.nama_lengkap || '-',
        status:  selectedStatus,
        tanggal: formatDate(sourceData?.tanggal_melamar),
        tentangSaya: sourceData?.pelamar?.tentang_saya || '-',
        identitas: {
            jenisKelamin:    sourceData?.pelamar?.jenis_kelamin || '-',
            tempatTglLahir:  sourceData?.pelamar?.tanggal_lahir ? formatDate(sourceData.pelamar.tanggal_lahir) : '-',
            alamatLengkap:   sourceData?.pelamar?.alamat || '-',
        },
        kontak: {
            email:       sourceData?.pelamar?.email || '-',
            telepon:     sourceData?.pelamar?.telepon || '-',
            linkedin:    '-',
            portofolio:  '-',
        },
        kualifikasi: {
            keahlian: (sourceData?.skill || []).map(s => s.nama_skill || s),
        },
        pengalamanKerja: (sourceData?.pengalaman || []).map(p => {
            const tglMulai = p.tanggal_mulai ? new Date(p.tanggal_mulai).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) : '';
            const tglSelesai = p.tanggal_selesai ? new Date(p.tanggal_selesai).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) : 'Sekarang';
            return {
                posisi:    p.posisi || '-',
                perusahaan: p.nama_perusahaan || '-',
                tahun:     tglMulai && tglSelesai ? `${tglMulai} - ${tglSelesai}` : (tglMulai || tglSelesai || '-'),
                deskripsi: p.deskripsi ? [p.deskripsi] : [],
            };
        }),
        pendidikan: (sourceData?.pendidikan || []).map(p => {
            const startYear = p.tahun_mulai ? new Date(p.tahun_mulai).getFullYear() : '';
            const endYear = p.tahun_selesai ? new Date(p.tahun_selesai).getFullYear() : 'Sekarang';
            return {
                institusi: p.institusi || '-',
                jurusan:   `${p.tingkat || ''} ${p.jurusan || ''}`.trim() || '-',
                tahun:     startYear && endYear ? `${startYear} - ${endYear}` : (startYear || endYear || '-'),
            };
        }),
        evaluasi: (sourceData?.jawaban_seleksi || []).map(j => ({
            tanya: j.pertanyaan?.pertanyaan || j.pertanyaan_lowongan?.pertanyaan || '-',
            jawab: j.jawaban || '-',
            tipe:  'panjang',
        })),
    };

    const getDocumentTypeByName = (name) => {
        if (!name) return 'cv';
        const lowerName = name.toLowerCase();
        if (lowerName.includes('cv')) return 'cv';
        if (lowerName.includes('ijazah') || lowerName.includes('ijasah') || lowerName.includes('pendidikan')) return 'pendidikan';
        if (lowerName.includes('surat') || lowerName.includes('rekomendasi') || lowerName.includes('kesehatan') || lowerName.includes('lamaran')) return 'surat';
        if (lowerName.includes('sertifikat') || lowerName.includes('piagam') || lowerName.includes('barista')) return 'sertifikat';
        return 'cv';
    };

    const uploadedDocs = sourceData?.dokumen || [];
    const requiredDocs = sourceData?.dokumen_lowongan || [];
    
    // Jika data dokumen_lowongan belum dimuat, gunakan fallback dokumen yang diupload saja
    const documentList = requiredDocs.length > 0 
        ? requiredDocs.map(reqDoc => {
            const uploaded = uploadedDocs.find(d => d.id_jenis_dokumen === reqDoc.id_jenis_dokumen);
            const docName = reqDoc.jenis_dokumen?.nama_dokumen || 'Dokumen';
            return {
                id: reqDoc.id_jenis_dokumen,
                nama: docName,
                tipe: getDocumentTypeByName(docName),
                wajib: reqDoc.wajib === true || reqDoc.wajib === 1 || reqDoc.wajib === "1",
                terlampir: !!uploaded,
                format: uploaded?.lokasi_file ? uploaded.lokasi_file.split('.').pop().toUpperCase() : '-',
                url: uploaded?.lokasi_file ? `/storage/${uploaded.lokasi_file}` : null,
            };
        }) 
        : uploadedDocs.map(d => {
            const docName = d.jenis_dokumen?.nama_dokumen || 'Dokumen';
            return {
                id: d.id_jenis_dokumen,
                nama: docName,
                tipe: getDocumentTypeByName(docName),
                wajib: true,
                terlampir: true,
                format: d.lokasi_file ? d.lokasi_file.split('.').pop().toUpperCase() : '-',
                url: d.lokasi_file ? `/storage/${d.lokasi_file}` : null,
            };
        });

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Diterima':
                return 'bg-[#DBFEE6] text-[#509564]';
            case 'Ditolak':
                return 'bg-[#FEEBEB] text-[#A04A4A]';
            case 'Diproses':
                return 'bg-[#DBEAFE] text-[#496B99]';
            case 'Wawancara':
                return 'bg-[#FFE6BD] text-[#B08949]';
            default:
                return 'bg-[#EAE4DC] text-[#4B2E2B]';
        }
    };

    // Helper to get document icon
    const getDocIcon = (tipe) => {
        switch (tipe) {
            case 'cv': return DokumenIcon;
            case 'pendidikan': return PendidikanIcon;
            case 'surat': return SuratIcon;
            case 'sertifikat': return SertifikatIcon;
            default: return DokumenIcon;
        }
    };

    return (
        <div className="flex flex-col w-full max-w-[1055px] animate-in fade-in slide-in-from-right-4 duration-500">
            
            {/* 1. Header Profile */}
            <div className="flex flex-col md:flex-row justify-between w-full min-h-[222px] bg-white rounded-[10px] border border-[#CCCCCC]/80 p-[24px] md:pl-[38px] md:pr-[25px] md:pb-[28px] md:pt-[32px] mb-[30px]">
                
                {/* Left side: Avatar and Info - Centered Vertically */}
                <div className="flex flex-col md:flex-row items-center gap-[24px] md:gap-[39px] md:my-auto flex-1 min-w-0">
                    <img 
                        src={sourceData?.pelamar?.foto_profil ? (sourceData.pelamar.foto_profil.startsWith('http') ? sourceData.pelamar.foto_profil : `/storage/${sourceData.pelamar.foto_profil}`) : PlaceholderProfile} 
                        alt="Profile" 
                        className="w-[120px] h-[120px] md:w-[158px] md:h-[158px] rounded-full object-cover shrink-0"
                    />
                    <div className="flex flex-col justify-center h-full min-w-0">
                        <h1 className="font-poppins font-bold text-[28px] md:text-[32px] text-[#4B2E2B] leading-tight mb-[10px] whitespace-nowrap">
                            {detail.nama}
                        </h1>
                        <div className="flex flex-wrap items-center gap-[10px]">
                            <div className={`h-[27px] w-[84px] flex items-center justify-center rounded-[50px] text-[13px] font-poppins font-semibold ${getStatusStyles(detail.status)}`}>
                                {detail.status}
                            </div>
                            <span className="font-poppins font-normal text-[13px] text-[#4B2E2B]">
                                Melamar pada {detail.tanggal}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right side: Buttons - Aligned to Bottom */}
                <div className="flex flex-col sm:flex-row items-center gap-[8px] mt-6 md:mt-0 md:self-end shrink-0 w-full md:w-auto">
                    {/* [UPDATE LOGIC] - Dropdown status yang dapat berinteraksi */}
                    <div className="relative w-full md:w-[141px]" ref={dropdownRef}>
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            disabled={isSaving}
                            className="flex items-center justify-between w-full h-[40px] bg-[#EAE4DC] border border-[#CCCCCC]/80 rounded-[10px] px-4 cursor-pointer hover:bg-[#EAE4DC]/80 transition-colors shrink-0 disabled:opacity-60"
                        >
                            <span className="font-poppins font-semibold text-[15px] text-[#4B2E2B]">{selectedStatus}</span>
                            <img src={ChevronDownIcon} alt="Dropdown" className={`w-[16px] object-contain transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {/* [UPDATE LOGIC] - List opsi status */}
                        {dropdownOpen && (
                            <div className="absolute z-50 top-[44px] left-0 w-full bg-white border border-[#CCCCCC]/80 rounded-[10px] shadow-md overflow-hidden">
                                {STATUS_OPTIONS.map((opt) => (
                                    <button
                                        key={opt}
                                        onClick={() => { setSelectedStatus(opt); setDropdownOpen(false); }}
                                        className={`w-full text-left px-4 py-2 font-poppins text-[14px] transition-colors hover:bg-[#F4ECE9] ${selectedStatus === opt ? 'font-semibold text-[#4B2E2B]' : 'text-[#504440]'}`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {/* [UPDATE LOGIC] - Tombol simpan yang memanggil handleSimpanStatus */}
                    <button
                        onClick={handleSimpanStatus}
                        disabled={isSaving}
                        className="flex items-center justify-center gap-[8px] w-full md:w-[262px] h-[40px] bg-[#F7B750] rounded-[10px] cursor-pointer hover:bg-[#F7B750]/90 transition-colors shrink-0 disabled:opacity-60"
                    >
                        <img src={ArrowRepeatIcon} alt="Sync" className={`w-[19px] object-contain ${isSaving ? 'animate-spin' : ''}`} />
                        <span className="font-poppins font-semibold text-[15px] text-[#4B2E2B] whitespace-nowrap">
                            {isSaving ? 'Menyimpan...' : 'Simpan Perubahan Status'}
                        </span>
                    </button>
                </div>
            </div>

            {/* [UPDATE LOGIC] - Pesan feedback sukses / error setelah simpan */}
            {saveMessage && (
                <div className={`mb-4 px-4 py-3 rounded-[10px] text-[14px] font-poppins font-medium border ${
                    saveMessage.type === 'success' ? 'bg-[#DBFEE6] text-[#509564] border-[#509564]/30' :
                    saveMessage.type === 'error'   ? 'bg-[#FEEBEB] text-[#A04A4A] border-[#A04A4A]/30' :
                                                     'bg-[#DBEAFE] text-[#496B99] border-[#496B99]/30'
                }`}>
                    {saveMessage.text}
                </div>
            )}

            {/* 2. Main Content Grid - (160:812) */}
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,691px)_332px] gap-8 w-full items-start">
                
                {/* Left Column: Personal & Professional (160:813) */}
                <div className="flex flex-col gap-8 w-full">
                    
                    {/* Section - Tentang Saya (160:814) */}
                    <div className="flex flex-col gap-4 p-5 md:p-8 bg-white rounded-[12px] shadow-sm border border-[#F5F5F4]">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center w-[16px] h-[16px]">
                                <img src={TentangIcon} alt="Tentang" className="w-full h-full object-contain" />
                            </div>
                            <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-[24px] text-[#2B1810]">Tentang Saya</h3>
                        </div>
                        <p className="font-['Plus_Jakarta_Sans'] font-normal text-[16px] text-[#504440] leading-[26px]">
                            {detail.tentangSaya}
                        </p>
                    </div>

                    {/* Section - Identitas Pelamar (160:822) */}
                    <div className="flex flex-col gap-8 p-5 md:p-8 bg-white rounded-[12px] shadow-sm border border-[#F5F5F4]">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center w-[20px] h-[20px]">
                                <img src={IdentitasIcon} alt="Identitas" className="w-full h-full object-contain" />
                            </div>
                            <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-[24px] text-[#2B1810]">Identitas Pelamar</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                            <div className="flex flex-col gap-1">
                                <span className="font-['Plus_Jakarta_Sans'] font-medium text-[12px] text-[#504440]">Nama Lengkap</span>
                                <span className="font-['Plus_Jakarta_Sans'] font-normal text-[16px] text-[#2B1810]">{detail.nama}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="font-['Plus_Jakarta_Sans'] font-medium text-[12px] text-[#504440]">Tanggal Lahir</span>
                                <span className="font-['Plus_Jakarta_Sans'] font-normal text-[16px] text-[#2B1810]">{detail.identitas.tempatTglLahir}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="font-['Plus_Jakarta_Sans'] font-medium text-[12px] text-[#504440]">Jenis Kelamin</span>
                                <span className="font-['Plus_Jakarta_Sans'] font-normal text-[16px] text-[#2B1810]">{detail.identitas.jenisKelamin}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="font-['Plus_Jakarta_Sans'] font-medium text-[12px] text-[#504440]">Nomor Telepon</span>
                                <span className="font-['Plus_Jakarta_Sans'] font-normal text-[16px] text-[#2B1810]">{detail.kontak.telepon}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="font-['Plus_Jakarta_Sans'] font-medium text-[12px] text-[#504440]">Email</span>
                                <span className="font-['Plus_Jakarta_Sans'] font-normal text-[16px] text-[#2B1810]">{detail.kontak.email}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="font-['Plus_Jakarta_Sans'] font-medium text-[12px] text-[#504440]">Alamat</span>
                                <span className="font-['Plus_Jakarta_Sans'] font-normal text-[16px] text-[#2B1810] leading-relaxed">
                                    {detail.identitas.alamatLengkap}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Section - Pendidikan (160:859) */}
                    <div className="flex flex-col gap-8 p-5 md:p-8 bg-white rounded-[12px] shadow-sm border border-[#F5F5F4]">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center w-[20px] h-[20px]">
                                <img src={KualifikasiIcon} alt="Pendidikan" className="w-full h-full object-contain" />
                            </div>
                            <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-[24px] text-[#2B1810]">Pendidikan</h3>
                        </div>
                        
                        <div className="flex flex-col gap-8">
                            {detail.pendidikan && detail.pendidikan.length > 0 ? (
                                detail.pendidikan.map((edu, index) => (
                                    <div key={index} className="flex flex-col gap-1">
                                        <h4 className="font-['Plus_Jakarta_Sans'] font-normal text-[16px] text-[#2B1810]">{edu.institusi}</h4>
                                        <span className="font-['Plus_Jakarta_Sans'] font-normal text-[16px] text-[#504440]">{edu.jurusan}</span>
                                        <span className="font-['Plus_Jakarta_Sans'] font-medium text-[12px] text-[#504440] mt-1">{edu.tahun}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="font-['Plus_Jakarta_Sans'] font-normal text-[16px] text-[#504440]">Belum ada data pendidikan.</p>
                            )}
                        </div>
                    </div>

                    {/* Section - Skill (160:882) */}
                    <div className="flex flex-col gap-8 p-5 md:p-8 bg-white rounded-[12px] shadow-sm border border-[#F5F5F4]">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center w-[20px] h-[20px]">
                                <img src={SkillIcon} alt="Skill" className="w-full h-full object-contain" />
                            </div>
                            <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-[24px] text-[#2B1810]">Skill</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {detail.kualifikasi.keahlian.map((skill, index) => (
                                <div key={index} className="px-[16px] py-[8px] bg-[#F7F3EE] border border-[#F5F5F4] rounded-[8px] transition-all hover:bg-[#EFE9E2]">
                                    <span className="font-['Plus_Jakarta_Sans'] font-normal text-[14px] text-[#432C23]">{skill}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Section - Pengalaman Kerja (160:901) */}
                    <div className="flex flex-col gap-8 p-5 md:p-8 bg-white rounded-[12px] shadow-sm border border-[#F5F5F4]">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center w-[20px] h-[20px]">
                                <img src={PengalamanIcon} alt="Pengalaman" className="w-full h-full object-contain" />
                            </div>
                            <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-[24px] text-[#2B1810]">Pengalaman Kerja</h3>
                        </div>
                        
                        <div className="flex flex-col gap-8">
                            {detail.pengalamanKerja.map((exp, index) => (
                                <div key={index} className="flex flex-col gap-1">
                                    <h4 className="font-['Plus_Jakarta_Sans'] font-normal text-[18px] text-[#2B1810]">{exp.posisi}</h4>
                                    <span className="font-['Plus_Jakarta_Sans'] font-medium text-[16px] text-[#92400E]">{exp.perusahaan}</span>
                                    <span className="font-['Plus_Jakarta_Sans'] font-medium text-[12px] text-[#504440] mt-1">{exp.tahun}</span>
                                    {exp.deskripsi && (
                                        <ul className="flex flex-col gap-2 mt-3">
                                            {exp.deskripsi.map((item, i) => (
                                                <li key={i} className="flex gap-2">
                                                    <span className="text-[#504440]">•</span>
                                                    <span className="font-['Plus_Jakarta_Sans'] font-normal text-[16px] text-[#504440] leading-relaxed">
                                                        {item}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Right Column: Application Specifics (160:950) */}
                <div className="flex flex-col gap-8 w-full shrink-0">
                    
                    {/* Section - Pertanyaan Perusahaan (160:951) */}
                    <div className="flex flex-col gap-8 p-5 md:p-8 bg-white rounded-[12px] shadow-sm border border-[#F5F5F4]">
                        <div className="flex items-start gap-3">
                            <div className="flex items-center justify-center w-[24px] h-[24px] mt-1">
                                <img src={PertanyaanIcon} alt="Pertanyaan" className="w-full h-full object-contain" />
                            </div>
                            <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-[24px] text-[#2B1810] leading-tight">
                                Pertanyaan<br />Perusahaan
                            </h3>
                        </div>
                        
                        <div className="flex flex-col gap-8">
                            {detail.evaluasi && detail.evaluasi.length > 0 ? (
                                detail.evaluasi.map((qna, index) => (
                                    <div key={index} className="flex flex-col gap-2">
                                        <h4 className="font-['Plus_Jakarta_Sans'] font-normal text-[14px] text-[#2B1810] leading-relaxed">
                                            {qna.tanya}
                                        </h4>
                                        
                                        {qna.tipe === "panjang" ? (
                                            <div className="p-4 bg-[#F7F3EE] rounded-[12px] mt-1">
                                                <p className="font-['Plus_Jakarta_Sans'] font-normal italic text-[14px] text-[#504440] leading-relaxed">
                                                    {qna.jawab}
                                                </p>
                                            </div>
                                        ) : qna.tipe === "status" ? (
                                            <div className="flex items-center gap-2 text-[#15803D] mt-1">
                                                <CheckCircle className="w-4 h-4 shrink-0" />
                                                <span className="font-['Plus_Jakarta_Sans'] font-normal text-[16px]">
                                                    {qna.jawab}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="mt-1">
                                                <span className="font-['Plus_Jakarta_Sans'] font-normal text-[18px] text-[#432C23]">
                                                    {qna.jawab}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="font-['Plus_Jakarta_Sans'] font-normal text-[14px] text-[#504440]">Tidak ada pertanyaan dari perusahaan.</p>
                            )}
                        </div>
                    </div>

                    {/* Section - Dokumen Terlampir (160:975) */}
                    <div className="flex flex-col gap-8 p-5 md:p-8 bg-white rounded-[12px] shadow-sm border border-[#F5F5F4]">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-[24px] h-[24px]">
                                <img src={FolderIcon} alt="Dokumen" className="w-full h-full object-contain" />
                            </div>
                            <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-[24px] text-[#2B1810] whitespace-nowrap">
                                Dokumen Terlampir
                            </h3>
                        </div>
                        
                        <div className="flex flex-col gap-4">
                            {loadingDetail ? (
                                <div className="text-[#504440] font-['Plus_Jakarta_Sans'] text-[14px]">Memuat dokumen...</div>
                            ) : documentList.length > 0 ? (
                                documentList.map((doc, index) => (
                                    <div key={index} className={`flex items-center justify-between p-4 bg-[#F7F3EE] rounded-[20px] border ${doc.terlampir ? 'border-[#B45309]/10' : 'border-[#CCCCCC]/50 border-dashed opacity-70'} transition-all hover:bg-[#F1EBE4] group ${doc.terlampir ? 'cursor-pointer' : ''}`}>
                                        <div className="flex items-start gap-3 min-w-0">
                                            <div className={`w-[28px] h-[28px] flex items-center justify-center mt-1 shrink-0 ${!doc.terlampir && 'grayscale opacity-50'}`}>
                                                <img src={getDocIcon(doc.tipe)} alt={doc.nama} className="w-full h-full object-contain" />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-['Plus_Jakarta_Sans'] font-normal text-[16px] text-[#2B1810] leading-tight break-words">
                                                    {doc.nama} {!doc.wajib && <span className="text-[#504440] text-[12px] font-normal italic">(Opsional)</span>}
                                                </span>
                                                <span className={`font-['Plus_Jakarta_Sans'] text-[12px] mt-1 ${doc.terlampir ? 'text-[#504440]' : 'text-[#A04A4A]'}`}>
                                                    {doc.terlampir ? doc.format : 'Tidak dilampirkan'}
                                                </span>
                                            </div>
                                        </div>
                                        {doc.terlampir && (
                                            <div className="flex items-center gap-2 shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <a href={doc.url} target="_blank" rel="noreferrer" className="p-1 transition-colors">
                                                    <Eye className="w-5 h-5 text-[#B45309]" />
                                                </a>
                                                <a href={doc.url} download className="p-1 transition-colors">
                                                    <Download className="w-5 h-5 text-[#B45309]" />
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-[#504440] font-['Plus_Jakarta_Sans'] text-[14px]">Tidak ada dokumen yang dilampirkan</div>
                            )}
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default ProfilPelamar;
