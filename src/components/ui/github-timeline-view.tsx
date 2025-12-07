"use client";

import { motion } from "framer-motion";
import { GitCommit, Clock, ArrowRight, GitBranch } from "lucide-react";
import { useRef } from "react";

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
    const history = items.slice(1);
    const scrollRef = useRef(null);

    return (
        <section className="py-24 relative z-0">
            <div className="container mx-auto px-4 max-w-6xl">

                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 font-heading text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] text-shadow-lg">
                        Live Activity
                    </h2>
                    <p className="text-gray-400 text-shadow-sm">
                        Real-time Git transmission.
                    </p>
                </div>

                {/* 1. Hero: Latest Activity Pulse */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative mb-20 group max-w-4xl mx-auto"
                >
                    <div className="absolute inset-0 bg-lime-500/10 rounded-2xl blur-xl group-hover:bg-lime-500/20 transition-colors duration-500" />
                    <div className="relative bg-black/60 border border-lime-500/30 rounded-2xl p-6 md:p-8 backdrop-blur-md overflow-hidden">
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />

                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
                            <div className="flex items-center gap-3">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-lime-500"></span>
                                </span>
                                <span className="text-lime-400 font-mono text-sm tracking-widest uppercase">HEAD -&gt; main</span>
                            </div>
                            <span className="flex items-center gap-2 text-gray-400 text-sm font-mono">
                                <Clock size={14} /> {latest.timeAgo}
                            </span>
                        </div>

                        <div className="mt-6">
                            <a href={latest.url} target="_blank" rel="noopener noreferrer" className="group/link block">
                                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 group-hover/link:text-lime-300 transition-colors">
                                    {latest.repo}
                                </h3>
                                <p className="text-gray-300 font-mono text-lg italic truncate opacity-80">
                                    "{latest.message}"
                                </p>
                            </a>
                        </div>
                    </div>
                </motion.div>

                {/* 2. Horizontal Git Graph */}
                <div className="relative">
                    <div className="flex items-center gap-2 mb-4 text-gray-400 font-mono text-xs px-4">
                        <GitBranch size={14} />
                        <span>Recent Commits (Scroll to explore)</span>
                        <ArrowRight size={14} className="animate-pulse" />
                    </div>

                    {/* Scroll Container */}
                    <div
                        ref={scrollRef}
                        className="overflow-x-auto pb-8 scrollbar-hide cursor-grab active:cursor-grabbing"
                    >
                        <div className="flex items-center min-w-max px-4">
                            {/* The "Main Branch" Line */}
                            <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500/5 via-indigo-500/50 to-indigo-500/5 top-[100px] -z-10" />

                            {items.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="relative flex flex-col items-center gap-4 w-[280px] group shrink-0"
                                >
                                    {/* Commit Node */}
                                    <div className="relative z-10">
                                        <div className="w-4 h-4 rounded-full bg-black border-2 border-indigo-500 group-hover:bg-indigo-500 group-hover:scale-125 transition-all duration-300 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                                        {/* Vertical connector to card */}
                                        <div className={`absolute left-1/2 -translate-x-1/2 w-0.5 h-8 bg-indigo-500/30 ${index % 2 === 0 ? 'top-4' : 'bottom-4'}`} />
                                    </div>

                                    {/* Commit Card (Alternating Top/Bottom) */}
                                    <div className={`absolute ${index % 2 === 0 ? 'top-8' : 'bottom-8'} left-0 right-0 p-2`}>
                                        <a
                                            href={item.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block bg-white/5 border border-white/10 p-4 rounded-xl hover:bg-white/10 hover:border-indigo-500/50 transition-all duration-300 hover:scale-105 backdrop-blur-sm"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-indigo-400 text-xs font-mono truncate max-w-[100px]" title={item.repo}>
                                                    {item.repo}
                                                </span>
                                                <span className="text-gray-500 text-[10px] whitespace-nowrap">{item.timeAgo}</span>
                                            </div>
                                            <p className="text-gray-200 text-sm font-medium line-clamp-2 min-h-[40px]" title={item.message}>
                                                {item.message}
                                            </p>
                                            <div className="mt-2 flex justify-end">
                                                <div className="text-[10px] text-gray-500 font-mono bg-black/30 px-2 py-0.5 rounded">
                                                    {item.id.substring(0, 7)}
                                                </div>
                                            </div>
                                        </a>
                                    </div>

                                    {/* Spacing for alignment since we use absolute positioning for cards */}
                                    <div className="h-[200px] w-full pointer-events-none" />

                                </motion.div>
                            ))}

                            {/* Branch continuing into infinity */}
                            <div className="w-12 h-0.5 bg-gradient-to-r from-indigo-500/50 to-transparent self-center translate-y-[1px]" />
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
