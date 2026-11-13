-- Edit this file, then restart KOReader.
return {
    -- Pick a long, random, hard-to-guess name. Anyone who knows it can read or change your sign.
    topic = "CHANGE-ME-to-something-random-like-door-7f3k9q2xv8",

    -- ntfy server. The free public one works; you can self-host later.
    server = "https://ntfy.sh",

    -- How often to check for a new status, in seconds. Lower = faster updates, more battery.
    poll_seconds = 60,

    -- Text shown before any status has been received.
    default_status = "OPEN",

    -- Optional smaller line shown under the status for these keywords.
    subtitles = {
        BUSY = "Please do not disturb",
        OPEN = "Come on in",
    },
}
