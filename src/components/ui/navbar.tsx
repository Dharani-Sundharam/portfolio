"use client";

import { motion } from "framer-motion";
import { Home, Code, Briefcase, Mail } from "lucide-react";
import Link from "next/link";

const navItems = [
    { name: "Home", href: "#hero", icon: Home },
    { name: "Experience", href: "#experience", icon: Briefcase },
    { name: "Projects", href: "#projects", icon: Code },
];

export function Navbar() {
    return (
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto"
        >
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-black/80 backdrop-blur-md shadow-lg shadow-white/5">
                {navItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className="p-3 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300 relative group"
                        aria-label={item.name}
                    >
                        <item.icon size={20} />
                        <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-xs rounded border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            {item.name}
                        </span>
                    </Link>
                ))}

                <div className="w-px h-6 bg-white/10 mx-2" />

                <a
                    href="mailto:hello@example.com"
                    className="p-3 rounded-full text-white hover:text-gray-200 hover:bg-white/10 transition-all"
                >
                    <Mail size={20} />
                </a>
            </div>
        </motion.div>
    );
}
