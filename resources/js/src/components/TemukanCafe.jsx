import React from 'react';

const TemukanCafe = () => {
  return (
    <section className="py-20 px-12 max-w-7xl mx-auto w-full">
      <div className="flex justify-start gap-8">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="flex flex-col items-center justify-center bg-white rounded-[20px] p-6 w-[258px] h-[258px] shadow-sm text-cafe-dark hover:shadow-lg transition-transform hover:-translate-y-2">
             <div className="w-[100px] h-[100px] mb-4">
               {/* Starbucks logo placeholder */}
               <img src="https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/Starbucks_Corporation_Logo_2011.svg/1200px-Starbucks_Corporation_Logo_2011.svg.png" alt="Starbucks" className="w-full h-full object-contain" />
             </div>
             <h3 className="font-bold text-[24px] mb-4 mt-2">Starbucks</h3>
             <button className="px-6 py-2 border-2 border-cafe-dark rounded-full text-sm font-semibold hover:bg-cafe-dark hover:text-cafe-white transition-colors">
               Lihat Pekerjaan
             </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TemukanCafe;
