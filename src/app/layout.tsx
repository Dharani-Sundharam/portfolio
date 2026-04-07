import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import ResponsiveBackground from "@/components/ui/responsive-background";
import ResponsiveClickSpark from "@/components/ui/responsive-click-spark";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dharani Sundharam - Portfolio",
  description: "Electronics and Communication Engineer Portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jakarta.variable} antialiased font-sans text-slate-50 relative bg-black`}
      >
        <ResponsiveBackground />
        <div className="relative z-10 w-full h-full">
          <ResponsiveClickSpark
            sparkColor='#00eaffff'
            sparkSize={18}
            sparkRadius={16}
            sparkCount={8}
            duration={300}
          >
            {children}
          </ResponsiveClickSpark>
        </div>
      </body>
    </html>
  );
}
