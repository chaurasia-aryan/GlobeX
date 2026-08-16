# Component Audit — GLOBEX AI

This document provides a verifiable proof-of-work map linking each UI section, interactive component, library origin, and source file in accordance with Section 1 of the Visual Craft Fix Protocol.

---

## Component Provenance Matrix

| Section / Functionality | Component | Library / Origin | Source File | Implementation Details |
| :--- | :--- | :--- | :--- | :--- |
| **Navbar (Dynamic Shrink)** | `Navbar` | `@aceternity/resizable-navbar` behavior | `src/components/layout/Navbar.tsx` | Scroll-reactive height reduction, transparent-to-solid backdrop blur. |
| **Hero Headline** | `TextGenerateEffect` | `@aceternity/text-generate-effect` | `src/components/ui/text-generate-effect.tsx` | Word-by-word reveal sequence with blur-to-sharp animation. |
| **Hero Background Accent** | `DottedGlowBackground` | `@aceternity/dotted-glow-background` | `src/components/ui/dotted-glow-background.tsx` | Subtle radial dot matrix positioned strictly behind the 3D globe zone. |
| **Hero CTA (Primary)** | `Button (MovingBorder)` | `@aceternity/moving-border` | `src/components/ui/moving-border.tsx` | Orbiting cyan accent border path on primary action button. |
| **Hero CTA (Secondary)** | Plain text link | Native React Router + Lucide | `src/pages/LandingPage.tsx` | Minimal ghost link (`Explore the marketplace →`) with zero border clutter. |
| **Hero 3D Visualizer** | `TradeGlobe` | WebGL Three.js / `react-globe.gl` | `src/components/TradeGlobe.tsx` | Asymmetric right-aligned 3D globe with country pop-out and transit arcs. |
| **Live Metric Ticker** | `Marquee` + `CountUp` | Magic UI (`marquee`) + React Bits | `src/components/ui/marquee.tsx` | Continuous ticker carrying animated count-up numerical statistics. |
| **Lifecycle Section** | `Timeline` | `@aceternity/timeline` | `src/components/ui/timeline.tsx` | Scroll-driven progress line carrying Discover → Assess → Verify → Settle stages. |
| **AI Demonstration Result** | `GlowingEffect` | `@aceternity/glowing-effect` | `src/components/ui/glowing-effect.tsx` | Single bold instance glowing border surrounding the $550k Basmati Rice AI test. |
| **Trust Architecture Diagram** | `AnimatedBeam` | Magic UI (`animated-beam`) | `src/components/ui/animated-beam.tsx` | Visual pulse beams connecting Evidence → AI → Decision → Settlement nodes. |
| **Final Call-to-Action** | `Button (MovingBorder)` | `@aceternity/moving-border` | `src/components/ui/moving-border.tsx` | Focused single-action button linking to trade analysis simulator. |
| **Top 10 Trusted Partners** | `CircularCarousel` | Magic UI / 21st.dev (`circular-carousel`) | `src/components/ui/circular-carousel.tsx` | Interactive circular orbital carousel displaying verified partner dossiers. |
| **Marketplace Catalog Grid** | `FocusCards` | `@aceternity/focus-cards` | `src/components/ui/focus-cards.tsx` | Hover-focus dimming grid with single AI match % badge per item. |
| **Smart Escrow Release** | `Button (StatefulButton)` | `@aceternity/stateful-button` | `src/components/ui/stateful-button.tsx` | Loading spinner ➔ checkmark success transition upon EVM release execution. |
| **Card Spotlight System** | `CardSpotlight` | `@aceternity/card-spotlight` | `src/components/ui/card-spotlight.tsx` | Unified cursor-following radial spotlight on cards across all pages. |
| **Blockchain Hash Visualizer**| `DecryptedText` | React Bits | `src/components/reactbits/DecryptedText.tsx` | Matrix decryption effect used strictly for hashes, blocks, and IDs. |

---
Audited & Verified: 2026-08-16
