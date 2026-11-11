import os
import qrcode
from PIL import Image
import fitz  # PyMuPDF

FIXTURE_DIR = os.path.dirname(__file__)
os.makedirs(FIXTURE_DIR, exist_ok=True)

# ---- 1. QR PNG with text content ----
qr = qrcode.QRCode(version=1, error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=10, border=4)
qr.add_data('NIB 1234567890123')
qr.make(fit=True)
img = qr.make_image(fill_color='black', back_color='white')
img = img.convert('RGB')
img.save(os.path.join(FIXTURE_DIR, 'qr_text.png'))

# ---- 2. QR JPEG with text content ----
qr2 = qrcode.QRCode(version=1, error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=10, border=4)
qr2.add_data('NIB 1234567890123')
qr2.make(fit=True)
img2 = qr2.make_image(fill_color='black', back_color='white').convert('RGB')
img2.save(os.path.join(FIXTURE_DIR, 'qr_text.jpeg'), format='JPEG', quality=90)

# ---- 3. QR PNG with URL content ----
qr3 = qrcode.QRCode(version=1, error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=10, border=4)
qr3.add_data('https://oss.example.com/verify/nib/1234567890123')
qr3.make(fit=True)
img3 = qr3.make_image(fill_color='black', back_color='white').convert('RGB')
img3.save(os.path.join(FIXTURE_DIR, 'qr_url.png'))

# ---- 4. Plain PNG without QR (just colored rectangle) ----
plain = Image.new('RGB', (400, 400), color='white')
plain.save(os.path.join(FIXTURE_DIR, 'no_qr.png'))

# ---- 5. Corrupt PNG file (valid PNG header, garbage body) ----
with open(os.path.join(FIXTURE_DIR, 'corrupt_png.png'), 'wb') as f:
    f.write(b'\x89PNG\r\n\x1a\n' + b'garbage garbage garbage not a real png')

# ---- 6. Corrupt image file (not a valid image at all) ----
with open(os.path.join(FIXTURE_DIR, 'corrupt.bin'), 'wb') as f:
    f.write(b'this is not a valid image file at all')

# ---- 6. PDF with QR on page 1 ----
doc = fitz.open()
page = doc.new_page()
rect = fitz.Rect(50, 50, 250, 250)
page.insert_image(rect, filename=os.path.join(FIXTURE_DIR, 'qr_text.png'))
doc.save(os.path.join(FIXTURE_DIR, 'qr_page1.pdf'))
doc.close()

# ---- 7. PDF with QR on page 2 (page 1 plain text, no QR) ----
doc = fitz.open()
page1 = doc.new_page()
page1.insert_text((50, 50), 'Halaman 1 - tidak ada QR di sini', fontsize=12)
page2 = doc.new_page()
rect2 = fitz.Rect(50, 50, 250, 250)
page2.insert_image(rect2, filename=os.path.join(FIXTURE_DIR, 'qr_text.png'))
doc.save(os.path.join(FIXTURE_DIR, 'qr_page2.pdf'))
doc.close()

# ---- 8. Multipage PDF (3 pages), QR on page 2 ----
doc = fitz.open()
for i in range(3):
    page = doc.new_page()
    page.insert_text((50, 50), f'Halaman {i+1}', fontsize=12)
    if i == 1:  # QR on page 2
        rect = fitz.Rect(50, 100, 250, 300)
        page.insert_image(rect, filename=os.path.join(FIXTURE_DIR, 'qr_text.png'))
doc.save(os.path.join(FIXTURE_DIR, 'qr_multipage.pdf'))
doc.close()

# ---- 9. Multipage PDF without any QR ----
doc = fitz.open()
for i in range(2):
    page = doc.new_page()
    page.insert_text((50, 50), f'Halaman {i+1} - tanpa QR', fontsize=12)
doc.save(os.path.join(FIXTURE_DIR, 'no_qr_multipage.pdf'))
doc.close()

print('QR fixtures generated in', FIXTURE_DIR)
for fn in sorted(os.listdir(FIXTURE_DIR)):
    if fn != 'generate.php' and fn != 'generate_scanned.php':
        print(' -', fn)
