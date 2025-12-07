"use client";

import { motion } from "framer-motion";
import portfolio from "@/data/portfolio.json";
import { Card } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";

export function Education() {
    const { education } = portfolio;

    return (
        <section id="education" className="py-24 relative">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <GraduationCap className="text-white" size={32} />
                        <h2 className="text-3xl md:text-4xl font-bold font-heading text-white text-shadow-lg">
                            Education
                        </h2>
                    </div>
                    <p className="text-gray-400 text-shadow-sm">Academic background.</p>
                </motion.div>

                <div className="max-w-4xl mx-auto space-y-8">
                    {education.map((edu, index) => (
                        <motion.div
                            key={edu.id}
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <Card className="flex flex-col md:flex-row gap-6 items-center bg-black/60 border-white/10 hover:border-white/30 transition-colors">
                                <div className="md:w-1/3 text-center md:text-left">
                                    <h3 className="text-2xl font-bold text-white text-shadowable">{edu.school}</h3>
                                    <span className="text-white/80 font-mono text-base mt-2 block">{edu.date}</span>
                                </div>
                                <div className="md:w-2/3 text-center md:text-left border-l border-white/10 md:pl-6">
                                    <p className="text-xl font-medium text-white text-shadow-sm">{edu.degree}</p>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
