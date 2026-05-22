import React, { useRef } from 'react';
import iconCV from '../../../aset/melamar/iconcv.svg';
import iconIjazah from '../../../aset/melamar/ikonijazah.svg';
import iconSurat from '../../../aset/melamar/iconsuratlamaran.svg';
import iconDocOther from '../../../aset/melamar/icondokumenlain.svg';
import iconUpload from '../../../aset/melamar/Vector.svg';
import iconCeklis from '../../../aset/melamar/cirkelcek.svg';

const getIconForDoc = (nama_dokumen) => {
    const name = (nama_dokumen || '').toLowerCase();
    if (name.includes('cv') || name.includes('curriculum')) return iconCV;
    if (name.includes('ijazah')) return iconIjazah;
    if (name.includes('surat lamaran') || name.includes('cover letter')) return iconSurat;
    return iconDocOther; // default fallback icon
};

const AreaUpload = ({ config, file, onChange, isWide = false }) => {
    const inputRef = useRef(null);
    const sudahUpload = !!file;

    return (
        <div className={`pembungkus-area-upload flex bg-white rounded-[20px] border-2 border-[#C69C6D] p-8 transition-all duration-300 ${isWide ? 'flex-col md:flex-row md:items-center md:gap-12' : 'flex-col gap-6'} ${isWide ? 'md:col-span-2' : ''}`}>
            {/* Header Card: Icon + Text */}
            <div className={`flex items-center gap-4 ${isWide ? 'md:min-w-[250px]' : ''}`}>
                <div className="w-[60px] h-[60px] bg-[#4B2E2B] rounded-[8px] flex items-center justify-center shrink-0">
                    <img src={getIconForDoc(config.nama_dokumen)} alt={config.nama_dokumen} className="w-7 h-7 object-contain" style={{ filter: 'invert(75%) sepia(18%) saturate(913%) hue-rotate(345deg) brightness(87%) contrast(85%)' }} />
                </div>
                <div className="flex flex-col">
                    <h3 className="font-poppins font-semibold text-[18px] text-[#4B2E2B] leading-tight">{config.nama_dokumen}</h3>
                    {config.wajib && <p className="font-poppins text-[14px] text-[#4B2E2B] opacity-60 mt-1 font-medium">Dibutuhkan</p>}
                </div>
            </div>

            {/* Dashed Upload Area */}
            <div
                onClick={() => inputRef.current.click()}
                className={`relative flex flex-col items-center justify-center rounded-[10px] border-2 border-dashed cursor-pointer transition-all duration-300 py-8 px-6 flex-1
                    ${sudahUpload ? 'border-[#6B8E23] bg-[#6B8E23]/5' : 'border-[#4B2E2B] border-opacity-30 bg-[#F8E8D5] bg-opacity-50 hover:bg-opacity-80'}`}
            >
                <input ref={inputRef} type="file" className="hidden" accept=".pdf" onChange={(e) => { if (e.target.files[0]) onChange(config.id_jenis_dokumen, e.target.files[0]); }} />
                {sudahUpload ? (
                    <div className="flex flex-col items-center gap-3">
                        <img src={iconCeklis} alt="uploaded" className="w-10 h-10" />
                        <p className="font-poppins text-[14px] text-[#6B8E23] font-bold text-center truncate max-w-full">{file.name}</p>
                        <button onClick={(e) => { e.stopPropagation(); onChange(config.id_jenis_dokumen, null); }} className="text-[12px] text-red-500 font-bold hover:underline bg-red-50 px-3 py-1 rounded-full">Hapus File</button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3">
                        <img src={iconUpload} alt="upload" className="w-8 h-8 opacity-80" />
                        <p className="font-poppins font-medium text-[13px] text-[#4B2E2B] opacity-80 text-center">Upload dengan format PDF (max 10mb)</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const BoxPendukung = ({ config, file, onChange }) => {
    const inputRef = useRef(null);
    const sudahUpload = !!file;

    return (
        <div 
            onClick={() => inputRef.current.click()}
            className={`pembungkus-box-pendukung flex items-center gap-3 p-4 bg-[#F8E8D5] bg-opacity-50 rounded-[10px] border-2 border-dashed border-[#4B2E2B] border-opacity-30 cursor-pointer hover:bg-opacity-80 transition-all
                ${sudahUpload ? 'border-[#6B8E23] bg-[#6B8E23]/5' : ''}`}
        >
            <input ref={inputRef} type="file" className="hidden" accept=".pdf" onChange={(e) => { if (e.target.files[0]) onChange(config.id_jenis_dokumen, e.target.files[0]); }} />
            <div className={`w-10 h-10 rounded-[5px] flex items-center justify-center shrink-0 ${sudahUpload ? 'bg-[#6B8E23]' : 'bg-[#4B2E2B]'}`}>
                {sudahUpload ? (
                    <img src={iconCeklis} alt="check" className="w-6 h-6 invert" />
                ) : (
                    <span className="text-white text-2xl font-bold">+</span>
                )}
            </div>
            <div className="flex flex-col min-w-0">
                <span className="font-poppins font-semibold text-[13px] text-[#4B2E2B] truncate">{sudahUpload ? file.name : config.nama_dokumen}</span>
                <span className="font-poppins text-[11px] text-[#4B2E2B] opacity-40 uppercase font-bold">opsional</span>
            </div>
        </div>
    );
};

const Step1Upload = ({ data, onChange, dokumenWajib = [] }) => {
    const handleFileChange = (id_jenis_dokumen, file) => {
        onChange({ ...data, [id_jenis_dokumen]: file });
    };

    const docWajib = dokumenWajib.filter(d => d.wajib);
    const docOpsional = dokumenWajib.filter(d => !d.wajib);

    return (
        <div className="pembungkus-tahap-unggah w-full flex flex-col gap-12">
            {/* Banner Instruksi Hijau */}
            <div className="w-full bg-[#6B8E23] rounded-[50px] px-12 py-10">
                <h2 className="font-poppins font-bold text-[32px] text-white leading-tight">Unggah Dokumen</h2>
                <p className="font-poppins font-medium text-[20px] text-white/90 mt-4 leading-relaxed max-w-[1100px]">
                    Harap berikan kredensial yang diperlukan untuk melengkapi lamaran Anda. Berkas lamaran Anda akan ditinjau oleh HRD.
                </p>
            </div>

            {/* Grid Dokumen Wajib */}
            {docWajib.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {docWajib.map((config, index) => (
                        <AreaUpload 
                            key={config.id_jenis_dokumen} 
                            config={config} 
                            file={data[config.id_jenis_dokumen]} 
                            onChange={handleFileChange} 
                            isWide={index === docWajib.length - 1 && docWajib.length % 2 !== 0} 
                        />
                    ))}
                </div>
            )}

            {/* Seksi Dokumen Pendukung */}
            {docOpsional.length > 0 && (
                <div className="flex flex-col gap-6">
                    <div>
                        <h3 className="font-poppins font-bold text-[36px] text-[#4B2E2B]">Dokumen Pendukung</h3>
                        <p className="font-poppins font-medium text-[20px] text-[#4B2E2B] opacity-80 mt-1">
                            Upload untuk dokumen pendukung seperti sertifikat dan lainnya
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {docOpsional.map((item) => (
                            <BoxPendukung 
                                key={item.id_jenis_dokumen} 
                                config={item} 
                                file={data[item.id_jenis_dokumen]} 
                                onChange={handleFileChange} 
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Step1Upload;
