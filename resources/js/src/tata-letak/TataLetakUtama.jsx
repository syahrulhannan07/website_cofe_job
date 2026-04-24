import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../komponen/umum/Navbar';
import Footer from '../komponen/umum/Footer';

const TataLetakUtama = () => {
    return (
        <div className="min-h-screen bg-[#F3EDE6] flex flex-col justify-between items-center overflow-x-hidden">
            <div className="w-full flex flex-col items-center">
                <div id="app-navbar" className="w-full">
                    <Navbar />
                </div>
                {/* Outlet menampilkan halaman aktif sesuai rute */}
                <Outlet />
            </div>
            <div id="app-footer" className="w-full">
                <Footer />
            </div>
        </div>
    );
};

export default TataLetakUtama;
