# PixBooth

React + Vite app for a digital photobooth with Supabase integration.

## Scripts

- `bun run dev` — start the app locally
- `bun run build` — production build
- `bun run preview` — preview the build
- `bun run server` — optional Elysia server for signed URLs

## Deploy to Vercel

1. Push code to GitHub (or connect this repo in Vercel).
2. In Vercel Project Settings → Environment Variables, add:
	- `VITE_SUPABASE_URL` = `https://ksrugselthfxjjibtgnp.supabase.co`
	- `VITE_SUPABASE_ANON_KEY` = `<your anon key>`
	- Optional: `VITE_SERVER_URL` = your signed-URL server (if used)
3. Vercel config:
	- Build Command: `bun run build`
	- Output Directory: `dist`
4. Deploy.

### Notes
- The `ImageStore` bucket is public for reads. Authenticated users can upload to `ImageStore/<uid>/...` per Storage RLS policies.
- If you switch the bucket to private reads, use the Elysia server (`/signed-url`) and set `VITE_SERVER_URL`.
