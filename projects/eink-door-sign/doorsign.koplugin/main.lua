--[[
Door sign plugin for KOReader.

Shows a full-screen status (e.g. BUSY / OPEN) and polls an ntfy topic for changes.
  * Tap the sign  -> toggle BUSY/OPEN and publish it (so the phone and sign stay in sync).
  * Hold the sign -> exit the sign.
Any message text you publish becomes the sign text, e.g. "In a meeting until 3".
]]

local Blitbuffer = require("ffi/blitbuffer")
local CenterContainer = require("ui/widget/container/centercontainer")
local Device = require("device")
local Font = require("ui/font")
local FrameContainer = require("ui/widget/container/framecontainer")
local Geom = require("ui/geometry")
local GestureRange = require("ui/gesturerange")
local InputContainer = require("ui/widget/container/inputcontainer")
local NetworkMgr = require("ui/network/manager")
local TextBoxWidget = require("ui/widget/textboxwidget")
local UIManager = require("ui/uimanager")
local VerticalGroup = require("ui/widget/verticalgroup")
local VerticalSpan = require("ui/widget/verticalspan")
local WidgetContainer = require("ui/widget/container/widgetcontainer")
local logger = require("logger")
local _ = require("gettext")
local Screen = Device.screen

local function load_config()
    local dir = debug.getinfo(1, "S").source:match("^@(.*/)") or "./"
    local ok, cfg = pcall(dofile, dir .. "config.lua")
    if not ok then
        logger.warn("doorsign: could not read config.lua:", cfg)
        cfg = {}
    end
    cfg.server = (cfg.server or "https://ntfy.sh"):gsub("/+$", "")
    cfg.poll_seconds = tonumber(cfg.poll_seconds) or 60
    cfg.default_status = cfg.default_status or "OPEN"
    cfg.subtitles = cfg.subtitles or {}
    return cfg
end

local function trim(s)
    return (s or ""):gsub("^%s+", ""):gsub("%s+$", "")
end

-- Returns body (string) or nil on failure.
local function http_request(url, method, body)
    local http = require("socket.http")
    local ltn12 = require("ltn12")
    local socket = require("socket")
    local socketutil = require("socketutil")
    local sink = {}
    socketutil:set_timeout(10, 20)
    local req = {
        url = url,
        method = method or "GET",
        sink = ltn12.sink.table(sink),
    }
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
-- The full-screen sign widget
---------------------------------------------------------------------------
local SignWidget = InputContainer:extend{
    status = "OPEN",
    subtitle = nil,
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
    -- Short words get huge text; longer custom messages shrink to fit.
    local len = #self.status
    local size = len <= 6 and 120 or (len <= 14 and 70 or 44)
    local group = VerticalGroup:new{ align = "center" }
    table.insert(group, TextBoxWidget:new{
        text = self.status,
        face = Font:getFace("cfont", size),
        bold = true,
        width = math.floor(w * 0.9),
        alignment = "center",
    })
    if self.subtitle then
        table.insert(group, VerticalSpan:new{ width = Screen:scaleBySize(30) })
        table.insert(group, TextBoxWidget:new{
            text = self.subtitle,
            face = Font:getFace("cfont", 32),
            width = math.floor(w * 0.9),
            alignment = "center",
        })
    end
    self[1] = FrameContainer:new{
        background = Blitbuffer.COLOR_WHITE,
        bordersize = 0,
        padding = 0,
        CenterContainer:new{ dimen = Geom:new{ w = w, h = h }, group },
    }
end

function SignWidget:setStatus(status, subtitle)
    if status == self.status and subtitle == self.subtitle then return end
    self.status, self.subtitle = status, subtitle
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

function DoorSign:subtitleFor(status)
    return self.cfg.subtitles[status:upper()]
end

function DoorSign:currentStatus()
    return G_reader_settings:readSetting("doorsign_status") or self.cfg.default_status
end

function DoorSign:start()
    if self.sign then return end
    local status = self:currentStatus()
    self.sign = SignWidget:new{
        status = status,
        subtitle = self:subtitleFor(status),
        on_tap = function() self:toggle() end,
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
end

function DoorSign:apply(status)
    status = trim(status)
    if status == "" then return end
    G_reader_settings:saveSetting("doorsign_status", status)
    if self.sign then self.sign:setStatus(status, self:subtitleFor(status)) end
end

function DoorSign:pollOnce()
    if not self.sign then return end
    local function fetch()
        -- since=latest returns only the newest message. ntfy.sh keeps messages ~12h;
        -- when it has nothing, we simply keep showing the last status.
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

function DoorSign:toggle()
    local new = self:currentStatus():upper() == "BUSY" and "OPEN" or "BUSY"
    self:apply(new)
    local url = string.format("%s/%s", self.cfg.server, self.cfg.topic)
    NetworkMgr:runWhenOnline(function() http_request(url, "POST", new) end)
end

function DoorSign:onCloseWidget()
    self:stop()
end

return DoorSign
