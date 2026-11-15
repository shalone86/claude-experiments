# Linework

Quick one-pen line-art tracer for making free Catholic coloring pages from public-domain
icons and paintings. Built for a phone + S Pen.

**Status:** deployed at https://linework.shalonely.com (Cloudflare Worker, static assets). Not yet tested on a real phone.

## How it works
- Opens on a random picture you haven't finished, shown at 50% opacity.
- You trace over it on a vector layer. One fine-liner: size slider + stabilization slider (lazy-brush).
- Pen draws; two fingers pinch-zoom and pan (one finger pans; turn on "Finger draws too" in settings).
  Mouse: left draws, wheel zooms, space/right-drag pans, Ctrl+Z undo.
- ✓ → title / description / tags → **Save & next** (removes it from rotation), **Download SVG**, or **Publish**.
- ⏭ skips to another random picture (your drawing is kept as a draft). ⤢ fits to screen.
- SVG output is line art only (no reference image), with `<title>`, `<desc>`, tags in `<metadata>`.
- Progress and finished work live in the browser (localStorage / IndexedDB). "Export all" dumps JSON.

## Run it
No build step. Serve the folder over HTTPS (needed for install-to-home-screen) and open on the phone:
```
cd projects/linework && python3 -m http.server 8000     # local test
```
For the phone, host it as static files (GitHub Pages / Cloudflare Pages), open in Chrome →
menu → **Add to Home screen**. It then runs full-screen and offline.

## Adding pictures
- In-app: ☰ → *Add pictures from device…* (stored on the phone).
- Bundled (20 already, from sdcason.com tag feeds): drop files in `icons/` and list them in `icons/index.json`:
  `[{"id":"x","src":"x.jpg","title":"…","description":"…","tags":["icon"],"source":"URL","license":"public domain"}]`
- Sources: Wikimedia Commons (Category: Icons), Met Open Access, Google Arts & Culture PD works.
  Check each file's license.

## Publish to your site
☰ → *Website settings*: URL + optional bearer token. Publish POSTs
`{id,title,description,tags[],svg}` as JSON. Your site needs an endpoint that accepts it
(and CORS for the app's origin). Not built yet.

## Ideas for later
Pressure-sensitive width, auto-written description/tags with Claude, closed-shape check for
colorability, an endpoint on your site, bundled starter icon set.

## Deploy
`cd projects/linework && npx wrangler@4 deploy` (needs `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID`).
`wrangler.jsonc` serves this folder as static assets on the custom domain `linework.shalonely.com`.
