---
name: Chill Guy
colors:
  primary: "#1A2A86"
  secondary: "#FF8A4C"
  tertiary: "#3BC6B8"
  leaf: "#1F6B3E"
  success: "#1F6B3E"
  warning: "#E0A200"
  danger: "#C4311F"
  info: "#2459C9"
  surface: "#FCEFB4"
  surface-raised: "#FFF9E0"
  surface-sunken: "#F0DC8C"
  text: "#1A2A86"
  text-muted: "#4A5AA8"
  border: "#1A2A86"
  neutral: "#F0DC8C"
typography:
  display:
    fontFamily: "DynaPuff"
    fontSize: 3.5rem
    lineHeight: 1.05
    fontWeight: 700
  h1:
    fontFamily: "DynaPuff"
    fontSize: 2.5rem
    lineHeight: 1.1
    fontWeight: 600
  h2:
    fontFamily: "DynaPuff"
    fontSize: 1.75rem
    lineHeight: 1.15
    fontWeight: 600
  body-md:
    fontFamily: "Bricolage Grotesque"
    fontSize: 1rem
    lineHeight: 1.55
    fontWeight: 400
  body-sm:
    fontFamily: "Bricolage Grotesque"
    fontSize: 0.875rem
    lineHeight: 1.5
    fontWeight: 500
  label:
    fontFamily: "Bricolage Grotesque"
    fontSize: 0.875rem
    lineHeight: 1.2
    fontWeight: 700
  lcd:
    fontFamily: "VT323"
    fontSize: 1.75rem
    lineHeight: 1
    fontWeight: 400
  sourceScale: "desktop-first, 1.25 modular scale, 16px base"
  weights: "Bricolage Grotesque 400-800 (variable), DynaPuff 400-700 (variable), VT323 400"
rounded:
  sm: 8px
  md: 16px
  lg: 24px
  pill: 999px
  wobble: "28px 22px 30px 24px / 24px 30px 22px 28px"
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  sourceScale: "8pt baseline grid, 4px half-step allowed inside components"
shadows:
  sticker: "4px 4px 0 #1A2A86"
  sticker-pressed: "1px 1px 0 #1A2A86"
  hud: "0 6px 0 #1A2A86"
borders:
  default: "2.5px solid #1A2A86"
  hero: "3px solid #1A2A86"
motion:
  ui-fast: 160ms
  ui: 280ms
  drawer: 420ms
  ease-lazy: "cubic-bezier(0.4, 0, 0.2, 1)"
  scene-interval: "30s default (10-120s)"
  scene-transition: "3000-6000ms, random per change"
  scene-drift: "linear, 1.06-1.16 scale, runs for interval + max transition"
---

## Overview

**Intent:** Chill Guy is a sunny daytime rooftop hangout, with a cassette deck at its center, for people who want to put on music and let slow pictures drift by.

The reference illustration gives us the mood and nothing else: a rooftop over a glowing city, a lava lamp, a tie-dye blanket, cassette tapes, snack bags, a swirly painted sky. We take the *objects and the colors*, and we deliberately **do not** take the night-time darkness or the purple. The shell is bright and warm. The user's own images are what bring depth and color to Vibe mode.

**Spend boldness in one place:** the cassette deck player. Reels turn while music plays, and the tape pack shifts from left reel to right reel as the track progresses (progress you can read at a glance). Everything around it stays quiet and disciplined.

**One visual metaphor only:** a physical cassette deck on a rooftop. No arcade, no glass, no dashboards.

## Style Foundations

- **Visual style:** flat color, thick ultramarine outlines, hard offset "sticker" shadows, wobbly hand-cut corners, a tiny bit of film grain. Soft and friendly, never glossy.
- **Typography fonts:** display=DynaPuff (puffy, inflatable, easy-going), body=Bricolage Grotesque (a quirky grotesque, clearly different from the display face), lcd=VT323 (only for the deck's time readout, because it's the deck's own display).
- **Type scale:** desktop-first, 1.25 ratio on a 16px base. Sentence case everywhere. No all-caps labels, no letter-spaced eyebrows, no spaced em-dash labels.
- **Spacing:** 8pt grid (4px half-step inside components only).
- **Radii:** `sm` 8 for inputs and chips, `md` 16 for keys and cards, `lg` 24 for the deck and drawers, `pill` for the seek tube and toggles, `wobble` for stickers and polaroids (use sparingly, max 3 per screen).
- **Outlines and shadows:** every raised thing has a 2.5px ultramarine outline and a `sticker` hard shadow. Pressed state moves the element by 3px and swaps to `sticker-pressed`. No blurred drop shadows anywhere.
- **Texture:** one static film-grain overlay on the page (SVG noise, 5 to 6% opacity, `pointer-events: none`). Never animated. Not shown in Vibe mode.
- **Iconography:** `lucide-react` at `strokeWidth` 2.5, round caps and joins, 24px default. Reels, logo and skyline are custom SVG.
- **Logo:** original sleepy crescent-moon face (half-closed eyes, small smile) in ultramarine and butter, next to the wordmark "Chill Guy" in DynaPuff. Do not use the meme character of the same name or any third-party character.
- **Skyline:** a static ultramarine city silhouette along the bottom of the home page, with a few lit windows in lava orange and mustard. It is part of the layout, not an animation.
- **Tie-dye:** used in exactly two places: the ring around the currently playing track, and the idle loader. It is a conic gradient of lava, mustard, teal, and sky blue (secondary, warning, tertiary, info). Nowhere else.

## Colors

| Token | Hex | Used for |
|---|---|---|
| **Primary** | `#1A2A86` ultramarine | text, outlines, shadows, CTA fill, tape |
| **Secondary** | `#FF8A4C` lava | Play key, active states, light-leak glow |
| **Tertiary** | `#3BC6B8` teal | reel hubs, seek fill highlight, info chips |
| **Leaf** | `#1F6B3E` | success, "active scene" toggle, small leaf motifs |
| **Warning** | `#E0A200` mustard | low-res badge, lit windows |
| **Danger** | `#C4311F` cherry | delete, errors |
| **Info** | `#2459C9` sky | links, tie-dye accent |
| **Surface** | `#FCEFB4` butter | page background |
| **Surface raised** | `#FFF9E0` | deck, cards, HUD, drawers, dialogs |
| **Surface sunken** | `#F0DC8C` | inputs, seek tube track, hover wash |
| **Text** | `#1A2A86` | all body and headings |
| **Text muted** | `#4A5AA8` | artist, metadata, hints |

**Tested pairs (WCAG 2.2 AA):**

| Pair | Ratio | Use |
|---|---|---|
| Text on Surface | ~10.5:1 | body |
| Text on Surface raised | ~11.5:1 | deck and cards |
| Text muted on Surface | ~5.4:1 | secondary text |
| Surface on Primary | ~10.5:1 | CTA text |
| Text on Secondary | ~5.2:1 | Play key, lava badges |
| Text on Tertiary | ~5.8:1 | teal chips |
| Surface raised on Danger | ~4.8:1 | destructive buttons |
| Surface raised on Leaf | ~5.6:1 | success toasts |
| Text on Warning | ~5.4:1 | warning chips |

**Hard rules:** text on Secondary is always ultramarine, never butter (butter on lava is ~2.4:1 and fails). No purple, magenta or violet anywhere in the UI. No black: the darkest value is ultramarine. No gradient washes except the tie-dye conic above and the fallback "lava lamp" scene.

## Layout

Alignment: left-aligned content, center-aligned only for the deck and empty state. Line length under 70 characters.

**Home, desktop (>= 1024px)**
```
+------------------------------------------------------------------+
| (moon) Chill Guy                  [Pick tunes] [Scenes] [Vibe]   |
|                                                                  |
|   +------------- CASSETTE DECK -------------+   +--- Queue ---+  |
|   |  +--------- label sticker -----------+   |   | 1 [*] Song  |  |
|   |  | Song title (DynaPuff)             |   |   | 2     Song  |  |
|   |  | Artist (body)                     |   |   | 3     Song  |  |
|   |  |   (O)~~~~~tape~~~~~(O)            |   |   |   ...       |  |
|   |  +-----------------------------------+   |   +-------------+  |
|   |  0:42 [=====o-----------] 3:58 (LCD)     |                    |
|   |  [<<] [  PLAY  ] [>>]  [shuf] [rep] (vol)|                    |
|   +------------------------------------------+                    |
|                                                                  |
|  ____/\____skyline silhouette, lit windows____/\___              |
+------------------------------------------------------------------+
```

**Home, mobile (< 768px):** deck full width, queue as a bottom sheet opened from a "Queue" key, skyline reduced to a 48px strip.

**Vibe mode**
```
+------------------------------------------------------------------+
|                                                                  |
|                  full-bleed scene (image drifting)               |
|                                                                  |
|                                                                  |
|            +--------- HUD (fades after 4s idle) ---------+       |
|            | Song - Artist   [<<] [ PLAY ] [>>]  [exit]  |       |
|            | 0:42 [=====o-----------] 3:58               |       |
|            +---------------------------------------------+       |
+------------------------------------------------------------------+
```

**Scenes manager (`/scenes`):** a header with the upload dropzone, then a responsive grid (1 col mobile, 2 tablet, 3 to 4 desktop) of polaroid cards. Cards sit at slightly different tiny angles (max +/-1.5deg, static) using the `wobble` radius.

## Components

All components must implement: default, hover, focus-visible, active/pressed, disabled, loading, error (where relevant).

### Button
- **Primary:** fill Primary, text Surface raised, `md` radius, outline, `sticker` shadow. Height 48px.
- **Secondary:** fill Surface raised, text Text, outline, `sticker` shadow.
- **Destructive:** fill Danger, text Surface raised. Always behind a confirm dialog.
- **Ghost (icon):** transparent, 44x44, outline appears on hover.
- Hover: translate -1px, shadow grows to 5px. Pressed: translate +3px, `sticker-pressed`. Disabled: 50% opacity, no shadow, `not-allowed`. Loading: label stays, a small tie-dye ring replaces the icon.
- Focus-visible: 3px Info outline, 3px offset, never removed.

### Cassette deck (hero component)
- **Anatomy:** body (Surface raised, hero border, `lg` radius, `sticker` shadow) > label sticker (Surface sunken, `wobble` radius, title and artist) > tape window (two reels) > LCD readout > seek tube > key row > volume.
- **Reels:** custom SVG, teal hub, ultramarine spokes. Rotate at ~1 turn per 2.4s while playing, stop while paused. The tape pack is two circles whose radii interpolate with progress (left shrinks, right grows). Min radius 18px, max 34px.
- **States:** empty (no cassette: window shows a dotted outline and the text "No tape yet"), loaded/paused, playing, loading metadata, error.
- **Load moment:** when the first tunes are added, the cassette slides into the deck once (320ms, ease-lazy). This is the one orchestrated entrance. No other entrance animations on the page.
- Max width 640px, centered in its column.

### Transport keys
- Keys: Previous, Play/Pause, Next, Shuffle, Repeat. Square-ish, `md` radius, 56px. Play is 72px, fill Secondary, text Text.
- Shuffle and Repeat show "on" as a pressed-in state plus a small leaf-green dot (never color alone), and repeat-one shows a "1" badge.
- Keyboard: Space toggles play. Arrow keys per the app shortcuts.

### Seek tube
- A pill-shaped tube: 20px tall, Surface sunken track, 2.5px outline. Fill is Secondary with a Tertiary highlight stripe on top. The thumb is a 28px round blob with outline.
- Native `<input type="range">` semantics (or equivalent ARIA slider), `aria-valuetext` like "1 minute 12 seconds of 3 minutes 58 seconds". Keyboard step 5s, page step 15s.
- Time labels use `lcd` with `font-variant-numeric: tabular-nums`.

### Volume
- Short tube slider (same anatomy, 120px) plus a mute key. Persisted.

### Queue (tape stack)
- Each row is a cassette spine: 56px tall, `md` radius, outline, track number in the label, title (body-md, 600), duration (lcd). Rows stack with 8px gaps.
- Current track: tie-dye ring (3px conic border) plus a 3-bar equalizer that animates only while playing. A static "playing" icon replaces it when paused or in reduced motion.
- Hover: lift 1px. Drag handle on the left (44px target). Remove key on the right.
- Virtualize above 100 rows. Empty queue shows the drop zone.

### Drop zone and empty state
- Large rounded rectangle with a dashed 3px ultramarine outline on Surface raised, an original rooftop illustration (lava lamp, speaker, cushion), and the line "Pick some tunes to get started." Primary button "Pick tunes", secondary "Add folder".
- Drag-over: fill switches to Surface sunken and the outline becomes solid. The text becomes "Drop to add".

### Toasts
- Sticky-note style, `wobble` radius, Surface raised, outline. Success has a leaf dot, error a cherry dot plus an icon. Auto-dismiss 5s (errors 8s), pause on hover, `role="status"` (errors `role="alert"`).

### Scene card (polaroid)
- White-ish Surface raised border area, image 4:3 with `object-fit: cover`, name under it (editable), pixel size, quality badge (Low = Warning, Good = Tertiary, Great = Leaf), active switch, delete. Drag handle top-left.
- Badges carry text and an icon, never color alone.

### Dialog
- Surface raised, `lg` radius, hero border, `sticker` shadow, scrim is Primary at 40% opacity (not black). Focus trapped, Esc closes, first action focused. Destructive action is the right-most button and says exactly what it does ("Delete scene").

### Vibe HUD
- Solid Surface raised card, `lg` radius, `hud` shadow, max 560px, 24px from the bottom. Contains title, artist, seek tube, Previous/Play/Next, exit.
- Fades out in 400ms after 4s of no input and the cursor hides. Returns instantly on pointer move, touch, or key. Never fades while a control has focus or while the pointer is over it.
- No text is ever placed directly on a scene image.

### Fallback scene (no images yet)
- Four to six soft blobs in Secondary, Warning, Tertiary and Info on a Surface base, slowly rising and merging like a lava lamp. Transform-only animation, 40 to 70s per cycle. No purple.

## Motion

UI motion answers an action (press, open, add). Non-user-triggered motion is limited to: reels while playing, the equalizer while playing, Vibe-mode scenes, and the fallback scene. Nothing else moves on its own.

**Vibe mode scene motion**
- **Interval:** 30s default between transition starts. The transition (3 to 6s) happens inside that window.
- **Drift:** each scene picks a random preset (zoom in, zoom out, pan left, right, up, down). Scale 1.06 to 1.16. Max translate per axis in % is `(scale - 1) / 2 * 100`, so edges never show. Linear easing, duration = interval + max transition.
- **Transitions (random, never the same twice in a row):** slow crossfade, zoom-through dissolve, drift slide, iris bloom, wisp dissolve (smoke-like mask), warm light-leak.
- **Pause behavior:** pausing music freezes both the scene timer and the drift. Resume continues from the same moment.
- **Properties allowed:** transform, opacity, clip-path, mask-position. Full-screen blur animation is forbidden.
- **Reduced motion:** no drift, crossfade only, same interval.

## Imagery and Quality

- Never re-encode or resize the user's originals. Serve the uploaded file from the CDN as-is.
- Scenes render as plain `<img>` (not the Next.js optimizer), `object-fit: cover`, decoded with `img.decode()` before they appear. Preload and decode the next scene ~8s early.
- Fit mode (for extreme aspect mismatches): the uncropped image over a static, soft backdrop made from the same image.
- Quality badges: Low under 1920x1080, Good from 1920x1080, Great from 2560x1440. Recommend 2560x1440 or larger for drift at 4K.

## Accessibility

- **Must:** WCAG 2.2 AA, full keyboard operation, visible focus (3px Info, 3px offset), 44px minimum targets, `prefers-reduced-motion` respected, `aria-live="polite"` for track changes.
- **Must:** every control has an accessible name. Icon-only keys have `aria-label` plus a tooltip. State is never conveyed by color alone.
- **Must:** scene images are decorative (`alt=""`). The scenes manager gives each thumbnail `alt` from the editable name.
- **Must:** touch devices have equivalents for all hover behavior. The HUD wakes on tap.
- **Should:** high-contrast mode (`forced-colors`) keeps outlines visible (they already are structural).

## Content and Tone

Voice: relaxed, plain-spoken, warm. Sentence case, active voice, no filler. Describe what happens. Be specific.

| Situation | Write this | Not this |
|---|---|---|
| Primary CTA | "Pick tunes" | "Upload" (nothing is uploaded) |
| Empty queue | "Pick some tunes to get started. Your music stays on this device." | "Nothing here!" |
| Files added | "Added 12 tunes to the queue." | "Success!" |
| Unsupported file | "song.wma can't play in this browser. Try mp3, m4a, wav or ogg." | "Error: format" |
| Scene saved | "Scene added." | "Upload complete" |
| Delete | "Delete this scene? It's removed from storage and can't be undone." | "Are you sure?" |
| No scenes | "No scenes yet. Add images and they'll drift in while music plays." | "No data" |
| Low-res | "Low resolution. This will look soft in Vibe mode." | "Warning" |

An action keeps the same name through the flow: "Add folder" gives the toast "Added 8 tunes from the folder." Errors never apologize and always say how to fix it.

## Anti-patterns

- Purple, violet, magenta, neon glow, black backgrounds, frosted glass.
- Gradient-wash heroes, identical rounded-card grids with soft grey shadows, uniform radius on everything.
- Tracked-out all-caps eyebrow labels, "A · B · C" meta strings, arrows appended to button text.
- Numbered markers on things that aren't a sequence (queue positions are the exception).
- Fade-and-slide-up on every section, hover animations on every card.
- Text placed directly on a scene image.
- Any blur animation on a full-screen layer.
- The Next.js image optimizer for Vibe-mode scenes.
- Third-party characters or the meme character called "Chill Guy".

## QA Checklist

- [ ] Every color, radius, spacing and shadow comes from a token above.
- [ ] No purple, no pure black, no gradient except tie-dye and the fallback scene.
- [ ] Text on lava orange is ultramarine in every component.
- [ ] Reels turn only while playing, and the tape pack tracks progress.
- [ ] Keyboard: every control reachable, focus ring visible, shortcuts documented in the UI.
- [ ] 360px layout works with no horizontal scroll. Queue is a bottom sheet.
- [ ] Reduced motion: no drift, no reels, no equalizer motion, crossfade only.
- [ ] Vibe mode: HUD idles out and returns, no text directly on images, 60fps at 1440p.
- [ ] Scenes are original-quality, decoded before display, and edges never show during drift.
- [ ] Copy follows the tone table. No "Upload" for local audio.

