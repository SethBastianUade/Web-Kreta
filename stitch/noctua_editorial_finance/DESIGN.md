---
name: Noctua Editorial Finance
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
  on-surface-variant: '#c8c4d7'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#918fa0'
  outline-variant: '#474554'
  surface-tint: '#c5c0ff'
  primary: '#c5c0ff'
  on-primary: '#2300a3'
  primary-container: '#8981ff'
  on-primary-container: '#1e0090'
  inverse-primary: '#5448d5'
  secondary: '#ffb4a3'
  on-secondary: '#621000'
  secondary-container: '#88270f'
  on-secondary-container: '#ffa089'
  tertiary: '#bac6ec'
  on-tertiary: '#23304e'
  tertiary-container: '#8490b4'
  on-tertiary-container: '#1d2947'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e3dfff'
  primary-fixed-dim: '#c5c0ff'
  on-primary-fixed: '#130068'
  on-primary-fixed-variant: '#3b2abd'
  secondary-fixed: '#ffdad2'
  secondary-fixed-dim: '#ffb4a3'
  on-secondary-fixed: '#3d0700'
  on-secondary-fixed-variant: '#84240d'
  tertiary-fixed: '#dae2ff'
  tertiary-fixed-dim: '#bac6ec'
  on-tertiary-fixed: '#0d1a38'
  on-tertiary-fixed-variant: '#3a4666'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
  deep-charcoal: '#1A1A1E'
  cool-violet: '#9D85FF'
  ember-glow: '#F2994A'
  surface-glass: rgba(255, 255, 255, 0.03)
  border-glass: rgba(255, 255, 255, 0.12)
typography:
  display-lg:
    fontFamily: EB Garamond
    fontSize: 64px
    fontWeight: '400'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: EB Garamond
    fontSize: 40px
    fontWeight: '400'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: EB Garamond
    fontSize: 32px
    fontWeight: '400'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: EB Garamond
    fontSize: 24px
    fontWeight: '400'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  unit: 8px
  gutter: 24px
  margin-desktop: 80px
  margin-mobile: 20px
  max-width: 1280px
---

## Brand & Style
The design system is built for a technology and finance studio that caters to small businesses (PyMEs) with a sophisticated, editorial-first approach. The brand personality is authoritative yet approachable, blending the reliability of financial institutions with the innovative edge of a high-end tech studio.

The visual style is **Minimalist Glassmorphism**. It utilizes a "near-black" foundation to create a canvas for translucent layers, frosted glass textures, and subtle inner glows. The emotional response is one of "calm confidence" and "premium precision." Every interaction should feel intentional and high-end, avoiding common "fintech" cliches in favor of a clean, structured, and literary aesthetic.

## Colors
The palette is rooted in a deep `#0A0A0A` background to ensure maximum contrast and depth. 
- **Primary:** A cool, sophisticated violet (`#7C72FF`) represents technology and modernity.
- **Secondary (The "Ember"):** A warm, muted ember (`#FF7E5F`) is used sparingly for depth and high-priority call-to-actions, providing a "living" contrast to the cool tones.
- **Surface Strategy:** Layers are built using "Deep Charcoal" for solid containers and "Surface Glass" for interactive or floating elements. 
- **Accents:** All accents follow a "muted-premium" logic; colors are never neon or overly saturated, maintaining an editorial maturity.

## Typography
The typographic hierarchy establishes the "Editorial" tone through high-contrast pairings. 
- **Headlines:** Use **EB Garamond** in light weights. This serif font provides a literary, established feel that contrasts beautifully against the dark, technical background.
- **Body & UI:** Use **Hanken Grotesk**. This sans-serif is clean, highly legible, and modern, ensuring that complex financial data remains accessible.
- **Scale:** Large display sizes should be used for impact in marketing and section headers, while body text maintains generous line heights for comfort. Labels use increased letter spacing and a semi-bold weight for functional clarity.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy to maintain an editorial, structured feel. 
- **Desktop:** A 12-column grid with a maximum width of 1280px. Margins are generous (80px) to allow the "Glass" elements to breathe and create a sense of focus.
- **Mobile:** A 4-column fluid grid with 20px margins. 
- **Rhythm:** An 8px base unit drives all spacing. Vertical rhythm is prioritized, with large white space (empty dark space) used to separate thematic blocks, emphasizing the "Minimal-but-alive" narrative.

## Elevation & Depth
Depth is not communicated via traditional drop shadows but through **Tonal Layering and Material Properties**:
1. **The Void (Base):** `#0A0A0A`. The deepest level.
2. **Plates (Secondary):** Deep Charcoal `#1A1A1E` with no border for structural background sections.
3. **Glass (Floating):** Elements like cards and navigation bars use a `backdrop-filter: blur(12px)` with a semi-transparent white background (`rgba(255,255,255,0.03)`).
4. **The Inner Glow:** High-elevation elements feature a 1px solid top-border using `rgba(255,255,255,0.12)` to simulate a light source catching the edge of the glass.

## Shapes
The shape language is primarily **Pill-shaped (Level 3)**. 
- **Buttons and Chips:** Use full pill-shaped rounding to create a soft, approachable contrast to the sharp typography.
- **Cards and Modals:** Use `rounded-xl` (1.5rem / 24px) to maintain a modern, friendly feel without becoming overly organic. 
- **Inputs:** Follow the card roundedness for consistency in the form-factor.

## Components
- **Buttons:** Primary buttons are pill-shaped with the "Ember" gradient or solid violet. They should have a subtle inner glow on the top edge. Secondary buttons use the "Glass" style with a 1px border.
- **Cards:** Glassmorphic with a 12px backdrop-blur. Borders are thin (1px) and slightly lighter than the surface color to define the shape against the black background.
- **Input Fields:** Dark, recessed backgrounds with a soft focus state that glows with the primary violet color. Labels are always positioned above the field in `label-md` style.
- **Lists:** Clean, separated by subtle 1px dividers (`rgba(255,255,255,0.05)`). Icons within lists should use the "Cool Violet" or "Ember" palette for categorization.
- **Chips/Badges:** Small, pill-shaped elements with low-opacity background fills of the primary or secondary colors, used for status indicators (e.g., "Pendiente", "Completado").
- **Financial Visualizations:** Charts should use the cool blue-to-violet gradient for data series, with the warm ember used exclusively for highlight points or alerts.