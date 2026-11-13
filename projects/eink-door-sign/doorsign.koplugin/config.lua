-- Edit this file, then restart KOReader.
return {
    -- Pick a long, random, hard-to-guess name. Anyone who knows it can read or change your sign.
    topic = "CHANGE-ME-to-something-random-like-door-7f3k9q2xv8",

    -- ntfy server. The free public one works; you can self-host later.
    server = "https://ntfy.sh",

    -- How often to check for a new status, in seconds. Lower = faster updates, more battery.
    poll_seconds = 60,

    -- Status shown before anything has been received.
    default_status = "FREE",

    -- Background colors {red, green, blue}, 0-255. Text is always white, bold, all caps.
    -- Color e-ink shows these more muted than a phone screen; push them stronger if needed.
    colors = {
        BUSY      = { 200, 30, 30 },   -- red
        RECORDING = { 17, 17, 17 },    -- near-black, with a red dot above the text
        FREE      = { 30, 140, 60 },   -- green
        ["OUT OF OFFICE"] = { 100, 50, 140 }, -- purple
        CUSTOM    = { 40, 64, 110 },   -- navy, used for any other text
    },
    dot_color = { 224, 36, 36 },

    -- Other words that mean the same as a main status (case doesn't matter).
    aliases = {
        OPEN = "FREE", AVAILABLE = "FREE",
        REC = "RECORDING", ["ON AIR"] = "RECORDING",
        OOO = "OUT OF OFFICE", OUT = "OUT OF OFFICE", AWAY = "OUT OF OFFICE",
    },
}
