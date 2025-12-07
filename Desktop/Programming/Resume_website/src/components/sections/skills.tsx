"use client";

import { motion } from "framer-motion";
import portfolio from "@/data/portfolio.json";
import {
    Shield, Lock, Terminal, Cpu, Cloud, Code2,
    Coffee, Atom, Eye, Box, Wifi, Server, Smartphone
} from "lucide-react";

// Map skills to icons
const SKILL_ICONS: Record<string, any> = {
    "Cybersecurity": Shield,
    "Network Security": Lock,
    "Penetration Testing": Terminal,
    "IoT & Embedded Systems": Smartphone,
    "Arduino/Raspberry Pi": Cpu,
    "AWS Cloud": Cloud,
    "Python": Code2,
    "C++": Code2,
    "Java": Coffee,
    "React/Next.js": Atom,
    "Computer Vision (OpenCV)": Eye,
    "Docker": Box
};

export function Skills() {
    const { skills } = portfolio;

    // Split skills into two rows
    const half = Math.ceil(skills.length / 2);
    const firstRow = skills.slice(0, half);
    const secondRow = skills.slice(half);

    // Duplicate for seamless loop
    const duplicatedRow1 = [...firstRow, ...firstRow];
    const duplicatedRow2 = [...secondRow, ...secondRow];

    return (
        <section id="skills" className="py-24 relative z-0 overflow-hidden">
            <div className="container mx-auto px-4 mb-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center"
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 font-heading text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] text-shadow-lg">
                        Skills
                    </h2>
                    <p className="text-gray-400 text-shadow-sm">
                        Technical proficiencies and tools.
                    </p>
                </motion.div>
            </div>

            <div className="flex flex-col gap-8 relative w-full">
                {/* Gradient Masks for fade effect */}
                <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-black via-black/80 to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-black via-black/80 to-transparent z-10 pointer-events-none" />

                {/* First Row - Moves Left */}
                <div className="flex overflow-hidden">
                    <motion.div
                        className="flex gap-8 whitespace-nowrap"
                        animate={{
                            x: ["0%", "-50%"],
                        }}
                        transition={{
                            x: {
                                repeat: Infinity,
                                repeatType: "loop",
                                duration: 30,
                                ease: "linear",
                            },
                        }}
                    >
                        {duplicatedRow1.map((skill, index) => {
                            const Icon = SKILL_ICONS[skill] || Server;
                            return (
                                <div
                                    key={`row1-${index}`}
                                    className="flex items-center gap-4 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-white/90 backdrop-blur-sm hover:bg-white/10 hover:border-white/30 transition-colors cursor-default group shrink-0"
                                >
                                    <Icon className="w-8 h-8 text-lime-400/80 group-hover:text-lime-300 transition-colors drop-shadow-[0_0_5px_rgba(163,230,53,0.5)]" />
                                    <span className="font-mono text-xl md:text-2xl tracking-tight font-medium">
                                        {skill}
                                    </span>
                                </div>
                            );
                        })}
                    </motion.div>
                </div>

                {/* Second Row - Moves Right */}
                <div className="flex overflow-hidden">
                    <motion.div
                        className="flex gap-8 whitespace-nowrap"
                        animate={{
                            x: ["-50%", "0%"],
                        }}
                        transition={{
                            x: {
                                repeat: Infinity,
                                repeatType: "loop",
                                duration: 30,
                                ease: "linear",
                            },
                        }}
                    >
                        {duplicatedRow2.map((skill, index) => {
                            const Icon = SKILL_ICONS[skill] || Server;
                            return (
                                <div
                                    key={`row2-${index}`}
                                    className="flex items-center gap-4 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-white/90 backdrop-blur-sm hover:bg-white/10 hover:border-white/30 transition-colors cursor-default group shrink-0"
                                >
                                    <Icon className="w-8 h-8 text-lime-400/80 group-hover:text-lime-300 transition-colors drop-shadow-[0_0_5px_rgba(163,230,53,0.5)]" />
                                    <span className="font-mono text-xl md:text-2xl tracking-tight font-medium">
                                        {skill}
                                    </span>
                                </div>
                            );
                        })}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
