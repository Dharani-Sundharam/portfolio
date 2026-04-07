"use client";

import { useEffect, useState } from "react";
import ClickSpark from "./click-spark";

interface ResponsiveClickSparkProps {
  sparkColor?: string;
  sparkSize?: number;
  sparkRadius?: number;
  sparkCount?: number;
  duration?: number;
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  extraScale?: number;
  children?: React.ReactNode;
}

export default function ResponsiveClickSpark({
  sparkColor = '#00eaffff',
  sparkSize = 18,
  sparkRadius = 16,
  sparkCount = 8,
  duration,
  easing,
  extraScale,
  children
}: ResponsiveClickSparkProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isMobileDevice = window.innerWidth < 1024;
    setIsMobile(isMobileDevice);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!mounted) return <>{children}</>;

  // Disable ClickSpark on mobile to improve performance
  if (isMobile) {
    return <>{children}</>;
  }

  // Desktop: Render full ClickSpark effect
  return (
    <ClickSpark
      sparkColor={sparkColor}
      sparkSize={sparkSize}
      sparkRadius={sparkRadius}
      sparkCount={sparkCount}
      duration={duration}
      easing={easing}
      extraScale={extraScale}
    >
      {children}
    </ClickSpark>
  );
}
