# E-ink door sign (PocketBook Color, PB633)

Turn a PocketBook e-reader into a portrait door sign you change from your phone over Wi-Fi.

| Sign | Background | Shows |
|---|---|---|
| **NO** | Black | Large white X, with "NO" below it |
| **GO** | White | Large black check mark, with "GO" below it |

Those are the only two signs. Pure black and white is the sharpest this color e-ink screen can
show. An earlier color version (red / green / navy, mockups in `design/`) looked washed out on
the device, so it was replaced. The X and the check are drawn as thick lines, not font
characters, so they don't depend on the fonts installed on the device.

The sign always shows in portrait so the device's chin sits at the bottom.

**Status:** KOReader and the plugin install fine on the device. The NO / GO version hasn't been
run on the device yet.

## How it works

```
 phone ──(tap a bookmark)──▶ ntfy.sh topic ◀──(checks every 60 s)── e-reader running KOReader
```

- **[KOReader](https://koreader.rocks)**: free, open-source reader software that runs on
  PocketBook as an extra app, with no jailbreak and without replacing the stock software.
  The `doorsign.koplugin` plugin in this folder shows the full-screen sign.
- **[ntfy.sh](https://ntfy.sh)**: free message service that needs no account. Your phone
  sends `no` or `go` to a private topic name, and the e-reader checks that topic.
- Capital letters and punctuation in a message don't matter (`No`, `GO`, `go!` all work).
  The sign ignores any other message and keeps showing what it already shows.
- On the sign itself: **tap** for a menu (No / Go), **press and hold** to close the sign.

## Setup

### 1. Install KOReader on the PocketBook
1. Download the latest `koreader-pocketbook-*.zip` from
   https://github.com/koreader/koreader/releases
2. Connect the e-reader to a computer by USB and choose **Connect to PC** on the e-reader.
   (On a Mac it appears under *Locations* in Finder's sidebar, e.g. as `PB633`. If it
   doesn't appear, try a different cable: many USB cables only charge.)
   Copy the `applications` and `system` folders from the zip onto the e-reader's main storage.
   Merge them with the folders that are already there.
3. Eject the e-reader. KOReader now appears in the e-reader's app list.

### 2. Add the plugin
1. Open `doorsign.koplugin/config.lua` and change `topic` to something long and random,
   for example `door-ari-8f2kq93nzx7`. **Anyone who knows the topic can see or change your
   sign**, so don't make it guessable.
2. Copy the whole `doorsign.koplugin` folder into
   `applications/koreader/plugins/` on the e-reader.

### 3. Set up KOReader on the e-reader
- Connect to Wi-Fi in KOReader (top menu → Network).
- Network → *Action when Wi-Fi is off* → **turn on**, so it reconnects without asking.
- Screen / Device → *Autosuspend* → **off**. Otherwise the e-reader goes to sleep and stops checking for changes.
- Open the top menu → Tools (🛠) → **Door sign**.

### 4. Set up the phone remote
Save these as bookmarks or home-screen shortcuts. Replace `YOURTOPIC` with your topic:

- No: `https://ntfy.sh/YOURTOPIC/publish?message=NO`
- Go: `https://ntfy.sh/YOURTOPIC/publish?message=GO`

Or send `no` / `go` to the topic from the free ntfy app. The sign changes within about a
minute (set by `poll_seconds`).

## Power

With Wi-Fi on and the device kept awake, expect roughly 1–3 days per charge.
For a permanent sign, keep it plugged into USB. Mounting command strips and a short
cable work well. A longer `poll_seconds` (for example 300) uses less battery but updates more slowly.

## Notes and limits
- ntfy.sh keeps a message for about 12 hours. After that the sign keeps showing the last
  status it received. That status is also saved on the device, so it comes back after a restart.
  Before anything has been received, it shows `default_status` (GO).
- For full privacy, run your own ntfy server and change `server` in `config.lua`.
- PocketBook's own *Settings → Software → Download new updates automatically* is fine to
  leave on. KOReader is a separate app, so firmware updates don't remove it.

## Ideas for later
- Calendar mode: show NO automatically during Google Calendar events.
- A sleep-friendly version: wake every few minutes, check, then go back to sleep.
