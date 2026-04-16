import React from 'react';

const jobListings = [
  { id: 1, title: 'Senior Barista', cafe: 'Starbucks', location: 'Kebayoran, Jakarta', salary: 'Rp 6.000.000', tag: 'Full-time' },
  { id: 2, title: 'Head Roaster', cafe: 'Starbucks', location: 'Gandaria, Jakarta', salary: 'Rp 8.000.000', tag: 'Full-time' },
  { id: 3, title: 'Service Attendant', cafe: 'Starbucks', location: 'Cilandak, Jakarta', salary: 'Rp 4.500.000', tag: 'Part-time' },
  { id: 4, title: 'Store Manager', cafe: 'Starbucks', location: 'Menteng, Jakarta', salary: 'Rp 10.000.000', tag: 'Full-time' }
];

const JobGrid = () => {
  return (
    <section className="px-12 py-16 max-w-7xl mx-auto w-full">
      <h2 className="text-[32px] font-bold mb-10 text-cafe-white">Lowongan Terbaru</h2>
      
      <div className="grid grid-cols-2 gap-6">
        {jobListings.map((job) => (
          <div key={job.id} className="bg-white rounded-[20px] p-8 flex justify-between text-cafe-dark shadow-sm hover:shadow-lg transition-all items-center border border-transparent hover:border-cafe-light">
             {/* Info Kiri */}
             <div className="flex gap-6 items-center">
                <div className="w-16 h-16 shrink-0 bg-gray-50 rounded-full flex items-center justify-center font-bold">
                   <img src="https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/Starbucks_Corporation_Logo_2011.svg/1200px-Starbucks_Corporation_Logo_2011.svg.png" alt="Starbucks" className="w-[80%] h-[80%] object-contain" />
                </div>
                <div>
                   <h3 className="font-bold text-[24px] mb-1">{job.title}</h3>
                   <div className="text-gray-500 font-medium space-y-1 text-sm bg-gray-100 px-3 py-1 rounded w-max">
                     {job.cafe}
                   </div>
                   <div className="flex items-center gap-4 mt-3 text-sm font-semibold text-gray-700">
                     <span className="flex gap-1 items-center">
                       📌 {job.location}
                     </span>
                     <span className="flex gap-1 items-center">
                       💰 {job.salary}
                     </span>
                   </div>
                </div>
             </div>
             
             {/* Kanan */}
             <div className="flex flex-col items-end justify-between h-full gap-4">
               {/* Optional Tag space */}
               <button className="px-6 py-3 bg-cafe-dark text-white rounded-card font-semibold hover:bg-cafe-light transition-colors shadow shadow-black/10">
                 Lihat Detail Lowongan
               </button>
             </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default JobGrid;
