export const baseJobs = [
    { judul: 'Senior Barista', perusahaan: 'Indra Coffee Roasters', lokasi: 'Karangampel', gaji: 'IDR 3.5M - 4.5M' },
    { judul: 'Head Roaster', perusahaan: 'Mangga Dua Coffee Hub', lokasi: 'Jatibarang', gaji: 'IDR 5.0M - 7.0M' },
    { judul: 'Service Attendant', perusahaan: 'Cimanuk Brew House', lokasi: 'Indramayu Kota', gaji: 'IDR 1.8M - 2.2M' },
    { judul: 'Junior Barista', perusahaan: 'Ujung Kulon Cafe', lokasi: 'Sindang', gaji: 'IDR 2.5M - 3.0M' },
    { judul: 'Outlet Manager', perusahaan: 'Dermayu Beans & Co.', lokasi: 'Lohbener', gaji: 'IDR 4.5M - 6.0M' },
    { judul: 'Marketing Intern', perusahaan: 'Indra Coffee Roasters', lokasi: 'Karangampel', gaji: 'IDR 1.5M - 2.0M' }
];

export const daftarLowongan = Array.from({ length: 36 }, (_, i) => ({
    ...baseJobs[i % baseJobs.length],
    id: i + 1,
}));
