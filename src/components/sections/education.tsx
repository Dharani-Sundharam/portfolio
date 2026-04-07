"use client";

import { motion } from "framer-motion";
import portfolio from "@/data/portfolio.json";
import { Card } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";

export function Education() {
    const { education } = portfolio;

    return (
        <section id="education" className="py-12 sm:py-24 relative">
            <div className="container mx-auto px-3 sm:px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-8 sm:mb-16"
                >
                    <div className="flex items-center justify-center gap-2 mb-2 sm:mb-4">
                        <GraduationCap className="text-white w-6 h-6 sm:w-8 sm:h-8" />
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading text-white text-shadow-lg">
                            Education
                        </h2>
                    </div>
                    <p className="text-gray-400 text-sm sm:text-base text-shadow-sm">Academic background.</p>
                </motion.div>

                <div className="max-w-4xl mx-auto space-y-4 sm:space-y-8">
                    {education.map((edu, index) => (
                        <motion.div
                            key={edu.id}
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <Card className="flex flex-col gap-4 sm:gap-6 bg-black/60 border-white/10 hover:border-white/30 transition-colors p-4 sm:p-6">
                                <div className="">
                                    <h3 className="text-lg sm:text-2xl font-bold text-white text-shadow">{edu.school}</h3>
                                    <span className="text-white/80 font-mono text-xs sm:text-base mt-2 block">{edu.date}</span>
                                </div>
                                <div className="">
                                    <p className="text-base sm:text-xl font-medium text-white text-shadow-sm">{edu.degree}</p>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
