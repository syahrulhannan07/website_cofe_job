import React, { useEffect, useState } from 'react';
import iconLocation from '../../../aset/melamar/Location.png';
import iconEmail from '../../../aset/melamar/Email.png';
import iconPhone from '../../../aset/melamar/Phone.png';
import iconEdit from '../../../aset/melamar/PencilSquare (3).svg';
import iconCheck from '../../../aset/melamar/cirkelcek.svg';
import iconDocCV from '../../../aset/melamar/iconcv.svg';
import iconDocIjazah from '../../../aset/melamar/ikonijazah.svg';
import iconDocSurat from '../../../aset/melamar/iconsuratlamaran.svg';
import iconDocOther from '../../../aset/melamar/icondokumenlain.svg';
import layananProfil from '../../../layanan/layananProfil';

const getIconForDoc = (nama_dokumen) => {
    const name = (nama_dokumen || '').toLowerCase();
    if (name.includes('cv') || name.includes('curriculum')) return iconDocCV;
    if (name.includes('ijazah')) return iconDocIjazah;
    if (name.includes('surat lamaran') || name.includes('cover letter')) return iconDocSurat;
    return iconDocOther; 
};

const ReviewCard = ({ title, children, className = "" }) => (
    <div className={`pembungkus-kartu-review bg-[#F5F1EA] rounded-[24px] p-8 border border-[#4B2E2B]/5 ${className}`}>
        {title && <h3 className="font-poppins font-bold text-[32px] text-[#4B2E2B] mb-8 leading-none">{title}</h3>}
        {children}
    </div>
);

const InfoItem = ({ icon, label, value }) => (
    <div className="flex items-start gap-4">
        <div className="w-8 h-8 flex items-center justify-center shrink-0 mt-1">
            <img src={icon} alt={label} className="w-6 h-6 object-contain" />
        </div>
        <div className="flex flex-col">
            <span className="font-poppins font-semibold text-[18px] text-[#4B2E2B]">{label}</span>
            <span className="font-poppins font-medium text-[16px] text-[#4B2E2B]/70">{value || '-'}</span>
        </div>
    </div>
);

const QuestionBox = ({ question, answer }) => (
    <div className="pembungkus-kotak-pertanyaan bg-white rounded-[12px] p-5 border border-[#C5C8B5]/20 flex flex-col gap-2">
        <p className="font-poppins font-semibold text-[16px] text-[#4B2E2B]">{question}</p>
        <p className="font-poppins font-bold text-[18px] text-[#4B2E2B]">{answer || '-'}</p>
    </div>
);

const DocumentItem = ({ icon, name, category, size }) => (
    <div className="pembungkus-item-dokumen bg-white rounded-[12px] p-4 border border-[#C5C8B5]/20 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#79582E]/10 rounded-[8px] flex items-center justify-center">
                <img src={icon} alt="doc" className="w-6 h-6 object-contain" style={{ filter: 'invert(75%) sepia(18%) saturate(913%) hue-rotate(345deg) brightness(87%) contrast(85%)' }} />
            </div>
            <div className="flex flex-col">
                <span className="font-poppins font-bold text-[16px] text-[#4B2E2B] truncate max-w-[300px] md:max-w-md">{name}</span>
                <span className="font-poppins font-bold text-[12px] text-[#4B2E2B]/40 uppercase tracking-widest">{category} {size ? `• ${size}` : ''}</span>
            </div>
        </div>
        <img src={iconCheck} alt="checked" className="w-6 h-6" />
    </div>
);

const Step4Review = ({ formData, dokumenWajib = [], pertanyaanSeleksi = [] }) => {
    const { upload = {}, pertanyaan = [], profil = {} } = formData || {};
    const [profilData, setProfilData] = useState(null);
    const [loadingProfil, setLoadingProfil] = useState(true);

    useEffect(() => {
        const fetchProfil = async () => {
            try {
                const res = await layananProfil.ambilProfil();
                if (res.status === 'success') setProfilData(res.data);
            } catch (err) {
                console.error('Gagal memuat profil untuk review:', err);
            } finally {
                setLoadingProfil(false);
            }
        };
        fetchProfil();
    }, []);

    const formatSize = (file) => {
        if (!file) return '';
        const size = file.size / (1024 * 1024);
        return `${size.toFixed(1)} MB`;
    };

    return (
        <div className="pembungkus-tahap-tinjauan w-full flex flex-col gap-10">
            {/* Banner Instruksi Hijau */}
            <div className="w-full bg-[#6B8E23] rounded-[50px] px-12 py-10">
                <h2 className="font-poppins font-semibold text-[32px] text-white leading-tight">
                    Review dan Kirim
                </h2>
                <p className="font-poppins font-medium text-[20px] text-white/90 mt-4 leading-relaxed max-w-[1100px]">
                    Harap periksa ringkasan seluruh kelengkapan data lamaran, jika dirasa sudah lengkap kirim lamaran Anda. Lamaran Anda akan ditinjau oleh HRD.
                </p>
            </div>

            {/* Top Row — Profil & Pertanyaan */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Kartu Profil */}
                <ReviewCard className="relative min-h-[480px]">
                    <div className="flex items-center gap-6 mb-8">
                        <div className="w-[100px] h-[100px] rounded-full bg-[#D9D9D9] overflow-hidden border-2 border-[#4B2E2B]/10">
                            {profilData?.foto_profil && (
                                <img src={profilData.foto_profil.startsWith('http') ? profilData.foto_profil : `/storage/${profilData.foto_profil}`} alt="Avatar" className="w-full h-full object-cover" />
                            )}
                        </div>
                        <h2 className="font-poppins font-bold text-[40px] text-[#4B2E2B] leading-tight">{profilData?.nama_lengkap || 'User'}</h2>
                    </div>

                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <span className="font-poppins font-semibold text-[18px] text-[#4B2E2B]">Tentang Saya</span>
                            <p className="font-poppins font-medium text-[16px] text-[#4B2E2B]/80 leading-relaxed">
                                {profilData?.tentang_saya || profil.tentangSaya || 'Tidak ada deskripsi.'}
                            </p>
                        </div>

                        <div className="flex flex-col gap-4 mt-2">
                            <InfoItem icon={iconLocation} label="Alamat" value={profilData?.alamat} />
                            <InfoItem icon={iconEmail} label="Email" value={profilData?.email} />
                            <InfoItem icon={iconPhone} label="No Telephone" value={profilData?.nomor_telepon} />
                        </div>
                    </div>

                    <a href="/profil" target="_blank" rel="noreferrer" className="absolute bottom-6 right-6 w-10 h-10 bg-white rounded-full flex items-center justify-center border border-[#4B2E2B]/10 hover:bg-gray-50 transition-all shadow-sm">
                        <img src={iconEdit} alt="edit" className="w-5 h-5" />
                    </a>
                </ReviewCard>

                {/* Kartu Pertanyaan */}
                <ReviewCard title="Pertanyaan Perusahaan" className="flex flex-col gap-6">
                    {pertanyaanSeleksi.length === 0 ? (
                        <p className="font-poppins text-[#4B2E2B] opacity-70">Tidak ada pertanyaan khusus.</p>
                    ) : (
                        pertanyaanSeleksi.map((q) => {
                            const ansObj = pertanyaan.find(p => p.id_pertanyaan === q.id_pertanyaan);
                            return (
                                <QuestionBox 
                                    key={q.id_pertanyaan} 
                                    question={q.pertanyaan} 
                                    answer={ansObj ? ansObj.jawaban : 'Belum dijawab'} 
                                />
                            );
                        })
                    )}
                </ReviewCard>
            </div>

            {/* Bottom Section — Dokumen Terlampir */}
            <ReviewCard title="Dokumen Terlampir" className="w-full flex flex-col gap-4">
                {dokumenWajib.map((doc) => {
                    const file = upload[doc.id_jenis_dokumen];
                    if (!file) return null; // Hanya tampilkan yang sudah diupload
                    return (
                        <DocumentItem 
                            key={doc.id_jenis_dokumen}
                            icon={getIconForDoc(doc.nama_dokumen)} 
                            name={file.name} 
                            category={doc.nama_dokumen} 
                            size={formatSize(file)} 
                        />
                    );
                })}
                {Object.keys(upload).length === 0 && (
                    <p className="font-poppins text-[#4B2E2B] opacity-70">Belum ada dokumen yang diunggah.</p>
                )}
            </ReviewCard>
        </div>
    );
};

export default Step4Review;
