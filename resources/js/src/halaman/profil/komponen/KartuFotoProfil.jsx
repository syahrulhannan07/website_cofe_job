import React, { useState, useRef, useEffect } from 'react';
import cameraIcon from '../../../aset/profil/Camera.png';
import placeholderImg from '../../../aset/profil/placeholder_profil.jpg';
import layananProfil from '../../../layanan/layananProfil';

const KartuFotoProfil = () => {
    const fileInputRef = useRef(null);
    const [preview, setPreview] = useState(placeholderImg);
    const [lastValidPreview, setLastValidPreview] = useState(placeholderImg);
    const [loading, setLoading] = useState(false);

    // Ambil data profil untuk menampilkan foto yang sudah ada
    useEffect(() => {
        const fetchProfil = async () => {
            try {
                const data = await layananProfil.ambilProfil();
                if (data.status === 'success' && data.data.foto_profil) {
                    const urlFoto = data.data.foto_profil.startsWith('http') 
                        ? data.data.foto_profil 
                        : `/storage/${data.data.foto_profil}`;
                    setPreview(urlFoto);
                    setLastValidPreview(urlFoto);
                }
            } catch (error) {
                console.error("Gagal mengambil foto profil:", error);
            }
        };
        fetchProfil();
    }, []);

    const handleCameraClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validasi client-side sederhana
            if (file.size > 2 * 1024 * 1024) {
                alert("Ukuran file terlalu besar! Maksimal 2MB.");
                setPreview(lastValidPreview);
                return;
            }

            const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
            if (!allowedTypes.includes(file.type)) {
                alert("Format file tidak didukung! Gunakan JPG atau PNG.");
                setPreview(lastValidPreview);
                return;
            }

            // Tampilkan preview lokal sementara
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
            
            // Lakukan upload otomatis
            const formData = new FormData();
            formData.append('foto_profil', file);
            
            setLoading(true);
            try {
                const respons = await layananProfil.updateProfil(formData);
                if (respons.status === 'success') {
                    const newUrl = respons.data.foto_profil.startsWith('http') 
                        ? respons.data.foto_profil 
                        : `/storage/${respons.data.foto_profil}`;
                    setPreview(newUrl);
                    setLastValidPreview(newUrl);
                    alert("Foto profil berhasil diperbarui!");
                }
            } catch (error) {
                console.error("Gagal mengunggah foto profil:", error);
                // Kembalikan ke foto sebelumnya jika gagal
                setPreview(lastValidPreview);
                alert("Gagal mengunggah foto profil ke server. Pastikan koneksi stabil.");
            } finally {
                setLoading(false);
                // Reset input agar bisa pilih file yang sama jika gagal
                e.target.value = '';
            }
        }
    };

    return (
        <div className="kartu-foto-profil bg-[#C69C6D] rounded-[25px] p-10 flex flex-col items-center justify-center shadow-lg w-full h-full min-h-[460px] relative z-10">
            <div className="wadah-foto relative mb-6">
                <div 
                    className={`bingkai-foto w-[256px] h-[289px] bg-[#E3CEB6] rounded-[25px] overflow-hidden flex items-center justify-center relative ${loading ? 'opacity-50' : ''}`}
                    style={{ 
                        boxShadow: '0px 0px 5px 8px rgba(167, 129, 93, 1)' 
                    }}
                >
                    <img 
                        src={preview} 
                        alt="Foto Profil" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.src = placeholderImg;
                        }}
                    />
                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        </div>
                    )}
                </div>

                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleFileChange}
                />

                <button 
                    onClick={handleCameraClick}
                    disabled={loading}
                    className="tombol-unggah-foto absolute bottom-[-10px] right-[-10px] bg-[#6B8E23] w-[55px] h-[55px] rounded-full flex items-center justify-center shadow-md hover:bg-[#5a7a1d] transition-colors z-20 disabled:opacity-50"
                >
                    <img src={cameraIcon} alt="Ganti Foto" className="w-8 h-8" />
                </button>
            </div>

            <h3 className="label-foto font-poppins font-semibold text-[32px] text-[#4B2E2B] mt-6">
                Foto Profil
            </h3>
        </div>
    );
};

export default KartuFotoProfil;
