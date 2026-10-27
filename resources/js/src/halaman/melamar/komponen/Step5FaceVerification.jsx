import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import iconCheck from '../../../aset/melamar/cirkelcek.svg';
import iconKembali from '../../../aset/melamar/iconkembali.svg';
import iconSent from '../../../aset/melamar/Sent.png';
import layananLamaran from '../../../layanan/layananLamaran';

const iconCamera = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="%234B2E2B"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>`;
const iconRefresh = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="%234B2E2B"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>`;
const iconClose = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="%234B2E2B"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" /></svg>`;

const SENSOR_STATES = {
    ALIGNING: 'aligning',
    SCANNING: 'scanning',
    MATCHED: 'matched',
    MISMATCH: 'mismatch',
};

const FaceOval = ({ className = '', state = SENSOR_STATES.ALIGNING }) => {
    let strokeColor = '#6B8E23';
    if (state === SENSOR_STATES.MATCHED) strokeColor = '#22C55E';
    else if (state === SENSOR_STATES.MISMATCH) strokeColor = '#EF4444';
    else if (state === SENSOR_STATES.SCANNING) strokeColor = '#EAB308';

    return (
        <svg viewBox="0 0 280 360" className={`w-full h-full ${className}`} preserveAspectRatio="none">
            <defs>
                <mask id="faceMask">
                    <rect x="0" y="0" width="280" height="360" fill="white" />
                    <ellipse cx="140" cy="165" rx="95" ry="125" fill="black" />
                </mask>
                <filter id="glowGreen" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>
            <rect x="0" y="0" width="280" height="360" fill="rgba(0,0,0,0.45)" mask="url(#faceMask)" />
            <ellipse
                cx="140"
                cy="165"
                rx="95"
                ry="125"
                fill="none"
                stroke={strokeColor}
                strokeWidth={state === SENSOR_STATES.MATCHED ? "4" : "3"}
                strokeDasharray={state === SENSOR_STATES.MATCHED ? "none" : state === SENSOR_STATES.SCANNING ? "8,4" : "12,6"}
                className={state === SENSOR_STATES.ALIGNING ? 'animate-pulse' : ''}
                filter={state === SENSOR_STATES.MATCHED ? "url(#glowGreen)" : undefined}
            />
        </svg>
    );
};

const Step5FaceVerification = ({
    onKirimLamaran,
    onVerifiedResult,
    onBack,
    profilePhoto,
    idLamaran,
    sedangMengirim = false
}) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    const [stream, setStream] = useState(null);
    const [cameraReady, setCameraReady] = useState(false);
    const [cameraError, setCameraError] = useState('');
    const [sensorState, setSensorState] = useState(SENSOR_STATES.ALIGNING);
    const [scanResult, setScanResult] = useState(null);
    const [retryCountdown, setRetryCountdown] = useState(3);
    const [scanCount, setScanCount] = useState(0);
    const [showProfilePreview, setShowProfilePreview] = useState(false);

    // Inisiasi kamera
    const startCamera = useCallback(async () => {
        setCameraError('');
        setCameraReady(false);
        setSensorState(SENSOR_STATES.ALIGNING);

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                setCameraError('Browser Anda tidak mendukung akses kamera. Silakan gunakan Google Chrome atau browser modern lainnya.');
                return;
            }

            let mediaStream = null;
            try {
                mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: 'user',
                        width: { ideal: 640 },
                        height: { ideal: 480 }
                    },
                    audio: false
                });
            } catch (constraintErr) {
                console.warn('Fallback ke konfigurasi kamera dasar:', constraintErr);
                mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: false
                });
            }

            streamRef.current = mediaStream;
            setStream(mediaStream);
            setCameraError('');
        } catch (err) {
            console.error('Camera access error:', err);
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setCameraError('Izin akses kamera ditolak. Harap izinkan akses kamera di ikon gembok browser Anda lalu klik "Coba Akses Kamera Lagi".');
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                setCameraError('Perangkat webcam tidak ditemukan pada laptop/komputer Anda.');
            } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                setCameraError('Kamera sedang digunakan aplikasi lain (misal Zoom atau Google Meet). Tutup aplikasi tersebut dan coba lagi.');
            } else {
                setCameraError('Gagal mengakses kamera: ' + (err.message || 'Pastikan izin kamera diaktifkan.'));
            }
        }
    }, []);

    // Jalankan inisiasi kamera saat pertama kali mount
    useEffect(() => {
        startCamera();

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
        };
    }, [startCamera]);

    // Hubungkan stream ke video element
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !stream) return;

        video.srcObject = stream;

        const handleCanPlay = () => {
            setCameraReady(true);
        };

        video.addEventListener('canplay', handleCanPlay);
        video.play().catch(err => {
            console.warn('Autoplay dicegah oleh browser:', err);
        });

        return () => {
            video.removeEventListener('canplay', handleCanPlay);
        };
    }, [stream]);

    // Tangkap frame gambar saat ini
    const captureFrame = useCallback(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!video || !canvas || video.readyState < 2 || !video.videoWidth) {
            return null;
        }

        const width = video.videoWidth || 640;
        const height = video.videoHeight || 480;
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        return dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
    }, []);

    // Deteksi wajah via Shape Detection API jika didukung browser
    const detectFaceInVideo = useCallback(async () => {
        if (!('FaceDetector' in window) || !videoRef.current || videoRef.current.readyState < 2) {
            return false;
        }
        try {
            const faceDetector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
            const faces = await faceDetector.detect(videoRef.current);
            return faces && faces.length > 0;
        } catch (e) {
            return false;
        }
    }, []);

    // Eksekusi pemindaian dan verifikasi wajah
    const executeAutoScan = useCallback(async () => {
        if (sensorState === SENSOR_STATES.MATCHED || sedangMengirim) return;

        const base64Image = captureFrame();
        if (!base64Image) {
            setSensorState(SENSOR_STATES.ALIGNING);
            return;
        }

        setSensorState(SENSOR_STATES.SCANNING);

        try {
            const response = await layananLamaran.verifikasiWajah(idLamaran, base64Image);
            const isMatch = response.status === 'success';

            setScanResult({
                success: isMatch,
                message: response.message || 'Verifikasi wajah berhasil.',
                confidence: response.confidence,
                threshold: response.threshold,
                face_detected: response.face_detected
            });
            setScanCount(prev => prev + 1);

            if (isMatch) {
                setSensorState(SENSOR_STATES.MATCHED);
                if (onVerifiedResult) {
                    onVerifiedResult(true);
                }
            } else {
                setSensorState(SENSOR_STATES.MISMATCH);
                setRetryCountdown(3);
                if (onVerifiedResult) {
                    onVerifiedResult(false);
                }
            }
        } catch (err) {
            console.error('Face verification error:', err);
            const data = err.response?.data;
            const message = data?.message || 'Terjadi kesalahan saat memverifikasi wajah.';
            const faceDetected = data?.face_detected ?? false;
            const confidence = data?.confidence ?? null;
            const threshold = data?.threshold ?? null;

            setScanResult({
                success: false,
                message,
                confidence,
                threshold,
                face_detected: faceDetected
            });
            setScanCount(prev => prev + 1);
            setSensorState(SENSOR_STATES.MISMATCH);
            setRetryCountdown(3);
            if (onVerifiedResult) {
                onVerifiedResult(false);
            }
        }
    }, [captureFrame, sensorState, sedangMengirim, idLamaran, onVerifiedResult]);

    // Siklus Pemindaian Otomatis (Auto-Scan)
    useEffect(() => {
        if (!cameraReady || sensorState === SENSOR_STATES.MATCHED || sedangMengirim) {
            return;
        }

        let isMounted = true;
        let timer = null;

        if (sensorState === SENSOR_STATES.ALIGNING) {
            // Jika browser mendukung FaceDetector, pantau posisi wajah
            if ('FaceDetector' in window) {
                const interval = setInterval(async () => {
                    const hasFace = await detectFaceInVideo();
                    if (hasFace && isMounted) {
                        clearInterval(interval);
                        executeAutoScan();
                    }
                }, 400);

                // Batas maksimal fallback 3 detik
                timer = setTimeout(() => {
                    clearInterval(interval);
                    if (isMounted) executeAutoScan();
                }, 3000);

                return () => {
                    clearInterval(interval);
                    if (timer) clearTimeout(timer);
                };
            } else {
                // Auto-scan setelah pelamar mengarahkan wajah ke oval (1.8 detik stabilisasi)
                timer = setTimeout(() => {
                    if (isMounted) {
                        executeAutoScan();
                    }
                }, 1800);

                return () => {
                    if (timer) clearTimeout(timer);
                };
            }
        } else if (sensorState === SENSOR_STATES.MISMATCH) {
            if (retryCountdown > 0) {
                timer = setTimeout(() => {
                    if (isMounted) {
                        setRetryCountdown(prev => prev - 1);
                    }
                }, 1000);

                return () => {
                    if (timer) clearTimeout(timer);
                };
            } else {
                // Countdown selesai, ulangi pemindaian otomatis
                executeAutoScan();
            }
        }
    }, [cameraReady, sensorState, retryCountdown, sedangMengirim, detectFaceInVideo, executeAutoScan]);

    const handleManualRetry = () => {
        setRetryCountdown(0);
        executeAutoScan();
    };

    const handleToggleProfilePreview = () => {
        setShowProfilePreview(prev => !prev);
    };

    return (
        <div className="pembungkus-verifikasi-wajah w-full flex flex-col gap-6">
            {/* Header */}
            <div className="w-full bg-[#6B8E23] rounded-2xl px-6 py-6 shadow-sm">
                <h2 className="font-poppins font-semibold text-2xl text-white leading-tight">
                    Verifikasi Identitas
                </h2>
                <p className="font-poppins font-medium text-[15px] text-white/90 mt-2 leading-relaxed max-w-3xl">
                    Harap lakukan verifikasi identitas melalui pemindaian wajah Anda untuk memastikan validitas data lamaran.
                    Pastikan wajah Anda terlihat jelas di area kamera sebelum memulai proses verifikasi.
                </p>
            </div>

            {/* Tombol Lihat Foto Profil Referensi */}
            {profilePhoto && (
                <div className="flex justify-center">
                    <button
                        type="button"
                        onClick={handleToggleProfilePreview}
                        className="flex items-center gap-2 px-4 py-2 bg-[#F5F1EA] border border-[#4B2E2B]/15 rounded-full text-[#4B2E2B] font-poppins font-medium text-[13px] hover:bg-[#EAE4DC] transition-colors shadow-sm cursor-pointer active:scale-95"
                    >
                        <svg className="w-4 h-4 text-[#4B2E2B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>{showProfilePreview ? 'Sembunyikan Foto Profil Referensi' : 'Lihat Foto Profil Referensi'}</span>
                    </button>
                </div>
            )}

            {/* Modal Foto Profil Referensi */}
            {showProfilePreview && profilePhoto && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                    onClick={handleToggleProfilePreview}
                    role="dialog"
                    aria-modal="true"
                >
                    <div
                        className="relative max-w-sm w-full bg-white rounded-2xl overflow-hidden shadow-2xl border border-[#EAE4DC]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-4 border-b border-[#EAE4DC] flex items-center justify-between bg-[#F8F5F0]">
                            <h3 className="font-poppins font-bold text-base text-[#4B2E2B]">Foto Profil Referensi</h3>
                            <button
                                onClick={handleToggleProfilePreview}
                                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors cursor-pointer"
                                aria-label="Tutup"
                            >
                                <img src={iconClose} alt="close" className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-5 flex flex-col items-center">
                            <img
                                src={profilePhoto.startsWith('http') ? profilePhoto : `/storage/${profilePhoto}`}
                                alt="Foto profil referensi"
                                className="w-48 h-48 rounded-xl object-cover shadow-md border-2 border-[#4B2E2B]/10"
                            />
                            <p className="font-poppins text-[13px] text-[#827470] text-center mt-3 leading-relaxed">
                                Foto profil akun ini digunakan sebagai tolak ukur pencocokan biometrik wajah Anda.
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Area Kamera Sensor Wajah */}
            <div className="relative flex flex-col items-center gap-5">
                <div className="relative w-full max-w-sm aspect-[280/360] bg-black rounded-2xl overflow-hidden shadow-xl border-2 border-[#4B2E2B]/10">
                    {/* Video Stream */}
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover transition-opacity duration-300 ${cameraReady ? 'opacity-100' : 'opacity-0'}`}
                        style={{ transform: 'scaleX(-1)' }}
                    />

                    {/* Hidden Canvas */}
                    <canvas ref={canvasRef} style={{ display: 'none' }} />

                    {/* Sensor Oval & Efek Biometrik */}
                    {cameraReady && (
                        <FaceOval
                            className="absolute inset-0 pointer-events-none"
                            state={sensorState}
                        />
                    )}

                    {/* Laser Scanner Beam (aktif saat SCANNING) */}
                    {cameraReady && sensorState === SENSOR_STATES.SCANNING && (
                        <motion.div
                            className="absolute left-10 right-10 h-1 bg-gradient-to-r from-transparent via-[#EAB308] to-transparent shadow-[0_0_15px_#EAB308] pointer-events-none"
                            initial={{ top: '20%' }}
                            animate={{ top: '80%' }}
                            transition={{
                                duration: 1.0,
                                repeat: Infinity,
                                repeatType: 'reverse',
                                ease: 'easeInOut'
                            }}
                        />
                    )}

                    {/* Status Badge di dalam area Sensor */}
                    {cameraReady && (
                        <div className="absolute top-4 inset-x-0 flex justify-center pointer-events-none px-4">
                            <div className={`px-3.5 py-1.5 rounded-full backdrop-blur-md text-[12px] font-poppins font-semibold shadow-md flex items-center gap-2 ${sensorState === SENSOR_STATES.MATCHED
                                ? 'bg-green-600/90 text-white border border-green-400'
                                : sensorState === SENSOR_STATES.SCANNING
                                    ? 'bg-amber-600/90 text-white border border-amber-400'
                                    : sensorState === SENSOR_STATES.MISMATCH
                                        ? 'bg-red-600/90 text-white border border-red-400'
                                        : 'bg-black/60 text-white border border-white/20'
                                }`}>
                                {sensorState === SENSOR_STATES.MATCHED ? (
                                    <>
                                        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                                        <span>Wajah Terverifikasi Cocok</span>
                                    </>
                                ) : sensorState === SENSOR_STATES.SCANNING ? (
                                    <>
                                        <svg className="animate-spin w-3.5 h-3.5 text-white" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        <span>Memproses Sensor Wajah...</span>
                                    </>
                                ) : sensorState === SENSOR_STATES.MISMATCH ? (
                                    <>
                                        <span>⚠️ Belum Cocok — Pindai Ulang ({retryCountdown}s)</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="w-2 h-2 rounded-full bg-[#6B8E23] animate-pulse" />
                                        <span>Arahkan Wajah ke Dalam Lingkaran</span>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Checkmark Badge saat MATCHED */}
                    {sensorState === SENSOR_STATES.MATCHED && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', damping: 15 }}
                            className="absolute bottom-5 inset-x-0 flex justify-center pointer-events-none"
                        >
                            <div className="flex items-center gap-2 bg-[#6B8E23] text-white px-4 py-1.5 rounded-full shadow-lg border-2 border-white font-poppins font-bold text-[13px]">
                                <img src={iconCheck} alt="verified" className="w-4 h-4" />
                                <span>Identitas Sesuai</span>
                            </div>
                        </motion.div>
                    )}

                    {/* Sudut Pemandu */}
                    {cameraReady && (
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute top-4 left-4 w-9 h-9 border-t-4 border-l-4 border-[#6B8E23] rounded-tl-xl" />
                            <div className="absolute top-4 right-4 w-9 h-9 border-t-4 border-r-4 border-[#6B8E23] rounded-tr-xl" />
                            <div className="absolute bottom-4 left-4 w-9 h-9 border-b-4 border-l-4 border-[#6B8E23] rounded-bl-xl" />
                            <div className="absolute bottom-4 right-4 w-9 h-9 border-b-4 border-r-4 border-[#6B8E23] rounded-br-xl" />
                        </div>
                    )}

                    {/* Fallback & Loading Layar Kamera */}
                    {!cameraReady && (
                        <div className="absolute inset-0 bg-[#F5F1EA] flex flex-col items-center justify-center p-6 text-center">
                            {cameraError ? (
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center text-red-500 text-2xl shadow-sm">
                                        ⚠️
                                    </div>
                                    <p className="font-poppins font-semibold text-[14px] text-red-600 px-2 leading-relaxed">
                                        {cameraError}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={startCamera}
                                        className="mt-2 flex items-center gap-2 px-4 py-2 bg-[#4B2E2B] text-white rounded-full font-poppins font-medium text-[13px] hover:bg-[#3d2523] transition-all shadow-md active:scale-95 cursor-pointer"
                                    >
                                        <img src={iconRefresh} alt="refresh" className="w-4 h-4 invert" />
                                        Coba Akses Kamera Lagi
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-14 h-14 bg-[#4B2E2B]/10 rounded-full flex items-center justify-center animate-pulse">
                                        <img src={iconCamera} alt="camera" className="w-7 h-7 text-[#4B2E2B]" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <svg className="animate-spin w-4 h-4 text-[#4B2E2B]" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        <p className="font-poppins font-medium text-[14px] text-[#4B2E2B]">Mengaktifkan sensor kamera...</p>
                                    </div>
                                    <span className="font-poppins text-[12px] text-[#827470]">Pastikan Anda telah mengizinkan akses kamera</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Notifikasi Hasil Pemindaian */}
                <AnimatePresence>
                    {scanResult && (
                        <motion.div
                            key={scanCount}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={`w-full max-w-sm rounded-xl p-4 border-2 text-center shadow-sm ${scanResult.success
                                ? 'bg-green-50 border-green-300 text-green-900'
                                : scanResult.face_detected === false
                                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                                    : 'bg-red-50 border-red-300 text-red-900'
                                }`}
                            role="alert"
                            aria-live="polite"
                        >
                            <div className="flex items-center justify-center gap-2 mb-1.5">
                                {scanResult.success ? (
                                    <div className="w-7 h-7 bg-green-200 rounded-full flex items-center justify-center">
                                        <img src={iconCheck} alt="success" className="w-4 h-4 text-green-700" />
                                    </div>
                                ) : (
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center ${scanResult.face_detected === false ? 'bg-amber-200 text-amber-800' : 'bg-red-200 text-red-800'}`}>
                                        ⚠️
                                    </div>
                                )}
                                <span className="font-poppins font-bold text-[15px]">
                                    {scanResult.success ? 'Wajah Cocok dengan Foto Profil!' : 'Verifikasi Wajah Belum Cocok'}
                                </span>
                            </div>

                            <p className="font-poppins text-[13px] leading-relaxed">
                                {scanResult.message}
                            </p>

                            {/* Tingkat Kemiripan vs Ambang Batas */}
                            {scanResult.confidence !== null && scanResult.confidence !== undefined && (
                                <div className="mt-2.5 py-1.5 px-3 bg-white/80 rounded-lg inline-flex items-center justify-center gap-3 border border-black/5">
                                    <span className="font-poppins text-[12px] text-[#4B2E2B]/90 font-medium">
                                        Tingkat Kemiripan: <strong className={scanResult.success ? 'text-green-700' : 'text-red-700'}>{Number(scanResult.confidence).toFixed(1)}%</strong>
                                    </span>
                                    {scanResult.threshold && (
                                        <span className="font-poppins text-[12px] text-[#4B2E2B]/60">
                                            (Syarat minimal: {Number(scanResult.threshold).toFixed(1)}%)
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Jika Belum Cocok: Tombol Pindai Ulang */}
                            {!scanResult.success && (
                                <div className="mt-3 flex flex-col items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handleManualRetry}
                                        className="flex items-center gap-2 px-5 py-2 bg-white border border-[#4B2E2B]/20 text-[#4B2E2B] rounded-full font-poppins font-semibold text-[13px] hover:bg-[#4B2E2B] hover:text-white transition-all shadow-sm active:scale-95 cursor-pointer"
                                    >
                                        <img src={iconRefresh} alt="retry" className="w-3.5 h-3.5" />
                                        <span>Pindai Ulang Sekarang</span>
                                    </button>
                                    <span className="font-poppins text-[11.5px] text-[#4B2E2B]/70">
                                        Memindai ulang otomatis dalam <strong>{retryCountdown}</strong> detik...
                                    </span>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Tombol Utama: JIKA COCOK BISA KLIK KIRIM LAMARAN */}
                <div className="flex flex-col items-center gap-3 w-full max-w-sm">
                    {sensorState === SENSOR_STATES.MATCHED ? (
                        <button
                            type="button"
                            onClick={onKirimLamaran}
                            disabled={sedangMengirim}
                            className="w-full flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-poppins font-bold text-[16px] bg-[#6B8E23] text-white hover:bg-[#59781d] active:scale-[0.98] transition-all shadow-lg shadow-green-600/30 cursor-pointer"
                        >
                            {sedangMengirim ? (
                                <>
                                    <svg className="animate-spin w-5 h-5 text-white" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    <span>Mengirimkan Lamaran...</span>
                                </>
                            ) : (
                                <>
                                    <span>Kirim Lamaran Sekarang</span>
                                    <img src={iconSent} alt="sent" className="w-5 h-5 object-contain" />
                                </>
                            )}
                        </button>
                    ) : (
                        <div className="w-full py-3 px-4 bg-[#F5F1EA] border border-[#4B2E2B]/10 rounded-xl text-center">
                            <p className="font-poppins font-medium text-[13px] text-[#4B2E2B]/80 flex items-center justify-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                <span>Arahkan wajah ke sensor. Tombol <strong>Kirim Lamaran</strong> akan aktif otomatis saat wajah cocok.</span>
                            </p>
                        </div>
                    )}
                </div>

                {/* Petunjuk Penggunaan */}
                <div className="w-full max-w-sm">
                    <div className="bg-white rounded-xl border border-[#EAE4DC] p-4 shadow-sm">
                        <h4 className="font-poppins font-bold text-[13.5px] text-[#4B2E2B] mb-2 flex items-center gap-2">
                            <span className="w-5 h-5 bg-[#6B8E23]/10 rounded-full flex items-center justify-center text-[#6B8E23] text-xs">
                                💡
                            </span>
                            Petunjuk Sensor Wajah
                        </h4>
                        <ul className="space-y-1.5 font-poppins text-[12px] text-[#4B2E2B]/80">
                            <li className="flex items-start gap-1.5">
                                <span className="text-[#6B8E23] font-bold">✓</span>
                                <span>Posisikan wajah tepat di dalam sensor bulat/oval</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                                <span className="text-[#6B8E23] font-bold">✓</span>
                                <span>Sensor akan memindai secara otomatis tanpa perlu menekan tombol</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                                <span className="text-[#6B8E23] font-bold">✓</span>
                                <span>Setelah sensor cocok dengan foto profil, klik tombol <strong>Kirim Lamaran</strong></span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Tombol Navigasi Kembali */}
            <div className="flex items-center justify-end gap-3 mt-2 pt-4 border-t border-[#EAE4DC]">
                <button
                    type="button"
                    onClick={onBack}
                    disabled={sedangMengirim}
                    className="flex items-center gap-2 px-4 py-2.5 border-2 border-[#4B2E2B]/10 bg-[#F5F1EA] text-[#4B2E2B] rounded-lg font-poppins font-semibold text-[14px] hover:bg-[#4B2E2B] hover:text-white transition-all duration-300 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                    <img src={iconKembali} alt="back" className="w-4 h-4" />
                    Kembali
                </button>
            </div>
        </div>
    );
};

export default Step5FaceVerification;