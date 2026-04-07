export function Footer() {
    return (
        <footer className="py-6 sm:py-8 text-center text-slate-500 text-xs sm:text-sm border-t border-slate-800/50 px-4">
            <p>&copy; {new Date().getFullYear()} Built with Next.js, Tailwind CSS & Framer Motion.</p>
        </footer>
    );
}
