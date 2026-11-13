--[[
Door sign plugin for KOReader (portrait only).

Statuses: BUSY (red), RECORDING (black + red dot), FREE (green), OUT OF OFFICE (purple),
or any custom text (navy).
Text is white, bold sans, all caps, and sized as large as fits the screen.

  * Change it from your phone by publishing to the ntfy topic in config.lua.
  * Tap the sign  -> menu: Busy / Recording / Free / Out of office / Custom...
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
local InputDialog = require("ui/widget/inputdialog")
local NetworkMgr = require("ui/network/manager")
local TextBoxWidget = require("ui/widget/textboxwidget")
local TextWidget = require("ui/widget/textwidget")
local UIManager = require("ui/uimanager")
local VerticalGroup = require("ui/widget/verticalgroup")
local VerticalSpan = require("ui/widget/verticalspan")
local WidgetContainer = require("ui/widget/container/widgetcontainer")
local logger = require("logger")
local _ = require("gettext")
local Screen = Device.screen

local MAIN = { "BUSY", "RECORDING", "FREE", "OUT OF OFFICE" }
local BOLD_FACE = "tfont" -- KOReader's bold sans (Noto Sans Bold)

local function load_config()
    local dir = debug.getinfo(1, "S").source:match("^@(.*/)") or "./"
    local ok, cfg = pcall(dofile, dir .. "config.lua")
    if not ok then
        logger.warn("doorsign: could not read config.lua:", cfg)
        cfg = {}
    end
    cfg.server = (cfg.server or "https://ntfy.sh"):gsub("/+$", "")
    cfg.poll_seconds = tonumber(cfg.poll_seconds) or 60
    cfg.default_status = cfg.default_status or "FREE"
    cfg.colors = cfg.colors or {}
    cfg.colors.BUSY = cfg.colors.BUSY or { 200, 30, 30 }
    cfg.colors.RECORDING = cfg.colors.RECORDING or { 17, 17, 17 }
    cfg.colors.FREE = cfg.colors.FREE or { 30, 140, 60 }
    cfg.colors["OUT OF OFFICE"] = cfg.colors["OUT OF OFFICE"] or { 100, 50, 140 }
    cfg.colors.CUSTOM = cfg.colors.CUSTOM or { 40, 64, 110 }
    cfg.dot_color = cfg.dot_color or { 224, 36, 36 }
    cfg.aliases = cfg.aliases or {}
    return cfg
end

local function trim(s)
    return (s or ""):gsub("^%s+", ""):gsub("%s+$", "")
end

local function rgb(c)
    return Blitbuffer.ColorRGB32(c[1], c[2], c[3], 0xFF)
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

-- Largest font size (from max down) at which every word of `text` fits within `max_w`.
local function fit_size(text, max_w, max_size, min_size)
    local size = max_size
    while size > min_size do
        local fits = true
        for word in text:gmatch("%S+") do
            local tw = TextWidget:new{ text = word, face = Font:getFace(BOLD_FACE, size) }
            local w = tw:getSize().w
            tw:free()
            if w > max_w then fits = false; break end
        end
        if fits then return size end
        size = size - 4
    end
    return min_size
end

---------------------------------------------------------------------------
-- The full-screen sign widget
---------------------------------------------------------------------------
local SignWidget = InputContainer:extend{
    status = "FREE",  -- already normalized (upper case)
    kind = "FREE",    -- BUSY / RECORDING / FREE / OUT OF OFFICE / CUSTOM
    cfg = nil,
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
    local bg = rgb(self.cfg.colors[self.kind])
    local text_w = math.floor(w * 0.86)
    -- Main words get big type; custom text a bit smaller so it can wrap onto a few lines.
    local max_size = self.kind == "CUSTOM" and 110 or 160
    local size = fit_size(self.status, text_w, max_size, 28)

    local group = VerticalGroup:new{ align = "center" }
    if self.kind == "RECORDING" then
        table.insert(group, TextWidget:new{
            text = "●",
            face = Font:getFace(BOLD_FACE, math.floor(size * 1.3)),
            fgcolor = rgb(self.cfg.dot_color),
            bgcolor = bg,
        })
        table.insert(group, VerticalSpan:new{ width = Screen:scaleBySize(10) })
    end
    table.insert(group, TextBoxWidget:new{
        text = self.status,
        face = Font:getFace(BOLD_FACE, size),
        width = text_w,
        alignment = "center",
        fgcolor = Blitbuffer.COLOR_WHITE,
        bgcolor = bg,
    })
    self[1] = FrameContainer:new{
        background = bg,
        bordersize = 0,
        padding = 0,
        CenterContainer:new{ dimen = Geom:new{ w = w, h = h }, group },
    }
end

function SignWidget:setStatus(status, kind)
    if status == self.status and kind == self.kind then return end
    self.status, self.kind = status, kind
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

-- Upper-cases the text and works out which design to use.
function DoorSign:normalize(text)
    local status = trim(text):upper()
    status = self.cfg.aliases[status] or status
    for _, k in ipairs(MAIN) do
        if status == k then return status, k end
    end
    return status, "CUSTOM"
end

function DoorSign:currentStatus()
    return G_reader_settings:readSetting("doorsign_status") or self.cfg.default_status
end

function DoorSign:start()
    if self.sign then return end
    -- Lock to portrait: the device's chin goes at the bottom.
    self.saved_rotation = Screen:getRotationMode()
    if self.saved_rotation ~= Screen.DEVICE_ROTATED_UPRIGHT then
        Screen:setRotationMode(Screen.DEVICE_ROTATED_UPRIGHT)
    end
    local status, kind = self:normalize(self:currentStatus())
    self.sign = SignWidget:new{
        status = status,
        kind = kind,
        cfg = self.cfg,
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

function DoorSign:apply(text)
    if trim(text) == "" then return end
    local status, kind = self:normalize(text)
    G_reader_settings:saveSetting("doorsign_status", status)
    if self.sign then self.sign:setStatus(status, kind) end
end

-- Show locally right away, then publish so the phone side stays in sync.
function DoorSign:set(text)
    self:apply(text)
    local url = string.format("%s/%s", self.cfg.server, self.cfg.topic)
    local status = self:normalize(text)
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
            { { text = _("Busy"), callback = pick("BUSY") } },
            { { text = _("Recording"), callback = pick("RECORDING") } },
            { { text = _("Free"), callback = pick("FREE") } },
            { { text = _("Out of office"), callback = pick("OUT OF OFFICE") } },
            { { text = _("Custom…"), callback = function()
                UIManager:close(dialog)
                self:showCustomInput()
            end } },
        },
    }
    UIManager:show(dialog)
end

function DoorSign:showCustomInput()
    local input
    input = InputDialog:new{
        title = _("Custom sign text"),
        input_hint = _("e.g. Back at 3:30"),
        buttons = { {
            { text = _("Cancel"), id = "close", callback = function() UIManager:close(input) end },
            { text = _("Set"), is_enter_default = true, callback = function()
                local text = input:getInputText()
                UIManager:close(input)
                self:set(text)
            end },
        } },
    }
    UIManager:show(input)
    input:onShowKeyboard()
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

function DoorSign:onCloseWidget()
    self:stop()
end

return DoorSign
