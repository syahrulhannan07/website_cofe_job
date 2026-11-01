import React, { useEffect, useId, useRef, useState } from 'react';
import api from '../../../../layanan/api';
import MapLokasi from '../../../../komponen/umum/MapLokasi';
import LokasiPerusahaan from '../../../../komponen/umum/LokasiPerusahaan';
import { getCompanyCoordinates } from '../../../../layanan/koordinatLokasi';
import { PUSAT_INDRAMAYU, isWithinIndramayuSearchArea, parseLocationCoordinates } from '../../../../layanan/lokasiIndramayu';

const LokasiProfilPerusahaan = ({ perusahaan, onUpdate }) => {
    const inputId = useId();
    const [editing, setEditing] = useState(false);
    const [queryLokasi, setQueryLokasi] = useState('');
    const [titik, setTitik] = useState(null);
    const [hasil, setHasil] = useState([]);
    const [searching, setSearching] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [status, setStatus] = useState('');
    const [success, setSuccess] = useState('');
    const searchRef = useRef(null);
    const requestRef = useRef(0);

    const stopSearch = () => {
        requestRef.current += 1;
        searchRef.current?.abort();
        setSearching(false);
    };

    useEffect(() => () => {
        requestRef.current += 1;
        searchRef.current?.abort();
    }, []);

    const mulaiEdit = () => {
        const koordinat = getCompanyCoordinates(perusahaan);
        setQueryLokasi(koordinat ? `${koordinat.latitude}, ${koordinat.longitude}` : '');
        setTitik(koordinat ? { lat: koordinat.latitude, lng: koordinat.longitude } : null);
        setHasil([]);
        setError('');
        setSuccess('');
        setStatus('Cari tempat, masukkan koordinat, klik peta, atau geser pin. Perubahan pin tidak mengubah alamat pada profil.');
        setEditing(true);
    };

    const terapkanKoordinat = (value) => {
        const { isCoordinate, point } = parseLocationCoordinates(value);
        if (!isCoordinate) return false;

        setTitik(point);
        setHasil([]);
        setError(point ? '' : 'Koordinat harus berada dalam area pencarian Indramayu. Gunakan urutan latitude, longitude.');
        setStatus(point ? 'Pin dipindahkan ke koordinat tersebut. Periksa titiknya, lalu klik Simpan Lokasi.' : '');
        return true;
    };

    const ubahQueryLokasi = (value) => {
        stopSearch();
        setQueryLokasi(value);
        setTitik(null);
        setHasil([]);
        setError('');
        if (terapkanKoordinat(value)) return;
        setStatus('Cari atau pilih titik yang sesuai sebelum menyimpan. Teks pencarian ini tidak disimpan sebagai alamat kafe.');
    };

    const pilihTitik = (lat, lng) => {
        if (saving) return;
        stopSearch();
        setHasil([]);
        if (!isWithinIndramayuSearchArea({ lat, lng })) {
            setTitik(null);
            setError('Pilih titik dalam area pencarian Indramayu.');
            return;
        }
        setTitik({ lat, lng });
        setError('');
        setStatus('Pin dipilih. Klik Simpan Lokasi untuk menyimpan koordinat. Alamat profil tidak akan berubah.');
    };

    const pilihHasil = (lokasi) => {
        const lat = Number(lokasi.latitude);
        const lng = Number(lokasi.longitude);
        if (!isWithinIndramayuSearchArea({ lat, lng })) {
            setError('Hasil pencarian berada di luar area pencarian Indramayu.');
            return;
        }
        pilihTitik(lat, lng);
        setQueryLokasi(lokasi.nama === lokasi.alamat ? lokasi.nama : `${lokasi.nama}, ${lokasi.alamat}`);
    };

    const cariLokasi = async () => {
        if (saving || searching) return;
        stopSearch();
        const query = queryLokasi.trim();
        if (terapkanKoordinat(query)) return;
        if (query.length < 3 || query.length > 200) {
            setError('Gunakan nama kafe atau alamat sepanjang 3–200 karakter untuk pencarian.');
            return;
        }
        const controller = new AbortController();
        searchRef.current = controller;
        const request = requestRef.current;
        setSearching(true);
        setError('');
        setHasil([]);
        setStatus('Mencari lokasi di Indramayu...');
        try {
            const response = await api.get('/lokasi/cari', { params: { q: query }, signal: controller.signal });
            if (controller.signal.aborted || request !== requestRef.current) return;
            const results = response.data.data;
            if (!Array.isArray(results)) throw new Error('Invalid location response');
            if (results.length === 1) {
                pilihHasil(results[0]);
            } else {
                setHasil(results);
                setStatus(results.length
                    ? 'Pilih kafe atau alamat yang benar dari hasil pencarian.'
                    : 'Lokasi belum ditemukan. Lengkapi alamat atau klik peta untuk menentukan pin secara manual.');
            }
        } catch (err) {
            if (controller.signal.aborted || request !== requestRef.current) return;
            setStatus('');
            setError(err.response?.status === 429
                ? 'Pencarian terlalu sering. Tunggu sebentar sebelum mencoba lagi.'
                : 'Pencarian lokasi belum tersedia. Coba lagi atau pilih titik langsung di peta.');
        } finally {
            if (request === requestRef.current) setSearching(false);
        }
    };

    const simpanLokasi = async (event) => {
        event.preventDefault();
        if (saving || searching) return;
        if (!titik || !isWithinIndramayuSearchArea(titik)) {
            setError('Tentukan titik lokasi di area Indramayu sebelum menyimpan.');
            return;
        }
        setSaving(true);
        setError('');
        try {
            const response = await api.post('/admin/profil-perusahaan', {

                latitude: titik.lat,
                longitude: titik.lng,
            });
            if (response.data.status !== 'success' || !response.data.data) throw new Error('Invalid profile response');
            onUpdate(response.data.data);
            setEditing(false);
            setSuccess('Titik lokasi kafe berhasil diperbarui. Alamat profil tidak diubah.');
        } catch (err) {
            setError(err.response?.data?.message || 'Lokasi belum berhasil disimpan. Perubahan Anda tetap ada, silakan coba lagi.');
        } finally {
            setSaving(false);
        }
    };

    if (!editing) {
        return (
            <div className="w-full min-w-0">
                {success && <p role="status" className="mb-3 rounded-xl bg-green-50 p-4 font-poppins text-sm text-green-800">{success}</p>}
                {parseLocationCoordinates(perusahaan.alamat_perusahaan || '').isCoordinate && (
                    <p role="status" className="mb-3 rounded-xl bg-amber-50 p-4 font-poppins text-sm leading-relaxed text-amber-900">
                        Alamat lama masih berisi koordinat. Perbarui kolom Alamat pada form profil di atas dengan alamat lengkap kafe. Koordinat pin tetap tersimpan terpisah.
                    </p>
                )}
                <LokasiPerusahaan perusahaan={perusahaan} onEdit={mulaiEdit} />
            </div>
        );
    }

    const tersimpan = getCompanyCoordinates(perusahaan);
    const pusat = titik || (tersimpan ? { lat: tersimpan.latitude, lng: tersimpan.longitude } : PUSAT_INDRAMAYU);

    return (
        <section className="w-full min-w-0 rounded-2xl border border-[#4B2E2B]/15 bg-white p-4 sm:p-6">
            <h2 className="font-poppins font-semibold text-xl sm:text-2xl text-[#4B2E2B]">Edit Lokasi Kafe</h2>
            <form onSubmit={simpanLokasi} className="mt-4 flex flex-col gap-4">
                <div>
                    <label htmlFor={inputId} className="block mb-2 font-poppins text-sm font-semibold text-[#4B2E2B]">Cari Lokasi / Koordinat Peta</label>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input
                            id={inputId}
                            value={queryLokasi}
                            onChange={(event) => ubahQueryLokasi(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                    cariLokasi();
                                }
                            }}
                            disabled={saving}
                            placeholder="Alamat atau koordinat: -6.3274, 108.3249"
                            aria-describedby={`${inputId}-status`}
                            className="min-w-0 flex-1 rounded-xl border border-[#4B2E2B]/30 px-4 py-3 font-poppins text-sm text-[#4B2E2B] disabled:opacity-60"
                        />
                        <button type="button" onClick={cariLokasi} disabled={saving || searching} className="min-h-11 rounded-xl border border-[#4B2E2B]/20 px-4 py-2 font-poppins text-sm font-semibold text-[#4B2E2B] disabled:opacity-50 cursor-pointer">
                            {searching ? 'Mencari...' : 'Cari Lokasi'}
                        </button>
                    </div>
                    <p className="mt-2 font-poppins text-xs leading-relaxed text-[#4B2E2B]/70">Khusus menentukan pin peta, bukan alamat publik. Isi latitude, longitude (contoh: -6.3274, 108.3249) untuk memindahkan pin otomatis. Ubah alamat teks melalui form profil di atas.</p>
                    <p id={`${inputId}-status`} role="status" className="mt-2 font-poppins text-sm leading-relaxed text-[#4B2E2B]/80">{status}</p>
                    {error && <p role="alert" className="mt-2 font-poppins text-sm text-red-700">{error}</p>}
                    {hasil.length > 0 && (
                        <ul aria-label="Hasil pencarian lokasi" className="mt-3 overflow-hidden rounded-xl border border-[#4B2E2B]/20 divide-y divide-[#4B2E2B]/10">
                            {hasil.map((lokasi) => (
                                <li key={lokasi.id}>
                                    <button type="button" onClick={() => pilihHasil(lokasi)} disabled={saving} className="w-full px-4 py-3 text-left hover:bg-[#F3EDE6] cursor-pointer">
                                        <span className="block font-poppins text-sm font-semibold text-[#4B2E2B]">{lokasi.nama}</span>
                                        <span className="mt-1 block font-poppins text-xs text-[#4B2E2B]/80">{lokasi.alamat}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                    <p className="mt-2 font-poppins text-xs text-[#4B2E2B]/70">Data pencarian: © OpenStreetMap contributors (Photon)</p>
                </div>

                <div className="relative z-0 h-64 sm:h-80 w-full overflow-hidden rounded-xl border border-[#4B2E2B]/15">
                    <MapLokasi
                        latitude={pusat.lat}
                        longitude={pusat.lng}
                        height="100%"
                        zoom={titik || tersimpan ? 17 : 12}
                        showMarker={Boolean(titik)}
                        popupText={perusahaan.nama_perusahaan || 'Lokasi kafe'}
                        onLocationChange={saving ? undefined : pilihTitik}
                    />
                </div>
                {titik && <p className="font-poppins text-xs text-[#4B2E2B]/70">Koordinat pin: {titik.lat.toFixed(6)}, {titik.lng.toFixed(6)}</p>}
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                    <button type="button" disabled={saving} onClick={() => { stopSearch(); setEditing(false); }} className="min-h-11 rounded-xl border border-[#4B2E2B]/20 px-5 py-2.5 font-poppins text-sm font-semibold text-[#4B2E2B] disabled:opacity-50 cursor-pointer">Batal</button>
                    <button type="submit" disabled={saving || searching || !titik} className="min-h-11 rounded-xl bg-[#6B8E23] px-5 py-2.5 font-poppins text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">{saving ? 'Menyimpan...' : 'Simpan Lokasi'}</button>
                </div>
            </form>
        </section>
    );
};

export default LokasiProfilPerusahaan;
