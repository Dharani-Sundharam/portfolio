import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "7.css/dist/7.scoped.css";
import "./globals.css";

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
  description: "Electronics and Communication Engineer | IoT · Embedded · Cybersecurity",
  icons: {
    icon: '/images/DS logo.png',
    apple: '/images/DS logo.png',
  },
};

// App-like on mobile: fill the device, no pinch-zoom.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jakarta.variable} antialiased font-sans text-slate-50 bg-slate-950`}
      >
        {children}
      </body>
    </html>
  );
}
