# Plan: Fix NIB Screening Issues (KBLI, nama usaha, nama pemilik, tanggal)

## Context
Backend extraction already works (KBLI detected, tanggal_diterbitkan extracted). Issues are:
1. Frontend KBLI scoring always 35 when found; should be 35 only for 56303/56304, <35 otherwise, 0 if not found.
2. nama_usaha regex uses `/s` (dotall) causing capture of numbered list text (extra '2.').
3. nama_pemilik_usaha not found should display '-' with status "Tidak Ditemukan" (already mostly, ensure).
4. Frontend needs rebuild after JSX change.

## Files to change
1. `app/Services/Nib/NibDataExtractorService.php` — fix extractNamaUsaha regex (remove dotall, allow indented continuation only).
2. `resources/js/src/super-admin/halaman/verifikasi/DetailVerifikasi.jsx` — KBLI scoring based on kbli_status/kbli_kode_sesuai; display '-' for missing values.

## Backend change detail
- In `extractNamaUsaha`: change pattern `(.+?)` → `([A-Z][^\n]*(?:\n[ \t]+[A-Z][^\n]*)?)`, modifiers `/is` → `/i`. This prevents capturing numbered list lines.
- Same for `extractNamaPemilikUsaha` if needed (already requires colon; change `.+?` → `[^\n]+`).

## Frontend change detail
- KBLI block: if kbli_status === 'SESUAI' and kodeSesuai non-empty → 35 pts, message "KBLI sesuai: <codes>". Else if found → 10 pts, message "KBLI ditemukan, namun tidak sesuai dengan 56303 atau 56304." (no full code list). Else 0.
- Table display: use '-' instead of '—' for null normalized_value.

## Verification
- Re-run extraction test on nib-pengujian.pdf to confirm nama_usaha has no '2.'.
- Rebuild frontend (npm run build).
- Re-screen a NIB and verify UI shows correct KBLI score and messages.

## Out of scope
- No DB schema changes.
- No new dependencies.
EOF