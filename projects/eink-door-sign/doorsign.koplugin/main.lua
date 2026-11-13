--[[
Door sign plugin for KOReader (portrait only, black and white).

Two signs only:
  NO -> black background, large white X, "NO" underneath
  GO -> white background, large black check mark, "GO" underneath

  * Change it from your phone by sending "no" or "go" to the ntfy topic in config.lua.
    Case doesn't matter. Any other message is ignored.
  * Tap the sign  -> menu: No / Go.
  * Hold the sign -> exit the sign.
]]

local Blitbuffer = require("ffi/blitbuffer")
local ButtonDialog = require("ui/widget/buttondialog")
local CenterContainer = require("ui/widget/container/centercontainer")
local Device = require("device")
local Font = require("ui/font")
local FrameContainer = require("ui/widget/container/framecontainer")
local Geom = require("ui/geometry")
local GestureRange = require("ui/gesturerange")
local InputContainer = require("ui/widget/container/inputcontainer")
local NetworkMgr = require("ui/network/manager")
local TextWidget = require("ui/widget/textwidget")
local UIManager = require("ui/uimanager")
local VerticalGroup = require("ui/widget/verticalgroup")
local VerticalSpan = require("ui/widget/verticalspan")
local Widget = require("ui/widget/widget")
local WidgetContainer = require("ui/widget/container/widgetcontainer")
local logger = require("logger")
local _ = require("gettext")
local Screen = Device.screen

local BOLD_FACE = "tfont" -- KOReader's bold sans (Noto Sans Bold)

local STYLES = {
    NO = { bg = Blitbuffer.COLOR_BLACK, fg = Blitbuffer.COLOR_WHITE },
    GO = { bg = Blitbuffer.COLOR_WHITE, fg = Blitbuffer.COLOR_BLACK },
}

local function load_config()
    local dir = debug.getinfo(1, "S").source:match("^@(.*/)") or "./"
    local ok, cfg = pcall(dofile, dir .. "config.lua")
    if not ok or type(cfg) ~= "table" then
        logger.warn("doorsign: could not read config.lua:", cfg)
        cfg = {}
    end
    cfg.server = (cfg.server or "https://ntfy.sh"):gsub("/+$", "")
    cfg.poll_seconds = tonumber(cfg.poll_seconds) or 60
    local d = tostring(cfg.default_status or "GO"):upper()
    cfg.default_status = STYLES[d] and d or "GO"
    return cfg
end

-- "no", " No! ", "GO." -> "NO" / "GO". Anything else -> nil (ignored).
local function normalize(text)
    local s = tostring(text or ""):upper():gsub("[^%a]", "")
    if STYLES[s] then return s end
    return nil
end

-- Returns body (string) or nil on failure.
local function http_request(url, method, body)
    local http = require("socket.http")
    local ltn12 = require("ltn12")
    local socket = require("socket")
    local socketutil = require("socketutil")
    local sink = {}
    socketutil:set_timeout(10, 20)
    local req = { url = url, method = method or "GET", sink = ltn12.sink.table(sink) }
    if body then
        req.source = ltn12.source.string(body)
        req.headers = { ["Content-Length"] = tostring(#body), ["Content-Type"] = "text/plain" }
    end
    local code = socket.skip(1, http.request(req))
    socketutil:reset_timeout()
    if code ~= 200 then
        logger.warn("doorsign: HTTP", method, url, "->", code)
        return nil
    end
    return table.concat(sink)
end

---------------------------------------------------------------------------
-- A big X or check mark, drawn as thick strokes (no font glyph needed)
---------------------------------------------------------------------------
local Mark = Widget:extend{
    kind = "NO",
    size = 400,
    color = Blitbuffer.COLOR_BLACK,
}

function Mark:getSize()
    return Geom:new{ w = self.size, h = self.size }
end

-- Thick line: stamp squares of side t along the path.
local function stroke(bb, x0, y0, x1, y1, t, color)
    local dx, dy = x1 - x0, y1 - y0
    local len = math.sqrt(dx * dx + dy * dy)
    local steps = math.max(1, math.ceil(len / math.max(1, t / 6)))
    local half = t / 2
    for i = 0, steps do
        local px = x0 + dx * i / steps
        local py = y0 + dy * i / steps
        bb:paintRect(math.floor(px - half), math.floor(py - half), t, t, color)
    end
end

function Mark:paintTo(bb, x, y)
    local s = self.size
    self.dimen = Geom:new{ x = x, y = y, w = s, h = s }
    local t = math.floor(s * 0.15)
    local m = t / 2 + 1
    if self.kind == "NO" then
        stroke(bb, x + m, y + m, x + s - m, y + s - m, t, self.color)
        stroke(bb, x + s - m, y + m, x + m, y + s - m, t, self.color)
    else
        local ax, ay = x + s * 0.08, y + s * 0.55
        local bx, by = x + s * 0.38, y + s * 0.84
        local cx, cy = x + s * 0.92, y + s * 0.16
        stroke(bb, ax, ay, bx, by, t, self.color)
        stroke(bb, bx, by, cx, cy, t, self.color)
    end
end

---------------------------------------------------------------------------
-- The full-screen sign widget
---------------------------------------------------------------------------
local SignWidget = InputContainer:extend{
    status = "GO",
    on_tap = nil,
    on_hold = nil,
}

function SignWidget:init()
    local w, h = Screen:getWidth(), Screen:getHeight()
    self.dimen = Geom:new{ x = 0, y = 0, w = w, h = h }
    self.ges_events = {
        Tap = { GestureRange:new{ ges = "tap", range = self.dimen } },
        Hold = { GestureRange:new{ ges = "hold", range = self.dimen } },
    }
    self:build()
end

function SignWidget:build()
    local w, h = self.dimen.w, self.dimen.h
    local style = STYLES[self.status]
    local mark_size = math.floor(math.min(w * 0.72, h * 0.5))
    -- Text about a quarter of the screen height, capped so it fits the width.
    local text_size = math.floor(math.min(h * 0.17, w * 0.32))

    self[1] = FrameContainer:new{
        background = style.bg,
        bordersize = 0,
        padding = 0,
        CenterContainer:new{
            dimen = Geom:new{ w = w, h = h },
            VerticalGroup:new{
                align = "center",
                Mark:new{ kind = self.status, size = mark_size, color = style.fg },
                VerticalSpan:new{ width = math.floor(h * 0.04) },
                TextWidget:new{
                    text = self.status,
                    face = Font:getFace(BOLD_FACE, text_size),
                    fgcolor = style.fg,
                    bgcolor = style.bg,
                },
            },
        },
    }
end

function SignWidget:setStatus(status)
    if status == self.status then return end
    self.status = status
    if self[1] then self[1]:free() end
    self:build()
    -- "full" = flashing refresh: clears e-ink ghosting so the sign looks crisp.
    UIManager:setDirty(self, "full")
end

function SignWidget:onTap()
    if self.on_tap then self.on_tap() end
    return true
end

function SignWidget:onHold()
    if self.on_hold then self.on_hold() end
    return true
end

---------------------------------------------------------------------------
-- Plugin
---------------------------------------------------------------------------
local DoorSign = WidgetContainer:extend{
    name = "doorsign",
    is_doc_only = false,
}

function DoorSign:init()
    self.cfg = load_config()
    self.ui.menu:registerToMainMenu(self)
end

function DoorSign:addToMainMenu(menu_items)
    menu_items.door_sign = {
        text = _("Door sign"),
        sorting_hint = "tools",
        callback = function() self:start() end,
    }
end

function DoorSign:currentStatus()
    return normalize(G_reader_settings:readSetting("doorsign_status")) or self.cfg.default_status
end

function DoorSign:start()
    if self.sign then return end
    -- Lock to portrait: the device's chin goes at the bottom.
    self.saved_rotation = Screen:getRotationMode()
    if self.saved_rotation ~= Screen.DEVICE_ROTATED_UPRIGHT then
        Screen:setRotationMode(Screen.DEVICE_ROTATED_UPRIGHT)
    end
    self.sign = SignWidget:new{
        status = self:currentStatus(),
        on_tap = function() self:showPicker() end,
        on_hold = function() self:stop() end,
    }
    UIManager:show(self.sign, "full")
    -- Keep the device awake and showing the sign while it is up.
    if UIManager.preventStandby then UIManager:preventStandby() end
    self.poll = function() self:pollOnce() end
    UIManager:scheduleIn(1, self.poll)
end

function DoorSign:stop()
    if not self.sign then return end
    UIManager:unschedule(self.poll)
    if UIManager.allowStandby then UIManager:allowStandby() end
    UIManager:close(self.sign, "full")
    self.sign = nil
    if self.saved_rotation and self.saved_rotation ~= Screen:getRotationMode() then
        Screen:setRotationMode(self.saved_rotation)
    end
end

-- Returns the status if the text was "no"/"go", else nil (and nothing changes).
function DoorSign:apply(text)
    local status = normalize(text)
    if not status then return nil end
    G_reader_settings:saveSetting("doorsign_status", status)
    if self.sign then self.sign:setStatus(status) end
    return status
end

-- Show locally right away, then publish so the phone side stays in sync.
function DoorSign:set(text)
    local status = self:apply(text)
    if not status then return end
    local url = string.format("%s/%s", self.cfg.server, self.cfg.topic)
    NetworkMgr:runWhenOnline(function() http_request(url, "POST", status) end)
end

function DoorSign:showPicker()
    local dialog
    local function pick(text)
        return function()
            UIManager:close(dialog)
            self:set(text)
        end
    end
    dialog = ButtonDialog:new{
        title = _("Set door sign"),
        buttons = {
            { { text = _("No"), callback = pick("NO") } },
            { { text = _("Go"), callback = pick("GO") } },
        },
    }
    UIManager:show(dialog)
end

function DoorSign:pollOnce()
    if not self.sign then return end
    local function fetch()
        -- since=latest returns only the newest message. ntfy.sh keeps messages ~12h;
        -- when it has nothing (or the newest isn't no/go), we keep the last status.
        local url = string.format("%s/%s/raw?poll=1&since=latest", self.cfg.server, self.cfg.topic)
        local body = http_request(url, "GET")
        if body then
            local last
            for line in body:gmatch("[^\r\n]+") do last = line end
            if last then self:apply(last) end
        end
    end
    if NetworkMgr:isOnline() then
        fetch()
    else
        NetworkMgr:runWhenOnline(fetch)
    end
    if self.sign then UIManager:scheduleIn(self.cfg.poll_seconds, self.poll) end
end

function DoorSign:onCloseWidget()
    self:stop()
end

return DoorSign
