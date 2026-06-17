import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../../layanan/api';
import LoadingKopi from '../../../komponen/umum/LoadingKopi';

// Components
import WawancaraToolbar from './komponen/WawancaraToolbar';
import WawancaraStats from './komponen/WawancaraStats';
import WawancaraTable from './komponen/WawancaraTable';
import ModalJadwalWawancara from './komponen/ModalJadwalWawancara';

const HalamanWawancara = () => {
    const location = useLocation();
    const [interviews, setInterviews] = useState([]);
    const [stats, setStats] = useState({ total_pelamar: 0, lamaran_diterima: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedId, setSelectedId] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [formData, setFormData] = useState({
        id_lamaran: '',
        tanggal: '',
        jam: '',
        lokasi: '',
        status: 'Terjadwal',
        catatan: ''
    });
    const [validationErrors, setValidationErrors] = useState({}); // [UPDATE LOGIC]
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const interviewRes = await api.get('/admin/wawancara', {
                params: { search: debouncedSearch }
            });
            setInterviews(interviewRes.data.data);

            const dashboardRes = await api.get('/admin/dashboard');
            const dStats = dashboardRes.data.data.statistik;
            setStats({
                total_pelamar: dStats.total_pelamar,
                lamaran_diterima: dStats.lamaran_diterima
            });
        } catch (error) {
            console.error("Gagal mengambil data wawancara:", error);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch]);

    const fetchCandidates = async () => {
        try {
            const res = await api.get('/admin/lamaran/status/wawancara');
            setCandidates(res.data.data);
        } catch (error) {
            console.error("Gagal mengambil kandidat:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Jika diarahkan dari halaman pelamar setelah ubah status ke Wawancara,
    // otomatis buka modal tambah jadwal dengan kandidat yang sudah dipilih
    useEffect(() => {
        if (location.state?.bukaModal) {
            const idLamaran = location.state.idLamaran;
            setModalMode('add');
            setFormData({ id_lamaran: idLamaran ? String(idLamaran) : '', tanggal: '', jam: '', lokasi: '', status: 'Terjadwal', catatan: '' });
            setValidationErrors({});
            // Muat daftar kandidat, kemudian tampilkan modal
            fetchCandidates().then(() => {
                setShowModal(true);
            });
            // Bersihkan state navigasi agar tidak terbuka lagi saat refresh
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const handleOpenAddModal = () => {
        setModalMode('add');
        setFormData({ id_lamaran: '', tanggal: '', jam: '', lokasi: '', status: 'Terjadwal', catatan: '' });
        setValidationErrors({}); // [UPDATE LOGIC]
        fetchCandidates();
        setShowModal(true);
    };

    const handleOpenEditModal = (item) => {
        setModalMode('edit');
        setSelectedId(item.id_wawancara);
        const [date, time] = item.tanggal_wawancara.split(' ');
        setFormData({
            id_lamaran: item.kandidat.id_lamaran,
            tanggal: date,
            jam: time.substring(0, 5),
            lokasi: item.lokasi,
            status: item.status || 'Terjadwal',
            catatan: item.catatan || ''
        });
        setValidationErrors({}); // [UPDATE LOGIC]
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (isSubmitting) return;

        // [UPDATE LOGIC] - Validasi Lokal
        const errors = {};
        if (!formData.tanggal) errors.tanggal = 'Harap isi bidang ini.';
        if (!formData.jam) errors.jam = 'Harap isi bidang ini.';
        if (!formData.lokasi) errors.lokasi = 'Harap isi bidang ini.';
        if (modalMode === 'add' && !formData.id_lamaran) {
            errors.id_lamaran = 'Harap isi bidang ini.';
        }

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        // [UPDATE LOGIC] - Payload yang dikirim ke backend
        const payload = {
            tanggal: formData.tanggal,
            waktu: formData.jam,
            tempat_link: formData.lokasi,
            tanggal_wawancara: `${formData.tanggal} ${formData.jam}`,
            lokasi: formData.lokasi,
            status: formData.status,
            catatan: formData.catatan
        };

        setIsSubmitting(true);
        try {
            if (modalMode === 'add') {
                await api.post(`/admin/lamaran/${formData.id_lamaran}/wawancara`, payload);
                alert('Undangan wawancara berhasil dikirim!'); // [UPDATE LOGIC]
            } else {
                await api.put(`/admin/wawancara/${selectedId}`, payload);
                alert('Jadwal wawancara berhasil diperbarui!'); // [UPDATE LOGIC]
            }
            setValidationErrors({}); // [UPDATE LOGIC]
            setShowModal(false);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Gagal menyimpan jadwal');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus jadwal wawancara ini?')) {
            try {
                await api.delete(`/admin/wawancara/${id}`);
                fetchData();
            } catch (error) {
                alert('Gagal menghapus jadwal');
            }
        }
    };

    const handleSelesai = async (id) => {
        try {
            await api.post(`/admin/wawancara/${id}/selesai`);
            fetchData();
        } catch (error) {
            alert('Gagal memperbarui status');
        }
    };

    if (loading && interviews.length === 0) return <LoadingKopi />;

    return (
        <div className="flex-1 w-full flex flex-col p-5 md:p-8 lg:p-10 bg-[#F3EDE6] min-h-screen font-poppins relative overflow-x-hidden">
            <WawancaraToolbar 
                onAdd={handleOpenAddModal} 
                search={search} 
                setSearch={setSearch} 
            />

            <WawancaraStats stats={stats} />

            <WawancaraTable 
                interviews={interviews} 
                onEdit={handleOpenEditModal} 
                onDelete={handleDelete} 
                onSelesai={handleSelesai} 
            />

            <ModalJadwalWawancara 
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setValidationErrors({}); // [UPDATE LOGIC]
                }}
                mode={modalMode}
                formData={formData}
                setFormData={setFormData}
                handleSubmit={handleSubmit}
                candidates={candidates}
                errors={validationErrors} // [UPDATE LOGIC]
                setErrors={setValidationErrors} // [UPDATE LOGIC]
                isSubmitting={isSubmitting}
            />
        </div>
    );
};

export default HalamanWawancara;
