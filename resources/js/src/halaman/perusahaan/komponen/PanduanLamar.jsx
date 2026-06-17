import React from 'react';
import { motion } from 'framer-motion';
import tahap1 from '../../../aset/perusahaan/tahap1.svg';
import tahap2 from '../../../aset/perusahaan/tahap2.svg';
import tahap3 from '../../../aset/perusahaan/tahap3.svg';

const PanduanLamar = () => {
    const steps = [
        { id: 1, title: "Tahap 1 Upload Dokumen", desc: "Upload dokumen yang diperlukan pada lowongan tersebut", icon: tahap1 },
        { id: 2, title: "Tahap 2 Jawab Pertanyaan", desc: "Menjawab pertanyaan penyaringan dari pihak kafe", icon: tahap2 },
        { id: 3, title: "Tahap 3 Kelengkapan Profil", desc: "Periksa kelengkapan data diri, memperbaruinya jika perlu", icon: tahap3 },
    ];

    return (
        <section className="w-full bg-[#6B8E23] rounded-2xl md:rounded-3xl py-8 px-6 mt-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-24 -mt-24 blur-3xl"></div>
            <div className="container mx-auto text-center relative z-10">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="font-poppins font-bold text-2xl leading-snug text-white mb-8"
                >
                    Bingung Cara Lamar Lowongan <br className="hidden md:block" /> di Perusahaan?
                </motion.h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-8">
                    {steps.map((step, index) => (
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 }}
                            className="flex flex-col items-center group"
                        >
                            <div className="w-16 h-16 flex items-center justify-center mb-4 transition-all group-hover:scale-110">
                                <img src={step.icon} alt={step.title} className="w-full h-full object-contain" />
                            </div>
                            <h3 className="font-poppins font-semibold text-lg leading-snug text-white mb-3">
                                {step.title}
                            </h3>
                            <p className="font-poppins font-medium text-white/90 text-sm leading-snug max-w-[260px] text-center">
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
