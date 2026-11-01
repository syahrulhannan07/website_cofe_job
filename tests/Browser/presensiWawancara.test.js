import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { chromium, expect } from '@playwright/test';

let server;
let browser;
let baseURL;

const attendance = { id_presensi: 3, id_wawancara: 7, waktu_presensi: '2026-11-01T07:30:00+07:00', status_kehadiran: 'Hadir' };
const schedule = { id_wawancara: 7, tanggal: '2026-11-01T08:00:00+07:00', status_jadwal: 'Terjadwal', lokasi: 'Kafe Indramayu', presensi: null, can_presensi: true, alasan_presensi: null };

before(async () => {
    const entry = '/presensi-test-entry.jsx';
        const harness = {
            name: 'presensi-test-harness',
            resolveId(id) { if (id === entry) return entry; },
            load(id) {
                if (id !== entry) return;
                return `
                    import React from 'react';
                                        import '/resources/css/app.css';
                    import { createRoot } from 'react-dom/client';
                    import { MemoryRouter, Routes, Route } from 'react-router-dom';
                    import Detail from '/resources/js/src/halaman/status_lamaran/DetailStatusLamaran.jsx';
                    import Table from '/resources/js/src/admin-perusahaan/halaman/wawancara/komponen/WawancaraTable.jsx';
                                        import Scheduling from '/resources/js/src/admin-perusahaan/halaman/wawancara/index.jsx';
                    const table = new URLSearchParams(location.search).has('table');
                    const item = { id_wawancara: 7, tanggal_wawancara: '2026-11-01T08:00:00+07:00', status: 'Selesai', kandidat: {nama_lengkap: 'Pelamar Uji'}, lowongan: {posisi: 'Barista'}, presensi: ${JSON.stringify(attendance)} };
                    createRoot(document.getElementById('root')).render(new URLSearchParams(location.search).has('scheduling')
                                            ? React.createElement(MemoryRouter, null, React.createElement(Scheduling))
                                            : table
                        ? React.createElement(Table, { interviews: [item] })
                        : React.createElement(MemoryRouter, { initialEntries: ['/lamaran/5?action=open_modal_wawancara'] }, React.createElement(Routes, null, React.createElement(Route, { path: '/lamaran/:id', element: React.createElement(Detail) }))));
                `;
            },
        };
        server = await createServer({ configFile: false, plugins: [react(), tailwindcss(), harness], optimizeDeps: { include: ['react', 'react-dom/client', 'react-router-dom', 'framer-motion', 'axios'] }, appType: 'custom', server: { host: '127.0.0.1', port: 0 } });
    server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/attendance-test')) return next();
        const html = await server.transformIndexHtml(req.url, `<!doctype html><html lang="id"><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"></div><script type="module" src="${entry}"></script></body></html>`);
        res.setHeader('Content-Type', 'text/html');
        res.end(html);
    });
    await server.listen();
    baseURL = `http://127.0.0.1:${server.httpServer.address().port}`;
    browser = await chromium.launch({ headless: true, channel: existsSync('C:/Program Files/Google/Chrome/Application/chrome.exe') ? 'chrome' : undefined, args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
});

after(async () => {
    await browser?.close();
    await server?.close();
});

async function applicantPage(jadwal = schedule) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, permissions: ['camera'] });
    const page = await context.newPage();
        await page.route('https://**/*', route => route.abort());
    await page.route('**/resources/js/src/layanan/detektorWajah*', route => route.fulfill({
        contentType: 'application/javascript',
        body: 'export async function createFaceDetector() { return { detect() { return window.testFaceVisible ? [{boundingBox:{x:260,y:130,width:120,height:160}}] : []; }, close() {} }; }',
    }));
    await page.route('**/api/v1/**', route => {
        const path = new URL(route.request().url()).pathname;
        if (path.endsWith('/pelamar/lamaran/5/wawancara')) return route.fulfill({ json: { status: 'success', data: { ...jadwal, tanggal_wawancara: jadwal.tanggal, status: jadwal.status_jadwal } } });
        if (path.endsWith('/pelamar/lamaran/5')) return route.fulfill({ json: { status: 'success', data: {
            posisi: 'Barista', nama_kafe: 'Kafe Uji', nama_pelamar: 'Pelamar Uji', status_saat_ini: 'Wawancara', wawancara: jadwal,
            timeline: [{ status: 'Wawancara', waktu: '2026-11-01T07:00:00+07:00', keterangan: 'Jadwal wawancara telah dibuat.' }],
        } } });
        if (path.endsWith('/pelamar/profil')) return route.fulfill({ json: { status: 'success', data: { foto_profil: 'foto_profil/uji.jpg' } } });
        return route.fulfill({ status: 404, json: {} });
    });
    await page.goto(`${baseURL}/attendance-test`);
    await expect(page.getByRole('heading', { name: 'Detail Jadwal Wawancara' })).toBeVisible();
    return { context, page };
}

test('presensi mobile hanya memindai wajah dalam bingkai, gagal berhenti, ulang berhasil mencatat hadir', async () => {
    const { context, page } = await applicantPage();
    try {
        let requests = 0;
        await page.route('**/api/v1/pelamar/lamaran/5/konfirmasi-wawancara', async route => {
            requests++;
            const body = route.request().postDataJSON();
            assert.equal(body.id_wawancara, 7);
            assert.ok(body.image_base64.length > 100);
            await route.fulfill(requests === 1
                ? { status: 422, json: { status: 'error', confidence: 42, face_detected: true, message: 'Wajah tidak cocok.' } }
                : { json: { status: 'success', data: { presensi: attendance, status_jadwal: 'Selesai' } } });
        });
        await page.getByRole('button', { name: 'Presensi Wajah', exact: true }).click();
        await expect(page.getByText('Posisikan satu wajah di dalam bingkai', { exact: true })).toBeVisible();
        await page.waitForTimeout(1000);
        assert.equal(requests, 0, 'Tidak memindai tanpa wajah.');
        await page.evaluate(() => { window.testFaceVisible = true; });

        await expect(page.getByRole('button', { name: 'Verifikasi Ulang', exact: true })).toBeVisible();
        await page.waitForTimeout(1200);
        assert.equal(requests, 1, 'Kegagalan tidak memicu scan ulang otomatis.');
        await page.getByRole('button', { name: 'Verifikasi Ulang', exact: true }).click();
        await expect(page.getByText('Hadir · Identitas terverifikasi', { exact: true })).toBeVisible();
        await expect(page.getByText(/Perusahaan telah diberi tahu/)).toBeVisible();
                await expect(page.getByText('Selesai', { exact: true })).toBeVisible();
                await expect(page.getByText('Status jadwal otomatis ditandai Selesai setelah presensi berhasil.')).toBeVisible();
        assert.equal(requests, 2);
        assert.equal(await page.locator('video').count(), 0, 'Kamera dilepas setelah presensi berhasil.');
        await expect(page.getByRole('button', { name: 'Presensi Wajah', exact: true })).toHaveCount(0);
    } finally {
        await context.close();
    }
});

test('tanggal lain tidak membuka kamera dan presensi tersimpan tetap terlihat setelah muat ulang', async () => {
    const { context, page } = await applicantPage({ ...schedule, can_presensi: false, alasan_presensi: 'Presensi hanya tersedia pada tanggal wawancara.' });
    try {
        await page.getByRole('button', { name: 'Cek Ketersediaan Presensi' }).click();
        await expect(page.getByRole('alert')).toContainText('Presensi hanya tersedia pada tanggal wawancara.');
        assert.equal(await page.locator('video').count(), 0);
    } finally {
        await context.close();
    }
    const saved = await applicantPage({ ...schedule, status_jadwal: 'Selesai', presensi: attendance, can_presensi: false });
    try {
        await expect(saved.page.getByText('Hadir · Identitas terverifikasi', { exact: true })).toBeVisible();
        await expect(saved.page.getByRole('button', { name: 'Presensi Wajah', exact: true })).toHaveCount(0);
    } finally {
        await saved.context.close();
    }
});

test('form jadwal menampilkan alasan validasi dan berhasil dikirim setelah diperbaiki', async () => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, timezoneId: 'America/Los_Angeles' });
    const page = await context.newPage();
    try {
        await page.clock.setFixedTime(new Date('2026-11-01T17:30:00Z'));
        await page.route('https://**/*', route => route.abort());
        const dialogs = [];
        page.on('dialog', async dialog => { dialogs.push(dialog.message()); await dialog.dismiss(); });
        const message = 'Tanggal dan waktu wawancara harus setelah waktu sekarang. Pilih tanggal atau jam yang akan datang.';
        let submissions = 0;
        await page.route('**/api/v1/**', async route => {
            const path = new URL(route.request().url()).pathname;
            if (path.endsWith('/admin/dashboard')) return route.fulfill({ json: { data: { statistik: { total_pelamar: 1, lamaran_diterima: 1 } } } });
            if (path.endsWith('/admin/wawancara')) return route.fulfill({ json: { data: [] } });
            if (path.endsWith('/admin/lamaran/status/wawancara')) return route.fulfill({ json: { data: [{ id_lamaran: 5, pelamar: { nama_lengkap: 'Pelamar Uji' }, lowongan: { posisi: 'Barista' } }] } });
            if (path.endsWith('/admin/lamaran/5/wawancara')) {
                submissions++;
                const payload = route.request().postDataJSON();
                assert.equal(payload.lokasi, 'Kafe Indramayu');
                assert.equal('tanggal' in payload, false);
                assert.equal('waktu' in payload, false);
                assert.equal('tempat_link' in payload, false);
                assert.equal(payload.tanggal_wawancara, submissions === 1 ? '2020-01-01 10:30' : '2099-01-01 10:30');
                return route.fulfill(submissions === 1
                    ? { status: 422, json: { status: 'error', message, errors: { tanggal_wawancara: [message] } } }
                    : { status: 201, json: { status: 'success', data: { id_wawancara: 7 } } });
            }
            return route.fulfill({ status: 404, json: {} });
        });
        await page.goto(`${baseURL}/attendance-test?scheduling`);
        await page.getByRole('button', { name: /Jadwalkan Wawancara/ }).click();
        await page.locator('select').first().selectOption('5');
        await page.getByPlaceholder('Online / Alamat Kantor').fill('Kafe Indramayu');
        await expect(page.locator('input[type="date"]')).toHaveAttribute('min', '2026-11-02');
        await page.locator('input[type="date"]').fill('2020-01-01');
        await page.locator('input[type="time"]').fill('10:30');
        await page.getByRole('button', { name: /Kirim Undangan Wawancara/ }).click();
        await expect(page.getByRole('alert')).toHaveText(message);
        await expect(page.getByText(message, { exact: true })).toHaveCount(2);
        assert.equal(submissions, 1);
        assert.deepEqual(dialogs, []);
        await page.locator('input[type="date"]').fill('2099-01-01');
        await page.getByRole('button', { name: /Kirim Undangan Wawancara/ }).click();
        await expect(page.getByRole('heading', { name: 'Jadwal Wawancara Baru' })).toHaveCount(0);
        assert.equal(submissions, 2);
        assert.deepEqual(dialogs, ['Undangan wawancara berhasil dikirim!']);
    } finally {
        await context.close();
    }
});

test('perusahaan melihat status selesai otomatis tanpa perlu menekan tombol selesai', async () => {
    const page = await browser.newPage();
    try {
        await page.goto(`${baseURL}/attendance-test?table`);
        await expect(page.getByText('Hadir · Terverifikasi', { exact: true })).toBeVisible();
        await expect(page.getByText('Selesai', { exact: true })).toBeVisible();
        await expect(page.getByTitle('Tandai Selesai')).toHaveCount(0);
        await expect(page.getByTitle('Ubah Jadwal')).toHaveCount(0);
    } finally {
        await page.close();
    }
});
