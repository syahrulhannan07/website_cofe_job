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

const ReviewCard = ({ title, children, className = "" }) => (
    <div className={`bg-[#F5F1EA] rounded-[24px] p-8 border border-[#4B2E2B]/5 ${className}`}>
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
    <div className="bg-white rounded-[12px] p-5 border border-[#C5C8B5]/20 flex flex-col gap-2">
        <p className="font-poppins font-semibold text-[16px] text-[#4B2E2B]">{question}</p>
        <p className="font-poppins font-bold text-[18px] text-[#4B2E2B]">{answer || '-'}</p>
    </div>
);

const DocumentItem = ({ icon, name, category, size }) => (
    <div className="bg-white rounded-[12px] p-4 border border-[#C5C8B5]/20 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#79582E]/10 rounded-[8px] flex items-center justify-center">
                <img src={icon} alt="doc" className="w-6 h-6 object-contain" />
            </div>
            <div className="flex flex-col">
                <span className="font-poppins font-bold text-[16px] text-[#4B2E2B] truncate max-w-[300px] md:max-w-md">{name}</span>
                <span className="font-poppins font-bold text-[12px] text-[#4B2E2B]/40 uppercase tracking-widest">{category} {size ? `• ${size}` : ''}</span>
            </div>
        </div>
        <img src={iconCheck} alt="checked" className="w-6 h-6" />
    </div>
);

const Step4Review = ({ formData }) => {
    const { upload = {}, pertanyaan = {}, profil = {} } = formData || {};
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
        <div className="w-full flex flex-col gap-10">
            {/* Banner Instruksi Hijau */}
            <div className="w-full bg-[#6B8E23] rounded-[50px] px-12 py-10">
                <h2 className="font-poppins font-semibold text-[32px] text-white leading-tight">
                    Review dan Kirim
                </h2>
                <p className="font-poppins font-medium text-[20px] text-white/90 mt-4 leading-relaxed max-w-[1100px]">
                    Harap periksa ringkasan seluruh kelengkapan data lamaran, jika dirasa sudah lengkap kirim lamaran Anda sebagai posisi Marketing Intern. Lamaran Anda akan ditinjau oleh HRD
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
                                {profil.tentangSaya || 'Tidak ada deskripsi.'}
                            </p>
                        </div>

                        <div className="flex flex-col gap-4 mt-2">
                            <InfoItem icon={iconLocation} label="Alamat" value={profilData?.alamat} />
                            <InfoItem icon={iconEmail} label="Email" value={profilData?.email} />
                            <InfoItem icon={iconPhone} label="No Telephone" value={profilData?.nomor_telepon} />
                        </div>
                    </div>

                    <a href="/profil" target="_blank" className="absolute bottom-6 right-6 w-10 h-10 bg-white rounded-full flex items-center justify-center border border-[#4B2E2B]/10 hover:bg-gray-50 transition-all shadow-sm">
                        <img src={iconEdit} alt="edit" className="w-5 h-5" />
                    </a>
                </ReviewCard>

                {/* Kartu Pertanyaan */}
                <ReviewCard title="Pertanyaan Perusahaan" className="flex flex-col gap-6">
                    <QuestionBox question="Berapa gaji bulanan yang diinginkan?" answer={pertanyaan.gajiDiinginkan} />
                    <QuestionBox question="Kualifikasi mana yang anda miliki?" answer={pertanyaan.kualifikasi} />
                    <QuestionBox question="Apakah anda mempunyai pengalaman kerja?" answer={pertanyaan.pengalamanKerja} />
                </ReviewCard>
            </div>

            {/* Bottom Section — Dokumen Terlampir */}
            <ReviewCard title="Dokumen Terlampir" className="w-full flex flex-col gap-4">
                {upload.cv && <DocumentItem icon={iconDocCV} name={upload.cv.name} category="Curriculum Vitae" size={formatSize(upload.cv)} />}
                {upload.ijazah && <DocumentItem icon={iconDocIjazah} name={upload.ijazah.name} category="Ijazah" size={formatSize(upload.ijazah)} />}
                {upload.suratLamaran && <DocumentItem icon={iconDocSurat} name={upload.suratLamaran.name} category="Surat Lamaran" size={formatSize(upload.suratLamaran)} />}
                
                {upload.dokumenPendukung && <DocumentItem icon={iconDocOther} name={upload.dokumenPendukung.name} category="Dokumen Pendukung" size={formatSize(upload.dokumenPendukung)} />}
                {upload.sertifikat1 && <DocumentItem icon={iconDocOther} name={upload.sertifikat1.name} category="Sertifikat 1" size={formatSize(upload.sertifikat1)} />}
                {upload.sertifikat2 && <DocumentItem icon={iconDocOther} name={upload.sertifikat2.name} category="Sertifikat 2" size={formatSize(upload.sertifikat2)} />}
                {upload.sertifikat3 && <DocumentItem icon={iconDocOther} name={upload.sertifikat3.name} category="Sertifikat 3" size={formatSize(upload.sertifikat3)} />}
            </ReviewCard>
        </div>
    );
};

export default Step4Review;
