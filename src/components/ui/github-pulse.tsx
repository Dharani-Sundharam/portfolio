"use client";

import { motion, useMotionTemplate, useMotionValue, animate } from "framer-motion";
import { useEffect, useState } from "react";
import { Github, Flame, GitCommitHorizontal } from "lucide-react";

// --- Types ---
interface Contribution {
    date: string;
    count: number;
    level: number; // 0-4
}

interface PulseProps {
    data: {
        contributions: Contribution[];
        totalCommits: number;
        currentStreak: number;
    };
}

export default function GithubPulse({ data }: PulseProps) {
    // --- 1. Spotlight Logic (React Bits Style) ---
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    // The glow effect gradient
    const maskImage = useMotionTemplate`radial-gradient(240px circle at ${mouseX}px ${mouseY}px, white, transparent)`;
    const style = { maskImage, WebkitMaskImage: maskImage };

    return (
        <section className="py-12 sm:py-24 relative z-0">
            <div className="w-full max-w-5xl mx-auto p-3 sm:p-4 space-y-6 sm:space-y-8">

                {/* --- Section A: Rolling Stats --- */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <StatsCard
                        icon={<GitCommitHorizontal className="text-lime-400 w-5 h-5 sm:w-6 sm:h-6" />}
                        label="Total Contributions"
                        value={data.totalCommits}
                    />
                    <StatsCard
                        icon={<Flame className="text-orange-500 w-5 h-5 sm:w-6 sm:h-6" />}
                        label="Current Streak"
                        value={data.currentStreak}
                        suffix=" Days"
                    />
                    <StatsCard
                        icon={<Github className="text-slate-200 w-5 h-5 sm:w-6 sm:h-6" />}
                        label="Active Year"
                        value={2025}
                        suffix=""
                    />
                </div>

                {/* --- Section B: The Spotlight Grid --- */}
                <div
                    onMouseMove={handleMouseMove}
                    className="relative group border border-white/10 bg-black/40 backdrop-blur-sm rounded-lg sm:rounded-2xl p-4 sm:p-8 overflow-hidden"
                >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 sm:gap-0 mb-4 sm:mb-6">
                        <h3 className="text-base sm:text-xl font-semibold text-slate-100">Contribution Graph</h3>
                        <div className="flex gap-2 text-xs text-slate-500">
                            <span>Less</span>
                            <div className="flex gap-1">
                                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded bg-white/5 border border-white/10" />
                                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded bg-lime-900/40 border border-lime-900" />
                                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded bg-lime-600/60 border border-lime-600" />
                                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded bg-lime-400 border border-lime-400" />
                            </div>
                            <span>More</span>
                        </div>
                    </div>

                    {/* The Base Layer (Dimmed) */}
                    <div className="flex flex-wrap gap-[2px] sm:gap-[3px] justify-center sm:justify-start">
                        {data.contributions.map((day, i) => (
                            <div
                                key={i}
                                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-[1px] sm:rounded-[2px] transition-colors duration-300 ${getColor(day.level)
                                    }`}
                                title={`${day.count} contributions on ${day.date}`}
                            />
                        ))}
                    </div>

                    {/* The Spotlight Layer (Reveals Borders/Glow) */}
                    <motion.div
                        className="absolute inset-0 pointer-events-none bg-lime-500/20"
                        style={style}
                    >
                        {/* This layer overlays ONLY where the mouse is */}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

// --- Helper Components ---

function StatsCard({ icon, label, value, suffix = "" }: any) {
    const count = useMotionValue(0);
    const rounded = useMotionValue(0);

    useEffect(() => {
        const animation = animate(count, value, { duration: 2 });
        // Update the 'rounded' state to remove decimals
        const unsubscribe = count.on("change", (latest) => rounded.set(Math.round(latest)));
        return () => {
            animation.stop();
            unsubscribe();
        }
    }, [value]);

    return (
        <div className="p-3 sm:p-6 rounded-lg sm:rounded-xl border border-white/10 bg-black/60 backdrop-blur-sm flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-2 hover:border-lime-500/30 transition-colors active:scale-95">
            <div className="p-2 sm:p-3 rounded-lg bg-white/5 shrink-0">{icon}</div>
            <div className="flex-1">
                <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">{label}</p>
                <div className="flex items-baseline gap-1">
                    <motion.span className="text-lg sm:text-2xl font-bold text-slate-100 font-heading">
                        {/* This text updates automatically as numbers spin */}
                        <DisplayValue value={count} />
                    </motion.span>
                    <span className="text-xs sm:text-sm text-slate-500">{suffix}</span>
                </div>
            </div>
        </div>
    );
}

// Helper to render the motion value as text
function DisplayValue({ value }: { value: any }) {
    const [display, setDisplay] = useState(0);
    useEffect(() => value.on("change", (v: number) => setDisplay(Math.round(v))), [value]);
    return <>{display}</>;
}

// Helper for grid colors
function getColor(level: number) {
    switch (level) {
        case 0: return "bg-white/5 border border-white/10";
        case 1: return "bg-lime-900/30 border border-lime-900/50";
        case 2: return "bg-lime-700/50 border border-lime-700/50";
        case 3: return "bg-lime-500/70 border border-lime-500/50";
        case 4: return "bg-lime-400 border border-lime-300/50 shadow-[0_0_10px_rgba(163,230,53,0.4)]";
        default: return "bg-white/5";
    }
}
