"use client";

import { useEffect, useState } from "react";
import PrismBackground from "./prism";

export default function ResponsiveBackground() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // Check if viewport is desktop size (>= 1024px)
    const isLargeScreen = window.innerWidth >= 1024;
    setIsDesktop(isLargeScreen);

    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Desktop: Render the heavy WebGL Prism background
  if (isDesktop) {
    return (
      <div className="fixed inset-0 z-0 pointer-events-none">
        <PrismBackground
          animationType="3drotate"
          timeScale={0.7}
          height={3}
          baseWidth={5.5}
          scale={3}
          hueShift={0.3}
          colorFrequency={1.5}
          noise={0}
          glow={0.8}
        />
      </div>
    );
  }

  // Mobile: Simple gradient background for better performance
  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-br from-black via-slate-900 to-black" />
  );
}
