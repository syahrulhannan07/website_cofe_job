import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Cropper from 'react-easy-crop';
import api from '../../../../layanan/api';
import { getCroppedImgBlob } from '../../../util/cropImage';

// Aset SVG
import pencilSquareSvg      from '../../../aset/profil-perusahaan/PencilSquare.svg';
import iconVerifSvg         from '../../../aset/profil-perusahaan/Iconverif.svg';
import placeholderProfilePng from '../../../aset/profil-perusahaan/placeholder_profile.png';

const FotoProfil = ({ variants, data, onUpdate }) => {
    const fileInputRef = useRef(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    // State untuk Cropping
    const [imageToCrop, setImageToCrop] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [showCropper, setShowCropper] = useState(false);

    // Sync image from props
    useEffect(() => {
        if (data?.logo_perusahaan) {
            const url = data.logo_perusahaan.startsWith('http') 
                ? data.logo_perusahaan 
                : `/storage/${data.logo_perusahaan}`;
            setPreviewImage(url);
        }
    }, [data]);

    const onCropComplete = useCallback((_croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handlePencilClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setImageToCrop(reader.result);
                setShowCropper(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleConfirmCrop = async () => {
        try {
            setIsUploading(true);
            const croppedImageBlob = await getCroppedImgBlob(imageToCrop, croppedAreaPixels);
            
            // Create a preview immediately
            const previewUrl = URL.createObjectURL(croppedImageBlob);
            setPreviewImage(previewUrl);
            setShowCropper(false);

            // Upload to backend
            const submissionData = new FormData();
            submissionData.append('logo', croppedImageBlob, 'profile_cropped.jpg');

            const response = await api.post('/admin/profil-perusahaan', submissionData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.status === 'success') {
                onUpdate();
            }
        } catch (error) {
            console.error('Gagal memproses gambar:', error);
            alert('Gagal memproses gambar. Silakan coba lagi.');
        } finally {
            setIsUploading(false);
            setImageToCrop(null);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Diterima': return { bg: '#92E3A9', text: '#3FB560', label: 'Diterima' };
            case 'Ditolak': return { bg: '#C76A6A', text: '#FFFFFF', label: 'Ditolak' };
            default: return { bg: '#B1894A', text: '#FFFFFF', label: 'Pending' };
        }
    };

    const statusStyle = getStatusStyle(data?.status_verifikasi);

    return (
        <div className="area-kanan-profil flex flex-col gap-[13px] w-[289px]">
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
                disabled={isUploading}
            />

            <motion.div 
                variants={variants}
                className="kartu-avatar w-full h-[322px] bg-[#EAE4DC] border border-[#CCCCCC] rounded-[20px] px-[24px] flex flex-col items-center shadow-sm"
            >
                <h3 className="mt-[33px] font-poppins font-semibold text-[24px] text-[#4B2E2B] leading-none">
                    Logo Cafe
                </h3>

                <div className="relative group mt-[13px]">
                    <div className="w-[158px] h-[158px] rounded-full overflow-hidden flex items-center justify-center transition-transform duration-300 group-hover:scale-[1.02]">
                        {previewImage ? (
                            <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <img src={placeholderProfilePng} alt="Placeholder" className="w-full h-full object-cover" />
                        )}
                        {isUploading && (
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                            </div>
                        )}
                    </div>
                    
                    <button 
                        onClick={handlePencilClick}
                        disabled={isUploading}
                        className="absolute bottom-[5px] right-[5px] w-[35px] h-[35px] border border-[#CCCCCC] rounded-full flex items-center justify-center shadow-md transition-all duration-300 bg-white hover:bg-gray-50"
                    >
                        <img src={pencilSquareSvg} alt="Ubah Foto" className="w-[20px] h-[20px]" />
                    </button>
                </div>

                <p className="mt-[23px] font-poppins font-medium text-[12px] text-[#4B2E2B]/80 text-center">
                    Format: PNG, JPG (Maks. 10MB)
                </p>
            </motion.div>

            <motion.div 
                variants={variants}
                className="kartu-verifikasi w-full h-[75px] bg-[#EAE4DC] border border-[#CCCCCC] rounded-[10px] px-[20px] flex items-center gap-[13px] shadow-sm"
            >
                <div className="w-[42px] h-[42px] bg-white rounded-full flex items-center justify-center shadow-[0_1px_2px_rgba(0,0,0,0.05)] shrink-0">
                    <img src={iconVerifSvg} alt="Verifikasi" className="w-[20px] h-[20px] object-contain" />
                </div>

                <div className="flex items-center gap-[10px]">
                    <span className="font-poppins font-semibold text-[14px] text-[#4B2E2B] whitespace-nowrap">
                        Status Verifikasi
                    </span>
                    <div 
                        className="flex items-center justify-center w-[72px] h-[18px] rounded-[10px] shrink-0"
                        style={{ backgroundColor: statusStyle.bg }}
                    >
                        <span className="font-poppins font-medium text-[10px] leading-none" style={{ color: statusStyle.text }}>
                            {statusStyle.label}
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* MODAL CROPPER */}
            <AnimatePresence>
                {showCropper && (
                    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-[#F3EDE6] w-full max-w-[500px] rounded-[20px] overflow-hidden shadow-2xl flex flex-col"
                        >
                            <div className="p-6 border-b border-[#4B2E2B]/10">
                                <h3 className="font-poppins font-bold text-[20px] text-[#4B2E2B]">Sesuaikan Posisi Foto</h3>
                                <p className="text-[14px] text-[#4B2E2B]/60">Geser dan perbesar untuk mendapatkan posisi terbaik.</p>
                            </div>

                            <div className="relative h-[400px] bg-black">
                                <Cropper
                                    image={imageToCrop}
                                    crop={crop}
                                    zoom={zoom}
                                    aspect={1}
                                    cropShape="round"
                                    showGrid={false}
                                    onCropChange={setCrop}
                                    onCropComplete={onCropComplete}
                                    onZoomChange={setZoom}
                                />
                            </div>

                            <div className="p-6 flex flex-col gap-4">
                                <div className="flex items-center gap-4">
                                    <span className="text-[12px] font-medium text-[#4B2E2B]">Zoom</span>
                                    <input
                                        type="range"
                                        value={zoom}
                                        min={1}
                                        max={3}
                                        step={0.1}
                                        aria-labelledby="Zoom"
                                        onChange={(e) => setZoom(e.target.value)}
                                        className="flex-1 accent-[#4B2E2B]"
                                    />
                                </div>
                                <div className="flex justify-end gap-3">
                                    <button 
                                        onClick={() => setShowCropper(false)}
                                        className="px-6 py-2 rounded-full border border-[#4B2E2B]/20 font-poppins font-semibold text-[14px] text-[#4B2E2B] hover:bg-black/5 transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button 
                                        onClick={handleConfirmCrop}
                                        disabled={isUploading}
                                        className="px-8 py-2 rounded-full bg-[#4B2E2B] font-poppins font-semibold text-[14px] text-white hover:bg-[#3d2523] transition-colors flex items-center gap-2"
                                    >
                                        {isUploading ? (
                                            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Memproses...</>
                                        ) : 'Simpan Posisi'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FotoProfil;
