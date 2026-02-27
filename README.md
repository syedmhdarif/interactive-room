# Interactive Room — 3D Portfolio

A first-person interactive 3D portfolio built with Next.js, React Three Fiber, and Three.js. Walk through an aurora night scene, approach the computer, and explore my projects.

## Live Demo

**[https://interactive-room-wine.vercel.app/](https://interactive-room-wine.vercel.app/)**

## How to Navigate

| Control | Action |
|---|---
| Click canvas | Enter first-person mode |
| W / A / S / D | Move around |
| Mouse | Look around |
| Shift | Sprint |
| Click computer | View projects |
| ESC | Exit / close modal |

## Tech Stack

- [Next.js 16](https://nextjs.org) — App Router, SSR disabled for 3D canvas
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) — React renderer for Three.js
- [@react-three/drei](https://github.com/pmndrs/drei) — Helpers (useGLTF, Html)
- [Three.js](https://threejs.org) — 3D engine, custom GLSL shaders
- TypeScript

## Features

- Aurora borealis sky with custom vertex-displacement GLSL shaders
- 11,000 independently twinkling stars (full 360° sphere)
- First-person WASD controls with pointer lock
- GLB models: table, computer, character, house
- Glassmorphism project modal

## Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)
