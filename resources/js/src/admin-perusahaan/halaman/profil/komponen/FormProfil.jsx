import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Aset SVG
import pencilSquareSvg from '../../../aset/profil-perusahaan/PencilSquare.svg';

const FormProfil = ({ variants }) => {
    // State untuk kontrol mode edit
    const [isEditing, setIsEditing] = useState(false);
    
    // State untuk field baru
    const [namaPengelola, setNamaPengelola] = useState("Syahrul Hannan");
    const [nibFile, setNibFile] = useState(null);
    const nibInputRef = useRef(null);

    // Fungsi toggle edit
    const toggleEdit = () => {
        setIsEditing(!isEditing);
    };

    // Fungsi trigger upload NIB
    const handleNibUploadClick = () => {
        if (isEditing) nibInputRef.current.click();
    };

    const handleNibChange = (e) => {
        const file = e.target.files[0];
        if (file) setNibFile(file.name);
    };

    return (
        <motion.div 
            variants={variants}
            className="area-form-profil w-full lg:w-[718px] min-h-[548px] bg-[#EAE4DC] border border-[#CCCCCC] rounded-[20px] p-[40px] relative shadow-sm flex flex-col justify-between"
        >
            {/* TOMBOL EDIT (PencilSquare) */}
            <button 
                onClick={toggleEdit}
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
                            defaultValue="Dermayu Beans"
                            disabled={!isEditing}
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
                            value={namaPengelola}
                            onChange={(e) => setNamaPengelola(e.target.value)}
                            disabled={!isEditing}
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
                            defaultValue="dermayubeans@gmail.com"
                            disabled={!isEditing}
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
                            defaultValue="Jl. Karangampel No. 12, Indramayu"
                            disabled={!isEditing}
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
                        defaultValue="Dermayu Beans adalah cafe yang berfokus pada penyajian kopi lokal terbaik dari daerah Indramayu dan sekitarnya. Kami berkomitmen untuk memberikan pengalaman minum kopi yang otentik dan nyaman bagi para pelanggan kami."
                        disabled={!isEditing}
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
                            {nibFile || "Belum ada file yang diunggah"}
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
                            <button className="tombol-simpan w-[189px] h-[48px] bg-[#4B2E2B] hover:bg-[#F5B759] text-[#F3EDE6] hover:text-[#4B2E2B] font-poppins font-bold text-[16px] rounded-[50px] transition-all duration-300 shadow-md">
                                Simpan Perubahan
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default FormProfil;
