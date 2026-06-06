import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';

/**
 * Konfigurasi Firebase.
 * 
 * PENTING: Ganti nilai di bawah ini dengan kredensial Firebase Anda.
 * Anda bisa mendapatkan nilai-nilai ini dari Firebase Console:
 * https://console.firebase.google.com > Project Settings > General > Your apps > Web app
 * 
 * Idealnya, simpan di file .env:
 *   VITE_FIREBASE_API_KEY=...
 *   VITE_FIREBASE_AUTH_DOMAIN=...
 *   VITE_FIREBASE_PROJECT_ID=...
 *   dst.
 */
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'YOUR_API_KEY',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'YOUR_AUTH_DOMAIN',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'YOUR_STORAGE_BUCKET',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'YOUR_MESSAGING_SENDER_ID',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || 'YOUR_APP_ID',
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Inisialisasi Firebase Auth
const auth = getAuth(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

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
 * @param {string} email - Alamat email pengguna
 * @returns {Promise<void>}
 */
export const kirimEmailResetPassword = async (email) => {
    await sendPasswordResetEmail(auth, email);
};

export { auth, googleProvider };
export default app;
