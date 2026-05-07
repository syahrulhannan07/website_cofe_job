import React from 'react';
import { Outlet } from 'react-router-dom';
import Footer from '../komponen/umum/Footer';

const TataLetakFooterSahaja = () => {
    return (
        <div className="min-h-screen bg-[#F3EDE6] flex flex-col overflow-x-hidden">
            <div className="flex-grow">
                <Outlet />
            </div>
            <div className="w-full">
                <Footer />
            </div>
        </div>
    );
};

export default TataLetakFooterSahaja;
