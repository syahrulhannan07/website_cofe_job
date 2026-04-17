import { useState } from 'react';

/**
 * Pengait untuk mengelola status autentikasi pengguna.
 * Akan dikembangkan lebih lanjut dengan integrasi Laravel Sanctum.
 */
const gunakanAutentikasi = () => {
    const [pengguna, setPengguna] = useState(null);
    const [sedangMemuat, setSedangMemuat] = useState(false);
    const [galat, setGalat] = useState(null);

    const sudahMasuk = Boolean(pengguna);

    return {
        pengguna,
        setPengguna,
        sedangMemuat,
        setSedangMemuat,
        galat,
        setGalat,
        sudahMasuk,
    };
};

export default gunakanAutentikasi;
