import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../layanan/api';
import LoadingKopi from '../../komponen/LoadingKopi';

// Icons
import PlusIcon from '../../aset/lowongan/Plus.svg';
import PencilIcon from '../../aset/lowongan/PencilSquare.svg';
import TrashIcon from '../../aset/lowongan/TrashFill.svg';
import SearchIcon from '../../aset/pelamar/Search.svg'; // Reusing search icon from pelamar

const HalamanLowongan = () => {
    const navigate = useNavigate();
    const [vacancies, setVacancies] = useState([]);
    const [stats, setStats] = useState({ total: 0, active: 0, draft: 0, closed: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/lowongan', {
                params: { search: debouncedSearch }
            });
            setVacancies(response.data.data);
            setStats(response.data.meta.statistik);
        } catch (error) {
            console.error("Gagal mengambil data lowongan:", error);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Active':
                return 'bg-[#DBFEE5] text-[#519564]';
            case 'Draft':
                return 'bg-[#CBCBCB] text-[#708075]';
            case 'Closed':
                return 'bg-[#FEEBEB] text-[#C66A6A]';
            default:
                return 'bg-[#EAE4DC] text-[#4B2E2B]';
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus lowongan ini? Pekerjaan yang sudah dihapus tidak dapat dikembalikan.")) {
            try {
                await api.delete(`/admin/lowongan/${id}`);
                fetchData();
            } catch (error) {
                console.error("Gagal menghapus lowongan:", error);
                alert("Gagal menghapus lowongan. Silakan coba lagi.");
            }
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await api.put(`/admin/lowongan/${id}`, { status: newStatus });
            fetchData(); // Refresh list and stats
        } catch (error) {
            console.error("Gagal mengubah status:", error);
            alert(error.response?.data?.message || "Gagal mengubah status.");
        }
    };

    if (loading && vacancies.length === 0) {
        return <LoadingKopi />;
    }

    return (
        <div className="flex-1 w-full flex flex-col p-8 lg:p-10 bg-[#F3EDE6] min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="font-poppins font-bold text-[32px] text-[#4B2E2B] leading-tight">
                        Manajemen Lowongan
                    </h1>
                    <p className="font-poppins text-[#4B2E2B]/60 text-[16px] mt-1">
                        Kelola data lowongan yang dibutuhkan.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/admin/lowongan/tambah')}
                        className="h-[40px] w-[180px] bg-[#4B2E2B] hover:bg-[#4B2E2B]/90 text-[#F3EDE6] rounded-full flex items-center justify-center gap-[6px] transition-all"
                    >
                        <img 
                            src={PlusIcon} 
                            alt="Plus" 
                            className="w-[28px] h-[28px]" 
                        />
                        <span className="font-poppins text-[13px] font-normal">Tambah Lowongan</span>
                    </button>

                    <div className="relative group w-[205px]">
                        <img 
                            src={SearchIcon} 
                            alt="Search" 
                            className="absolute left-[15px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] opacity-100" 
                        />
                        <input 
                            type="text"
                            placeholder="Cari lowongan..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full h-[40px] pl-[42px] pr-4 bg-[#EADFD3] border border-[#CCCCCC]/80 rounded-full font-poppins text-[13px] text-[#4B2E2B] placeholder:text-[#4B2E2B]/60 focus:ring-1 focus:ring-[#4B2E2B]/20 transition-all outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {[
                    { label: 'Total Lowongan', value: stats.total, color: 'bg-[#EAE4DC] text-[#4B2E2B]' },
                    { label: 'Active', value: stats.active, color: 'bg-[#DBFEE5] text-[#509564]' },
                    { label: 'Draft', value: stats.draft, color: 'bg-[#E5E7EB] text-[#6B7280]' },
                    { label: 'Closed', value: stats.closed, color: 'bg-[#FEEBEB] text-[#C66A6A]' },
                ].map((item, idx) => (
                    <div key={idx} className={`${item.color.split(' ')[0]} p-6 rounded-[20px] shadow-sm flex flex-col gap-1`}>
                        <span className="font-poppins text-[14px] opacity-70 font-medium">{item.label}</span>
                        <span className={`font-poppins font-bold text-[32px] ${item.color.split(' ')[1]}`}>{item.value}</span>
                    </div>
                ))}
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-[24px] shadow-sm overflow-hidden border border-[#4B2E2B]/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-left table-fixed">
                        <thead>
                            <tr className="bg-[#EAE4DC] border-b border-[#4B2E2B]/5 h-[60px]">
                                <th className="w-[30%] px-10 font-poppins font-semibold text-[#4B2E2B] text-[13px]">Posisi</th>
                                <th className="w-[20%] px-6 font-poppins font-semibold text-[#4B2E2B] text-[13px]">Tanggal Buka</th>
                                <th className="w-[20%] px-6 font-poppins font-semibold text-[#4B2E2B] text-[13px]">Tanggal Tutup</th>
                                <th className="w-[15%] px-6 font-poppins font-semibold text-[#4B2E2B] text-[13px]">Status</th>
                                <th className="w-[15%] px-10 font-poppins font-semibold text-[#4B2E2B] text-[13px] text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#4B2E2B]/5">
                            {vacancies.length > 0 ? (
                                vacancies.map((item) => (
                                    <tr key={item.id} className="hover:bg-[#F3EDE6]/20 transition-colors h-[72px]">
                                        <td className="px-10 py-4 truncate">
                                            <span className="font-poppins font-semibold text-[#4B2E2B] text-[14px]">{item.posisi}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-poppins text-[#4B2E2B]/80 text-[13px] font-medium">{formatDate(item.batas_awal)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-poppins text-[#4B2E2B]/80 text-[13px] font-medium">{formatDate(item.batas_akhir)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select 
                                                value={item.status}
                                                onChange={(e) => handleStatusChange(item.id, e.target.value)}
                                                className={`appearance-none inline-flex items-center justify-center w-[92px] h-[28px] rounded-full text-[11px] font-poppins font-bold text-center cursor-pointer outline-none transition-all border-none focus:ring-2 focus:ring-[#4B2E2B]/10 ${getStatusStyles(item.status)}`}
                                            >
                                                <option value="Active">Active</option>
                                                <option value="Draft">Draft</option>
                                                <option value="Closed">Closed</option>
                                            </select>
                                        </td>
                                        <td className="px-10 py-4 text-right">
                                            <div className="flex items-center justify-end gap-5">
                                                <button 
                                                    onClick={() => navigate(`/admin/lowongan/edit/${item.id}`)}
                                                    className="hover:scale-110 transition-transform p-1"
                                                >
                                                    <img 
                                                        src={PencilIcon} 
                                                        alt="Edit" 
                                                        className="w-[18px] h-[18px]" 
                                                    />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(item.id)}
                                                    className="hover:scale-110 transition-transform p-1"
                                                >
                                                    <img 
                                                        src={TrashIcon} 
                                                        alt="Delete" 
                                                        className="w-[18px] h-[18px]" 
                                                    />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <p className="font-poppins text-[#4B2E2B]/40">Tidak ada lowongan ditemukan.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default HalamanLowongan;
