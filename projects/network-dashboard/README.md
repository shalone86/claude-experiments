# Network dashboard

One page that shows traffic for all of Shalone's sites in one place: page views, visitors, bots,
where visitors came from, song and video plays, game plays and downloads, per site and in total.
It runs as the Cloudflare Worker `cloudflare-unified-dashboard` at
https://dashboard.shalonely.com (also dashboard.methodiusmedia.com).

**Status:** live. This folder holds the code that is deployed. The original source wasn't in any
repo, so `src/index.js` is the deployed bundle as downloaded from Cloudflare on 2026-11-18
(the page's HTML and the Worker in one file), with that day's changes:
- removed kids.methodiusmedia.com (its videos moved to Angelio)
- angelio.org now counts video plays, song plays and downloads, from the site and from the
  `watch-media` R2 bucket that holds Angelio's Watch & Sing files

## How it counts

| What | Where it comes from |
|---|---|
| Page views, visitors, bots | Cloudflare zone analytics (GraphQL `httpRequestsAdaptiveGroups`) for each site's zone |
| Plays and downloads | Requests for `.mp3`, `.mp4`, `.pdf`, `.zip` on each site, plus R2 `GetObject` counts for the buckets listed in `r2Buckets` |
| Ghost sites | A small script in Ghost's code injection sends events to `/api/track`; they're stored in the `MEDIA_STATS` KV namespace |
| Traffic sources | Cloudflare Web Analytics, for sites that have it turned on |

Numbers are Cloudflare's sampled estimates, so treat them as rough sizes.

## Change which sites it shows

Edit the `SITES` list near the top of the Worker part of `src/index.js` (search for `var SITES`).
Each site has its hostnames (`matchHosts`), its Cloudflare zone (`zoneDomain`), optional
`r2Buckets`, and `trackMedia: false` / `trackDownloads: false` to hide plays or downloads.
Also add or remove the site in the page's site picker (search for `<option value=`).

Known gap: it still tracks the old courses.methodiusmedia.com, not catholiccourses.org.

## Deploy

```bash
cd projects/network-dashboard
npx -y wrangler@4 deploy --keep-vars
```

`--keep-vars` keeps the variables set in the Cloudflare dashboard (see `wrangler.jsonc`).
The API token is a secret, so it stays either way. Roll back: Cloudflare dashboard → Workers →
cloudflare-unified-dashboard → Deployments.
