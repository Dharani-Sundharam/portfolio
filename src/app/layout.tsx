import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import PrismBackground from "@/components/ui/prism";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dev Portfolio",
  description: "Senior Frontend Engineer Portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jakarta.variable} antialiased font-sans text-slate-50 relative`}
      >
        <div className="fixed inset-0 z-0 pointer-events-none">
          <PrismBackground
            animationType="3drotate"
            timeScale={1}
            height={3}
            baseWidth={5.5}
            scale={3}
            hueShift={0.36}
            colorFrequency={1.2}
            noise={0}
            glow={0.8}
          />
        </div>
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
