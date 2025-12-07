"use client";

import { motion, AnimatePresence } from "framer-motion";
import portfolio from "@/data/portfolio.json";
import { Mail, Phone, Github, Linkedin, X } from "lucide-react";
import { useState } from "react";
import BlurText from "@/components/ui/blur-text";

interface Profile {
    name: string;
    role: string;
    bio: string;
    avatar: string;
    social: {
        github: string;
        linkedin: string;
        email: string;
        phone?: string;
    };
    timeline?: unknown;
}

export function Hero() {
    const { name, role, bio, social } = portfolio.profile as Profile;
    const avatarUrl = portfolio.profile.avatar;
    const [isProfileExpanded, setIsProfileExpanded] = useState(false);

    const handleAnimationComplete = () => {
        console.log('Name animation completed!');
    };

    return (
        <section id="hero" className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden pt-20">
            {/* Top Left Profile Icon */}
            <motion.div
                className="absolute top-6 left-6 z-50 cursor-pointer"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                onClick={() => setIsProfileExpanded(true)}
            >
                {!isProfileExpanded && (
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:scale-110 transition-transform duration-300">
                        <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                )}
            </motion.div>

            {/* Expanded Profile Card */}
            <AnimatePresence>
                {isProfileExpanded && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                            onClick={() => setIsProfileExpanded(false)}
                        />
                        {/* Card - Full Screen Overlay */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-xl"
                        >
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsProfileExpanded(false); }}
                                className="absolute top-8 right-8 text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full group"
                            >
                                <X size={32} className="group-hover:rotate-90 transition-transform duration-300" />
                            </button>

                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="flex flex-col items-center max-w-2xl w-full"
                            >
                                <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white/20 mb-8 shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                                    <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                                </div>

                                <h3 className="text-4xl md:text-5xl font-bold text-white mb-4 text-center">{name}</h3>
                                <p className="text-xl md:text-2xl text-cyan-400 font-mono text-center mb-8">{role}</p>

                                <p className="text-gray-300 text-lg leading-relaxed mb-12 text-center max-w-xl">
                                    {bio}
                                </p>

                                <div className="flex justify-center gap-12">
                                    <a href={social.github} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors flex flex-col items-center gap-2 group">
                                        <div className="p-4 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                                            <Github size={32} />
                                        </div>
                                        <span className="text-sm uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">GitHub</span>
                                    </a>
                                    <a href={social.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors flex flex-col items-center gap-2 group">
                                        <div className="p-4 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                                            <Linkedin size={32} />
                                        </div>
                                        <span className="text-sm uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">LinkedIn</span>
                                    </a>
                                    <a href={`mailto:${social.email}`} className="text-gray-400 hover:text-white transition-colors flex flex-col items-center gap-2 group">
                                        <div className="p-4 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                                            <Mail size={32} />
                                        </div>
                                        <span className="text-sm uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Email</span>
                                    </a>
                                </div>
                            </motion.div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <div className="container mx-auto px-4 text-center z-10 flex flex-col items-center">


                <div className="mb-6">
                    <BlurText
                        text={name}
                        delay={150}
                        animateBy="words"
                        direction="bottom"
                        onAnimationComplete={handleAnimationComplete}
                        className="text-6xl md:text-8xl font-bold tracking-tighter text-white drop-shadow-[0_0_30px_rgba(163,230,53,0.5)] justify-center"
                    />
                </div>

                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="text-2xl md:text-3xl font-light text-gray-300 mb-12 font-mono text-shadow"
                >
                    &lt;{role} /&gt;
                </motion.h2>

                {/* Contact & Socials Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="flex flex-col items-center gap-6"
                >
                    <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-center text-gray-300">
                        {social.phone && (
                            <a href={`tel:${social.phone}`} className="flex items-center gap-3 hover:text-white hover:scale-105 transition-all duration-300 group">
                                <div className="p-2 rounded-full bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-white/30 transition-colors">
                                    <Phone size={20} />
                                </div>
                                <span className="font-mono text-lg tracking-wide">{social.phone}</span>
                            </a>
                        )}
                        <a href={`mailto:${social.email}`} className="flex items-center gap-3 hover:text-white hover:scale-105 transition-all duration-300 group">
                            <div className="p-2 rounded-full bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-white/30 transition-colors">
                                <Mail size={20} />
                            </div>
                            <span className="font-mono text-lg tracking-wide">{social.email}</span>
                        </a>
                    </div>

                    <div className="w-16 h-px bg-white/10 my-2" />

                    <div className="flex gap-8">
                        <a
                            href={social.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-white hover:scale-110 transition-all duration-300 p-2 hover:bg-white/5 rounded-full"
                            title="GitHub"
                        >
                            <Github size={32} />
                        </a>
                        <a
                            href={social.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-blue-400 hover:scale-110 transition-all duration-300 p-2 hover:bg-white/5 rounded-full"
                            title="LinkedIn"
                        >
                            <Linkedin size={32} />
                        </a>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
