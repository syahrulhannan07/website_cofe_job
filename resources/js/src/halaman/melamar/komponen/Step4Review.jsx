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
import placeholderProfile from '../../../aset/profil/placeholder_profil.jpg';
import iconEdu from '../../../aset/profil/Graduation Cap.png';
import iconExp from '../../../aset/profil/Building.png';
import layananProfil from '../../../layanan/layananProfil';

const iconCalendar = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="%234B2E2B"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>`;
const iconGender = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="%234B2E2B"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>`;

const getIconForDoc = (nama_dokumen) => {
    const name = (nama_dokumen || '').toLowerCase();
    if (name.includes('cv') || name.includes('curriculum')) return iconDocCV;
    if (name.includes('ijazah')) return iconDocIjazah;
    if (name.includes('surat lamaran') || name.includes('cover letter')) return iconDocSurat;
    return iconDocOther; 
};

const ReviewCard = ({ title, children, className = "" }) => (
    <div className={`pembungkus-kartu-review bg-[#F5F1EA] rounded-xl p-5 border border-[#4B2E2B]/5 ${className}`}>
        {title && <h3 className="font-poppins font-bold text-xl text-[#4B2E2B] mb-5 leading-none">{title}</h3>}
        {children}
    </div>
);

const InfoItem = ({ icon, label, value }) => (
    <div className="flex items-start gap-3">
        {icon ? (
            <div className="w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">
                <img src={icon} alt={label} className="w-4 h-4 object-contain" />
            </div>
        ) : (
            <div className="w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">
                <div className="w-2 h-2 bg-[#4B2E2B]/30 rounded-full" />
            </div>
        )}
        <div className="flex flex-col">
            <span className="font-poppins font-semibold text-[15px] text-[#4B2E2B]">{label}</span>
            <span className="font-poppins font-medium text-[14px] text-[#4B2E2B]/70">{value || '-'}</span>
        </div>
    </div>
);

const QuestionBox = ({ question, answer }) => (
    <div className="pembungkus-kotak-pertanyaan bg-white rounded-lg p-4 border border-[#C5C8B5]/20 flex flex-col gap-1.5">
        <p className="font-poppins font-semibold text-[14px] text-[#4B2E2B]">{question}</p>
        <p className="font-poppins font-bold text-[15px] text-[#4B2E2B]">{answer || '-'}</p>
    </div>
);

const DocumentItem = ({ icon, name, category, size, onClick }) => (
    <div className="pembungkus-item-dokumen bg-white rounded-lg p-3 border border-[#C5C8B5]/20 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#79582E]/10 rounded-md flex items-center justify-center">
                <img src={icon} alt="doc" className="w-5 h-5 object-contain" style={{ filter: 'invert(75%) sepia(18%) saturate(913%) hue-rotate(345deg) brightness(87%) contrast(85%)' }} />
            </div>
            <div className="flex flex-col">
                <span 
                    onClick={onClick}
                    className="font-poppins font-bold text-[14px] text-[#4B2E2B] truncate max-w-[200px] md:max-w-sm cursor-pointer hover:underline hover:text-blue-600 transition-colors"
                    title="Klik untuk meninjau dokumen"
                >
                    {name}
                </span>
                <span className="font-poppins font-bold text-[10px] text-[#4B2E2B]/40 uppercase tracking-widest">{category} {size ? `• ${size}` : ''}</span>
            </div>
        </div>
        <img src={iconCheck} alt="checked" className="w-5 h-5" />
    </div>
);

const Step4Review = ({ formData, dokumenWajib = [], pertanyaanSeleksi = [], onEditProfil }) => {
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
        <div className="pembungkus-tahap-tinjauan w-full flex flex-col gap-6">
            {/* Banner Instruksi Hijau */}
            <div className="w-full bg-[#6B8E23] rounded-2xl px-6 py-6">
                <h2 className="font-poppins font-semibold text-2xl text-white leading-tight">
                    Review dan Kirim
                </h2>
                <p className="font-poppins font-medium text-[15px] text-white/90 mt-2 leading-relaxed max-w-3xl">
                    Harap periksa ringkasan seluruh kelengkapan data lamaran, jika dirasa sudah lengkap kirim lamaran Anda. Lamaran Anda akan ditinjau oleh HRD.
                </p>
            </div>

            {/* Top Row — Profil & Pertanyaan */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Kartu Profil */}
                <ReviewCard className="relative min-h-80">
                    <div className="flex items-center gap-4 mb-5">
                        <div className="w-14 h-14 rounded-full bg-[#F3EDE6] overflow-hidden border-2 border-[#4B2E2B]/10 flex items-center justify-center">
                            <img 
                                src={profilData?.foto_profil 
                                    ? (profilData.foto_profil.startsWith('http') ? profilData.foto_profil : `/storage/${profilData.foto_profil}`)
                                    : placeholderProfile} 
                                alt="Avatar" 
                                className="w-full h-full object-cover" 
                            />
                        </div>
                        <h2 className="font-poppins font-bold text-2xl text-[#4B2E2B] leading-tight">{profilData?.nama_lengkap || 'User'}</h2>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <span className="font-poppins font-semibold text-[18px] text-[#4B2E2B]">Tentang Saya</span>
                            <p className="font-poppins font-medium text-[13px] text-[#4B2E2B]/80 leading-relaxed">
                                {profilData?.tentang_saya || profil.tentangSaya || 'Tidak ada deskripsi.'}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1 border-t border-[#4B2E2B]/10 pt-4">
                            <InfoItem icon={iconLocation} label="Alamat" value={profilData?.alamat} />
                            <InfoItem icon={iconEmail} label="Email" value={profilData?.pengguna?.email} />
                            <InfoItem icon={iconPhone} label="No Telephone" value={profilData?.nomor_telepon} />
                            <InfoItem icon={iconCalendar} label="Tanggal Lahir" value={profilData?.tanggal_lahir ? new Date(profilData.tanggal_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : ''} />
                            <InfoItem icon={iconGender} label="Jenis Kelamin" value={profilData?.jenis_kelamin} />
                        </div>

                        {/* Pendidikan */}
                        <div className="flex flex-col gap-2 mt-3 border-t border-[#4B2E2B]/10 pt-4">
                            <span className="font-poppins font-semibold text-[15px] text-[#4B2E2B]">Pendidikan</span>
                            {profilData?.pendidikan?.length > 0 ? (
                                <div className="flex flex-col gap-2">
                                    {profilData.pendidikan.map(p => (
                                        <div key={p.id_pendidikan} className="flex items-start gap-3">
                                            <img src={iconEdu} alt="Pendidikan" className="w-5 h-5 object-contain shrink-0" />
                                            <p className="font-poppins text-[15px] text-[#4B2E2B] leading-snug">
                                                {p.institusi} - {p.tingkat} {p.jurusan ? `- ${p.jurusan}` : ''}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="font-poppins text-[14px] text-[#4B2E2B]/60">Belum ada data pendidikan.</p>}
                        </div>

                        {/* Pengalaman Kerja */}
                        <div className="flex flex-col gap-2 mt-1">
                            <span className="font-poppins font-semibold text-[15px] text-[#4B2E2B]">Pengalaman Kerja</span>
                            {profilData?.pengalaman_kerja?.length > 0 ? (
                                <div className="flex flex-col gap-4">
                                    {profilData.pengalaman_kerja.map(p => {
                                        const tglMulai = p.tanggal_mulai ? new Date(p.tanggal_mulai).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) : '';
                                        const tglSelesai = p.tanggal_selesai ? new Date(p.tanggal_selesai).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) : 'Sekarang';
                                        return (
                                            <div key={p.id_pengalaman} className="flex items-start gap-3">
                                                <img src={iconExp} alt="Pengalaman" className="w-5 h-5 object-contain shrink-0 mt-0.5" />
                                                <div className="flex flex-col gap-1">
                                                    <p className="font-poppins text-[15px] text-[#4B2E2B] leading-snug font-bold">
                                                        {p.nama_perusahaan} - <span className="font-semibold">{p.posisi}</span>
                                                    </p>
                                                    <span className="font-poppins text-[13px] text-[#4B2E2B]/70">{tglMulai} - {tglSelesai}</span>
                                                    {p.deskripsi && (
                                                        <p className="font-poppins text-[14px] text-[#4B2E2B]/90 mt-1 leading-relaxed">
                                                            {p.deskripsi}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : <p className="font-poppins text-[14px] text-[#4B2E2B]/60">Belum ada data pengalaman kerja.</p>}
                        </div>

                        {/* Keahlian (Skill) */}
                        <div className="flex flex-col gap-2 mt-1">
                            <span className="font-poppins font-semibold text-[15px] text-[#4B2E2B]">Keahlian (Skill)</span>
                            {profilData?.skills?.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {profilData.skills.map(s => (
                                        <span key={s.id_skill} className="px-4 py-1.5 bg-[#4B2E2B]/5 text-[#4B2E2B] rounded-full text-[14px] font-semibold border border-[#4B2E2B]/10">
                                            {s.nama_skill}
                                        </span>
                                    ))}
                                </div>
                            ) : <p className="font-poppins text-[14px] text-[#4B2E2B]/60">Belum ada data keahlian.</p>}
                        </div>
                    </div>

                    <button onClick={onEditProfil} className="absolute bottom-4 right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center border border-[#4B2E2B]/10 hover:bg-gray-50 transition-all shadow-sm cursor-pointer" title="Kembali Edit Profil">
                        <img src={iconEdit} alt="edit" className="w-4 h-4" />
                    </button>
                </ReviewCard>

                {/* Kartu Pertanyaan */}
                <ReviewCard title="Pertanyaan Perusahaan" className="flex flex-col gap-4 h-fit">
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
            <ReviewCard title="Dokumen Terlampir" className="w-full flex flex-col gap-3">
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
                            onClick={() => {
                                const url = URL.createObjectURL(file);
                                window.open(url, '_blank');
                            }}
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
