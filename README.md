# PKlab | Engineering Calculators for CNC Machine Design

Welcome to **PKlab**, a premium, high-fidelity engineering editorial and interactive portal built specifically for CNC machinists, router operators, mechanical engineers, and machine designers. 

This repository contains the complete codebase for the interactive portal, delivering sub-second, real-time calculations, detailed materials libraries, and technical standards compliance documents.

## 🚀 Key Features

- **15+ Interactive Engineering Calculators**: Accurate solvers for machining speeds, feeds, spindle systems, ball screws, servos, tool deflections, and thread configurations. All calculations are executed purely client-side with zero telemetry or tracking.
- **Dynamic Structural Routing**: High-performance custom hash-routing architecture (`src/router/`) that automatically manages SEO, breadcrumbs, detail layouts, and custom JSON-LD schema metadata based on declarative JSON catalogs.
- **Unified Global Search Faceting**: Search instantaneously across calculators, topics, materials, and machinery assets simultaneously. Filter and narrow down results by category, difficulty level, material group, or machine type.
- **Metallurgical Materials Library**: A comprehensive references database with Brinell hardness indices, tensile strengths, recommendations for surface feeds, and specific cutting energy rates.
- **Editorial Bulletin & Standards Compliance**: Deep-dive handbooks and articles detailing critical theories from chip-thinning dynamics to ASME B5.50 / ISO 286 mechanical tolerances.
- **Optimized Singlefile Build**: Leveraging Vite's production packing, the entire web application can build as a fully self-contained standalone HTML document, perfect for offline shop-floor usage on tablets, mobile screens, or desktop terminals.

---

## 🛠️ Technology Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 7](https://vite.dev/)
- **Styles**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Math Formulations**: [KaTeX](https://katex.org/) for beautiful, LaTeX-rendered mathematical equations.
- **Animations**: [Framer Motion](https://www.framer.com/motion/) for fluid page transitions, tickers, and interactive micro-interactions.

---

## 📁 Repository Structure

```tree
PKlab/
├── index.html                  # Root template & SEO boilerplate
├── package.json                # Project dependencies & npm scripts
├── vite.config.ts              # Vite configuration (Tailwind v4 & SingleFile)
├── tsconfig.json               # TypeScript configuration
├── public/                     # Static assets & offline database
│   ├── manifest.json           # PWA web manifest definition
│   └── data/                   # Main JSON databases
│       ├── categories.json     # Machining catalog sectors
│       ├── calculators.json    # Interactive formulas & variables
│       ├── topics.json         # Advanced engineering articles
│       ├── materials.json      # Metallurgical reference data
│       ├── machines.json       # OEM CNC machinery specifications
│       └── standards.json      # Compliance indices (ISO/ASME)
└── src/                        # React source application
    ├── main.tsx                # Application mounting entrypoint
    ├── App.tsx                 # Core shell, SEO metadata, & layouts router
    ├── index.css               # Tailwind directives & CSS variable systems
    ├── router/                 # Hash router, auto-breadcrumbs & schema.org schemas
    ├── layouts/                # General shells (Nav, Footer, PageShell)
    ├── components/             # Reusable UI controls & modular visual elements
    ├── data/                   # Data Access Layer & Global Facet Search Engine
    ├── hooks/                  # Dark/light theme & favorites bookmarking hooks
    ├── pages/                  # Editorial templates (About, Category, Calculators, etc.)
    ├── topics/                 # Specific deep-dive engineering scripts
    └── calculators/            # Mathematical evaluation formulas & UI engines
```

---

## 💻 Local Development

Get the portal running on your system with these simple steps:

### Prerequisites
Make sure you have Node.js (version 18+ recommended) and npm installed.

### Installation
1. Install project dependencies:
   ```bash
   npm install
   ```

2. Spin up the Vite development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173/index.source.html` (or the address printed in your terminal) to view the live website in your browser.

### Build and Deployment
To compile the application into a production-optimized package:
```bash
npm run build
   ```
This generates a single, highly-optimized, self-contained HTML file inside the `dist/` directory using the Vite SingleFile plugin, allowing you to load and run all features offline instantly on any browser terminal. The build is then **promoted to the repository root as `index.html`** automatically.

> **⚠️ How GitHub Pages serves this repo (important)**
> GitHub Pages deploys the **root of `main`**. The root `index.html` therefore *is* the live website and must always contain the built, self-contained app — never the raw Vite template (which references `/src/main.tsx` and renders as a blank page).
>
> - `index.source.html` → the Vite entry template used for **development and builds** (served at `/index.source.html` in dev mode).
> - `index.html` → the **production artifact** served to visitors. `npm run build` regenerates it; commit and push the updated file to `main` to publish.
> - After editing source, always run `npm run build`, commit the refreshed root `index.html`, and push to `main`.

---

## 🛡️ License & Attributions

Developed with mathematical precision and calibrated for CNC machinery performance. All formulas conform to standard engineering guidelines (ISO, ASME, DIN).

Feel free to browse, customize, and extend calculators for your specific mechanical shop-floor operations.
