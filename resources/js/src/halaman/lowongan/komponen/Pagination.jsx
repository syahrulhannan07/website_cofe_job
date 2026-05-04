import React from 'react';
import arrowKanan from '../../../aset/lowongan/Arrow-kanan.png';
import arrowKiri from '../../../aset/lowongan/Arrow-kiri.png';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="w-full flex items-center justify-center gap-[10px] py-[10px] px-[36px] mt-[40px]">
            <button 
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`w-[40px] h-[40px] rounded-[80px] flex items-center justify-center transition-colors ${
                    currentPage === 1 ? 'bg-[#F3EDE6] opacity-50 cursor-not-allowed' : 'bg-[#F3EDE6] hover:bg-[#e6dfd6]'
                }`}
            >
                <img src={arrowKiri} alt="Previous" className="w-[30px] h-[30px] object-contain rotate-90" />
            </button>
            
            {pages.map(page => (
                <button 
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`w-[40px] h-[40px] rounded-[80px] flex items-center justify-center font-poppins font-bold text-[14px] transition-colors ${
                        currentPage === page 
                            ? 'bg-[#C69C6D] text-[#F3EDE6]' 
                            : 'bg-[#F3EDE6] text-[#C69C6D] hover:bg-[#e6dfd6]'
                    }`}
                >
                    {page}
                </button>
            ))}

            <button 
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`w-[40px] h-[40px] rounded-[80px] flex items-center justify-center transition-colors ${
                    currentPage === totalPages ? 'bg-[#F3EDE6] opacity-50 cursor-not-allowed' : 'bg-[#F3EDE6] hover:bg-[#e6dfd6]'
                }`}
            >
                <img src={arrowKanan} alt="Next" className="w-[30px] h-[30px] object-contain" />
            </button>
        </div>
    );
};

export default Pagination;
