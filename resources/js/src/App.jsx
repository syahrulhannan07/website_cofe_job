import React from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-[#F3EDE6] text-cafe-dark flex flex-col justify-between">
      <div>
         <Navbar />
         <HeroSection />
         <div className="text-center mt-20 min-h-[50vh]">
            <h1 className="text-3xl font-bold mb-4">Halaman Beranda</h1>
            <p className="text-lg">Menunggu instruksi lebih lanjut dari Anda...</p>
         </div>
      </div>
      <Footer />
    </div>
  );
}

export default App;
