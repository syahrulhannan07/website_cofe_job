import React from 'react';
import cameraIcon from '../../../aset/profil/Camera.png';
import placeholderImg from '../../../aset/profil/placeholder_profil.jpg';

const KartuFotoProfil = () => {
    return (
        <div className="kartu-foto-profil bg-[#C69C6D] rounded-[25px] p-10 flex flex-col items-center justify-center shadow-lg w-full h-full min-h-[460px] relative z-10">
            <div className="wadah-foto relative mb-6">
                {/* Main Photo Bingkai with Shadow */}
                <div 
                    className="bingkai-foto w-[256px] h-[289px] bg-[#E3CEB6] rounded-[25px] overflow-hidden flex items-center justify-center relative"
                    style={{ 
                        boxShadow: '0px 0px 5px 8px rgba(167, 129, 93, 1)' 
                    }}
                >
                    <img 
                        src={placeholderImg} 
                        alt="Foto Profil" 
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Camera Action Button */}
                <button className="tombol-unggah-foto absolute bottom-[-10px] right-[-10px] bg-[#6B8E23] w-[55px] h-[55px] rounded-full flex items-center justify-center shadow-md hover:bg-[#5a7a1d] transition-colors z-20">
                    <img src={cameraIcon} alt="Ganti Foto" className="w-8 h-8" />
                </button>
            </div>

            <h3 className="label-foto font-poppins font-semibold text-[32px] text-[#4B2E2B] mt-6">
                Foto Profil
            </h3>
        </div>
    );
};

export default KartuFotoProfil;
