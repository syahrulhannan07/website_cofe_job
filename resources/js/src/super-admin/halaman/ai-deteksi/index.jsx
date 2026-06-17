import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../layanan/api';
import LoadingKopi from '../../../komponen/umum/LoadingKopi';

const getTindakanStyles = (tindakan) => {
    switch (tindakan) {
        case 'suspended': return 'bg-red-100 text-red-700';
        case 'warning':   return 'bg-yellow-100 text-yellow-700';
        case 'flagged':   return 'bg-blue-100 text-blue-700';
        default:          return 'bg-green-100 text-green-700';
    }
};

const getTindakanLabel = (tindakan) => {
    switch (tindakan) {
        case 'suspended': return 'Diblokir';
        case 'warning':   return 'Peringatan';
        case 'flagged':   return 'Terflag';
        case 'aman':      return 'Aman';
        default:          return tindakan;
    }
};

const ModalDetail = ({ log, onClose, onOverride }) => {
    if (!log) return null;

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-[20px] max-w-2xl w-full max-h-[80vh] overflow-y-auto p-4 md:p-8 shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="font-poppins font-bold text-[22px] text-[#4B2E2B]">Detail Deteksi</h2>
                    <button onClick={onClose} className="text-[#4B2E2B]/60 hover:text-[#4B2E2B] text-2xl">&times;</button>
                </div>

                <div className="space-y-4">
                    <div className="flex gap-4 items-center">
                        <span className="font-poppins text-[14px] text-[#4B2E2B]/60">Skor:</span>
                        <span className="font-poppins font-bold text-[24px] text-[#4B2E2B]">{log.skor_total}</span>
                        <span className={`px-3 py-1 rounded-full text-[12px] font-poppins font-bold ${getTindakanStyles(log.tindakan)}`}>
                            {getTindakanLabel(log.tindakan)}
                        </span>
                    </div>

                    {log.perusahaan && (
                        <div className="p-4 bg-[#F4ECE9] rounded-[12px]">
                            <p className="font-poppins text-[13px] text-[#4B2E2B]/60">Perusahaan</p>
                            <p className="font-poppins font-semibold text-[#4B2E2B]">{log.perusahaan.nama_perusahaan || log.perusahaan.nama_pengguna}</p>
                            <p className="font-poppins text-[13px] text-[#4B2E2B]/80">{log.perusahaan.email}</p>
                            <p className="font-poppins text-[13px] text-[#4B2E2B]/80">Status: {log.perusahaan.status_akun}</p>
                        </div>
                    )}

                    {log.lowongan && (
                        <div className="p-4 bg-[#F4ECE9] rounded-[12px]">
                            <p className="font-poppins text-[13px] text-[#4B2E2B]/60">Lowongan</p>
                            <p className="font-poppins font-semibold text-[#4B2E2B]">{log.lowongan.posisi}</p>
                            <p className="font-poppins text-[13px] text-[#4B2E2B]/80">Status: {log.lowongan.status}</p>
                            {log.lowongan.gaji && <p className="font-poppins text-[13px] text-[#4B2E2B]/80">Gaji: {log.lowongan.gaji}</p>}
                            {log.lowongan.lokasi && <p className="font-poppins text-[13px] text-[#4B2E2B]/80">Lokasi: {log.lowongan.lokasi}</p>}
                        </div>
                    )}

                    {log.detail_signal && log.detail_signal.length > 0 && (
                        <div>
                            <p className="font-poppins font-semibold text-[15px] text-[#4B2E2B] mb-3">Signal Terdeteksi</p>
                            <div className="space-y-2">
                                {log.detail_signal.map((s, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-[#F9F9F9] rounded-[10px] border border-[#E7E5E4]">
                                        <div className="flex-1">
                                            <span className="font-poppins text-[13px] text-[#4B2E2B]">{s.deskripsi}</span>
                                            <span className="block font-poppins text-[11px] text-[#4B2E2B]/40">{s.signal}</span>
                                        </div>
                                        <span className={`font-poppins font-bold text-[13px] ${s.bobot >= 30 ? 'text-red-500' : s.bobot >= 15 ? 'text-yellow-600' : 'text-blue-500'}`}>
                                            +{s.bobot}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="font-poppins text-[12px] text-[#4B2E2B]/40">
                        {log.dibuat_pada && <p>Waktu: {new Date(log.dibuat_pada).toLocaleString('id-ID')}</p>}
                        {log.catatan && <p>Catatan: {log.catatan}</p>}
                    </div>

                    {(log.tindakan === 'warning' || log.tindakan === 'suspended') && log.perusahaan?.status_akun !== 'Aktif' && (
                        <div className="flex gap-3 pt-4 border-t border-[#E7E5E4]">
                            <button
                                onClick={() => onOverride(log.id_deteksi, 'aktifkan_kembali')}
                                className="flex-1 h-[44px] bg-[#4B2E2B] text-white font-poppins font-bold text-[13px] rounded-full hover:bg-[#4B2E2B]/90 transition-all"
                            >
                                Aktifkan Kembali Akun
                            </button>
                            <button
                                onClick={() => onOverride(log.id_deteksi, 'abaikan')}
                                className="flex-1 h-[44px] border-2 border-[#4B2E2B] text-[#4B2E2B] font-poppins font-bold text-[13px] rounded-full hover:bg-[#4B2E2B]/5 transition-all"
                            >
                                Abaikan
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const HalamanAiDeteksi = () => {
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [search, setSearch] = useState('');
    const [selectedLog, setSelectedLog] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (filter) params.tindakan = filter;
            if (search) params.search = search;

            const [logRes, statRes] = await Promise.all([
                api.get('/super-admin/ai-deteksi', { params }),
                api.get('/super-admin/ai-deteksi/statistik'),
            ]);
            setLogs(logRes.data.data?.data || logRes.data.data || []);
            setStats(statRes.data.data);
        } catch (error) {
            console.error('Gagal mengambil data deteksi:', error);
        } finally {
            setLoading(false);
        }
    }, [filter, search]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleOverride = async (id, tindakan) => {
        try {
            await api.post(`/super-admin/ai-deteksi/${id}/override`, { tindakan });
            setSelectedLog(null);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Gagal melakukan override');
        }
    };

    if (loading && logs.length === 0) return <LoadingKopi />;

    return (
        <div className="flex-1 w-full flex flex-col p-4 md:p-6 lg:p-10 bg-[#F3EDE6] min-h-screen">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="font-poppins font-bold text-[24px] md:text-[32px] text-[#4B2E2B] leading-tight">Deteksi AI</h1>
                    <p className="font-poppins text-[#4B2E2B]/60 text-[14px] md:text-[16px] mt-1">
                        Monitoring lowongan dan akun mencurigakan oleh sistem AI
                    </p>
                </div>
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="h-[40px] px-4 bg-[#EADFD3] border border-[#CCCCCC]/80 rounded-full font-poppins text-[13px] text-[#4B2E2B] outline-none"
                    >
                        <option value="">Semua</option>
                        <option value="suspended">Diblokir</option>
                        <option value="warning">Peringatan</option>
                        <option value="flagged">Terflag</option>
                        <option value="aman">Aman</option>
                    </select>
                    <div className="relative group w-full md:w-[200px]">
                        <input
                            type="text"
                            placeholder="Cari perusahaan..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full h-[40px] px-4 bg-[#EADFD3] border border-[#CCCCCC]/80 rounded-full font-poppins text-[13px] text-[#4B2E2B] placeholder:text-[#4B2E2B]/60 outline-none"
                        />
                    </div>
                </div>
            </div>

            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-8">
                    {[
                        { label: 'Total Deteksi', value: stats.total, color: 'bg-[#EAE4DC]' },
                        { label: 'Terflag', value: stats.flagged, color: 'bg-blue-100' },
                        { label: 'Peringatan', value: stats.warning, color: 'bg-yellow-100' },
                        { label: 'Diblokir', value: stats.suspended, color: 'bg-red-100' },
                        { label: 'Aman', value: stats.aman, color: 'bg-green-100' },
                    ].map((item, idx) => (
                        <div key={idx} className={`${item.color} p-4 md:p-5 rounded-[16px] shadow-sm`}>
                            <span className="font-poppins text-[12px] md:text-[13px] text-[#4B2E2B]/60">{item.label}</span>
                            <p className="font-poppins font-bold text-[22px] md:text-[28px] text-[#4B2E2B]">{item.value}</p>
                        </div>
                    ))}
                </div>
            )}

            <div className="bg-white rounded-[24px] shadow-sm overflow-hidden border border-[#4B2E2B]/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[#EAE4DC] h-[52px] md:h-[60px]">
                                <th className="px-3 md:px-6 font-poppins font-semibold text-[#4B2E2B] text-[12px] md:text-[13px]">Waktu</th>
                                <th className="px-3 md:px-6 font-poppins font-semibold text-[#4B2E2B] text-[12px] md:text-[13px]">Perusahaan</th>
                                <th className="px-3 md:px-6 font-poppins font-semibold text-[#4B2E2B] text-[12px] md:text-[13px]">Lowongan</th>
                                <th className="px-3 md:px-6 font-poppins font-semibold text-[#4B2E2B] text-[12px] md:text-[13px]">Skor</th>
                                <th className="px-3 md:px-6 font-poppins font-semibold text-[#4B2E2B] text-[12px] md:text-[13px]">Tindakan</th>
                                <th className="px-3 md:px-6 font-poppins font-semibold text-[#4B2E2B] text-[12px] md:text-[13px]">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#4B2E2B]/5">
                            {logs.length > 0 ? (
                                logs.map((log) => (
                                    <tr key={log.id_deteksi} className="hover:bg-[#F3EDE6]/20 transition-colors h-[52px] md:h-[60px]">
                                        <td className="px-3 md:px-6 py-3 md:py-4 font-poppins text-[12px] md:text-[13px] text-[#4B2E2B]/80 whitespace-nowrap">
                                            {log.dibuat_pada ? new Date(log.dibuat_pada).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'}
                                        </td>
                                        <td className="px-3 md:px-6 py-3 md:py-4">
                                            <span className="font-poppins font-semibold text-[13px] md:text-[14px] text-[#4B2E2B]">
                                                {log.perusahaan?.nama_perusahaan || log.perusahaan?.nama_pengguna || '-'}
                                            </span>
                                        </td>
                                        <td className="px-3 md:px-6 py-3 md:py-4 font-poppins text-[12px] md:text-[13px] text-[#4B2E2B]/80 whitespace-nowrap">
                                            {log.lowongan?.posisi || '-'}
                                        </td>
                                        <td className="px-3 md:px-6 py-3 md:py-4">
                                            <span className="font-poppins font-bold text-[14px] md:text-[16px] text-[#4B2E2B]">{log.skor_total}</span>
                                        </td>
                                        <td className="px-3 md:px-6 py-3 md:py-4">
                                            <span className={`inline-flex px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-[11px] font-poppins font-bold ${getTindakanStyles(log.tindakan)}`}>
                                                {getTindakanLabel(log.tindakan)}
                                            </span>
                                        </td>
                                        <td className="px-3 md:px-6 py-3 md:py-4">
                                            <button
                                                onClick={() => setSelectedLog(log)}
                                                className="font-poppins text-[12px] md:text-[13px] text-[#4B2E2B] hover:underline"
                                            >
                                                Detail
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-4 md:px-8 py-12 md:py-20 text-center font-poppins text-[#4B2E2B]/40 text-[13px] md:text-[14px]">
                                        Tidak ada data deteksi.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ModalDetail
                log={selectedLog}
                onClose={() => setSelectedLog(null)}
                onOverride={handleOverride}
            />
        </div>
    );
};

export default HalamanAiDeteksi;
