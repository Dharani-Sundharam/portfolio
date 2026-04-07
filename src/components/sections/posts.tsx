"use client";

import { motion } from "framer-motion";
import portfolio from "@/data/portfolio.json";
import { Card } from "@/components/ui/card";
import { Newspaper, ArrowUpRight } from "lucide-react";

export function Posts() {
    const { posts } = portfolio;

    // Guard clause if no posts exist
    if (!posts || posts.length === 0) return null;

    return (
        <section id="posts" className="py-12 sm:py-24 relative bg-black/30">
            <div className="container mx-auto px-3 sm:px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-8 sm:mb-16"
                >
                    <div className="flex items-center justify-center gap-2 mb-2 sm:mb-4">
                        <Newspaper className="text-white w-6 h-6 sm:w-8 sm:h-8" />
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading text-white text-shadow-lg">
                            Recent Thoughts
                        </h2>
                    </div>
                    <p className="text-gray-400 text-sm sm:text-base text-shadow-sm">Summaries from my LinkedIn feed.</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
                    {posts.map((post, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <Card className="h-full flex flex-col bg-black/60 border-white/10 hover:border-white/30 transition-colors p-4 sm:p-6">
                                <h3 className="text-base sm:text-xl font-bold text-white mb-2 text-shadow">{post.title}</h3>
                                <p className="text-gray-400 flex-grow mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base text-shadow-sm">
                                    {post.summary}
                                </p>
                                <div className="mt-auto">
                                    <a
                                        href={post.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-white hover:text-gray-300 active:scale-95 transition-all text-xs sm:text-sm font-medium"
                                    >
                                        Read on LinkedIn <ArrowUpRight size={14} />
                                    </a>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
