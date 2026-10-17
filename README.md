# Chill Guy

> A sunny daytime rooftop cassette-deck player for chill listening. Pick tunes from your PC, hit play, and slow, original-quality scenes drift across the full screen.

---

## Brand & Aesthetic

- **Palette:** Butter yellow surface (`#FCEFB4`), ultramarine ink (`#1A2A86`), lava orange (`#FF8A4C`), teal (`#3BC6B8`), leaf green (`#1F6B3E`), warning mustard (`#E0A200`), danger cherry (`#C4311F`), info sky (`#2459C9`).
- **Typography:** Display: `DynaPuff`, Body: `Bricolage Grotesque`, LCD Readouts: `VT323`.
- **Hero element:** Physical cassette deck with spinning reels, dynamic tape pack tracking progress, chunky transport keys, and a lava-tube seek slider.
- **Vibe mode:** Drifting full-screen original imagery, 6 smooth transitions (crossfade, zoom-through dissolve, drift slide, iris bloom, wisp dissolve, warm light-leak), and an auto-hiding HUD.

---

## Hard Architectural Constraints

1. **Local Audio Stays Local:** Audio files never leave the browser. They are played via `URL.createObjectURL(file)`. No audio is uploaded, stored, or proxied on any server.
2. **Uploaded Assets:** Images are the only uploaded assets. Stored in UploadThing, metadata stored in Supabase Postgres.
3. **No Image Re-encoding in Vibe Mode:** Scenes render via standard un-optimized `<img>` tags pointing directly to the CDN to preserve 100% original pixel fidelity and prevent compression artifacts.

---

## 1. Supabase Setup

Run the following SQL in your Supabase project's SQL Editor:

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

-- Note: Mutations (insert, update, delete) are executed on the server
-- using the Supabase service-role client after verifying the admin email.
```

### Auth Redirect URLs
In your Supabase project under **Authentication -> URL Configuration**:
- **Site URL:** `http://localhost:3000` (or your production Vercel domain)
- **Redirect URLs:**
  - `http://localhost:3000/auth/callback`
  - `https://your-domain.vercel.app/auth/callback`

---

## 2. UploadThing Setup

1. Create a project at [UploadThing](https://uploadthing.com).
2. Generate an API token and copy it.
3. Set `UPLOADTHING_TOKEN` in your environment variables.

---

## 3. Environment Variables

Create `.env.local` based on `.env.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
UPLOADTHING_TOKEN=your_uploadthing_token
ADMIN_EMAIL=your-email@example.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 4. Local Development & Testing

```bash
# Install dependencies
npm install

# Run unit tests (Vitest)
npm test

# Run TypeScript typecheck
npm run typecheck

# Run linter
npm run lint

# Build for production
npm run build

# Start development server
npm run dev
```

---

## 5. Keyboard Shortcuts

- `Space`: Play / Pause
- `Left` / `Right`: Seek backward / forward 5s
- `Shift + Left` / `Shift + Right`: Previous / Next track
- `Up` / `Down`: Volume up / down (5%)
- `M`: Mute / Unmute
- `S`: Toggle Shuffle
- `F`: Toggle Vibe mode
- `Q`: Toggle Queue
- `Esc`: Exit Vibe mode

---

## Decisions Log

1. **Next.js 16 App Router & React 19:** Configured async cookie handling and React 19 compatibility across server actions and route handlers.
2. **Audio Streaming & Memory Safety:** Utilized `URL.createObjectURL(file)` with immediate revoking on track removal and window unload to prevent memory bloat during multi-hour listening sessions.
3. **Lazy ID3 Metadata Extraction:** Employs dynamic `import("music-metadata")` to parse ID3 title, artist, and embedded cover art in the background without blocking the main UI thread.
4. **Drift Bounds & Transform Guarantee:** All drift scale and translation offsets strictly satisfy `|t| <= (scale - 1) / 2 * 100`, mathematically guaranteeing that image boundaries never leak into view during full-screen motion.
5. **Frame Rate Self-Check:** Monitors rendering delta via `requestAnimationFrame`; if client device drops below ~50fps, smoothly defaults to crossfade for the remainder of the session.
6. **No Third-Party Characters:** Implemented original SVG artwork for the sleepy crescent-moon logo and rooftop hangout illustration (lava lamp, speaker, comfy cushions).
