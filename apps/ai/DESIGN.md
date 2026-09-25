# DESIGN.md - System Specification: ai.index0.in

## 1. ARCHETYPE DEFINITION
- **Core Aesthetic**: Cursor IDE Dark Minimalist Chrome fused with Retro-Futuristic ASCII Box-Drawing and Monospace Data Density.
- **Atmosphere**: Deep Obsidian terminal cockpit, sovereign engineering workstation, high information density with zero decorative clutter.

## 2. GLOBAL SYSTEM DIALS
- `DESIGN_VARIANCE: 8`: Asymmetric splits, non-standard bento cells, text-based structural dividers (`┌─┐│└─┘`, `╔═╗`, `╚═╝`).
- `MOTION_INTENSITY: 6`: Instant micro-interactions (100-150ms), interruptible spring physics, asymmetric exits (~20% faster).
- `VISUAL_DENSITY: 8`: High-density cockpit layout; 1px hairline borders and ASCII box art instead of rounded cards.

## 3. TYPOGRAPHY SYSTEM
- **Primary Typeface**: Monospace primary (`Geist Mono` or `JetBrains Mono`).
- **Headlines**: Uppercase tight tracking (`text-4xl md:text-6xl tracking-tighter uppercase font-mono`).
- **Metadata & Telemetry**: Monospace uppercase small caps (`text-xs tracking-wider font-mono`).
- **Strictly Banned**: Default `Inter` and decorative serifs (`Fraunces`, `Instrument Serif`).

## 4. STRICT 3-COLOR SYSTEM (DARK, WHITE, GRAY)
Zero chromatic colors. The entire platform interface strictly utilizes Dark, White, and Gray shades.

### Dark Mode (Deep Void Monochrome)
- **Base (Dark)**: `#0a0a0a`
- **Surface (Dark Chrome)**: `#141414`
- **Surface Active / Hover**: `#1f1f1f`
- **Hairline Border (Gray)**: `rgba(255, 255, 255, 0.12)`
- **Foreground (White)**: `#ffffff`
- **Muted Foreground (Light Gray)**: `#a3a3a3`
- **Dim Metadata (Medium Gray)**: `#737373`
- **Accent (White)**: `#ffffff`
- **Accent Foreground (Dark)**: `#0a0a0a`

### Light Mode (Clean Paper Monochrome)
- **Base (White)**: `#ffffff`
- **Surface (Light Gray)**: `#f5f5f5`
- **Surface Active / Hover**: `#e8e8e8`
- **Hairline Border (Gray)**: `rgba(0, 0, 0, 0.12)`
- **Foreground (Dark)**: `#0a0a0a`
- **Muted Foreground (Medium Gray)**: `#666666`
- **Dim Metadata (Gray)**: `#8c8c8c`
- **Accent (Dark)**: `#0a0a0a`
- **Accent Foreground (White)**: `#ffffff`

- **Strictly Banned**: Chromatic colors (orange, red, blue, green, purple, amber, pastels) in both modes. Every visual element must be composed strictly of Dark, White, or Gray.


## 5. ASCII BOX-DRAWING CHARACTERS
- Box corners & lines: `┌`, `┐`, `└`, `┘`, `│`, `─`, `├`, `┤`, `┬`, `┴`, `┼`
- Double lines: `╔`, `╗`, `╚`, `╝`, `║`, `═`, `╠`, `╣`, `╦`, `╩`, `╬`
- Block shades & progress: `░`, `▒`, `▓`, `█`
- Prompt glyphs: `❯`, `▶`, `▲`, `▼`, `◆`, `◇`, `■`, `□`, `●`, `○`

## 6. MOTION ENGINEERING SPECIFICATIONS
- **Frequency Gate Rule**: High-frequency actions (input typing, command palette keypress) trigger instantly (0-100ms) or omit open/close animations.
- **Timing Thresholds**:
  - Micro-interactions: 100-150ms
  - Overlays: 150-250ms
  - Modals: 200-300ms
  - Exit transitions run ~20% faster than entrance transitions.
- **Spring Physics**: Interruptible springs (`stiffness: 300, damping: 25`) via Motion (`import { motion } from "motion/react"`).
- **Origin-Aware Popovers**: Expand from trigger origin starting from `scale(0.95)`—NEVER `scale(0)`.
- **Hardware Acceleration**: Target `transform` and `opacity` exclusively. Never animate layout geometry (`width`, `height`, `margin`, `top`).

## 7. STRICT ANTI-SLOP RULES
- ❌ **ZERO Em-Dashes**: Complete ban on em-dashes (`—`) and en-dashes (`–`) in headlines, body copy, and UI tags. Use periods, colons, or standard hyphens (`-`).
- ❌ **NO AI Purple / Violet**: No `#6366f1` or default Tailwind indigo buttons.
- ❌ **NO Centered Hero + 3 Cards**: Banned generic centered template layouts.
- ❌ **NO Unprompted Dark Glows**: No heavy `shadow-[0_0_*]` neon glows on text or cards.
- ❌ **Viewport Stability**: Hero must use `min-h-[100dvh]` to prevent iOS Safari address bar jumping.
