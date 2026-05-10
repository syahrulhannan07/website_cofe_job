import React from 'react';
import Navbar from '../../komponen/umum/Navbar';
import Footer from '../../komponen/umum/Footer';

const Melamar = () => {
    return (
        <div className="min-h-screen bg-[#F3EDE6] font-poppins flex flex-col">
            <Navbar />
            <div className="flex-1 flex flex-col items-center justify-center p-10">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-[#4B2E2B] mb-4">Halaman Melamar</h1>
                    <p className="text-lg text-[#C69C6D]">Sedang dalam tahap pengembangan.</p>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Melamar;
