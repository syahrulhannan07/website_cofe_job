import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../../layanan/api';

// Aset SVG
import pencilSquareSvg from '../../../aset/profil-perusahaan/PencilSquare.svg';

const FormProfil = ({ variants, data, onUpdate }) => {
    // State untuk kontrol mode edit
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    // State untuk field
    const [formData, setFormData] = useState({
        nama_perusahaan: "",
        nama_pengguna: "",
        email: "",
        alamat_perusahaan: "",
        deskripsi: ""
    });

    const [nibFile, setNibFile] = useState(null);
    const [nibFileName, setNibFileName] = useState("");
    const nibInputRef = useRef(null);

    // Sync data from props
    useEffect(() => {
        if (data) {
            setFormData({
                nama_perusahaan: data.nama_perusahaan || "",
                nama_pengguna: data.nama_pengguna || "",
                email: data.email || "",
                alamat_perusahaan: data.alamat_perusahaan || "",
                deskripsi: data.deskripsi || ""
            });
            setNibFileName(data.dokumen_izin ? data.dokumen_izin.split('/').pop() : "");
        }
    }, [data]);

    // Fungsi toggle edit
    const toggleEdit = () => {
        if (isEditing) {
            // Reset to original data if cancel
            if (data) {
                setFormData({
                    nama_perusahaan: data.nama_perusahaan || "",
                    nama_pengguna: data.nama_pengguna || "",
                    email: data.email || "",
                    alamat_perusahaan: data.alamat_perusahaan || "",
                    deskripsi: data.deskripsi || ""
                });
                setNibFile(null);
                setNibFileName(data.dokumen_izin ? data.dokumen_izin.split('/').pop() : "");
            }
        }
        setIsEditing(!isEditing);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Fungsi trigger upload NIB
    const handleNibUploadClick = () => {
        if (isEditing) nibInputRef.current.click();
    };

    const handleNibChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNibFile(file);
            setNibFileName(file.name);
        }
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            const submissionData = new FormData();
            submissionData.append('nama_perusahaan', formData.nama_perusahaan);
            submissionData.append('nama_pengguna', formData.nama_pengguna);
            submissionData.append('email', formData.email);
            submissionData.append('alamat_perusahaan', formData.alamat_perusahaan);
            submissionData.append('deskripsi', formData.deskripsi);
            
            if (nibFile) {
                submissionData.append('dokumen_izin', nibFile);
            }

            const response = await api.post('/admin/profil-perusahaan', submissionData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.status === 'success') {
                setIsEditing(false);
                onUpdate();
            }
        } catch (error) {
            console.error('Gagal memperbarui profil:', error);
            alert(error.response?.data?.message || 'Gagal memperbarui profil');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <motion.div 
            variants={variants}
            className="area-form-profil w-full lg:w-[718px] min-h-[548px] bg-[#EAE4DC] border border-[#CCCCCC] rounded-[20px] p-[40px] relative shadow-sm flex flex-col justify-between"
        >
            {/* TOMBOL EDIT (PencilSquare) */}
            <button 
                onClick={toggleEdit}
                disabled={isSaving}
                className={`absolute top-[18px] right-[18px] p-[8px] rounded-full transition-all duration-300 ${
                    isEditing ? 'bg-[#4B2E2B] shadow-inner' : 'bg-transparent hover:bg-[#F3EDE6]'
                }`}
                title={isEditing ? 'Batal Edit' : 'Edit Profil'}
            >
                <img 
                    src={pencilSquareSvg} 
                    alt="Edit" 
                    className={`w-[24px] h-[24px] transition-all ${isEditing ? 'brightness-0 invert' : ''}`}
                />
            </button>

            <div className="flex flex-col gap-[6px]">
                {/* BARIS 1: NAMA CAFE & NAMA PENGELOLA */}
                <div className="flex flex-col md:flex-row gap-[14px] w-full">
                    <div className="grup-input flex-1 flex flex-col gap-[6px]">
                        <label className="label-input font-poppins font-semibold text-[16px] text-[#4B2E2B]">
                            Nama Cafe
                        </label>
                        <input 
                            type="text" 
                            name="nama_perusahaan"
                            value={formData.nama_perusahaan}
                            onChange={handleInputChange}
                            disabled={!isEditing || isSaving}
                            className={`input-profil w-full h-[38px] px-[16px] bg-[#F3EDE6] border border-[#CCCCCC]/80 rounded-[5px] font-poppins text-[14px] text-[#4B2E2B] transition-all ${
                                isEditing 
                                ? 'focus:outline-none focus:border-[#F7B750] ring-1 ring-[#F7B750]/20' 
                                : 'cursor-not-allowed opacity-90'
                            }`}
                        />
                    </div>

                    <div className="grup-input flex-1 flex flex-col gap-[6px]">
                        <label className="label-input font-poppins font-semibold text-[16px] text-[#4B2E2B]">
                            Nama Pengelola
                        </label>
                        <input 
                            type="text" 
                            name="nama_pengguna"
                            value={formData.nama_pengguna}
                            onChange={handleInputChange}
                            disabled={!isEditing || isSaving}
                            className={`input-profil w-full h-[38px] px-[16px] bg-[#F3EDE6] border border-[#CCCCCC]/80 rounded-[5px] font-poppins text-[14px] text-[#4B2E2B] transition-all ${
                                isEditing 
                                ? 'focus:outline-none focus:border-[#F7B750] ring-1 ring-[#F7B750]/20' 
                                : 'cursor-not-allowed opacity-90'
                            }`}
                        />
                    </div>
                </div>

                {/* SPACER 6px */}
                <div className="h-0" />

                {/* BARIS 2: EMAIL BISNIS & ALAMAT */}
                <div className="flex flex-col md:flex-row gap-[14px] w-full items-end">
                    <div className="grup-input flex-1 flex flex-col gap-[6px]">
                        <label className="label-input font-poppins font-semibold text-[16px] text-[#4B2E2B]">
                            Email Bisnis
                        </label>
                        <input 
                            type="email" 
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled={!isEditing || isSaving}
                            className={`input-profil w-full h-[38px] px-[16px] bg-[#F3EDE6] border border-[#CCCCCC]/80 rounded-[5px] font-poppins text-[14px] text-[#4B2E2B] transition-all ${
                                isEditing 
                                ? 'focus:outline-none focus:border-[#F7B750] ring-1 ring-[#F7B750]/20' 
                                : 'cursor-not-allowed opacity-90'
                            }`}
                        />
                    </div>

                    <div className="grup-input flex-1 flex flex-col gap-[6px]">
                        <label className="label-input font-poppins font-semibold text-[16px] text-[#4B2E2B]">
                            Alamat
                        </label>
                        <input 
                            type="text" 
                            name="alamat_perusahaan"
                            value={formData.alamat_perusahaan}
                            onChange={handleInputChange}
                            disabled={!isEditing || isSaving}
                            className={`input-profil w-full h-[38px] px-[16px] bg-[#F3EDE6] border border-[#CCCCCC]/80 rounded-[5px] font-poppins text-[14px] text-[#4B2E2B] transition-all ${
                                isEditing 
                                ? 'focus:outline-none focus:border-[#F7B750] ring-1 ring-[#F7B750]/20' 
                                : 'cursor-not-allowed opacity-90'
                            }`}
                        />
                    </div>
                </div>

                {/* SPACER 6px */}
                <div className="h-0" />

                {/* INPUT: DESKRIPSI CAFE */}
                <div className="grup-input flex flex-col gap-[6px]">
                    <label className="label-input font-poppins font-semibold text-[16px] text-[#4B2E2B]">
                        Deskripsi Cafe
                    </label>
                    <textarea 
                        name="deskripsi"
                        value={formData.deskripsi}
                        onChange={handleInputChange}
                        disabled={!isEditing || isSaving}
                        className={`input-profil w-full h-[204px] p-[16px] bg-[#F3EDE6] border border-[#CCCCCC]/80 rounded-[5px] font-poppins text-[14px] text-[#4B2E2B] resize-none transition-all ${
                            isEditing 
                            ? 'focus:outline-none focus:border-[#F7B750] ring-1 ring-[#F7B750]/20' 
                            : 'cursor-not-allowed opacity-90'
                        }`}
                    />
                </div>

                {/* SPACER 6px */}
                <div className="h-0" />

                {/* UPLOAD: DOKUMEN IZIN USAHA/NIB */}
                <div className="grup-input flex flex-col gap-[6px]">
                    <label className="label-input font-poppins font-semibold text-[16px] text-[#4B2E2B]">
                        Dokumen Izin Usaha / NIB
                    </label>
                    <input 
                        type="file" 
                        ref={nibInputRef} 
                        className="hidden" 
                        onChange={handleNibChange} 
                        accept=".pdf,.jpg,.jpeg,.png"
                    />
                    <div 
                        onClick={handleNibUploadClick}
                        className={`input-profil w-full h-[38px] px-[16px] bg-[#F3EDE6] border border-[#CCCCCC]/80 rounded-[5px] font-poppins text-[14px] text-[#4B2E2B] flex items-center justify-between cursor-pointer transition-all ${
                            isEditing 
                            ? 'hover:border-[#F7B750] bg-white/50' 
                            : 'cursor-not-allowed opacity-90'
                        }`}
                    >
                        <span className="truncate">
                            {nibFileName || "Belum ada file yang diunggah"}
                        </span>
                        {isEditing && (
                            <span className="text-[12px] bg-[#4B2E2B] text-white px-3 py-1 rounded-full shrink-0">
                                Pilih File
                            </span>
                        )}
                    </div>
                </div>

                {/* TOMBOL SIMPAN */}
                <AnimatePresence>
                    {isEditing && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="mt-[30px] flex justify-end"
                        >
                            <button 
                                onClick={handleSave}
                                disabled={isSaving}
                                className="tombol-simpan w-[189px] h-[48px] bg-[#4B2E2B] hover:bg-[#F5B759] text-[#F3EDE6] hover:text-[#4B2E2B] font-poppins font-bold text-[16px] rounded-[50px] transition-all duration-300 shadow-md flex items-center justify-center disabled:opacity-70"
                            >
                                {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default FormProfil;
