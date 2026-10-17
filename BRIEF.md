# Copilot agent brief: "Chill Guy"

You are a senior full-stack engineer. Build **Chill Guy**, a Next.js web app for chill listening. The user picks MP3s from their own PC (one track or a whole queue), and while the music plays, a full-screen "Vibe mode" shows slowly drifting images with smooth, random transitions. The user adds those images manually. Images live in UploadThing, their metadata lives in Supabase, and the app deploys to Vercel.

## 0. Ground rules

- **Read first, before writing code:** `DESIGN.md` (repo root) and `.github/skills/chill-guy-design/SKILL.md`. They are the source of truth for every visual decision: tokens, fonts, components, motion. If this brief and DESIGN.md disagree on visuals, DESIGN.md wins. On behavior, this brief wins.
- A reference illustration is attached. Use it for **mood and palette only**: a rooftop hangout at night, swirly painterly sky, lava lamp, tie-dye blanket, cassette tapes, snack bags, a glowing city. Do **not** reproduce its characters or any other third-party IP. The logo and any illustration must be original.
- Do not stop to ask questions. Pick the sensible default, then record it under "Decisions" in `README.md`.
- TypeScript `strict`, no `any`, validate all external input with `zod`, no dead code, no commented-out code.
- Work in the milestone order in section 12. After each milestone run typecheck, lint, tests and `next build`, and fix everything before moving on.

## 1. Hard constraints

1. **Local audio never leaves the browser.** A web app cannot read arbitrary paths on the user's disk, so use a file picker, a folder picker and drag-and-drop, then play through `URL.createObjectURL(file)`. No audio upload, no server route that touches audio. Revoke object URLs when tracks are removed and on unmount.
2. **Images are the only uploaded assets.** They go to UploadThing. Their metadata goes to Supabase Postgres.
3. **No purple, no dark-mode-neon, no gradient-wash "AI look".** Follow the palette in DESIGN.md exactly (butter yellow surface, ultramarine ink, lava orange, teal, leaf green).
4. **Image quality is a product requirement.** See section 7.
5. Must deploy on Vercel with zero custom server. Everything is Next.js route handlers and server actions.

## 2. Stack

- Next.js (latest stable, App Router), React, TypeScript strict
- Tailwind CSS with the DESIGN.md tokens exposed as CSS variables and mapped in the Tailwind theme
- `next/font/google`: DynaPuff, Bricolage Grotesque, VT323 (roles in DESIGN.md)
- Zustand for player and vibe state (keep stores small, one for the player, one for settings)
- `@supabase/supabase-js` + `@supabase/ssr`
- `uploadthing` + `@uploadthing/react` (current App Router setup from the official docs; use the URL field the docs recommend, `ufsUrl` in v7+)
- `zod`, `lucide-react` (set `strokeWidth={2.5}`), `@tanstack/react-virtual` for long queues
- `music-metadata` (browser build, dynamic import) for ID3 title, artist, duration and cover art. Fall back to parsing `Artist - Title.mp3` from the filename.
- Vitest for unit tests. Playwright is optional.

## 3. Features

### F1. Local audio input
- Buttons: **Pick tunes** (`<input type="file" multiple accept="audio/*,.mp3,.m4a,.aac,.wav,.ogg,.flac">`) and **Add folder** (`webkitdirectory`). Plus a full-window drop zone.
- Accept one file or many. Sort folder imports with natural filename sort. Skip non-audio. Check support with `audio.canPlayType` and show a toast for unsupported files, naming the file and the fix.
- Parse metadata lazily in the background so adding 200 files never blocks the UI.
- Show a quiet line: "Your music stays on this device."

### F2. Queue and playback
- One persistent `<audio>` element owned by a client provider, so playback survives route changes.
- Controls: play/pause, previous (restarts the track if more than 3s in), next, seek, volume, mute, shuffle, repeat (off, all, one), remove track, clear queue, drag to reorder, click to jump.
- Auto-advance on `ended`. A small gap between tracks is acceptable.
- **Media Session API:** title, artist, artwork and OS media keys.
- **Keyboard:** Space play/pause, Left/Right seek 5s, Shift+Left/Right previous/next, Up/Down volume, M mute, S shuffle, F vibe mode, Q queue, Esc exit vibe mode. Ignore shortcuts while typing in an input.
- Persist volume, shuffle, repeat and settings in `localStorage`, wrapped in try/catch. The queue itself cannot persist, because browsers do not keep file access across reloads. Say so plainly in the empty state.
- Autoplay policy: audio starts only from the user's Play click. Next-track auto-advance is fine after that.

### F3. Player UI
Build the cassette-deck player exactly as specified in DESIGN.md (reels that turn while playing, tape pack that moves with progress, lava-tube seek bar, chunky keys, queue as a stack of tape spines). Empty state is a large friendly drop zone with an original rooftop illustration.

### F4. Vibe mode (the main event)
- Pressing Play enters Vibe mode when "Auto-enter on play" is on (default on). Call `requestFullscreen()` on the Vibe root **inside the click handler**, because browsers only allow it from a user gesture.
- Fallback when the Fullscreen API is unavailable or denied (iPhone Safari): a fixed `inset: 0` full-viewport overlay using `100dvh`, with the same behavior.
- Esc or the exit key leaves Vibe mode. Music keeps playing. A "Vibe" button re-enters.
- While active, request a **Screen Wake Lock** so the display doesn't sleep. Release it on exit and re-acquire it on `visibilitychange`.
- **HUD:** compact cassette strip at the bottom centre (title, artist, seek, prev/play/next). It fades out after 4s without pointer or key activity and the cursor hides with it. It returns on move, touch or key. It uses the solid raised surface from DESIGN.md, never text floating on the image.
- If there are no scenes yet, show the built-in fallback scene from DESIGN.md (slow warm "lava lamp" blobs, no purple) and a gentle nudge to add images.
- Full spec of the scene engine is in section 6.

### F5. Scenes manager (`/scenes`, admin only)
- Upload many images at once through UploadThing (drag-drop plus picker). Show per-file progress.
- Grid of polaroid-style cards: thumbnail, name (inline editable), pixel size, quality badge, active toggle, delete.
- Quality badge: **Low** below 1920x1080, **Good** from 1920x1080, **Great** from 2560x1440. Low-res images still work, but warn that they will look soft in Vibe mode.
- Drag to reorder (`sort_order`). Delete removes the UploadThing file (`UTApi.deleteFiles`) **and** the DB row, with a confirm dialog.
- Optimistic UI, errors in plain language, no silent failures.

### F6. Auth and access
- Public: `/` (player and Vibe mode) can read active scenes.
- Admin: `/scenes` and every mutation require a signed-in Supabase user whose email equals `ADMIN_EMAIL`. Use Supabase Auth email magic link (`/login`, `/auth/callback`).
- Enforce on the server in three places: `middleware.ts` for `/scenes`, the UploadThing middleware, and every server action. Never trust the client.
- The service-role key is used only in server code, never in anything importable by a client component.

### F7. Settings (drawer, saved to `localStorage`)
- Scene interval: 10 to 120s, default **30s**.
- Transition feel: Soft (4 to 6s) or Mixed (3 to 6s, default).
- Shuffle scenes (default on). Drift motion (default on). Fit: Fill (default) or Fit with soft backdrop. Auto-enter Vibe on play (default on).

## 4. Data model (Supabase)

```sql
create extension if not exists "pgcrypto";

create table public.scenes (
  id          uuid primary key default gen_random_uuid(),
  name        text        not null,
  url         text        not null,
  file_key    text        not null unique,
  width       int,
  height      int,
  size_bytes  bigint,
  sort_order  int         not null default 0,
  is_active   boolean     not null default true,
  created_at  timestamptz not null default now()
);

create index scenes_active_order_idx on public.scenes (is_active, sort_order);

alter table public.scenes enable row level security;

-- Anyone can read active scenes (public player).
create policy "public can read active scenes"
  on public.scenes for select
  using (is_active = true);

-- No insert/update/delete policies on purpose.
-- Writes go through server actions using the service-role key after the admin check.
```

The admin screen needs to see inactive scenes too, so it reads server-side with the service-role client.

## 5. UploadThing

- File route `sceneUploader`: `image` only, `maxFileSize: "16MB"`, `maxFileCount: 20`.
- `.middleware()` verifies the admin session. Reject otherwise.
- After upload completes, insert the DB row on the server. Store `file_key` and the URL.
- After the client receives the upload result, measure `naturalWidth/Height` from the file in the browser and call a server action to store `width`, `height` and `size_bytes`.
- Configure `next.config` `images.remotePatterns` for the UploadThing hosts (`utfs.io` and `*.ufs.sh`). Verify against the current docs.
- Call `revalidateTag("scenes")` after every scene mutation. The home page fetches active scenes in a Server Component with that tag.

## 6. Scene engine spec

Build it as a small, testable module (`lib/scene-engine/`) plus a React component that renders it.

**Timing**
- `interval` = time between the *start* of one transition and the start of the next. Default 30s. The transition itself (3 to 6s, random per change) happens inside that window.
- The scene clock runs only while audio is playing. Pausing music pauses the timer **and** the drift animation. Resume continues from where it stopped. Use elapsed-time accounting, not a naive `setInterval`, and handle `visibilitychange`.

**Scene order**
- Shuffle uses a shuffled bag: every scene shows once before any repeats, and the first scene of a new bag never equals the last scene of the previous one. With one scene, just keep drifting it. With zero, show the fallback scene.

**Drift (slow movement)**
- Each scene gets a random preset: zoom-in, zoom-out, pan-left, pan-right, pan-up, pan-down, each with a slight zoom.
- Scale range 1.06 to 1.16. Max translate per axis (in %) must satisfy `|t| <= (scale - 1) / 2 * 100`, so edges never show.
- Duration = `interval + maxTransition`, so the motion never visibly stops, even during the next fade-in.
- Linear or very gentle ease-in-out. Slow enough to feel static if you stare, and clearly moving if you look away and back.
- Implement with the Web Animations API on **transform** only.

**Transitions (random, smooth)**
Create a registry of at least six. Pick randomly, never the same one twice in a row, and randomise duration within the chosen range.

1. Slow crossfade
2. Zoom-through dissolve (outgoing scales up and fades, incoming settles from 0.92)
3. Drift slide (both layers move 4 to 6% sideways while fading)
4. Iris bloom (a soft-edged circular mask grows from a random point)
5. Wisp dissolve (animated noise mask that reads like drifting smoke)
6. Warm light-leak (crossfade plus a brief orange-to-yellow glow peaking mid-transition)

Rules for every transition:
- Animate only `transform`, `opacity`, `clip-path` or `mask-position`. Never animate `filter: blur()` on a full-screen layer.
- At most two full-screen layers exist during a transition. Promote them with `will-change` only while animating, then remove it.
- If a transition drops below ~50fps in a quick self-check (`requestAnimationFrame` delta sampling), fall back to crossfade for the rest of the session.
- Optional stretch: a WebGL transition layer (gl-transitions style shaders) behind feature detection. Do not build this before everything else passes.

**Reduced motion**
With `prefers-reduced-motion: reduce`: no drift, only the slow crossfade, same timing.

## 7. Image quality (non-negotiable)

- **Never re-encode or downscale the user's originals.** Store and serve what they uploaded.
- Render Vibe-mode scenes with a plain `<img>` (or a `<canvas>` if you prefer) pointing at the original CDN URL. **Do not** route them through the Next.js image optimizer: it re-encodes, can soften detail, and burns Vercel quota. Use `next/image` only for small admin thumbnails.
- `object-fit: cover` with `width/height: 100%`. For extreme aspect mismatches (a portrait image on a landscape screen), use Fit mode: the image uncropped over a **static** soft backdrop made from the same image (rendered once, not animated).
- Before a scene is shown: create `new Image()`, set `src`, `await img.decode()`. Preload and decode the **next** scene about 8s before the transition. Keep at most 3 decoded scenes in memory.
- If the next image isn't ready at transition time, wait (up to 10s) rather than showing a half-loaded image. If it fails to load, mark it skipped for this session and move on.
- Honor `devicePixelRatio`. Test at 1080p, 1440p and 4K.
- Layers are composited on the GPU (transform and opacity only), so drift never causes layout or repaint.

## 8. Suggested structure

```
app/
  layout.tsx                 fonts, providers, grain overlay
  page.tsx                   server: fetch active scenes, render <Deck/>
  login/page.tsx
  auth/callback/route.ts
  scenes/page.tsx            admin gallery (server-guarded)
  api/uploadthing/{core.ts,route.ts}
components/
  deck/        CassetteDeck, Reels, SeekTube, Keys, VolumeKnob
  queue/       QueueDrawer, TapeSpine, DropZone
  vibe/        VibeRoot, SceneStage, Hud, FallbackScene
  scenes/      SceneGrid, SceneCard, SceneUploader
  ui/          Button, Toast, Dialog, Switch, Slider
lib/
  audio/       player-store.ts, metadata.ts, media-session.ts
  scene-engine/ scheduler.ts, drift.ts, transitions/, preload.ts
  supabase/    server.ts, admin.ts, browser.ts
  actions/     scenes.ts   ("use server", admin-gated, zod-validated)
  settings-store.ts
middleware.ts
DESIGN.md
.github/skills/chill-guy-design/SKILL.md
```

## 9. Environment variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # server only
UPLOADTHING_TOKEN=              # server only
ADMIN_EMAIL=                    # the one email allowed into /scenes
NEXT_PUBLIC_SITE_URL=
```

Ship `.env.example`. Never commit real values. Validate env at startup with `zod`.

## 10. Quality bar

- **Accessibility:** WCAG 2.2 AA. Visible `:focus-visible`, 44px minimum targets, full keyboard operation, `aria-live="polite"` for track changes and toasts, scene images are `alt=""` (decorative), sliders use native or correct ARIA patterns, reduced motion respected.
- **Browsers:** latest Chrome, Edge, Firefox, Safari. iOS Safari uses the fullscreen fallback and a standalone PWA manifest.
- **Performance:** Vibe mode holds ~60fps at 1440p on a mid-range laptop. The home route ships minimal JS: lazy-load `music-metadata`, the scene engine and the queue virtualizer.
- **Responsive:** desktop first, fully usable at 360px wide. On mobile the queue is a bottom sheet.
- **Errors:** every failure says what happened and how to fix it. No raw error strings, no silent catches.

## 11. Acceptance criteria

1. Pick 3+ MP3s (and drag-drop others) from the PC. They queue, show ID3 title/artist/cover when present, and play in order.
2. Pressing Play goes full screen and shows the first scene within 1s of the image being ready. No network request is made for audio.
3. A scene stays about 30s, then transitions to the next. Over 10 consecutive changes, at least 4 different transition types appear and none repeats back to back.
4. Images visibly drift for the whole interval, with no stutter and no visible edges. Pausing music freezes the drift and the timer. Resume continues.
5. Esc exits Vibe mode and music keeps playing. The HUD hides after 4s and reappears on input.
6. A signed-out visitor cannot reach `/scenes` and cannot call any mutation. The admin can upload, rename, reorder, toggle and delete, and deleting also removes the UploadThing file.
7. A 3840x2160 upload looks sharp full screen on a 4K display, with no re-compression artifacts and no blurry upscale.
8. With zero scenes the fallback scene runs and the app still works.
9. `pnpm typecheck && pnpm lint && pnpm test && pnpm build` all pass. Lighthouse accessibility is 95 or higher on `/`.
10. Deploys to Vercel with only the env vars above.

## 12. Work order

1. **Scaffold:** project, Tailwind tokens from DESIGN.md, fonts, grain overlay, base layout, `.env.example`.
2. **Audio core:** player store, file intake, metadata parsing, queue logic, **unit tests** for queue (next/prev/shuffle/repeat/remove/reorder).
3. **Deck UI:** cassette deck, keys, seek tube, volume, queue drawer, empty state, keyboard shortcuts, Media Session.
4. **Backend:** Supabase schema and RLS, auth and middleware, UploadThing route, server actions, `/scenes` manager.
5. **Scene engine:** scheduler, bag shuffle, drift, six transitions, preload/decode, fallback scene, **unit tests** for the scheduler (no repeats, bag logic, pause/resume timing).
6. **Vibe mode:** fullscreen with fallback, HUD idle behavior, wake lock, settings drawer.
7. **Polish and verify:** accessibility pass, reduced motion, perf checks at 1080p/1440p/4K, run the acceptance list.
8. **Docs:** `README.md` with Supabase SQL, UploadThing setup, Supabase auth redirect URLs, Vercel deploy steps, and the "Decisions" list.

## 13. Do not

- Do not upload, proxy or store audio anywhere.
- Do not use the Next.js image optimizer for Vibe-mode scenes.
- Do not use purple, black backgrounds, glassmorphism, neon glows or gradient-wash hero sections.
- Do not use Inter, Roboto, Arial or Space Grotesk.
- Do not put the service-role key, the UploadThing token or the admin check in client code.
- Do not add features not listed here. Finish and verify what's listed first.

