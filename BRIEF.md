# Chill Guy project brief

## What this project is

Chill Guy is a browser-based music player with a physical cassette-deck interface and a full-screen Vibe mode that shows original-quality, slowly moving images. People select music from their own device and manage the shared image collection in an admin-only scenes manager.

## What the app does

- **Play local music:** Pick audio files or a folder, or drop files into the player. Audio is played in the browser; it is not uploaded to the server. The browser queue is session-based because local file access does not survive a reload.
- **Manage a playback queue:** Play, pause, seek, adjust volume, mute, change tracks, shuffle, repeat, remove tracks, and reorder the queue. Track metadata is read locally when available. Keyboard shortcuts and operating-system media controls are supported.
- **Show Vibe scenes:** Enter full-screen or full-viewport Vibe mode while listening. Original images slowly drift and transition between scenes. Scene motion, order, interval, fit, and automatic entry preferences are stored in browser settings. If no scenes are available, a built-in fallback scene is shown.
- **Manage images:** `/scenes` provides an admin interface to upload images, rename and reorder them, toggle visibility, inspect image dimensions and quality, and delete them from image storage and the database.
- **Protect admin actions:** `/login` accepts a six-digit PIN using six separate inputs. The PIN is stored in PostgreSQL as a salted scrypt hash. Failed attempts are rate-limited through a database lockout. Successful sign-in creates a signed, HTTP-only session that expires after eight hours. **Back to deck** signs out, so returning to `/scenes` requires the PIN again.

## Stack and data flow

- Next.js App Router 16, React 19, strict TypeScript, Tailwind CSS 4, and Zustand.
- Prisma 6 and PostgreSQL (the project database is hosted by Supabase) store scenes and the admin account.
- UploadThing stores scene image files; PostgreSQL stores their metadata. The Next.js UploadThing middleware checks admin access before accepting an upload.
- Zod validates credentials and server-action inputs. Vitest covers audio, scene scheduling, and admin authentication.
- Audio files stay in the browser. Vibe mode displays scene images directly from their original CDN URLs rather than using the Next.js image optimizer.

## Main routes and code locations

- `/` — player, queue, cassette deck, and Vibe mode.
- `/login` — six-cell admin PIN form.
- `/scenes` — PIN-protected scene manager.
- `/api/admin/login` and `/api/admin/logout` — create and clear the signed admin session.
- `/api/uploadthing` — protected UploadThing image upload endpoint.
- `components/deck/` — playback provider, cassette deck, controls, and home screen.
- `components/queue/` — local file intake and playback queue.
- `components/scenes/` and `app/scenes/` — image management interface.
- `components/vibe/` and `lib/scene-engine/` — full-screen Vibe view, settings, drift, preloading, and transitions.
- `lib/actions/scenes.ts` — Prisma-backed scene reads and admin-checked mutations.
- `lib/auth/` — PIN hash verification, signed session, and admin access check.
- `prisma/schema.prisma` — `Scene` and `AdminUser` models.
- `DESIGN.md` and `.github/skills/chill-guy-design/SKILL.md` — design-system source of truth.

## Database and migrations

Prisma models the `scenes` table and the private `admin_users` table. Migrations are under `prisma/migrations/`:

1. `20261016000000_baseline` describes the existing scenes table. It was recorded as already applied when connecting Prisma to the existing database; it must **not** be run against a database that already has that table.
2. `20261017000000_admin_pin_auth` creates and seeds the admin account and defines the atomic failed-PIN lockout function. This migration has been applied to the configured database.

Check migration state with `npx prisma migrate status`. For a fresh database, inspect the baseline before deploying: it creates the scenes table and public-active-scenes policy.

## Design direction

The interface follows the warm rooftop cassette-deck visual system in `DESIGN.md`: butter-yellow surfaces, ultramarine outlines, hard sticker shadows, and the DynaPuff, Bricolage Grotesque, and VT323 typefaces. Text uses sentence case. Avoid generic dark/neon styling, purple, blurred glass, soft grey shadows, and unapproved gradient washes. Keep controls keyboard accessible, provide visible focus, and respect reduced-motion preferences.

## Local setup

1. Install Node.js and npm dependencies:

   ```bash
   npm install
   ```

2. Create an ignored local `.env` file (or `.env.local`) containing the required values:

   ```dotenv
   DATABASE_URL=postgresql://<user>:<password>@<host>:6543/postgres?pgbouncer=true
   DIRECT_URL=postgresql://<user>:<password>@<host>:5432/postgres
   UPLOADTHING_TOKEN=<UploadThing server token>
   ADMIN_SESSION_SECRET=<random secret of at least 32 characters>
   ```

   Use your own database and UploadThing credentials. Never put real secrets in this brief, source code, or a committed file.

3. Start the development server:

   ```bash
   npm run dev
   ```

   Open `http://localhost:3000`. Sign in to manage scenes at `/login`.

## Useful commands

```bash
npx prisma generate
npx prisma migrate status
npm run typecheck
npm run lint
npm test
npm run build
npm run start
```

## Safety and maintenance notes

- Never commit database passwords, UploadThing tokens, admin PINs, or session-signing secrets.
- A database password pasted into a chat or otherwise exposed should be rotated in Supabase, then updated in local and deployment environment settings.
- Keep the server-only session secret private; changing it invalidates existing signed sessions.
- Keep admin checks in the server proxy, upload middleware, and every scene mutation. Client-side visibility is not authorization.
- Preserve the local-audio boundary: music is never uploaded, stored, or proxied.
- For visual changes, read `DESIGN.md` and the Chill Guy design skill before editing UI.
