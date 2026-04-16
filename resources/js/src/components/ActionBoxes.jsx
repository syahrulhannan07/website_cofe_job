import React from 'react';

const ActionBoxes = () => {
  return (
    <section className="px-12 py-10 max-w-7xl mx-auto flex gap-8 w-full">
      {/* Box 1 - Green */}
      <div className="flex-1 bg-cafe-green rounded-[40px] p-10 flex flex-col justify-center text-cafe-dark relative overflow-hidden h-[300px]">
         <div className="w-[60%] z-10">
            <h2 className="text-[32px] font-bold mb-6 leading-tight">Ingin Pasang Iklan<br/>Lowongan di Cofe Job?</h2>
            <button className="bg-white text-cafe-dark font-semibold px-8 py-3 rounded-card text-[20px] shadow-sm hover:scale-105 transition-transform w-[258px]">
              Gabung Sekarang
            </button>
         </div>
         {/* Decoration / Illustration Placeholder */}
         <div className="absolute right-0 bottom-0 w-[40%] h-[120%] bg-teal-200/40 rounded-l-[100px] -mr-10"></div>
      </div>

      {/* Box 2 - Brown */}
      <div className="flex-1 bg-cafe-light rounded-[40px] p-10 flex flex-col justify-center text-cafe-dark relative overflow-hidden h-[300px]">
         <div className="w-[60%] z-10 text-white">
            <h2 className="text-[32px] font-bold mb-6 leading-tight">Cari Careermu dan<br/>Lamar di Cofe Job?</h2>
             <button className="bg-white text-cafe-dark font-semibold px-8 py-3 rounded-card text-[20px] shadow-sm hover:scale-105 transition-transform w-[258px]">
              Buat Profilemu Sekarang
            </button>
         </div>
         {/* Decoration / Illustration Placeholder */}
         <div className="absolute right-0 bottom-0 w-[40%] h-[120%] bg-orange-200/30 rounded-l-[100px] -mr-10"></div>
      </div>
    </section>
  );
};

export default ActionBoxes;
