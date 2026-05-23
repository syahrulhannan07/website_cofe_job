import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Icons from aset/wawancara (as requested)
import XIcon from '../../../aset/wawancara/x.svg';
import PersonIcon from '../../../aset/wawancara/person.svg';
import TanggalIcon from '../../../aset/wawancara/tanggal.svg';
import JamIcon from '../../../aset/wawancara/jam.svg';
import LokasiIcon from '../../../aset/wawancara/lokasi.svg';
import CatatanIcon from '../../../aset/wawancara/catatan.svg';
import JadwalIcon from '../../../aset/wawancara/jadwal.svg';
import DropdownIcon from '../../../aset/wawancara/dropdown.svg';
import KirimIcon from '../../../aset/wawancara/kirim.svg';
import StatusIcon from '../../../aset/wawancara/status.svg';

const ModalJadwalWawancara = ({ 
    isOpen, 
    onClose, 
    mode, 
    formData, 
    setFormData, 
    handleSubmit, 
    candidates,
    errors = {}, // [UPDATE LOGIC]
    setErrors, // [UPDATE LOGIC]
    isSubmitting
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={!isSubmitting ? onClose : undefined}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Container */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-[#FDF9F4] w-full max-w-[512px] rounded-[12px] shadow-2xl overflow-hidden border border-black/5 z-10"
                    >
                        {/* Header - Cokelat Gelap (Node 229:1896) */}
                        <div className="p-6 bg-[#432C23] flex flex-col gap-1 relative">
                            <div className="flex justify-between items-center mb-1">
                                <div className="flex items-center gap-3">
                                    <div className="w-[18px] h-[20px] flex items-center justify-center">
                                        <img 
                                            src={JadwalIcon} 
                                            alt="jadwal" 
                                            className="w-full h-full" 
                                        />
                                    </div>
                                    <h2 className="text-[20px] font-bold text-white tracking-[-0.5px] leading-[28px] font-poppins">
                                        {mode === 'add' ? 'Jadwal Wawancara Baru' : 'Ubah Jadwal Wawancara'}
                                    </h2>
                                </div>
                                <button 
                                    type="button"
                                    onClick={onClose} 
                                    disabled={isSubmitting}
                                    className="p-1 hover:bg-white/10 rounded-full transition-all group disabled:opacity-50"
                                >
                                    <img 
                                        src={XIcon} 
                                        alt="close" 
                                        className="w-[14px] h-[14px] brightness-0 invert opacity-60 group-hover:opacity-100" 
                                    />
                                </button>
                            </div>
                            <p className="text-[12px] text-[#B39286] uppercase tracking-[0.6px] font-medium font-poppins opacity-80">
                                {mode === 'add' ? 'ATUR PERTEMUAN DENGAN KANDIDAT PILIHAN ANDA' : 'SESUAIKAN WAKTU ATAU LOKASI PERTEMUAN'}
                            </p>
                        </div>

                        {/* Body - Putih Gading (Node 229:1908) */}
                        <form onSubmit={handleSubmit} noValidate className="p-5 pt-4 bg-[#FDF9F4]">
                            <div className="space-y-4">
                                {/* Pelamar Selection (Node 229:1910) */}
                                {mode === 'add' && (
                                    <div className="flex flex-col gap-[6px]">
                                        <div className="flex items-center gap-2">
                                            <img src={PersonIcon} alt="person" className="w-[9.33px] h-[9.33px]" />
                                            <label className="text-[15px] font-regular text-[#1C1C19] font-poppins leading-[22px]">Pelamar (ID Lamaran)</label>
                                        </div>
                                        <div className="relative group">
                                            <select
                                                required
                                                disabled={isSubmitting}
                                                className={`w-full h-[48px] bg-[#F7F3EE] border rounded-[8px] px-4 text-[15px] text-[#1C1C19] focus:outline-none focus:border-[#432C23]/40 appearance-none transition-all cursor-pointer font-poppins disabled:opacity-70 ${errors.id_lamaran ? 'border-red-500 ring-1 ring-red-500/30' : 'border-[#D3C3BE]'}`} // [UPDATE LOGIC]
                                                value={formData.id_lamaran}
                                                onChange={(e) => {
                                                    setFormData({...formData, id_lamaran: e.target.value});
                                                    if (errors.id_lamaran) setErrors({...errors, id_lamaran: null}); // [UPDATE LOGIC]
                                                }}
                                            >
                                                <option value="">Pilih Pelamar</option>
                                                {candidates.map(c => (
                                                    <option key={c.id_lamaran} value={c.id_lamaran}>
                                                        {c.pelamar?.nama_lengkap} - {c.lowongan?.posisi}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-60">
                                                <img src={DropdownIcon} alt="dropdown" className="w-5 h-5" />
                                            </div>
                                        </div>
                                        {errors.id_lamaran && (
                                            <p className="text-[12px] text-red-500 font-poppins mt-1">Harap isi bidang ini.</p> // [UPDATE LOGIC]
                                        )}
                                    </div>
                                )}

                                {/* Grid Row 1: Status & Lokasi/Link (Node 270:170) */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-[6px]">
                                        <div className="flex items-center gap-2">
                                            <img src={StatusIcon} alt="status" className="w-[11px] h-[11px] opacity-80" />
                                            <label className="text-[15px] font-regular text-[#1C1C19] font-poppins leading-[22px]">Status</label>
                                        </div>
                                        <div className="relative group">
                                            <select
                                                required
                                                disabled={isSubmitting}
                                                className="w-full h-[48px] bg-[#F7F3EE] border border-[#D3C3BE] rounded-[8px] px-4 text-[15px] text-[#1C1C19] focus:outline-none focus:border-[#432C23]/40 appearance-none transition-all cursor-pointer font-poppins disabled:opacity-70"
                                                value={formData.status || 'Terjadwal'}
                                                onChange={(e) => setFormData({...formData, status: e.target.value})}
                                            >
                                                <option value="Terjadwal">Terjadwal</option>
                                                <option value="Selesai">Selesai</option>
                                                <option value="Dibatalkan">Dibatalkan</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-60">
                                                <img src={DropdownIcon} alt="dropdown" className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-[6px]">
                                        <div className="flex items-center gap-2">
                                            <img src={LokasiIcon} alt="lokasi" className="w-[13px] h-[13px] opacity-80" />
                                            <label className="text-[15px] font-regular text-[#1C1C19] font-poppins leading-[22px]">Tempat / Link</label>
                                        </div>
                                        <input
                                            required
                                            type="text"
                                            disabled={isSubmitting}
                                            placeholder="Online / Alamat Kantor"
                                            className={`w-full h-[48px] bg-[#F7F3EE] border rounded-[8px] px-4 text-[15px] text-[#1C1C19] focus:outline-none focus:border-[#432C23]/40 transition-all font-poppins placeholder:text-[#6B7280]/60 disabled:opacity-70 ${errors.lokasi ? 'border-red-500 ring-1 ring-red-500/30' : 'border-[#D3C3BE]'}`} // [UPDATE LOGIC]
                                            value={formData.lokasi}
                                            onChange={(e) => {
                                                setFormData({...formData, lokasi: e.target.value});
                                                if (errors.lokasi) setErrors({...errors, lokasi: null}); // [UPDATE LOGIC]
                                            }}
                                        />
                                        {errors.lokasi && (
                                            <p className="text-[12px] text-red-500 font-poppins mt-1">Harap isi bidang ini.</p> // [UPDATE LOGIC]
                                        )}
                                    </div>
                                </div>

                                {/* Grid Row 2: Tanggal & Jam (Node 270:171) */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-[6px]">
                                        <div className="flex items-center gap-2">
                                            <img src={TanggalIcon} alt="tanggal" className="w-[10.5px] h-[11.6px] opacity-80" />
                                            <label className="text-[15px] font-regular text-[#1C1C19] font-poppins leading-[22px]">Tanggal</label>
                                        </div>
                                        <input
                                            required
                                            type="date"
                                            min={new Date().toISOString().split('T')[0]}
                                            disabled={isSubmitting}
                                            className={`w-full h-[48px] bg-[#F7F3EE] border rounded-[8px] px-4 text-[15px] text-[#1C1C19] focus:outline-none focus:border-[#432C23]/40 transition-all font-poppins cursor-pointer disabled:opacity-70 ${errors.tanggal ? 'border-red-500 ring-1 ring-red-500/30' : 'border-[#D3C3BE]'}`} // [UPDATE LOGIC]
                                            value={formData.tanggal}
                                            onChange={(e) => {
                                                setFormData({...formData, tanggal: e.target.value});
                                                if (errors.tanggal) setErrors({...errors, tanggal: null}); // [UPDATE LOGIC]
                                            }}
                                        />
                                        {errors.tanggal && (
                                            <p className="text-[12px] text-red-500 font-poppins mt-1">Harap isi bidang ini.</p> // [UPDATE LOGIC]
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-[6px]">
                                        <div className="flex items-center gap-2">
                                            <img src={JamIcon} alt="jam" className="w-[12.5px] h-[12.5px] opacity-80" />
                                            <label className="text-[15px] font-regular text-[#1C1C19] font-poppins leading-[22px]">Jam</label>
                                        </div>
                                        <input
                                            required
                                            type="time"
                                            disabled={isSubmitting}
                                            className={`w-full h-[48px] bg-[#F7F3EE] border rounded-[8px] px-4 text-[15px] text-[#1C1C19] focus:outline-none focus:border-[#432C23]/40 transition-all font-poppins cursor-pointer disabled:opacity-70 ${errors.jam ? 'border-red-500 ring-1 ring-red-500/30' : 'border-[#D3C3BE]'}`} // [UPDATE LOGIC]
                                            value={formData.jam}
                                            onChange={(e) => {
                                                setFormData({...formData, jam: e.target.value});
                                                if (errors.jam) setErrors({...errors, jam: null}); // [UPDATE LOGIC]
                                            }}
                                        />
                                        {errors.jam && (
                                            <p className="text-[12px] text-red-500 font-poppins mt-1">Harap isi bidang ini.</p> // [UPDATE LOGIC]
                                        )}
                                    </div>
                                </div>

                                {/* Catatan (Node 229:1978) */}
                                <div className="flex flex-col gap-[6px]">
                                    <div className="flex items-center gap-2">
                                        <img src={CatatanIcon} alt="catatan" className="w-[9.3px] h-[11.6px] opacity-80" />
                                        <label className="text-[15px] font-regular text-[#1C1C19] font-poppins leading-[22px]">Catatan</label>
                                    </div>
                                    <textarea
                                        rows="2"
                                        disabled={isSubmitting}
                                        placeholder="Tuliskan detail tambahan atau instruksi untuk pelamar di sini..."
                                        className="w-full min-h-[80px] bg-[#F7F3EE] border border-[#D3C3BE] rounded-[8px] px-4 pt-3 pb-3 text-[15px] text-[#1C1C19] focus:outline-none focus:border-[#432C23]/40 transition-all resize-none font-poppins placeholder:text-[#6B7280]/60 disabled:opacity-70"
                                        value={formData.catatan}
                                        onChange={(e) => setFormData({...formData, catatan: e.target.value})}
                                    />
                                </div>
                            </div>

                            {/* Footer Buttons (Node 229:1986) */}
                            <div className="mt-6 pt-4 flex items-center justify-end gap-3 border-t border-[#E6E2DE]">
                                <button 
                                    type="button"
                                    onClick={onClose}
                                    disabled={isSubmitting}
                                    className="px-5 py-2.5 border border-[#2B1810] text-[#2B1810] rounded-full font-poppins text-[15px] hover:bg-[#2B1810]/5 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2.5 bg-[#FEAE2C] text-[#6B4500] rounded-full font-poppins text-[15px] hover:bg-[#FEAE2C]/90 shadow-md transition-all transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-4 w-4 text-[#6B4500]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Memproses...
                                        </span>
                                    ) : (
                                        <>
                                            <img 
                                                src={KirimIcon} 
                                                alt="kirim" 
                                                className="w-[14px] h-[11px]"
                                            />
                                            {mode === 'add' ? 'Kirim Undangan Wawancara' : 'Simpan Perubahan'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ModalJadwalWawancara;
