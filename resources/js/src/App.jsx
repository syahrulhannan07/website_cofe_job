import React from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import FindCafeSection from './components/FindCafeSection';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-[#F3EDE6] text-cafe-dark flex flex-col justify-between">
      <div>
         <Navbar />
         <HeroSection />
         <FindCafeSection />
      </div>
      <Footer />
    </div>
  );
}

export default App;
