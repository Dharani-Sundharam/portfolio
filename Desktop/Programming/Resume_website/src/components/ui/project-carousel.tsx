"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Star } from "lucide-react";
import TiltedCard from "@/components/ui/tilted-card";
import { useState } from "react";

interface Project {
    id: number;
    name: string;
    description: string;
    html_url: string;
    language: string;
    stargazers_count: number;
    image?: string;
}

interface ProjectCarouselProps {
    projects: Project[];
    images: Record<string, string>;
}

export function ProjectCarousel({ projects, images }: ProjectCarouselProps) {
    const [activeIndex, setActiveIndex] = useState(0);

    const nextSlide = () => {
        setActiveIndex((prev) => (prev + 1) % projects.length);
    };

    const prevSlide = () => {
        setActiveIndex((prev) => (prev - 1 + projects.length) % projects.length);
    };

    if (!projects || projects.length === 0) return null;

    return (
        <div className="relative w-full max-w-5xl mx-auto py-12 px-4">
            <div className="relative overflow-hidden min-h-[600px] flex items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center">
                    {projects.map((project, index) => {
                        // For a simple carousel, let's show just the active one
                        if (index !== activeIndex) return null;

                        const img = project.image || getProjectImage(project.name, images) || "/images/projects/4_bit_calc.jpeg";
                        const isRestricted = project.name.toLowerCase().includes("vending") || project.name.toLowerCase().includes("medicine");

                        return (
                            <div
                                key={project.id}
                                className={`w-full md:w-[800px] h-[500px] ${!isRestricted ? 'cursor-pointer' : 'cursor-default'}`}
                                onClick={() => !isRestricted && window.open(project.html_url, "_blank")}
                            >
                                <TiltedCard
                                    imageSrc={img}
                                    altText={project.name}
                                    captionText={isRestricted ? "" : "See Github"}
                                    containerHeight="100%"
                                    containerWidth="100%"
                                    imageHeight="100%"
                                    imageWidth="100%"
                                    rotateAmplitude={12}
                                    scaleOnHover={1.05}
                                    showMobileWarning={false}
                                    showTooltip={!isRestricted}
                                    displayOverlayContent={true}
                                    overlayContent={
                                        <div className="absolute bottom-0 left-0 w-full h-[45%] bg-gradient-to-t from-black via-black/80 to-transparent p-6 flex flex-col justify-end rounded-b-[15px]">
                                            <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                                <div className="mb-2">
                                                    <h3 className="text-3xl font-bold text-white mb-2 font-heading tracking-tight text-shadow-lg drop-shadow-lg">
                                                        {project.name}
                                                    </h3>
                                                    <div className="flex gap-4 text-xs font-mono text-gray-200 mb-4">
                                                        <span className="bg-white/10 px-2 py-1 rounded border border-white/20 backdrop-blur-md">
                                                            {project.language || "CODE"}
                                                        </span>
                                                        <span className="flex items-center gap-1 drop-shadow-md">
                                                            <Star className="w-3 h-3 text-white fill-white" /> {project.stargazers_count}
                                                        </span>
                                                    </div>
                                                </div>

                                                <p className="text-gray-100 leading-relaxed mb-4 line-clamp-2 text-shadow-md font-medium text-base drop-shadow-md max-w-2xl">
                                                    {project.description || "System data restricted. No description available."}
                                                </p>

                                                {!isRestricted && (
                                                    <div className="flex items-center text-white text-sm font-semibold tracking-wider transition-transform drop-shadow-md opacity-0 group-hover:opacity-100">
                                                        ACCESS_REPOSITORY <ArrowUpRight className="ml-2 w-4 h-4" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    }
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex justify-center gap-4 mt-8">
                <button
                    onClick={prevSlide}
                    className="p-3 bg-black/50 border border-white/10 rounded-full hover:bg-white/10 hover:border-white/30 text-gray-400 hover:text-white transition-all font-mono text-xs backdrop-blur-sm"
                >
                    &lt; PREV
                </button>
                <div className="flex gap-2 items-center">
                    {projects.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveIndex(i)}
                            className={`w-2 h-2 rounded-full transition-all ${i === activeIndex
                                ? "bg-white w-8 shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                                : "bg-gray-700 hover:bg-gray-500"
                                }`}
                        />
                    ))}
                </div>
                <button
                    onClick={nextSlide}
                    className="p-3 bg-black/50 border border-white/10 rounded-full hover:bg-white/10 hover:border-white/30 text-gray-400 hover:text-white transition-all font-mono text-xs backdrop-blur-sm"
                >
                    NEXT &gt;
                </button>
            </div>
        </div>
    );
}

function getProjectImage(name: string, images: Record<string, string>) {
    const nameLower = name.toLowerCase();
    for (const key of Object.keys(images)) {
        if (nameLower.includes(key.toLowerCase())) {
            return images[key];
        }
    }
    return null;
}
