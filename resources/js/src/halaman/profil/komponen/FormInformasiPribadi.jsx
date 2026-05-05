import React from 'react';
import backgroundVector from '../../../aset/profil/Vector.png';
import pencilSquareIcon from '../../../aset/profil/PencilSquare.svg';

const FormInformasiPribadi = () => {
    return (
        <div className="form-informasi-pribadi bg-[#C69C6D] rounded-[25px] p-8 md:p-10 shadow-lg w-full min-h-[460px] relative overflow-hidden z-10 flex flex-col">
            {/* Background Vector - Wave at the bottom of the card */}
            <div className="vektor-latar absolute bottom-0 left-0 w-full opacity-50 pointer-events-none z-0">
                <img src={backgroundVector} alt="" className="w-full h-auto object-cover" />
            </div>

            {/* Header Section */}
            <div className="area-header relative z-10 flex justify-between items-center mb-8">
                <h2 className="judul-seksi font-poppins font-semibold text-[28px] md:text-[36px] text-[#4B2E2B]">
                    Informasi Pribadi
                </h2>
                
                <div className="grup-aksi flex items-center gap-6">
                    <button className="tombol-simpan bg-[#4B2E2B] text-[#F3EDE6] font-poppins font-semibold text-[16px] px-8 py-2.5 rounded-[50px] hover:bg-[#3d2523] transition-all shadow-md active:scale-95">
                        Simpan Perubahan
                    </button>
                    <button className="tombol-edit-ikon group">
                        <div className="wadah-ikon-edit w-[44px] h-[44px] flex items-center justify-center rounded-lg hover:bg-[#4B2E2B]/10 transition-colors">
                            <img src={pencilSquareIcon} alt="Edit" className="w-[38px] h-[38px]" />
                        </div>
                    </button>
                </div>
            </div>

            {/* Form Section */}
            <form className="area-form relative z-10 grid grid-cols-1 md:grid-cols-2 gap-x-[60px] gap-y-6 flex-1">
                {/* Column 1 */}
                <div className="flex flex-col gap-6">
                    {/* Nama Lengkap */}
                    <div className="grup-input flex flex-col gap-2">
                        <label className="label-input font-poppins font-semibold text-[18px] md:text-[20px] text-[#4B2E2B]">
                            Nama Lengkap
                        </label>
                        <input 
                            type="text" 
                            className="input-field h-[50px] bg-[#E3CEB6] border-none rounded-[8px] px-4 font-poppins text-[#4B2E2B] focus:ring-2 focus:ring-[#4B2E2B]/20 outline-none placeholder:text-[#4B2E2B]/40 transition-shadow"
                            placeholder="Nama Lengkap"
                        />
                    </div>

                    {/* Tentang Saya */}
                    <div className="grup-input flex flex-col gap-2">
                        <label className="label-input font-poppins font-semibold text-[18px] md:text-[20px] text-[#4B2E2B]">
                            Tentang Saya
                        </label>
                        <textarea 
                            className="input-field h-[110px] bg-[#E3CEB6] border-none rounded-[8px] p-4 font-poppins text-[#4B2E2B] focus:ring-2 focus:ring-[#4B2E2B]/20 outline-none resize-none placeholder:text-[#4B2E2B]/40 transition-shadow"
                            placeholder="Ceritakan tentang diri Anda..."
                        />
                    </div>

                    {/* Alamat */}
                    <div className="grup-input flex flex-col gap-2">
                        <label className="label-input font-poppins font-semibold text-[18px] md:text-[20px] text-[#4B2E2B]">
                            Alamat
                        </label>
                        <textarea 
                            className="input-field h-[110px] bg-[#E3CEB6] border-none rounded-[8px] p-4 font-poppins text-[#4B2E2B] focus:ring-2 focus:ring-[#4B2E2B]/20 outline-none resize-none placeholder:text-[#4B2E2B]/40 transition-shadow"
                            placeholder="Alamat lengkap Anda..."
                        />
                    </div>
                </div>

                {/* Column 2 */}
                <div className="flex flex-col gap-6">
                    {/* Email */}
                    <div className="grup-input flex flex-col gap-2">
                        <label className="label-input font-poppins font-semibold text-[18px] md:text-[20px] text-[#4B2E2B]">
                            Email
                        </label>
                        <input 
                            type="email" 
                            className="input-field h-[50px] bg-[#E3CEB6] border-none rounded-[8px] px-4 font-poppins text-[#4B2E2B] focus:ring-2 focus:ring-[#4B2E2B]/20 outline-none placeholder:text-[#4B2E2B]/40 transition-shadow"
                            placeholder="email@contoh.com"
                        />
                    </div>

                    {/* No Telepon */}
                    <div className="grup-input flex flex-col gap-2">
                        <label className="label-input font-poppins font-semibold text-[18px] md:text-[20px] text-[#4B2E2B]">
                            No Telepon
                        </label>
                        <input 
                            type="text" 
                            className="input-field h-[50px] bg-[#E3CEB6] border-none rounded-[8px] px-4 font-poppins text-[#4B2E2B] focus:ring-2 focus:ring-[#4B2E2B]/20 outline-none placeholder:text-[#4B2E2B]/40 transition-shadow"
                            placeholder="08123456789"
                        />
                    </div>

                    {/* Jenis Kelamin */}
                    <div className="grup-input flex flex-col gap-2">
                        <label className="label-input font-poppins font-semibold text-[18px] md:text-[20px] text-[#4B2E2B]">
                            Jenis Kelamin
                        </label>
                        <select className="input-field h-[50px] bg-[#E3CEB6] border-none rounded-[8px] px-4 font-poppins text-[#4B2E2B] focus:ring-2 focus:ring-[#4B2E2B]/20 outline-none appearance-none cursor-pointer transition-shadow">
                            <option value="">Pilih Jenis Kelamin</option>
                            <option value="Laki-laki">Laki-laki</option>
                            <option value="Perempuan">Perempuan</option>
                        </select>
                    </div>

                    {/* Tanggal Lahir */}
                    <div className="grup-input flex flex-col gap-2">
                        <label className="label-input font-poppins font-semibold text-[18px] md:text-[20px] text-[#4B2E2B]">
                            Tanggal Lahir
                        </label>
                        <div className="relative">
                            <input 
                                type="date" 
                                className="input-field w-full h-[50px] bg-[#E3CEB6] border-none rounded-[8px] px-4 font-poppins text-[#4B2E2B] focus:ring-2 focus:ring-[#4B2E2B]/20 outline-none transition-shadow"
                            />
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default FormInformasiPribadi;
