# E-ink door sign (PocketBook Color, PB633)

Turn a PocketBook e-reader into a door sign that shows **BUSY** or **OPEN** and
that you change from your phone over Wi-Fi.

**Status:** written, but not yet tested on the device.

## How it works

```
 phone ──(tap a bookmark)──▶ ntfy.sh topic ◀──(checks every 60 s)── e-reader running KOReader
```

- **[KOReader](https://koreader.rocks)**: free, open-source reader software that runs on
  PocketBook as an extra app, with no jailbreak and without replacing the stock software.
  The `doorsign.koplugin` plugin in this folder shows the full-screen sign.
- **[ntfy.sh](https://ntfy.sh)**: free message service that needs no account. Your phone
  sends "BUSY" or "OPEN" to a private topic name, and the e-reader checks that topic.
- Whatever text you send is what the sign shows, so `In a meeting until 3pm` works too.
- On the sign itself: **tap** to switch between BUSY and OPEN, **press and hold** to close the sign.

## Setup

### 1. Install KOReader on the PocketBook
1. Download the latest `koreader-pocketbook-*.zip` from
   https://github.com/koreader/koreader/releases
2. Connect the e-reader to a computer by USB. Copy the `applications` and `system`
   folders from the zip onto the e-reader's main storage. Merge them with the folders
   that are already there.
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
Save these two links as bookmarks or home-screen shortcuts. Replace `YOURTOPIC` with your topic:

- BUSY: `https://ntfy.sh/YOURTOPIC/publish?message=BUSY`
- OPEN: `https://ntfy.sh/YOURTOPIC/publish?message=OPEN`

Opening a link changes the sign within about a minute (set by `poll_seconds`).
To send custom text, use the free ntfy app or an iOS Shortcut / Android Tasker action
that sends the text to `https://ntfy.sh/YOURTOPIC`.

## Power

With Wi-Fi on and the device kept awake, expect roughly 1–3 days per charge.
For a permanent sign, keep it plugged into USB. Mounting command strips and a short
cable work well. A longer `poll_seconds` (for example 300) uses less battery but updates more slowly.

## Notes and limits
- ntfy.sh keeps a message for about 12 hours. After that the sign keeps showing the last
  status it received. That status is also saved on the device, so it comes back after a restart.
- For full privacy, run your own ntfy server and change `server` in `config.lua`.
- PocketBook's own *Settings → Software → Download new updates automatically* is fine to
  leave on. KOReader is a separate app, so firmware updates don't remove it.

## Ideas for later
- Calendar mode: show BUSY automatically during Google Calendar events.
- Show "back at 3:30" with a countdown.
- A sleep-friendly version: wake every few minutes, check, then go back to sleep.
