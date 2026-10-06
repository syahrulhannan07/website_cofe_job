import { initializeApp } from 'firebase/app';
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail,
    verifyPasswordResetCode,
    confirmPasswordReset,
} from 'firebase/auth';

/**
 * Konfigurasi Firebase.
 * 
 * PENTING: Ganti nilai di bawah ini dengan kredensial Firebase Anda.
 * Anda bisa mendapatkan nilai-nilai ini dari Firebase Console:
 * https://console.firebase.google.com > Project Settings > General > Your apps > Web app
 * 
 * Simpan di file .env:
 *   VITE_FIREBASE_API_KEY=...
 *   VITE_FIREBASE_AUTH_DOMAIN=...
 *   VITE_FIREBASE_PROJECT_ID=...
 *   dst.
 * 
 * JANGAN commit file .env ke git! Gunakan .env.example sebagai template.
 */
const requiredEnvVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
];

const missingVars = requiredEnvVars.filter(key => !import.meta.env[key]);

if (missingVars.length > 0) {
    console.error(
        '[Firebase] Missing required environment variables:',
        missingVars.join(', '),
        '\nPlease check your .env file and ensure all VITE_FIREBASE_* variables are set.',
        '\nSee .env.example for reference.'
    );
}

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Inisialisasi Firebase Auth
const auth = getAuth(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Add custom parameters for better UX
googleProvider.setCustomParameters({
    prompt: 'select_account',
});

/**
 * Login/Daftar menggunakan Google melalui popup.
 * @returns {Promise<import('firebase/auth').UserCredential>}
 */
export const masukDenganGoogle = async () => {
    const hasil = await signInWithPopup(auth, googleProvider);
    return hasil;
};

/**
 * Kirim email reset password melalui Firebase.
 * Link email akan mengarah langsung ke halaman /atur-ulang-sandi di aplikasi kita.
 * @param {string} email - Alamat email pengguna
 * @returns {Promise<void>}
 */
export const kirimEmailResetPassword = async (email) => {
    const actionCodeSettings = {
        // Setelah reset berhasil, pengguna akan diarahkan kembali ke halaman login
        url: `${window.location.origin}/atur-ulang-sandi`,
        handleCodeInApp: true,
    };
    await sendPasswordResetEmail(auth, email, actionCodeSettings);
};

/**
 * Verifikasi kode reset password (oobCode) dari email.
 * @param {string} oobCode - Kode aksi dari URL email
 * @returns {Promise<string>} - Email yang terkait dengan kode reset
 */
export const verifikasiKodeReset = async (oobCode) => {
    return await verifyPasswordResetCode(auth, oobCode);
};

/**
 * Konfirmasi reset password dengan kata sandi baru.
 * @param {string} oobCode - Kode aksi dari URL email
 * @param {string} passwordBaru - Kata sandi baru
 * @returns {Promise<void>}
 */
export const konfirmasiResetPassword = async (oobCode, passwordBaru) => {
    await confirmPasswordReset(auth, oobCode, passwordBaru);
};

export { auth, googleProvider };
export default app;
