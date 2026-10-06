import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../komponen/umum/Navbar';
import Footer from '../komponen/umum/Footer';
import FloatingChatbot from '../komponen/umum/FloatingChatbot';

const TataLetakUtama = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('peran');
        setIsLoggedIn(!!token);
        setUserRole(role);
    }, []);

    return (
        <div className="min-h-screen bg-[#F3EDE6] flex flex-col justify-between items-center overflow-x-hidden">
            <div className="w-full flex-1 flex flex-col items-center">
                <div id="app-navbar" className="w-full">
                    <Navbar />
                </div>
                {/* Outlet menampilkan halaman aktif sesuai rute */}
                <Outlet />
            </div>
            <div id="app-footer" className="w-full">
                <Footer />
            </div>
            {/* Floating Chatbot - only for logged-in pelamar on specific pages */}
            <FloatingChatbot isLoggedIn={isLoggedIn} userRole={userRole} />
        </div>
    );
};

export default TataLetakUtama;
