import React from 'react';
import arrowKanan from '../../../aset/lowongan/Arrow-kanan.png';
import arrowKiri from '../../../aset/lowongan/Arrow-kiri.png';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="w-full flex items-center justify-center gap-2 py-2 px-4 mt-6">
            <button 
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    currentPage === 1 ? 'bg-[#F3EDE6] opacity-50 cursor-not-allowed' : 'bg-[#F3EDE6] hover:bg-[#e6dfd6]'
                }`}
            >
                <img src={arrowKiri} alt="Previous" className="w-4 h-4 object-contain rotate-90" />
            </button>
            
            {(() => {
                // Logika untuk hanya menampilkan 3 angka saja
                let start = Math.max(1, currentPage - 1);
                let end = Math.min(totalPages, start + 2);
                
                // Geser start jika end mencapai batas akhir
                if (end - start < 2 && totalPages > 2) {
                    start = Math.max(1, end - 2);
                }

                const visiblePages = Array.from({ length: (end - start) + 1 }, (_, i) => start + i);

                return visiblePages.map(page => (
                    <button 
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-poppins font-bold text-xs transition-colors ${
                            currentPage === page 
                                ? 'bg-[#C69C6D] text-[#F3EDE6]' 
                                : 'bg-[#F3EDE6] text-[#C69C6D] hover:bg-[#e6dfd6]'
                        }`}
                    >
                        {page}
                    </button>
                ));
            })()}

            <button 
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    currentPage === totalPages ? 'bg-[#F3EDE6] opacity-50 cursor-not-allowed' : 'bg-[#F3EDE6] hover:bg-[#e6dfd6]'
                }`}
            >
                <img src={arrowKanan} alt="Next" className="w-4 h-4 object-contain" />
            </button>
        </div>
    );
};

export default Pagination;
