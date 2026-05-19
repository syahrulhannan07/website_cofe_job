import React from 'react';
import { motion } from 'framer-motion';
import tahap1 from '../../../aset/perusahaan/tahap1.svg';
import tahap2 from '../../../aset/perusahaan/tahap2.svg';
import tahap3 from '../../../aset/perusahaan/tahap3.svg';

const PanduanLamar = () => {
    const steps = [
        {
            id: 1,
            title: "Tahap 1 Upload Dokumen",
            desc: "Upload dokumen yang diperlukan pada lowongan tersebut",
            icon: tahap1,
        },
        {
            id: 2,
            title: "Tahap 2 Jawab Pertanyaan",
            desc: "Menjawab pertanyaan penyaringan dari pihak kafe",
            icon: tahap2,
        },
        {
            id: 3,
            title: "Tahap 3 Kelengkapan Profil",
            desc: "Periksa kelengkapan data diri, memperbaruinya jika perlu",
            icon: tahap3,
        }
    ];

    return (
        <section className="w-full bg-[#6B8E23] rounded-[40px] md:rounded-[50px] py-16 px-8 mt-10 relative overflow-hidden">
            {/* Decorative Ornaments */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            
            <div className="container mx-auto text-center relative z-10">
                <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="font-poppins font-bold text-[36px] leading-[54px] text-white mb-16"
                >
                    Bingung Cara Lamar Lowongan <br className="hidden md:block" /> di Perusahaan?
                </motion.h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-24">
                    {steps.map((step, index) => (
                        <motion.div 
                            key={step.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 }}
                            className="flex flex-col items-center group"
                        >
                            <div className="w-[100px] h-[100px] flex items-center justify-center mb-8 transition-all group-hover:scale-110">
                                <img src={step.icon} alt={step.title} className="w-full h-full object-contain" />
                            </div>
                            <h3 className="font-poppins font-semibold text-[24px] leading-[36px] text-white mb-4">
                                {step.title}
                            </h3>
                            <p className="font-poppins font-medium text-white/90 text-[17px] leading-[25.5px] max-w-[300px] text-center">
                                {step.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PanduanLamar;
