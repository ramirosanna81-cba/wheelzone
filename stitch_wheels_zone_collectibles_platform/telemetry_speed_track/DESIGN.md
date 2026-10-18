---
name: Telemetry Speed Track
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#d3c5ab'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#9c8f78'
  outline-variant: '#4f4632'
  surface-tint: '#f9bd00'
  primary: '#ffe5b0'
  on-primary: '#3f2e00'
  primary-container: '#ffc200'
  on-primary-container: '#6d5100'
  inverse-primary: '#785a00'
  secondary: '#ffb3b1'
  on-secondary: '#680011'
  secondary-container: '#d6022e'
  on-secondary-container: '#ffe7e5'
  tertiary: '#dae9ff'
  on-tertiary: '#233143'
  tertiary-container: '#becde3'
  on-tertiary-container: '#48576a'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdf9c'
  primary-fixed-dim: '#f9bd00'
  on-primary-fixed: '#251a00'
  on-primary-fixed-variant: '#5b4300'
  secondary-fixed: '#ffdad8'
  secondary-fixed-dim: '#ffb3b1'
  on-secondary-fixed: '#410007'
  on-secondary-fixed-variant: '#92001c'
  tertiary-fixed: '#d4e4fa'
  tertiary-fixed-dim: '#b9c8de'
  on-tertiary-fixed: '#0d1c2d'
  on-tertiary-fixed-variant: '#39485a'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-hero:
    fontFamily: Barlow Condensed
    fontSize: 56px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: 0.02em
  display-hero-mobile:
    fontFamily: Barlow Condensed
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 38px
    letterSpacing: 0.02em
  headline-lg:
    fontFamily: Barlow Condensed
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: 0.03em
  headline-md:
    fontFamily: Barlow Condensed
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: 0.025em
  headline-sm:
    fontFamily: Barlow Condensed
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0.02em
  body-lg:
    fontFamily: DM Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: DM Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: DM Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-telemetry:
    fontFamily: Barlow Condensed
    fontSize: 13px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.08em
  label-price:
    fontFamily: Barlow Condensed
    fontSize: 26px
    fontWeight: '800'
    lineHeight: 26px
    letterSpacing: 0.01em
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
  space-2xl: 4rem
---

## Brand & Style

The design system projects adrenaline, precision engineering, and elite collectible motorsport culture. Tailored for die-cast collectors, track day enthusiasts, and vintage treasure hunters, the interface fuses the visceral heat of track racing with the surgical clarity of racing telemetry.

The aesthetic merges high-contrast dark performance minimalism with industrial trackside brutality:
- **Carbon Monocoque Foundations:** Jet-black matte bases layered with structural asphalt tones.
- **Ignition Accents:** Kinetic bursts of flame yellow, tachometer red, and metallic aluminum trim.
- **Aggressive Geometry:** 0-radius edges, chamfered corner cuts, angled chevron motifs, and high-density technical readouts.
- **Tactile Urgency:** High-octane contrast, razor-sharp outlines, and telemetry badges that immediately declare blister condition, casting series, and scale.

## Colors

The palette is engineered for extreme clarity under low ambient lighting, mimicking racing dashboards and pit-wall monitors.

- **Primary (`#FFC200`):** Ignition Amber/Flame Yellow. Serves as the primary focal spark, highlighting interactive calls to action, price highlights, and ultra-rare 'Treasure Hunt' or 1st-edition markers.
- **Secondary (`#E51937`):** Redline Competition. Drives urgency, drop counters, high-heat flash sales, and destructive/warning signals.
- **Tertiary (`#94A3B8`):** Brushed Titanium. Deployed for structural divider borders, telemetry gridlines, subheaders, and secondary metadata (e.g., scale designations like 1:64).
- **Neutral Core (`#0B0B0B` to `#18181B`):** Carbon Abyss. Ultra-deep dark surfaces layered to provide absolute contrast against neon accents and metallic vehicle reflections.
- **Functional States:**
  - *Blister Mint / Grade A:* High-voltage green `#10B981` paired with dark graphite backing.
  - *Card Damaged / Soft Corners:* Tactical amber `#F59E0B`.
  - *Loose / Unboxed:* Monochromatic slate `#64748B`.

## Typography

Typography balances high-speed racing iconography with legible e-commerce specifications:

- **Headlines & Telemetry (Barlow Condensed):** Delivers aerodynamic, condensed verticality. Uppercase styling is strictly enforced for primary section heads, product series identifiers, and pricing modules to evoke stadium speed boards and chassis serial plates.
- **Body & Product Metadata (DM Sans):** Neutral, clean, and low-contrast geometric sans-serif that ensures effortless readability for collector notes, casting history, scale details, and checkout flows.
- **Tabular Numerics:** Numerical values across auction countdowns, live bids, and telemetry tags must employ `font-variant-numeric: tabular-nums` to eliminate jitter during real-time updates.

## Layout & Spacing

The layout is built around a tight, telemetry-inspired 12-column grid system optimized for high product density without visual clutter:

- **Grid Geometry:** Fluid 12-column setup on desktop (`gutter-desktop: 1.5rem`), transitioning to 6 columns on tablet and 2 columns on mobile devices to preserve high-fidelity side-by-side card viewing.
- **Density:** Spacing tokens prioritize compact visual scanning. Product feeds leverage `space-md` gaps between items, keeping actionable information within the active viewport.
- **Rhythm Rules:** Vertical rhythm follows a strict 4px/8px modular cadence. Sections are separated by sharp horizontal dividing rules punctuated by technical telemetry markers (e.g., coordinates, category stamps).

## Elevation & Depth

Rather than conventional soft drop shadows, this design system expresses depth through illuminated edge borders, back-glow luminescence, and surface layering:

- **Surface Tiers:**
  - *Tier 0 (Chassis Ground):* `#0B0B0B` (Canvas base).
  - *Tier 1 (Cockpit Panels):* `#121214` with a 1px border of `#27272A`.
  - *Tier 2 (Floating Pods/Drawers):* `#18181B` with an angled highlight top-border of `#3F3F46`.
- **Race Lighting & Glow:** High-priority cards (e.g., Ultra-Rare Super Treasure Hunts) project an ambient, low-spread back-glow (`0 0 24px rgba(255, 194, 0, 0.18)`).
- **Outlines over Blur:** Component separation is achieved strictly through crisp 1px borders, technical crosshairs, and 45-degree corner accent lines rather than diffuse drop shadows.

## Shapes

The shape system is strictly zero-radius (`roundedness: 0`), adhering to an aggressive, cut-crystal aerodynamic chassis philosophy.

- **Zero-Radius Standard:** All standard components—cards, inputs, badges, and modal overlays—feature unyielding 90° corners.
- **Chamfered Cuts (45-Degree Clip):** Primary call-to-action buttons, blister status tags, and selected navigational tabs feature a diagonal 6px to 8px chamfered edge (`clip-path: polygon(...)`) in either the top-right or opposing diagonal corners, simulating aerodynamic spoilers and carbon-fiber panel joints.
- **Chevron Accents:** Directional pagination and active filtering states employ razor-sharp angular ticks and diagonal hazard slashes.

## Components

### Buttons
- **Primary Velocity CTA:** Background is a steep linear gradient from `#FFC200` to `#FF9900` or solid `#E51937`. Text is pure black or crisp white in `Barlow Condensed` bold uppercase with 45° chamfered corner cuts. Active state triggers a 1px inset border with an intense ignition glow.
- **Secondary Pitstop Button:** Transparent background, 1px solid border in `#475569`, text in `#FFFFFF`. Hover shifts border to `#FFC200` and fills background with 10% tint.

### Blister & Collector Badges
- **Mint / Impecable:** Inverted pill-less box badge (`#10B981` border on `#052e16` background) with text in uppercase telemetry font.
- **Loose / Unboxed:** Dark neutral outline `#475569` with subdued slate typography.
- **Card Damaged:** Amber warning outline `#F59E0B` with strike-through warning iconography.
- **Scale Indicators (1:64, 1:43, 1:24):** High-contrast micro-chips with carbon-textured dark backgrounds and titanium typography.

### Product Die-Cast Cards
- Constructed with absolute 0-radius borders (`#27272A`), expanding to an active `#FFC200` highlight border on hover.
- Includes a dedicated blister silhouette viewport, floating top badges for Scale and Blister Condition, a prominent price block rendered in `label-price`, and a quick-add "PIT CREW" action bar that surfaces from the lower deck on mouse enter.

### Input Fields & Search
- Low-profile dark inputs (`#121214`) flanked by a 1px structural outline in `#334155`.
- Focus shifts border color to `#FFC200` and displays a right-aligned neon status marker.
- Monospaced numerical values for filter ranges (year, price, series run).

### Selection Controls (Checkboxes & Radios)
- **Checkboxes:** Square 0-radius boxes with a `#334155` border. Checked state fills with `#FFC200` bearing an angled black checkmark.
- **Radio Buttons:** Diamond-shaped rotated squares (45-degree angle) instead of circular dots, filling with secondary red `#E51937` when active.