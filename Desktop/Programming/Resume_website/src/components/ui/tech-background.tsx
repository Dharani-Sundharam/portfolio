"use client";

import { useEffect, useRef } from "react";

export function TechBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const setSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        setSize();
        window.addEventListener("resize", setSize);

        // Configuration
        const gridSize = 40; // spacing between grid points
        const connectionChance = 0.3; // chance to connect neighbors
        const electronChance = 0.02; // chance for an electron to spawn on a path
        const nodes: { x: number, y: number, connections: { x: number, y: number }[] }[] = [];
        const electrons: {
            x: number, y: number,
            targetX: number, targetY: number,
            progress: number, speed: number
        }[] = [];

        // Initialize Grid
        const cols = Math.ceil(canvas.width / gridSize);
        const rows = Math.ceil(canvas.height / gridSize);

        for (let i = 0; i <= cols; i++) {
            for (let j = 0; j <= rows; j++) {
                nodes.push({
                    x: i * gridSize,
                    y: j * gridSize,
                    connections: []
                });
            }
        }

        // Create Connections (Horizontal & Vertical only for Circuit look)
        nodes.forEach((node, i) => {
            // Connect to right neighbor
            if (Math.random() < connectionChance && i + rows + 1 < nodes.length && (i % (rows + 1) !== rows)) {
                // connection logic simplified: standard grid index math is tricky with 1D array
                // Let's just draw random horizontal/vertical lines slightly differently
            }
        });

        // Easier approach: Path Walkers (Traces)
        const traces: { path: { x: number, y: number }[], hue: number }[] = [];
        const numTraces = 20;

        function createTrace() {
            const startX = Math.floor(Math.random() * cols) * gridSize;
            const startY = Math.floor(Math.random() * rows) * gridSize;
            let currentX = startX;
            let currentY = startY;
            const path = [{ x: currentX, y: currentY }];
            const length = Math.floor(Math.random() * 20) + 5;
            let dir = Math.floor(Math.random() * 4); // 0: up, 1: right, 2: down, 3: left

            for (let k = 0; k < length; k++) {
                if (Math.random() < 0.2) dir = Math.floor(Math.random() * 4); // change dir

                if (dir === 0) currentY -= gridSize;
                else if (dir === 1) currentX += gridSize;
                else if (dir === 2) currentY += gridSize;
                else if (dir === 3) currentX -= gridSize;

                path.push({ x: currentX, y: currentY });
            }
            return { path, hue: 190 }; // Cyan hue base
        }

        for (let i = 0; i < numTraces; i++) traces.push(createTrace());

        const animate = () => {
            // Semi-clear for trail effect? No, clean clear for circuit look.
            ctx.fillStyle = "rgba(5, 5, 8, 1)"; // Deep opaque background
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw static grid dots (faint)
            ctx.fillStyle = "rgba(6, 182, 212, 0.05)";
            nodes.forEach(n => {
                ctx.fillRect(n.x - 1, n.y - 1, 2, 2);
            });

            // Draw Traces (Wires)
            ctx.lineWidth = 1;
            traces.forEach(trace => {
                ctx.strokeStyle = `rgba(6, 182, 212, 0.2)`;
                ctx.beginPath();
                if (trace.path.length > 0) {
                    ctx.moveTo(trace.path[0].x, trace.path[0].y);
                    for (let p of trace.path) ctx.lineTo(p.x, p.y);
                }
                ctx.stroke();

                // Draw "IC" pads at ends
                if (trace.path.length > 0) {
                    const end = trace.path[trace.path.length - 1];
                    ctx.fillStyle = "rgba(6, 182, 212, 0.1)";
                    ctx.fillRect(end.x - 3, end.y - 3, 6, 6);
                }
            });

            // Spawn Electrons
            if (electrons.length < 10 && Math.random() < 0.1) {
                const randomTrace = traces[Math.floor(Math.random() * traces.length)];
                if (randomTrace.path.length > 1) {
                    electrons.push({
                        x: randomTrace.path[0].x,
                        y: randomTrace.path[0].y,
                        targetX: randomTrace.path[1].x,
                        targetY: randomTrace.path[1].y,
                        progress: 0,
                        speed: 0.1, // fast
                        // Store path info to follow it? 
                        // Simplified: Just move between the first two points for now, 
                        // or properly implement path following.
                        // Let's implement full path following next frame.
                    } as any);
                    // Attaching full path to electron for navigation
                    const el = electrons[electrons.length - 1] as any;
                    el.pathIndex = 0;
                    el.path = randomTrace.path;
                }
            }

            // Update & Draw Electrons
            for (let i = electrons.length - 1; i >= 0; i--) {
                const e = electrons[i] as any;
                e.progress += e.speed;

                e.x = e.path[e.pathIndex].x + (e.path[e.pathIndex + 1].x - e.path[e.pathIndex].x) * e.progress;
                e.y = e.path[e.pathIndex].y + (e.path[e.pathIndex + 1].y - e.path[e.pathIndex].y) * e.progress;

                // Draw
                ctx.shadowBlur = 10;
                ctx.shadowColor = "cyan";
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(e.x, e.y, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;

                if (e.progress >= 1) {
                    e.pathIndex++;
                    e.progress = 0;
                    if (e.pathIndex >= e.path.length - 1) {
                        electrons.splice(i, 1); // Reached end
                    }
                }
            }

            requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener("resize", setSize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 bg-[#050508]"
        />
    );
}
