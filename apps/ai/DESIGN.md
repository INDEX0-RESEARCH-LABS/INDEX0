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

## 4. DUAL-MODE COLOR SYSTEM (OKLCH)
Max 1 accent color across the entire interface (Terminal Emerald), calibrated for contrast in each mode.

### Dark Mode (Deep Obsidian Void)
- **Base**: `oklch(0.08 0.01 260)` (`#0b0c0e`)
- **Surface (Cockpit Chrome)**: `oklch(0.12 0.015 260)` (`#121418`)
- **Surface Active / Hover**: `oklch(0.16 0.02 260)` (`#1a1c22`)
- **Hairline Border**: `oklch(0.22 0.02 260)` (`#252830`)
- **Foreground (Crisp Off-White)**: `oklch(0.96 0.01 260)` (`#f5f6f8`)
- **Muted Foreground**: `oklch(0.55 0.02 260)` (`#777e8c`)
- **Dim Metadata**: `oklch(0.40 0.015 260)`
- **Accent (Terminal Emerald)**: `oklch(0.72 0.19 155)` (`#10b981`)
- **Accent Dim**: `oklch(0.72 0.19 155 / 0.15)`
- **Diff Insertion**: `oklch(0.72 0.19 155)` / Background `oklch(0.72 0.19 155 / 0.12)`
- **Diff Deletion**: `oklch(0.65 0.22 25)` / Background `oklch(0.65 0.22 25 / 0.12)`

### Light Mode (Paper Terminal / Clean Laboratory Monochrome)
- **Base (Alabaster Void)**: `oklch(0.97 0.005 260)` (`#f6f7f9`)
- **Surface (Lab Chrome)**: `oklch(0.93 0.008 260)` (`#edf0f4`)
- **Surface Active / Hover**: `oklch(0.88 0.01 260)` (`#e1e5eb`)
- **Hairline Border (Carbon Pencil)**: `oklch(0.82 0.015 260)` (`#cfd4dc`)
- **Foreground (Typewriter Ink)**: `oklch(0.12 0.015 260)` (`#101216`)
- **Muted Foreground**: `oklch(0.45 0.02 260)` (`#545965`)
- **Dim Metadata**: `oklch(0.60 0.015 260)`
- **Accent (Deep Terminal Emerald)**: `oklch(0.50 0.18 155)` (`#059669` for WCAG AAA contrast)
- **Accent Dim**: `oklch(0.50 0.18 155 / 0.12)`
- **Diff Insertion**: `oklch(0.46 0.18 155)` / Background `oklch(0.50 0.18 155 / 0.10)`
- **Diff Deletion**: `oklch(0.52 0.22 25)` / Background `oklch(0.52 0.22 25 / 0.10)`

- **Strictly Banned**: AI Purple (`#6366f1`) and indigo/violet primary gradients in both modes.

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
