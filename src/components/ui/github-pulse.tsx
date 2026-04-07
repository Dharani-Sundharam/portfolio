"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { useEffect, useState } from "react";
import { Github } from "lucide-react";

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
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    const maskImage = useMotionTemplate`radial-gradient(240px circle at ${mouseX}px ${mouseY}px, white, transparent)`;
    const style = { maskImage, WebkitMaskImage: maskImage };

    return (
        <section className="py-12 sm:py-24 relative z-0">
            <div className="w-full max-w-6xl mx-auto p-3 sm:p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-8 sm:mb-12"
                >
                    <div className="flex items-center justify-center gap-2 mb-2 sm:mb-4">
                        <Github className="text-slate-200 w-6 h-6 sm:w-8 sm:h-8" />
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading text-white text-shadow-lg">
                            Contribution Activity
                        </h2>
                    </div>
                    <p className="text-gray-400 text-sm sm:text-base text-shadow-sm">
                        {data.totalCommits} contributions from June 2025 to {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                </motion.div>

                {/* GitHub-Style Contribution Graph */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    onMouseMove={handleMouseMove}
                    className="relative border border-white/10 bg-black/40 backdrop-blur-sm rounded-lg sm:rounded-2xl p-4 sm:p-6 overflow-x-auto"
                >
                    <GitHubGraphView contributions={data.contributions} />

                    <motion.div
                        className="absolute inset-0 pointer-events-none bg-lime-500/20 rounded-lg sm:rounded-2xl"
                        style={style}
                    />
                </motion.div>

                {/* Stats Row */}
                <div className="mt-6 sm:mt-8 grid grid-cols-3 gap-3 sm:gap-4">
                    <div className="p-3 sm:p-4 rounded-lg border border-white/10 bg-white/5 text-center">
                        <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider font-semibold">Total</p>
                        <p className="text-xl sm:text-2xl font-bold text-white mt-1">{data.totalCommits}</p>
                    </div>
                    <div className="p-3 sm:p-4 rounded-lg border border-white/10 bg-white/5 text-center">
                        <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider font-semibold">Streak</p>
                        <p className="text-xl sm:text-2xl font-bold text-white mt-1">{data.currentStreak}</p>
                    </div>
                    <div className="p-3 sm:p-4 rounded-lg border border-white/10 bg-white/5 text-center">
                        <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider font-semibold">Since</p>
                        <p className="text-xl sm:text-2xl font-bold text-white mt-1">Jun '25</p>
                    </div>
                </div>
            </div>
        </section>
    );
}

function GitHubGraphView({ contributions }: { contributions: Contribution[] }) {
    // Organize contributions into weeks and days
    const weeks: Array<Array<Contribution | null>> = [];
    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Create a map of dates to contributions
    const contribMap = new Map(contributions.map(c => [c.date, c]));

    // Find start and end dates
    if (contributions.length === 0) {
        return <div className="text-gray-500 text-center py-8">No contributions found</div>;
    }

    const startDate = new Date(contributions[0].date);
    const endDate = new Date(contributions[contributions.length - 1].date);

    // Start from Sunday of the first week
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() - currentDate.getDay());

    // Build week-based grid
    while (currentDate <= endDate) {
        const week: Array<Contribution | null> = [];
        for (let i = 0; i < 7; i++) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const contrib = contribMap.get(dateStr);
            week.push(contrib || null);
            currentDate.setDate(currentDate.getDate() + 1);
        }
        weeks.push(week);
    }

    // Get month headers
    const monthHeaders: Array<{ month: string; week: number }> = [];
    let currentMonth = -1;
    weeks.forEach((week, weekIdx) => {
        const firstDate = new Date(contributions[0].date);
        firstDate.setDate(firstDate.getDate() + weekIdx * 7);
        const month = firstDate.getMonth();
        if (month !== currentMonth && week.some(d => d)) {
            monthHeaders.push({ month: monthLabels[month], week: weekIdx });
            currentMonth = month;
        }
    });

    return (
        <div className="flex flex-col gap-3">
            {/* Month Labels */}
            <div className="flex gap-1 ml-12">
                {monthHeaders.map((mh, i) => (
                    <div
                        key={i}
                        className="text-xs text-gray-500 font-semibold"
                        style={{ marginLeft: mh.week === 0 ? 0 : `${(mh.week - monthHeaders[i - 1]?.week || 0) * 18}px` }}
                    >
                        {mh.month}
                    </div>
                ))}
            </div>

            {/* Graph Grid */}
            <div className="flex gap-1">
                {/* Day Labels */}
                <div className="flex flex-col gap-1 mr-2">
                    {dayLabels.map((day, i) => (
                        <div key={day} className="w-10 h-4 sm:h-5 text-xs text-gray-500 flex items-center justify-end pr-2">
                            {[0, 2, 4, 6].includes(i) ? day : ""}
                        </div>
                    ))}
                </div>

                {/* Weeks */}
                <div className="flex gap-1">
                    {weeks.map((week, weekIdx) => (
                        <div key={weekIdx} className="flex flex-col gap-1">
                            {week.map((day, dayIdx) => (
                                <div
                                    key={`${weekIdx}-${dayIdx}`}
                                    className={`w-3 h-3 sm:w-4 sm:h-4 rounded-[2px] sm:rounded-sm transition-all duration-200 cursor-pointer hover:ring-1 hover:ring-cyan-400 ${
                                        getGitHubColor(day?.level || 0)
                                    }`}
                                    title={day ? `${day.count} contributions on ${day.date}` : ""}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end gap-2 mt-4 text-xs text-gray-400">
                <span>Less</span>
                <div className="flex gap-1">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-[1px] bg-white/10 border border-white/20" />
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-[1px] bg-green-900/40 border border-green-900" />
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-[1px] bg-green-700/60 border border-green-700" />
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-[1px] bg-green-500/80 border border-green-500" />
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-[1px] bg-green-400 border border-green-300 shadow-[0_0_8px_rgba(74,222,128,0.4)]" />
                </div>
                <span>More</span>
            </div>
        </div>
    );
}

function getGitHubColor(level: number): string {
    switch (level) {
        case 0:
            return "bg-white/10 border border-white/20";
        case 1:
            return "bg-green-900/40 border border-green-900/50 hover:bg-green-900/50";
        case 2:
            return "bg-green-700/60 border border-green-700/50 hover:bg-green-700/70";
        case 3:
            return "bg-green-500/80 border border-green-500/50 hover:bg-green-500/90";
        case 4:
            return "bg-green-400 border border-green-300/50 shadow-[0_0_8px_rgba(74,222,128,0.4)] hover:shadow-[0_0_12px_rgba(74,222,128,0.6)]";
        default:
            return "bg-white/10";
    }
}
