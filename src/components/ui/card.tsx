"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface CardProps {
    children: ReactNode;
    className?: string;
    delay?: number;
}

export function Card({ children, className, delay = 0 }: CardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            whileHover={{ scale: 1.01 }}
            className={cn(
                "relative rounded-sm border border-slate-800 bg-black/60 backdrop-blur-md p-6 overflow-hidden group transition-all duration-300 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]",
                className
            )}
        >
            {/* Tech Corners */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-500/30 group-hover:border-cyan-400 transition-colors" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan-500/30 group-hover:border-cyan-400 transition-colors" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-cyan-500/30 group-hover:border-cyan-400 transition-colors" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-500/30 group-hover:border-cyan-400 transition-colors" />

            {/* Subtle Glow Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            {children}
        </motion.div>
    );
}
