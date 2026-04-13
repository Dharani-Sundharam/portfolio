# Interactive 3D Portfolio

A highly interactive, visually striking personal portfolio website built with Next.js, React Three Fiber, and Tailwind CSS. The core experience features a fully rendered 3D motherboard where scrolling seamlessly navigates the camera through various hardware component sections.

## Overview

This project takes a novel approach to web portfolios by embedding a 3D WebGL scene directly within the browser. Viewers fly through a motherboard environment, exploring different sections (About, Skills, Projects, Experience) stylized as physical hardware components such as CPU sockets, RAM modules, and NVMe drives. 

## Key Features

* **3D WebGL Integration:** Uses Three.js and React Three Fiber to render a real-time, interactive motherboard environment that reacts to user interactions.
* **Cinematic Scroll Navigation:** Viewers navigate by scrolling, driving a custom keyframe camera rig for smooth, cinematic transitions between points of interest.
* **Hardware-Themed UI:** Custom overlay panels (`CpuPanel`, `RamPanel`, etc.) gracefully slide into view as the camera settles on their targeted 3D locations.
* **Responsive Architecture:** Auto-detects device constraints and screen sizes, delivering an elegant and fast 2D fallback (`MobileView`) for mobile devices to maximize performance.
* **Dynamic Lighting:** Real-time point lights activate and synchronize their glow with the current active section for a more immersive feel.

## Built With

* [![Next.js][Next.js]][Next-url]
* [![React][React.js]][React-url]
* [![TypeScript][TypeScript]][TypeScript-url]
* [![Three.js][Three.js]][Three-url]
* [![Tailwind CSS][Tailwind.css]][Tailwind-url]
* [![Framer Motion][FramerMotion]][FramerMotion-url]
* [![GSAP][GSAP]][GSAP-url]

## Getting Started

### Prerequisites

Ensure you have Node.js (v18+) and your preferred package manager (npm, yarn, pnpm) installed.

### Installation

1. Clone this repository.
2. Install the necessary dependencies:

```bash
npm install
```

### Local Development

Start the local development server:

```bash
npm run dev
```

Navigate to `http://localhost:3000` to view the 3D desktop site. 
Resize your browser window below 1024px to test the responsive 2D mobile layout.

## Codebase Structure

* `/src/app` - Contains the primary Next.js application logic, including the desktop/mobile conditional renderer.
* `/src/components` - Houses isolated React components like the `InteractiveBoard` (3D scene root), `MobileView`, and overlay UI panels.
* `/src/data` - Contains the raw data populating the site content (`portfolio.json`, `projects.json`, `sections.ts`).
* `/src/lib` - Stores custom scripts handling scroll progression arithmetic, tweening, and viewport snap navigation.
* `/public` - Stores static WebGL assets, including the core `motherboard.glb` file.

## Performance Modeling

To maintain 60FPS in standard web environments, the scene and assets are carefully optimized. When replacing models or adding logic inside `InteractiveBoard`, be mindful of draw calls and avoid unnecessarily recalculating layout geometries on unmemoized frames.

## License

This is an open source look at my personal portfolio codebase. Feel free to explore the code to learn my approach to React Three Fiber integration and cinematic keyframe camera setups.

<!-- MARKDOWN LINKS & IMAGES -->
[Next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[TypeScript]: https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white
[TypeScript-url]: https://www.typescriptlang.org/
[Three.js]: https://img.shields.io/badge/Three.js-black?style=for-the-badge&logo=three.js&logoColor=white
[Three-url]: https://threejs.org/
[Tailwind.css]: https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white
[Tailwind-url]: https://tailwindcss.com/
[FramerMotion]: https://img.shields.io/badge/Framer_Motion-white?style=for-the-badge&logo=framer&logoColor=black
[FramerMotion-url]: https://www.framer.com/motion/
[GSAP]: https://img.shields.io/badge/GSAP-88CE02?style=for-the-badge&logo=greensock&logoColor=white
[GSAP-url]: https://gsap.com/
