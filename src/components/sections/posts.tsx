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
        <section id="posts" className="py-24 relative bg-black/30">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Newspaper className="text-white" size={32} />
                        <h2 className="text-3xl md:text-4xl font-bold font-heading text-white text-shadow-lg">
                            Recent Thoughts
                        </h2>
                    </div>
                    <p className="text-gray-400 text-shadow-sm">Summaries from my LinkedIn feed.</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {posts.map((post, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <Card className="h-full flex flex-col bg-black/60 border-white/10 hover:border-white/30 transition-colors">
                                <h3 className="text-xl font-bold text-white mb-2 text-shadow">{post.title}</h3>
                                <p className="text-gray-400 flex-grow mb-6 leading-relaxed text-shadow-sm">
                                    {post.summary}
                                </p>
                                <div className="mt-auto">
                                    <a
                                        href={post.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-white hover:text-gray-300 transition-colors text-sm font-medium"
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
