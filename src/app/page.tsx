import { Hero } from "@/components/sections/hero";
import { Experience } from "@/components/sections/experience";
import { Education } from "@/components/sections/education";
import { Skills } from "@/components/sections/skills";
import { Projects } from "@/components/sections/projects";
import { Footer } from "@/components/ui/footer";

export default function Home() {
  return (
    <main className="min-h-screen text-slate-50 selection:bg-indigo-500/30 overflow-x-hidden">
      <Hero />
      <Experience />
      <Education />
      <Skills />
      <Projects />
      <Footer />
    </main>
  );
}
