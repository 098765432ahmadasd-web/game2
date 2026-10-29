---
name: Apex Velocity & Precision Engineering
colors:
  surface: '#131315'
  surface-dim: '#131315'
  surface-bright: '#39393b'
  surface-container-lowest: '#0e0e10'
  surface-container-low: '#1c1b1d'
  surface-container: '#201f21'
  surface-container-high: '#2a2a2c'
  surface-container-highest: '#353437'
  on-surface: '#e5e1e4'
  on-surface-variant: '#e9bcb9'
  inverse-surface: '#e5e1e4'
  inverse-on-surface: '#313032'
  outline: '#af8784'
  outline-variant: '#5e3f3d'
  surface-tint: '#ffb3af'
  primary: '#ffb3af'
  on-primary: '#68000d'
  primary-container: '#ff5355'
  on-primary-container: '#5c000a'
  inverse-primary: '#bf0021'
  secondary: '#ffb3b2'
  on-secondary: '#680013'
  secondary-container: '#d10030'
  on-secondary-container: '#ffe1e0'
  tertiary: '#00dbe9'
  on-tertiary: '#00363a'
  tertiary-container: '#00a0aa'
  on-tertiary-container: '#002f33'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdad7'
  primary-fixed-dim: '#ffb3af'
  on-primary-fixed: '#410005'
  on-primary-fixed-variant: '#930017'
  secondary-fixed: '#ffdad9'
  secondary-fixed-dim: '#ffb3b2'
  on-secondary-fixed: '#410008'
  on-secondary-fixed-variant: '#92001f'
  tertiary-fixed: '#7df4ff'
  tertiary-fixed-dim: '#00dbe9'
  on-tertiary-fixed: '#002022'
  on-tertiary-fixed-variant: '#004f54'
  background: '#131315'
  on-background: '#e5e1e4'
  surface-variant: '#353437'
typography:
  display-xl:
    fontFamily: Chivo
    fontSize: 56px
    fontWeight: '900'
    lineHeight: 64px
    letterSpacing: -0.03em
  display-xl-mobile:
    fontFamily: Chivo
    fontSize: 36px
    fontWeight: '900'
    lineHeight: 42px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Chivo
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Chivo
    fontSize: 28px
    fontWeight: '800'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Chivo
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Chivo
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: 0em
  body-lg:
    fontFamily: Space Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Space Grotesk
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Space Grotesk
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Space Mono
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 20px
    letterSpacing: 0.08em
  label-md:
    fontFamily: Space Mono
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.1em
  label-sm:
    fontFamily: Space Mono
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.14em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system channels the uncompromising, adrenaline-fueled atmosphere of top-tier motorsport cockpits, hypercar telemetry instrumentation, and luxury automotive engineering. It embodies three primary tenets: raw speed, structural precision, and dark-room immersion.

The design movement blends **High-Contrast Dark Mode** with **Precision Instrument Brutalism** and subtle **Cockpit HUD Glassmorphism**. Layouts evoke high-performance digital dashes: laser-etched dividers, telemetry data tags, technical status readouts, and vivid red accents bursting through an abyss of deep asphalt and carbon weave.

### Target Audience & Emotional Response
- **Audience:** Sim-racers, luxury supercar collectors, motorsport enthusiasts, and digital automotive connoisseurs demanding cutting-edge performance aesthetics.
- **Emotional Response:** Visceral focus, pulse-quickening speed, tactile authority, and the prestige of a carbon-chassis cockpit illuminated solely by neon rev limiters and head-up display instrumentation.

## Colors

The palette is engineered around high luminance contrast to ensure instantaneous legibility under intense focus, drawing directly from competitive trackside telemetry.

- **Primary (`#ff1a35` - Apex Neon Red):** The dominant action color, evoking rev-limiters, active DRS states, and performance braking calipers. Used for high-priority CTAs, active telemetry bars, and critical UI state indicators.
- **Secondary (`#ff334b` - Corsa Crimson):** A high-heat crimson used for reactive hover states, energetic gradient transitions, and ambient back-glows.
- **Tertiary (`#00f0ff` - Telemetry Cyan):** A hyper-focused secondary accent dedicated to technical vehicle diagnostics, aerodynamic efficiency tags, and delta time tracking.
- **Neutral Surface Palette:**
  - **Asphalt Abyss (`#0a0a0c`):** Base canvas background, eliminating light pollution and maximizing OLED contrast.
  - **Carbon Charcoal (`#141419`):** Surface card tier 1 and structural modules.
  - **Cockpit Slate (`#1f1f26`):** Elevated overlays, inspect trays, and telemetry panels.
  - **Titanium White (`#f5f5f7`):** High-clarity primary typography.
  - **Exhaust Silver (`#8e8e99`):** Secondary metadata, inactive states, and unit measures (km/h, RPM, G-Force).

## Typography

The typographic hierarchy mirrors digital instrument clusters and aeronautical HUD layouts.

- **Headlines (Chivo):** An aggressive, aerodynamic neo-grotesque with sharp terminal cuts that reflect automotive body styling and aerodynamic ducting. Rendered in upper weights with tight tracking to convey momentum.
- **Body (Space Grotesk):** Engineered readability with geometric flair; clean, precise, and highly legible against carbon backgrounds without introducing ocular fatigue.
- **Labels & Telemetry (Space Mono):** Fixed-width mechanical precision dedicated to specifications (torque, split intervals, horsepower, RPM, curb weight). All labels must use uppercase transformation with expanded letter-spacing to simulate instrument-grade gauges.

## Layout & Spacing

The layout is structured around an adaptive 12-column fluid grid on desktop, scaling to 8 columns on tablet and 4 columns on mobile devices. 

- **Grid Dynamics:** Columns function as rigid mechanical chassis rails. Elements snap cleanly to borders without organic offsets.
- **Mobile First Adaptation:** On touch displays, card grids compress into horizontally swipeable carousel runs mimicking digital cockpit car selectors. Gutter transitions contract from `1.5rem` down to `1rem` to prioritize full-width vehicle imagery and telemetry graphs.
- **Safe Margins:** Touch targets strictly adhere to a minimum height of 48px, with `space-sm` internal padding safeguarding tap accuracy during rapid interactions.

## Elevation & Depth

Depth is established through dark-field layering, optical neon luminescence, and structural frame borders rather than soft, muddy drop shadows.

- **Surface Tiers:**
  - **Level 0 (Asphalt Floor - `#0a0a0c`):** Deepest ground plane containing atmospheric red particle blurs and ambient radial gradients.
  - **Level 1 (Chassis Plates - `#141419`):** Base container cards, framed with a 1px razor-wire border of `#262630`.
  - **Level 2 (Cockpit HUD Panels - `#1f1f26`):** Active modules, telemetry cards, and modal sheets. Features a subtle gradient fill angled at 135 degrees.
- **Luminous Crimson Ambient Glows:** High-priority cards and active cars emit a focused back-projection: `0 8px 32px rgba(255, 26, 53, 0.18)` paired with an inner top hairline of `rgba(255, 51, 75, 0.4)`.
- **Laser-Etched Framing:** UI panels utilize low-contrast perimeter strokes (`1px solid rgba(255, 255, 255, 0.08)`) that brighten to `rgba(255, 26, 53, 0.8)` upon hover or active selection, simulating an energized electrical conduit.

## Shapes

The system relies on minimal, sharp radii (`roundedness: 1`, 0.25rem) to reinforce industrial carbon-fiber engineering, machined billet aluminum parts, and aerodynamic canards. Rounded, pill-like shapes are strictly avoided in favor of crisp, structural edges.

- **Chamfered Geometries:** Interactive components such as main launch buttons, telemetry tabs, and race badges feature diagonal 45-degree chamfered corners (using SVG or CSS `clip-path: polygon(...)`) to evoke cockpit toggle guards and aerodynamic dive planes.
- **Bevel Dividers:** Panel headers terminate in 45-degree cut lines that separate technical vehicle metrics from imagery.

## Components

### Buttons
- **Primary CTA ("Ignition"):** Chamfered rectangle, filled with `#ff1a35`, text in `#0a0a0c` with `Chivo Black` uppercase. Hover triggers a dynamic drop-glow (`0 0 20px rgba(255, 26, 53, 0.6)`) and a subtle horizontal sweep light effect.
- **Secondary ("Pitstop / Config"):** Background `#141419` with a 1px border of `#ff1a35` at 50% opacity. Text in `#f5f5f7` `Chivo Bold`.
- **Telemetry Action (Ghost):** Borderless, `#8e8e99` typography shifting to `#00f0ff` with a left-edge vertical racing stripe indicator.

### Racing Badges & Chips
- **Class Tags (e.g., "GT3", "HYPERCAR", "PRO-AM"):** Compact micro-badges featuring `Space Mono` typography (`label-sm`), background `#0a0a0c`, with a prominent 2px solid left accent bar tinted to the classification color (Apex Red, Cyan, or Gold).
- **Stat Badges:** Dual-cell inline tokens displaying an italicized parameter code (`PWR`, `AERO`, `WT`) on a dark-grey pill with the live numerical output rendered on an adjacent high-contrast tile.

### Telemetry Cards & Supercar Showcases
- Base background `#141419` wrapped in a 1px border of `rgba(255, 255, 255, 0.07)`.
- Upper right corner hosts an angular tachometer-inspired index marker (e.g., `// 01_SPEC`).
- Integrated dynamic stats bars: A segmented track (10 tick marks) displaying 0–100 performance levels, filled with red neon gradient segments for top-end values.

### Input Fields & Controls
- **Inputs:** Dark field `#0e0e12` with a 1px bottom and side stroke of `#262630`. On focus, the bottom border intensifies to `#ff1a35` with a subtle ground glow.
- **Checkboxes & Radios:** Angular diamond or square markers with cut corners. Checked state activates an intense red neon core with a faint cockpit targeting reticle.

### Specialized Motorsport Components
- **Rev-Limiter Progress Bars:** Horizontal gauges split into progressive green, yellow, and flashing red zone indicators.
- **Delta Timers:** Split-screen time readout panels using `Space Mono` displaying negative delta in glowing emerald (`#00e676`) and positive loss in `#ff1a35`.