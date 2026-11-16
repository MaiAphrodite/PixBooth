# PixBooth

> Browser photo booth that captures, styles, and saves photo strips to Supabase

[![License](https://img.shields.io/badge/license-MIT-2ea44f?style=flat-square)](LICENSE)
[![Stack](https://img.shields.io/badge/stack-React%20%2B%20Vite%20%2B%20Supabase-000?style=flat-square)](#tech-stack)

Live demo: [pix-booth.vercel.app](https://pix-booth.vercel.app)

PixBooth runs a photo booth in the browser: pick a strip or collage layout, take
webcam shots with a countdown, style the result in an editor, then save it to
Supabase Storage and find it again in your gallery. It is aimed at events,
parties, and quick sessions, and it deploys as a static Vite app on Vercel.

## Features

- Seven layouts: one single shot, three strip styles with 2, 3 and 4 poses, and
  three collage styles with 4, 6 and 8 poses (`src/data/layouts.js`).
- In-browser capture through a small `getUserMedia` wrapper, with a 3 second
  countdown, retake per pose, mirrored preview, optional crop and
  hue/saturation/brightness sliders.
- Editor on a Fabric.js canvas: frame color, filters, eight sticker packs, and
  repeating patterns, then download the strip as a PNG.
- Save to gallery: the strip is rendered to a PNG blob and uploaded to Supabase
  Storage under the signed-in user id, with the public link copied to the
  clipboard.
- Email and password auth with Supabase, with the session surfaced in the
  header (display name and log out).
- Gallery lists only the uploads that belong to the signed-in user.
- Optional Elysia helper server that mints signed URLs when the storage bucket
  is private.
- Vercel ready: `vercel.json` sets the build command, output directory, and the
  SPA rewrite.

## Tech stack

| Layer | Choice |
|---|---|
| UI | React 19, React Router 7 |
| Build | Vite 7 (rolldown-vite), Bun |
| Styling | plain CSS (`App.css`, `index.css`, `instagram.css`), Poppins |
| Canvas | Fabric.js and p5, loaded from jsDelivr at runtime |
| Backend | Supabase Auth and Storage, optional Elysia server |
| Deploy | Vercel |

## Getting started

Prerequisites: Bun and a Supabase project with an `ImageStore` bucket that
allows public reads.

```sh
bun install
cp .env.example .env.local   # then fill in your Supabase values
bun run dev                  # http://localhost:5173
```

Camera access needs `https` or `localhost`.

| Variable | Scope | Used by |
|---|---|---|
| `VITE_SUPABASE_URL` | browser | Supabase client in `src/lib/supabase.js` |
| `VITE_SUPABASE_ANON_KEY` | browser | Supabase client, publishable key |
| `VITE_SERVER_URL` | browser | signed URL helper, default `http://localhost:8787` |
| `SUPABASE_URL` | server only | `server/index.ts` |
| `SUPABASE_SERVICE_ROLE` | server only | `server/index.ts`, never expose this to the browser |

### Scripts

```sh
bun run dev      # vite
bun run build    # vite build
bun run preview  # vite preview
bun run lint     # eslint .
bun run server   # bun run server/index.ts, Elysia on port 8787
```

## Supabase storage

Uploads go to the `ImageStore` bucket at `<uid>/layout-<id>/<timestamp>.png`, and
reads use the public URL, so the bucket has to allow public reads and
authenticated writes scoped to the uploader's own `uid` folder, per the Storage
RLS policy on `ImageStore/<uid>/...`.

If you flip the bucket to private reads, run `bun run server` with
`SUPABASE_SERVICE_ROLE` set and point `VITE_SERVER_URL` at it, then the editor
falls back to `POST /signed-url` for each render.

## Project structure

```
src/
├── pages/       # Home, Layout, Booth, Editor, Gallery, Login, Signup
├── components/  # Header, Footer, Hero, HowItWorks, LayoutSelector
├── lib/         # supabase client, storage upload and signed URL helpers
├── data/        # layout catalog
└── vendor/      # self-contained photobooth camera widget
server/          # optional Elysia server for signed URLs
```

## Notes and limitations

- `Event` and `Vendor` are stub pages with placeholder copy.
- The "Download via QR code" button has no handler yet; the PNG download works.
- Layout previews and hero art point at Figma MCP asset URLs, so those images
  depend on Figma's CDN rather than local files.
- Fabric.js 5.3 and p5 1.9 are loaded from jsDelivr at runtime, while
  `package.json` also lists Fabric as a dependency, so the versions can drift.
- `server/index.ts` signs paths in a bucket named `renders` while the app
  uploads to `ImageStore`; align the names before relying on private reads.
- `src/lib/supabase.js` falls back to a built-in anon key when the env vars are
  missing, which is fine for local demos but should not be how you deploy.
- `resolveEmailForUsername` and `signInWithProvider` exist in
  `src/lib/supabase.js` but nothing calls them; the resolver also expects a
  `profiles` table with `username` and `email` columns.

## License

MIT. See [LICENSE](LICENSE).
