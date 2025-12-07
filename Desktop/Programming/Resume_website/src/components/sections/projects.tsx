import { Suspense } from "react";
import { fetchGitHubRepos } from "@/lib/github";
import { ProjectCarousel } from "@/components/ui/project-carousel";
import SpotlightCard from "@/components/ui/spotlight-card";
import { Star, GitBranch, ArrowUpRight } from "lucide-react";

// Extract username from social link or hardcode
const GITHUB_USERNAME = "Dharani-Sundharam";

// Manual Project Data (Featured)
const MANUAL_PROJECTS = [
    {
        id: 1,
        name: "DriveSync",
        description: "Vehicle-to-Vehicle (V2V) communication capability for decentralized navigation using Python, ROS, and YDLIDAR sensors. Features SLAM-based navigation with a custom control codebase.",
        html_url: "https://github.com/Dharani-Sundharam/DriveSync",
        language: "Python",
        stargazers_count: 12,
        image: "/images/projects/Drivesync1.png"
    },
    {
        id: 2,
        name: "4-bit Calculator",
        description: "Hardware implementation of a 4-bit arithmetic calculator using discrete logic components and C++. Supporting addition, subtraction, and multiplication with 8-bit output.",
        html_url: "https://github.com/Dharani-Sundharam/4-bit-calculator",
        language: "C++",
        stargazers_count: 8,
        image: "/images/projects/4_bit_calc.jpeg"
    },
    {
        id: 3,
        name: "Smart Vending Machine",
        description: "Sustainable healthcare solution providing 24/7 access to essential medicines using Raspberry Pi, RFID, and Flask. Features real-time stock monitoring and secure contactless dispensing.",
        html_url: "", // No link
        language: "Python",
        stargazers_count: 15,
        image: "/images/projects/vending_machine.jpeg"
    },
    {
        id: 4,
        name: "Fiber-Optics based Light collector",
        description: "A Solar collector which concentrates Sunlight by a matrix of Solar luminescence concentrators that are made up of fiber optic material which collect and concentrate light assembly into fiber optic cables and which guide the light to a desired location where it can be used for lighting and reduce electricity consumption.",
        html_url: "https://github.com/Dharani-Sundharam/Optic_light", // No link
        language: "Python",
        stargazers_count: 15,
        image: "/images/projects/optic.jpg"
    }
];

// Carousel images map
const PROJECT_IMAGES = {
    "DriveSync": "/images/projects/Drivesync1.png",
    "4-bit Calculator": "/images/projects/4_bit_calc.jpeg",
    "Smart Vending Machine": "/images/projects/vending_machine.jpeg"
};

// Repos to fetch from GitHub for "Other Repositories"
const OTHER_REPOS_KEYS = [
    "railway-system",
    "V2V",
    "TTS_Engine",
    "ProjectManager",
    "Autobluetoothoff",
    "Blackeye-download"
];

export function Projects() {
    return (
        <section id="projects" className="py-24 backdrop-blur-sm relative z-0 overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 font-heading text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] text-shadow-lg">
                        Featured Projects
                    </h2>
                    <p className="text-gray-400 text-shadow-sm">
                        Open source contributions and personal repositories.
                    </p>
                </div>

                <Suspense fallback={<ProjectsSkeleton />}>
                    <ProjectContent />
                </Suspense>
            </div>
        </section>
    );
}

async function ProjectContent() {
    // 1. Fetch from GitHub
    let otherRepos = [];
    try {
        const repos = await fetchGitHubRepos(GITHUB_USERNAME);
        otherRepos = repos.filter(repo =>
            OTHER_REPOS_KEYS.some(key => repo.name.toLowerCase() === key.toLowerCase())
        );
    } catch (error) {
        console.error("Failed to fetch GitHub repos:", error);
    }

    return (
        <div className="space-y-24">
            {/* Featured Project Carousel (Manual Data) */}
            <div className="flex flex-col items-center justify-center min-h-[500px] py-12">
                <h3 className="text-xl text-white/90 font-mono mb-8 uppercase tracking-widest text-center text-shadow-sm border-b border-white/10 pb-2">
                    &lt;Top_Priority_Builds /&gt;
                </h3>
                <ProjectCarousel projects={MANUAL_PROJECTS as any} images={PROJECT_IMAGES} />
            </div>

            {/* Spotlight Grid for Other Repositories (GitHub Data) */}
            {otherRepos.length > 0 && (
                <div>
                    <h3 className="text-xl text-gray-400 font-mono mb-8 uppercase tracking-widest text-center text-shadow-sm">
                        &lt;Other_Repositories /&gt;
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {otherRepos.map((repo, i) => {
                            const colors = [
                                '0, 229, 255', // Cyan
                                '239, 68, 68',   // Red
                                '59, 130, 246',  // Blue
                                '249, 115, 22',  // Orange
                                '168, 85, 247',  // Purple
                                '16, 185, 129',  // Emerald
                            ];
                            const colorIndex = (repo.name.length + i) % colors.length;
                            const spotlightColor = `rgba(${colors[colorIndex]}, 0.2)` as any;

                            return (
                                <SpotlightCard key={repo.id} spotlightColor={spotlightColor} className="h-full flex flex-col">
                                    <div className="flex justify-between items-start mb-4 z-10 relative">
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <GitBranch size={18} className="text-white" />
                                            <span className="font-semibold truncate max-w-[150px] text-white group-hover:text-gray-200 transition-colors text-shadow-sm">
                                                {repo.name}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 text-gray-400 bg-white/5 px-2 py-1 rounded-full text-xs border border-white/10">
                                            <Star size={14} className="text-white fill-white" />
                                            <span>{repo.stargazers_count}</span>
                                        </div>
                                    </div>

                                    <p className="text-gray-400 text-sm mb-6 flex-grow line-clamp-3 leading-relaxed text-shadow-sm z-10 relative">
                                        {repo.description || "No description provided."}
                                    </p>

                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10 z-10 relative">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${getLanguageColor(repo.language)} shadow-[0_0_8px_currentColor]`} />
                                            <span className="text-xs text-gray-400">{repo.language || "Unknown"}</span>
                                        </div>

                                        <a
                                            href={repo.html_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-white hover:text-gray-300 text-sm flex items-center gap-1 transition-colors hover:translate-x-1 font-medium pointer-events-auto"
                                        >
                                            View Code <ArrowUpRight size={14} />
                                        </a>
                                    </div>
                                </SpotlightCard>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

function ProjectsSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
                <div
                    key={i}
                    className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 h-[300px] animate-pulse"
                >
                    <div className="h-40 w-full bg-slate-800 rounded mb-4"></div>
                    <div className="h-6 w-3/4 bg-slate-800 rounded mb-2"></div>
                    <div className="h-4 w-1/2 bg-slate-800 rounded mb-6"></div>
                </div>
            ))}
        </div>
    );
}

function getLanguageColor(language: string) {
    const colors: Record<string, string> = {
        TypeScript: "bg-blue-500 text-blue-500",
        JavaScript: "bg-yellow-400 text-yellow-400",
        css: "bg-pink-400 text-pink-400",
        HTML: "bg-orange-500 text-orange-500",
        Python: "bg-green-500 text-green-500",
        "C++": "bg-purple-500 text-purple-500",
        Java: "bg-red-500 text-red-500",
        Shell: "bg-gray-400 text-gray-400",
    };
    return colors[language] || "bg-slate-500 text-slate-500";
}
