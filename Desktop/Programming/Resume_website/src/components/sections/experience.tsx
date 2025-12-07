"use client";

import { motion } from "framer-motion";
import portfolio from "@/data/portfolio.json";
import { Card } from "@/components/ui/card";

export function Experience() {
    const { experience } = portfolio;

    return (
        <section id="experience" className="py-24 relative">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 font-heading text-white text-shadow-lg">
                        Experience
                    </h2>
                    <p className="text-gray-400 text-shadow-sm">My professional journey.</p>
                </motion.div>

                <div className="max-w-4xl mx-auto space-y-8">
                    {experience.map((job, index) => (
                        <motion.div
                            key={job.id}
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <Card className="flex flex-col md:flex-row gap-6 bg-black/60 border-white/10 hover:border-white/30 transition-colors">
                                <div className="md:w-1/3 flex-shrink-0">
                                    <span className="text-white/90 font-medium text-shadow-sm text-base">{job.date}</span>
                                    <h3 className="text-2xl font-bold text-white mt-1 text-shadowable">{job.company}</h3>
                                    <p className="text-gray-200 text-lg mt-2 font-medium">{job.role}</p>
                                </div>
                                <div className="md:w-2/3">
                                    <ul className="space-y-3 list-disc list-inside text-gray-100">
                                        {job.description.map((point, i) => (
                                            <li key={i} className="text-base leading-relaxed">
                                                {point}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
