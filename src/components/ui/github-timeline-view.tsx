"use client";

import { motion } from "framer-motion";
import { Clock } from "lucide-react";

interface ActivityItem {
    id: string;
    repo: string;
    message: string;
    date: string;
    timeAgo: string;
    url: string;
}

export function GithubTimelineView({ items }: { items: ActivityItem[] }) {
    if (!items || items.length === 0) return null;

    const latest = items[0];

    return (
        <section className="py-12 sm:py-24 relative z-0">
            <div className="container mx-auto px-3 sm:px-4 max-w-6xl">

                {/* Header */}
                <div className="text-center mb-8 sm:mb-16">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4 font-heading text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] text-shadow-lg">
                        Live Activity
                    </h2>
                    <p className="text-gray-400 text-sm sm:text-base text-shadow-sm">
                        Real-time Git transmission.
                    </p>
                </div>

                {/* 1. Hero: Latest Activity Pulse */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative mb-12 sm:mb-20 group max-w-4xl mx-auto"
                >
                    <div className="absolute inset-0 bg-lime-500/10 rounded-lg sm:rounded-2xl blur-xl group-hover:bg-lime-500/20 transition-colors duration-500" />
                    <div className="relative bg-black/60 border border-lime-500/30 rounded-lg sm:rounded-2xl p-4 sm:p-6 md:p-8 backdrop-blur-md overflow-hidden active:scale-95">
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between relative z-10">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <span className="relative flex h-2 w-2 sm:h-3 sm:w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 sm:h-3 sm:w-3 bg-lime-500"></span>
                                </span>
                                <span className="text-lime-400 font-mono text-xs sm:text-sm tracking-widest uppercase">HEAD -&gt; main</span>
                            </div>
                            <span className="flex items-center gap-2 text-gray-400 text-xs sm:text-sm font-mono">
                                <Clock size={14} /> {latest.timeAgo}
                            </span>
                        </div>

                        <div className="mt-4 sm:mt-6">
                            <a href={latest.url} target="_blank" rel="noopener noreferrer" className="group/link block">
                                <h3 className="text-lg sm:text-2xl md:text-3xl font-bold text-white mb-2 group-hover/link:text-lime-300 transition-colors line-clamp-2">
                                    {latest.repo}
                                </h3>
                                <p className="text-gray-300 font-mono text-sm sm:text-lg italic truncate opacity-80">
                                    "{latest.message}"
                                </p>
                            </a>
                        </div>
                    </div>
                </motion.div>

            </div>
        </section>
    );
}
