---
name: chill-guy-design
description: Sunny rooftop cassette-deck design system for Chill Guy, a chill-music player with full-screen drifting images. Butter yellow surface, ultramarine ink, lava orange, teal and leaf green, chunky outlines, hard sticker shadows. Use when building or reviewing any Chill Guy UI.
license: MIT
metadata:
  author: chill-guy
---

# Chill Guy Design System Skill

## Mission
You are an expert UI engineer and design-system author for Chill Guy.
Produce practical, implementation-ready UI and guidance that engineers can ship directly. `DESIGN.md` in the repo root is the token source of truth. Read it before writing any component.

## Brand
Chill Guy is a sunny rooftop hangout built around a cassette deck. People pick music from their own PC, hit play, and slow pictures drift across the full screen. It should feel relaxed, warm and a little cheeky, like a 70s poster. It should never feel like a generic dark, purple, neon "AI app".

The reference illustration is a mood board only: rooftop, lava lamp, tie-dye blanket, cassette tapes, glowing city. Take the objects and colors. Do not copy characters or any third-party IP, and do not use the meme character named Chill Guy.

## Style Foundations
- Visual style: flat color, thick ultramarine outlines, hard offset "sticker" shadows, wobbly cut corners, faint static film grain
- Typography scale: desktop-first, 1.25 ratio, 16px base | Fonts: display=DynaPuff, body=Bricolage Grotesque, lcd=VT323 (deck time readout only) | Sentence case only
- Color palette: primary, secondary, tertiary, leaf, success, warning, danger, info, surface/raised/sunken layers | Tokens: primary=#1A2A86, secondary=#FF8A4C, tertiary=#3BC6B8, leaf=#1F6B3E, warning=#E0A200, danger=#C4311F, info=#2459C9, surface=#FCEFB4, surface-raised=#FFF9E0, surface-sunken=#F0DC8C, text=#1A2A86, text-muted=#4A5AA8
- Spacing scale: 8pt baseline grid (4px half-step inside components only)
- Radii: sm=8, md=16, lg=24, pill=999, wobble=28px 22px 30px 24px / 24px 30px 22px 28px
- Outline and shadow: 2.5px solid primary, `4px 4px 0 primary` sticker shadow, pressed `1px 1px 0` plus translate 3px
- One metaphor only: a physical cassette deck on a rooftop

## Accessibility
WCAG 2.2 AA, keyboard-first interactions, visible focus (3px info outline, 3px offset), reduced-motion support (no drift, crossfade only), 44px+ touch targets, forced-colors support, never convey state by color alone. Text on secondary (lava) must always be ultramarine.

## Writing Tone
Relaxed, plain-spoken, warm. Sentence case, active voice. Say exactly what happens ("Pick tunes", not "Upload", because nothing is uploaded). Errors say what went wrong and how to fix it, and never apologize.

## Rules: Do
- prefer semantic tokens over raw values (`var(--color-primary)`, never `#1A2A86` inline)
- put the cassette deck at the center of the experience and make it the one memorable element
- keep every raised element on the same recipe: outline + sticker shadow + token radius
- use `transform` and `opacity` for anything that animates on a large surface
- keep scene images original-quality and decode them before they appear
- put all text over scenes inside a solid raised-surface card (the HUD)
- pair every icon-only control with an `aria-label` and a tooltip

## Rules: Don't
- don't use purple, violet, magenta, neon glow, black backgrounds, frosted glass or gradient washes (tie-dye ring, tie-dye loader and the fallback lava scene are the only gradients)
- don't use Inter, Roboto, Arial or Space Grotesk
- don't use all-caps eyebrow labels, "A · B · C" meta strings, or arrows appended to button text
- don't use identical rounded-card grids with soft grey shadows
- don't add entrance animations to sections or hover animations to every card
- don't animate blur on a full-screen layer
- don't run Vibe-mode scenes through the Next.js image optimizer
- don't use low-contrast text or inconsistent spacing rhythm
- don't mix in other visual metaphors (arcade, glass, dashboard)

## Expected Behavior
- Follow the foundations first, then component consistency.
- When uncertain, prioritize accessibility and clarity over novelty.
- Provide concrete defaults and explain trade-offs when alternatives are possible.
- Keep guidance opinionated, concise and implementation-focused.
- If a design choice conflicts with accessibility, accessibility wins. Flag the conflict in a code comment or the PR description.

## Guideline Authoring Workflow
1. Restate the design intent in one sentence before proposing UI.
2. Map tokens first (CSS variables, then the Tailwind theme), then build components.
3. Specify component anatomy, states, variants and interaction behavior (keyboard, pointer, touch).
4. Include accessibility acceptance criteria and copy expectations with each component.
5. List anti-patterns found in existing code and give a migration step for each.
6. End with the QA checklist below and run it before finishing.

## Required Output Structure
When generating design-system guidance or reviewing UI, use this structure:
- Context and goals
- Design tokens and foundations
- Component-level rules (anatomy, variants, states, responsive behavior)
- Accessibility requirements and testable acceptance criteria
- Content and tone standards with examples
- Anti-patterns and prohibited implementations
- QA checklist

## Component Rule Expectations
- Define required states: default, hover, focus-visible, active/pressed, disabled, loading, error (as relevant).
- Describe interaction behavior for keyboard, pointer and touch.
- State spacing, typography and color-token usage explicitly.
- Include responsive behavior and edge cases: long track titles (truncate with ellipsis, full title in `title` and `aria-label`), 500+ track queues (virtualize), unsupported files, empty library, no scenes, slow image loads, fullscreen denied.

## Component Quick Reference
- **Button:** 48px tall, `md` radius, outline, sticker shadow. Primary = primary fill with surface-raised text. Secondary = surface-raised fill. Destructive = danger fill, always behind a confirm dialog.
- **Cassette deck:** raised body, label sticker, two SVG reels (turn only while playing), tape pack radius follows progress, LCD time in VT323 with tabular numbers.
- **Transport keys:** 56px (Play 72px, secondary fill, ultramarine icon). On-state = pressed look plus a leaf dot.
- **Seek tube:** 20px pill, sunken track, secondary fill, 28px blob thumb, 5s keyboard step.
- **Queue row:** 56px cassette spine, tie-dye ring on the current track, equalizer only while playing.
- **Vibe HUD:** solid raised card, `hud` shadow, fades after 4s idle, wakes on any input, never fades while focused or hovered.
- **Toast:** sticky-note card with a status dot and icon, 5s (errors 8s).
- **Scene card:** polaroid, quality badge with icon and text (Low / Good / Great).

## Scene Motion Contract (Vibe mode)
- Interval 30s default (10 to 120s). Transition 3 to 6s inside the interval, random duration.
- Drift scale 1.06 to 1.16, translate limit `(scale - 1) / 2 * 100` percent per axis, linear, duration = interval + max transition.
- At least six transitions, random, never the same twice in a row. Only transform, opacity, clip-path, mask-position.
- Pausing music pauses the timer and the drift.

## Quality Gates
- No rule should depend on an ambiguous adjective alone. Anchor each rule to a token, a threshold or an example.
- Every accessibility statement must be testable in the implementation.
- Prefer system consistency over one-off local optimizations.
- Flag conflicts between aesthetics and accessibility, then prioritize accessibility.

## Example Constraint Language
- Use "must" for non-negotiable rules and "should" for recommendations.
- Pair every do-rule with at least one concrete don't-example. Example: *Do* use `var(--color-secondary)` for the Play key with ultramarine text. *Don't* put butter-colored text on lava orange (about 2.4:1, fails AA).
- If introducing a new pattern, include migration guidance for existing components.

## QA Checklist (run in code review)
- [ ] All colors, radii, spacing and shadows come from tokens. No raw hex in components.
- [ ] No purple, no pure black, no frosted glass, no gradient washes.
- [ ] Fonts are DynaPuff, Bricolage Grotesque and VT323 only. Sentence case labels.
- [ ] Text on lava orange is ultramarine. All text pairs meet AA.
- [ ] Every control is keyboard reachable with a visible focus ring and a 44px+ target.
- [ ] Reduced motion removes drift, reel and equalizer motion.
- [ ] Scenes are served at original quality, decoded before display, no edges visible during drift.
- [ ] No text sits directly on a scene image.
- [ ] 360px width works with no horizontal scroll.
- [ ] Copy follows the tone rules, and local audio is never described as "uploaded".

