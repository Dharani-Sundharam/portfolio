import { Hero } from "@/components/sections/hero";
import { Experience } from "@/components/sections/experience";
import { Education } from "@/components/sections/education";
import { Skills } from "@/components/sections/skills";
import GithubPulse from "@/components/ui/github-pulse";
import { GithubTimeline } from "@/components/ui/github-timeline";
import { Projects } from "@/components/sections/projects";
import { Footer } from "@/components/ui/footer";
import { getGithubPulseData } from "@/lib/github-pulse-loader";

export default async function Home() {
  const pulseData = await getGithubPulseData();

  return (
    <main className="min-h-screen text-slate-50 selection:bg-indigo-500/30 overflow-x-hidden">
      <Hero />
      <Experience />
      <Education />
      <Skills />
      <GithubPulse data={pulseData} />
      <GithubTimeline />
      <Projects />
      <Footer />
    </main>
  );
}
