---
name: Luminous Spectrum
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#444748'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#060607'
  on-primary: '#ffffff'
  primary-container: '#1f1f1f'
  on-primary-container: '#888686'
  inverse-primary: '#c8c6c5'
  secondary: '#0053ce'
  on-secondary: '#ffffff'
  secondary-container: '#2a6cf0'
  on-secondary-container: '#fefcff'
  tertiary: '#070706'
  on-tertiary: '#ffffff'
  tertiary-container: '#201f1e'
  on-tertiary-container: '#898685'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1b1b1c'
  on-primary-fixed-variant: '#474746'
  secondary-fixed: '#dae2ff'
  secondary-fixed-dim: '#b2c5ff'
  on-secondary-fixed: '#001848'
  on-secondary-fixed-variant: '#0040a2'
  tertiary-fixed: '#e6e2df'
  tertiary-fixed-dim: '#c9c6c4'
  on-tertiary-fixed: '#1c1b1a'
  on-tertiary-fixed-variant: '#484645'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  display:
    fontFamily: Poppins
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Poppins
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Poppins
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Poppins
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Poppins
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Poppins
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Poppins
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Poppins
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-padding: 24px
  gutter: 16px
  glass-padding: 20px
---

## Brand & Style

The design system is an ethereal, high-end interpretation of Glassmorphism tailored for the CEM brand. It evokes a sense of clarity, innovation, and educational prestige. By blending a stark, sophisticated light environment with a vibrant multi-color spectrum, the UI feels both disciplined and creative.

The aesthetic centers on "White Glass"—surfaces that appear as polished, semi-transparent frosted panels floating over a soft, non-white neutral background. The emotional response is one of openness and modern professionalism, using light as a primary medium for depth and interaction.

## Colors

The palette is anchored by a "Carbón" (#1F1F1F) for high-contrast typography, ensuring legibility against light glass. The background is a sophisticated light grey (#E9ECEF), providing enough tonal separation for white glass panels to pop.

The CEM Multicolor spectrum is used strategically:
- **Accents:** Active states and focus rings.
- **Progress & Data:** Gauges and charts utilize the full rainbow to differentiate categories.
- **Glows:** Subtle, diffused mesh gradients behind glass panels use these colors to provide a "spectral" depth.
- **Functional:** Blue for primary actions, while Pink and Orange are used for highlighting creative or urgent elements.

## Typography

The design system utilizes Poppins exclusively to maintain a modern, geometric, and professional appearance.

- **Weight Usage:** Bold and ExtraBold are reserved for Display and Headline levels to create a strong hierarchy. Medium and Regular are used for body text and functional labels.
- **Coloring:** Headers use the primary "Carbón" color. Body text uses a slightly softened version for long-form readability.
- **Scaling:** On mobile, display sizes are aggressively stepped down to ensure glass containers do not overflow while maintaining the distinctive bold character of the brand.

## Layout & Spacing

This design system uses a **Fluid Grid** with fixed maximum widths for desktop (1440px) to maintain the integrity of glass layers.

- **Rhythm:** An 8px base unit drives all padding and margins.
- **Glass Padding:** Internal padding for glass cards should be generous (20px minimum) to let the backdrop blur effect breathe around the content.
- **Breakpoints:**
  - **Mobile (<768px):** 4-column grid, 16px margins. Glass containers span full width.
  - **Tablet (768px - 1024px):** 8-column grid, 24px margins.
  - **Desktop (>1024px):** 12-column grid, 32px margins. Use of "Negative Space" is encouraged to emphasize the "floating" nature of the UI.

## Elevation & Depth

Hierarchy is achieved through **Optical Transparency** and **Backdrop Blurs** rather than traditional heavy shadows.

- **Surface Layer:** The base canvas is a flat, matte light grey.
- **Glass Layer:** Elevated panels use a 70% white fill with a `backdrop-filter: blur(30px)`.
- **The Luminous Border:** Every glass panel must have a 1px solid border. The top and left borders use a brighter white (high opacity) to simulate a light source, while the bottom and right are slightly more transparent.
- **Shadows:** Use extremely soft, long-spread shadows (`box-shadow: 0 20px 40px rgba(0,0,0,0.04)`) to lift panels off the background without creating "dirt" in the clean aesthetic.
- **Multicolor Glows:** For high-importance elements, a soft colored glow (e.g., Turquoise or Purple) can be placed *behind* the glass panel to indicate status or category.

## Shapes

The shape language is "Rounded" to complement the friendly and approachable brand tone.

- **Panels & Cards:** Use a 1rem (16px) radius to create a soft, modern silhouette.
- **Buttons & Inputs:** Follow the same 1rem radius for consistency.
- **Indicators:** Glowing status indicators and notification pips use 100% circular (pill) shapes to stand out against the geometric containers.

## Components

- **Buttons:** Primary buttons use a subtle linear gradient (e.g., Blue to Turquoise) with a white Poppins label. Hover states should increase the "inner glow" of the button.
- **Glass Cards:** The signature component. High-transparency white backgrounds with 1px luminous borders. Titles inside cards are always "Carbón" Bold.
- **Input Fields:** Semi-transparent white with a 1px border that shifts to a multicolor gradient (CEM spectrum) on focus.
- **Chips/Badges:** Use the CEM multicolor palette for the background at 15% opacity with 100% opacity text of the same color.
- **Progress Bars:** Use a multicolor linear gradient (Green → Yellow → Orange) to visualize growth or completion.
- **Status Indicators:** Small, pulsing circles using the Turquoise or Pink accents to draw attention to real-time updates.
