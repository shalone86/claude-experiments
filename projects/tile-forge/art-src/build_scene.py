"""
Tile Forge: round 4 mockup. The heavenly ledger on a scriptorium desk, as a flat painted 2D illustration.

Round 3 made the forge tags bigger (TAG_SCALE) and laid a light vintage filter on the render.
Round 4 keeps the same scene and pushes the finish much further, all in the compositor:
  broad painterly Kuwahara strokes, cel-shaded brightness bands, a warm umber-to-cream palette,
  bold sepia ink outlines (Freestyle, broad nib), crisp lettering, paper texture and burnt edges.
The close-up camera has almost no depth of field, so it reads like a drawing.

Layout follows the game's play screen (src/tile_forge.js renderPlay), top to bottom:
  upper page  = the HUD written as ledger entries (Terrace, Vigil, Goal, Score, Words, Swaps, Gold)
                and the angel's judgement line
  gutter      = a wooden book weight holding the ledger open, with the five slot candles on it
  lower page  = the line being written (5 slots), the word score panel and its sub line
  desk        = the rack of hand tiles
Tiles carry forged upgrades the way the game draws them: the face material
(tilePrimaryClass) and the soft tags with an arrow nose (glyphHtml).

Everything is a scripted prop. No characters: the angel is a plain gold roundel
standing in for Shalone's own drawing.

Units: 1 Blender unit = 100 CSS px of the play screen. X right, Y up the screen, Z up.

Run headless:
  blender -b -P build_scene.py -- --out ./renders --samples 512 --pct 100
Flags:
  --out DIR       where the .blend and PNGs go (default: next to this script)
  --samples N     Cycles samples (default 128)
  --pct P         resolution percent (default 100)
  --candle I      which slot (0-4) holds the lit candle (default 1)
  --fonts DIR     folder with the game's fonts as .woff (default: ./fonts next to this script)
  --only NAME     render only one camera: screen or candle
  --no-render     only build and save the .blend
  --tag-scale S   forge tag size against the game's (default 1.6)
  --bands N       how many flat brightness bands the cel shading uses (default 7)
  --no-flat       skip the flat 2D finish (plain render, as round 2)
"""
import bpy, bmesh, math, os, sys, random
from mathutils import Vector

# ---------- options ----------
argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
def opt(name, default):
    return argv[argv.index(name) + 1] if name in argv else default
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.abspath(opt("--out", HERE))
SAMPLES = int(opt("--samples", 128))
PCT = int(opt("--pct", 100))
CANDLE = int(opt("--candle", 1))
FONT_DIR = os.path.abspath(opt("--fonts", os.path.join(HERE, "fonts")))
ONLY = opt("--only", "")
RENDER = "--no-render" not in argv
TAG_SCALE = float(opt("--tag-scale", 1.6))   # round 3: forge tags this much bigger than the game's 15 px
FLAT = "--no-flat" not in argv
BANDS = float(opt("--bands", 7))   # cel-shading steps of brightness
EXPOSURE = 1.4
os.makedirs(OUT, exist_ok=True)
random.seed(7)

# ---------- palette (styles.css :root and the tile materials) ----------
def hexc(h, a=1.0):
    h = h.lstrip("#")
    srgb = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    lin = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in srgb]
    return (*lin, a)

IRON, IRON2 = "#2b1b0f", "#5b4128"
LAPIS, CINNABAR, GOLD, GOLD2, GOLD_DEEP = "#1f4fa3", "#b5301c", "#d3a23b", "#f4d886", "#7a5512"
FORGE_COL = {"pts": "#1f4fa3", "mult": "#b5301c", "echo": "#7b3ba8", "gold": "#a8730f", "green": "#2e846c"}

# The game's own fonts (Google Fonts, SIL Open Font License), with system fallbacks.
SYS = "/usr/share/fonts/truetype"
FONTS = {
    "cinzel": ("cinzel-latin-700-normal.woff", f"{SYS}/dejavu/DejaVuSerif-Bold.ttf"),
    "cinzel_black": ("cinzel-latin-900-normal.woff", f"{SYS}/dejavu/DejaVuSerif-Bold.ttf"),
    "garamond": ("eb-garamond-latin-600-normal.woff", f"{SYS}/liberation/LiberationSerif-Regular.ttf"),
    "garamond_bold": ("eb-garamond-latin-800-normal.woff", f"{SYS}/liberation/LiberationSerif-Bold.ttf"),
    "garamond_italic": ("eb-garamond-latin-600-italic.woff", f"{SYS}/liberation/LiberationSerif-Italic.ttf"),
    "fraktur": ("unifrakturmaguntia-latin-400-normal.woff", f"{SYS}/liberation/LiberationSerif-Bold.ttf"),
    "sans_bold": (None, f"{SYS}/dejavu/DejaVuSans-Bold.ttf"),       # the tags use system-ui bold
    "symbol": (None, f"{SYS}/freefont/FreeSerif.ttf"),               # has the clone glyph
}

# ---------- clean scene ----------
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
col = scene.collection

def set_input(node, names, value):
    for n in names if isinstance(names, (list, tuple)) else [names]:
        if n in node.inputs:
            node.inputs[n].default_value = value
            return

def new_mat(name):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    return m, m.node_tree, m.node_tree.nodes["Principled BSDF"]

# ---------- materials ----------
MATS = {}
def mat_basic(name, color, rough=0.6, metal=0.0, sss=0.0, emit=None, emit_strength=0.0, coat=0.0):
    if name in MATS:
        return MATS[name]
    m, nt, p = new_mat(name)
    set_input(p, "Base Color", hexc(color) if isinstance(color, str) else color)
    set_input(p, "Roughness", rough)
    set_input(p, "Metallic", metal)
    if sss:
        set_input(p, ["Subsurface Weight", "Subsurface"], sss)
        set_input(p, "Subsurface Radius", (1.0, 0.5, 0.25))
        set_input(p, "Subsurface Scale", 0.06)
    if coat:
        set_input(p, ["Coat Weight", "Clearcoat"], coat)
        set_input(p, ["Coat Roughness", "Clearcoat Roughness"], 0.08)
    if emit:
        set_input(p, ["Emission Color", "Emission"], hexc(emit) if isinstance(emit, str) else emit)
        set_input(p, "Emission Strength", emit_strength)
    MATS[name] = m
    return m

def ramp_node(nt, stops):
    r = nt.nodes.new("ShaderNodeValToRGB")
    els = r.color_ramp.elements
    while len(els) < len(stops):
        els.new(0.5)
    for el, (pos, c) in zip(els, stops):
        el.position = pos
        el.color = hexc(c) if isinstance(c, str) else c
    return r

def mix_rgb(nt, a, b, fac, blend="MIX"):
    m = nt.nodes.new("ShaderNodeMix"); m.data_type = "RGBA"; m.blend_type = blend
    if isinstance(fac, float):
        m.inputs["Factor"].default_value = fac
    else:
        nt.links.new(fac, m.inputs["Factor"])
    for sock, v in ((6, a), (7, b)):
        if isinstance(v, tuple):
            m.inputs[sock].default_value = v
        else:
            nt.links.new(v, m.inputs[sock])
    return m.outputs[2]

def mat_desk():
    """Old dark oak: planks up the screen, grain, grime in the corners, worn pale where hands rest."""
    m, nt, p = new_mat("Desk oak (worn)")
    L = nt.links
    tc = nt.nodes.new("ShaderNodeTexCoord")
    grain = nt.nodes.new("ShaderNodeTexNoise")
    grain.inputs["Scale"].default_value = 5.0
    grain.inputs["Detail"].default_value = 10.0
    grain.inputs["Roughness"].default_value = 0.62
    grain.inputs["Distortion"].default_value = 0.4
    seams = nt.nodes.new("ShaderNodeTexWave")
    seams.wave_type = "BANDS"; seams.bands_direction = "X"; seams.wave_profile = "SAW"
    seams.inputs["Scale"].default_value = 0.42   # planks about 0.75 units wide
    seam_r = ramp_node(nt, [(0.0, (0, 0, 0, 1)), (0.025, (1, 1, 1, 1))])
    wood = ramp_node(nt, [(0.3, "#2a190d"), (0.5, "#4b2f1a"), (0.7, "#6e4828")])
    grime_n = nt.nodes.new("ShaderNodeTexNoise"); grime_n.inputs["Scale"].default_value = 0.35
    grime_n.inputs["Detail"].default_value = 6
    grime_r = ramp_node(nt, [(0.42, (1, 1, 1, 1)), (0.62, hexc("#5a4636"))])
    scratch = nt.nodes.new("ShaderNodeTexNoise"); scratch.inputs["Scale"].default_value = 60
    scratch.inputs["Detail"].default_value = 2
    smap = nt.nodes.new("ShaderNodeMapping"); smap.inputs["Scale"].default_value = (0.08, 1.0, 1.0)
    scratch_r = ramp_node(nt, [(0.62, (0, 0, 0, 1)), (0.7, (1, 1, 1, 1))])
    gmap = nt.nodes.new("ShaderNodeMapping"); gmap.inputs["Scale"].default_value = (1.0, 0.06, 1.0)
    L.new(tc.outputs["Object"], gmap.inputs["Vector"])
    L.new(gmap.outputs["Vector"], grain.inputs["Vector"])
    L.new(tc.outputs["Object"], seams.inputs["Vector"])
    L.new(tc.outputs["Object"], grime_n.inputs["Vector"])
    L.new(tc.outputs["Object"], smap.inputs["Vector"])
    L.new(smap.outputs["Vector"], scratch.inputs["Vector"])
    L.new(grain.outputs["Fac"], wood.inputs["Fac"])
    L.new(seams.outputs["Fac"], seam_r.inputs["Fac"])
    L.new(grime_n.outputs["Fac"], grime_r.inputs["Fac"])
    L.new(scratch.outputs["Fac"], scratch_r.inputs["Fac"])
    c = mix_rgb(nt, wood.outputs["Color"], seam_r.outputs["Color"], 1.0, "MULTIPLY")
    c = mix_rgb(nt, c, grime_r.outputs["Color"], 1.0, "MULTIPLY")
    c = mix_rgb(nt, c, hexc("#8a6a4a"), scratch_r.outputs["Color"], "MIX")
    L.new(c, p.inputs["Base Color"])
    rough = ramp_node(nt, [(0.0, (0.38, 0.38, 0.38, 1)), (1.0, (0.7, 0.7, 0.7, 1))])
    L.new(grime_n.outputs["Fac"], rough.inputs["Fac"])
    L.new(rough.outputs["Color"], p.inputs["Roughness"])
    bump = nt.nodes.new("ShaderNodeBump"); bump.inputs["Strength"].default_value = 0.25
    hmix = mix_rgb(nt, wood.outputs["Color"], seam_r.outputs["Color"], 1.0, "MULTIPLY")
    L.new(hmix, bump.inputs["Height"])
    L.new(bump.outputs["Normal"], p.inputs["Normal"])
    return m

def mat_stone():
    """Ashlar wall: big sandstone blocks, darker mortar, rough faces."""
    m, nt, p = new_mat("Stone wall")
    L = nt.links
    tc = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    comb = nt.nodes.new("ShaderNodeCombineXYZ")
    L.new(tc.outputs["Object"], sep.inputs[0])
    L.new(sep.outputs["X"], comb.inputs["X"]); L.new(sep.outputs["Z"], comb.inputs["Y"])
    brick = nt.nodes.new("ShaderNodeTexBrick")
    brick.offset = 0.5; brick.squash = 1.0
    brick.inputs["Scale"].default_value = 0.55
    brick.inputs["Mortar Size"].default_value = 0.03
    brick.inputs["Mortar Smooth"].default_value = 0.3
    brick.inputs["Brick Width"].default_value = 1.5
    brick.inputs["Row Height"].default_value = 0.7
    brick.inputs["Color1"].default_value = hexc("#6e5a44")
    brick.inputs["Color2"].default_value = hexc("#56463a")
    brick.inputs["Mortar"].default_value = hexc("#2a211a")
    L.new(comb.outputs[0], brick.inputs["Vector"])
    nz = nt.nodes.new("ShaderNodeTexNoise"); nz.inputs["Scale"].default_value = 3.0; nz.inputs["Detail"].default_value = 8
    L.new(comb.outputs[0], nz.inputs["Vector"])
    tint = ramp_node(nt, [(0.3, "#7a6650"), (0.7, "#4a3c30")])
    L.new(nz.outputs["Fac"], tint.inputs["Fac"])
    c = mix_rgb(nt, brick.outputs["Color"], tint.outputs["Color"], 0.5, "MULTIPLY")
    c = mix_rgb(nt, c, (1.6, 1.6, 1.6, 1.0), 1.0, "MULTIPLY")
    L.new(c, p.inputs["Base Color"])
    set_input(p, "Roughness", 0.92)
    bump = nt.nodes.new("ShaderNodeBump"); bump.inputs["Strength"].default_value = 0.6
    bump.inputs["Distance"].default_value = 0.2
    h = nt.nodes.new("ShaderNodeMath"); h.operation = "ADD"
    L.new(brick.outputs["Fac"], h.inputs[0])
    nz2 = nt.nodes.new("ShaderNodeMath"); nz2.operation = "MULTIPLY"; nz2.inputs[1].default_value = 0.35
    L.new(nz.outputs["Fac"], nz2.inputs[0])
    inv = nt.nodes.new("ShaderNodeMath"); inv.operation = "SUBTRACT"; inv.inputs[0].default_value = 1.0
    L.new(brick.outputs["Fac"], inv.inputs[1])
    h2 = nt.nodes.new("ShaderNodeMath"); h2.operation = "ADD"
    L.new(inv.outputs[0], h2.inputs[0]); L.new(nz2.outputs[0], h2.inputs[1])
    L.new(h2.outputs[0], bump.inputs["Height"])
    L.new(bump.outputs["Normal"], p.inputs["Normal"])
    return m

def mat_parchment():
    """Aged vellum: blotchy cream, darker toward the page edges, faint drypoint ruling."""
    m, nt, p = new_mat("Ledger vellum")
    L = nt.links
    tc = nt.nodes.new("ShaderNodeTexCoord")
    base_n = nt.nodes.new("ShaderNodeTexNoise"); base_n.inputs["Scale"].default_value = 1.6; base_n.inputs["Detail"].default_value = 6
    base = ramp_node(nt, [(0.35, "#f3e5c3"), (0.7, "#e4cf9f")])
    L.new(tc.outputs["Object"], base_n.inputs["Vector"]); L.new(base_n.outputs["Fac"], base.inputs["Fac"])
    fox = nt.nodes.new("ShaderNodeTexNoise"); fox.inputs["Scale"].default_value = 14; fox.inputs["Detail"].default_value = 3
    fox_r = ramp_node(nt, [(0.66, (1, 1, 1, 1)), (0.74, hexc("#c9a46e"))])
    L.new(tc.outputs["Object"], fox.inputs["Vector"]); L.new(fox.outputs["Fac"], fox_r.inputs["Fac"])
    lines = nt.nodes.new("ShaderNodeTexWave")
    lines.wave_type = "BANDS"; lines.bands_direction = "Y"; lines.wave_profile = "SAW"
    lines.inputs["Scale"].default_value = 0.314 / 0.24
    lr = ramp_node(nt, [(0.0, hexc("#d7bf90")), (0.04, (1, 1, 1, 1))])
    L.new(tc.outputs["Object"], lines.inputs["Vector"]); L.new(lines.outputs["Fac"], lr.inputs["Fac"])
    # edge darkening from Generated coords: max(|gx-.5|, |gy-.5|) * 2
    sep = nt.nodes.new("ShaderNodeSeparateXYZ"); L.new(tc.outputs["Generated"], sep.inputs[0])
    def absdev(sock):
        a = nt.nodes.new("ShaderNodeMath"); a.operation = "SUBTRACT"; a.inputs[1].default_value = 0.5
        L.new(sock, a.inputs[0])
        b = nt.nodes.new("ShaderNodeMath"); b.operation = "ABSOLUTE"; L.new(a.outputs[0], b.inputs[0])
        return b.outputs[0]
    mx = nt.nodes.new("ShaderNodeMath"); mx.operation = "MAXIMUM"
    L.new(absdev(sep.outputs["X"]), mx.inputs[0]); L.new(absdev(sep.outputs["Y"]), mx.inputs[1])
    edge = ramp_node(nt, [(0.38, (1, 1, 1, 1)), (0.5, hexc("#b98f55"))])
    L.new(mx.outputs[0], edge.inputs["Fac"])
    c = mix_rgb(nt, base.outputs["Color"], fox_r.outputs["Color"], 0.55, "MULTIPLY")
    c = mix_rgb(nt, c, lr.outputs["Color"], 0.5, "MULTIPLY")
    c = mix_rgb(nt, c, edge.outputs["Color"], 0.9, "MULTIPLY")
    L.new(c, p.inputs["Base Color"])
    set_input(p, "Roughness", 0.78)
    set_input(p, ["Subsurface Weight", "Subsurface"], 0.06)
    set_input(p, "Subsurface Radius", (1.0, 0.7, 0.4)); set_input(p, "Subsurface Scale", 0.03)
    bump = nt.nodes.new("ShaderNodeBump"); bump.inputs["Strength"].default_value = 0.06
    L.new(base_n.outputs["Fac"], bump.inputs["Height"]); L.new(bump.outputs["Normal"], p.inputs["Normal"])
    return m

def mat_page_edge():
    """The side of the page block: thin stacked leaves."""
    m, nt, p = new_mat("Page edges")
    L = nt.links
    tc = nt.nodes.new("ShaderNodeTexCoord")
    w = nt.nodes.new("ShaderNodeTexWave"); w.wave_type = "BANDS"; w.bands_direction = "Z"
    w.inputs["Scale"].default_value = 30; w.inputs["Distortion"].default_value = 1.5
    r = ramp_node(nt, [(0.0, "#a98e64"), (1.0, "#e9d8b2")])
    L.new(tc.outputs["Object"], w.inputs["Vector"]); L.new(w.outputs["Fac"], r.inputs["Fac"])
    L.new(r.outputs["Color"], p.inputs["Base Color"])
    set_input(p, "Roughness", 0.85)
    return m

def mat_leather(name, dark, light, scale=30):
    m, nt, p = new_mat(name)
    L = nt.links
    noise = nt.nodes.new("ShaderNodeTexNoise"); noise.inputs["Scale"].default_value = scale; noise.inputs["Detail"].default_value = 6
    wear = nt.nodes.new("ShaderNodeTexNoise"); wear.inputs["Scale"].default_value = 2.5
    ramp = ramp_node(nt, [(0.3, dark), (0.75, light)])
    L.new(noise.outputs["Fac"], ramp.inputs["Fac"])
    wr = ramp_node(nt, [(0.45, (1, 1, 1, 1)), (0.7, (1.45, 1.3, 1.15, 1))])
    L.new(wear.outputs["Fac"], wr.inputs["Fac"])
    c = mix_rgb(nt, ramp.outputs["Color"], wr.outputs["Color"], 1.0, "MULTIPLY")
    L.new(c, p.inputs["Base Color"])
    bump = nt.nodes.new("ShaderNodeBump"); bump.inputs["Strength"].default_value = 0.3
    L.new(noise.outputs["Fac"], bump.inputs["Height"]); L.new(bump.outputs["Normal"], p.inputs["Normal"])
    rr = ramp_node(nt, [(0.0, (0.35, 0.35, 0.35, 1)), (1.0, (0.6, 0.6, 0.6, 1))])
    L.new(wear.outputs["Fac"], rr.inputs["Fac"]); L.new(rr.outputs["Color"], p.inputs["Roughness"])
    return m

def mat_flame(name, inner, outer, strength):
    """Teardrop flame: hot core fading to orange at the edge (Layer Weight)."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.remove(nt.nodes["Principled BSDF"])
    out = nt.nodes["Material Output"]
    lw = nt.nodes.new("ShaderNodeLayerWeight"); lw.inputs["Blend"].default_value = 0.5
    ramp = ramp_node(nt, [(0.0, inner), (1.0, outer)])
    em = nt.nodes.new("ShaderNodeEmission"); em.inputs["Strength"].default_value = strength
    nt.links.new(lw.outputs["Facing"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], em.inputs["Color"])
    nt.links.new(em.outputs[0], out.inputs["Surface"])
    return m

def mat_wax(name, lit):
    """Beeswax. A lit candle glows near its top where the flame shines through the wax."""
    m, nt, p = new_mat(name)
    set_input(p, "Base Color", hexc("#efe0bb"))
    set_input(p, "Roughness", 0.35)
    set_input(p, ["Subsurface Weight", "Subsurface"], 0.35)
    set_input(p, "Subsurface Radius", (1.0, 0.55, 0.25))
    set_input(p, "Subsurface Scale", 0.05)
    if lit:
        L = nt.links
        tc = nt.nodes.new("ShaderNodeTexCoord")
        sep = nt.nodes.new("ShaderNodeSeparateXYZ"); L.new(tc.outputs["Generated"], sep.inputs[0])
        r = ramp_node(nt, [(0.7, (0, 0, 0, 1)), (1.0, (1.0, 0.5, 0.16, 1))])
        L.new(sep.outputs["Z"], r.inputs["Fac"])
        L.new(r.outputs["Color"], p.inputs["Emission Color"] if "Emission Color" in p.inputs else p.inputs["Emission"])
        set_input(p, "Emission Strength", 2.2)
    return m

def mat_gradient(name, stops, angle_deg, rough=0.2, coat=0.5, emit=0.0, metal=0.0):
    """A tile face like the CSS linear-gradient(angle, ...): angle 0 = to top, 90 = to right."""
    m, nt, p = new_mat(name)
    L = nt.links
    tc = nt.nodes.new("ShaderNodeTexCoord")
    a = math.radians(angle_deg)
    dx, dy = math.sin(a), -math.cos(a)   # CSS direction, with Y flipped to point up
    k = 1.0 / (abs(dx) + abs(dy))
    sep = nt.nodes.new("ShaderNodeSeparateXYZ"); L.new(tc.outputs["Generated"], sep.inputs[0])
    def lin(sock, mul):
        s = nt.nodes.new("ShaderNodeMath"); s.operation = "SUBTRACT"; s.inputs[1].default_value = 0.5
        L.new(sock, s.inputs[0])
        t = nt.nodes.new("ShaderNodeMath"); t.operation = "MULTIPLY"; t.inputs[1].default_value = mul
        L.new(s.outputs[0], t.inputs[0])
        return t.outputs[0]
    add = nt.nodes.new("ShaderNodeMath"); add.operation = "ADD"
    L.new(lin(sep.outputs["X"], dx * k), add.inputs[0]); L.new(lin(sep.outputs["Y"], dy * k), add.inputs[1])
    off = nt.nodes.new("ShaderNodeMath"); off.operation = "ADD"; off.inputs[1].default_value = 0.5
    L.new(add.outputs[0], off.inputs[0])
    r = ramp_node(nt, stops)
    L.new(off.outputs[0], r.inputs["Fac"])
    L.new(r.outputs["Color"], p.inputs["Base Color"])
    set_input(p, "Roughness", rough)
    set_input(p, "Metallic", metal)
    set_input(p, ["Coat Weight", "Clearcoat"], coat)
    set_input(p, ["Coat Roughness", "Clearcoat Roughness"], 0.06)
    if emit:
        L.new(r.outputs["Color"], p.inputs["Emission Color"] if "Emission Color" in p.inputs else p.inputs["Emission"])
        set_input(p, "Emission Strength", emit)
    return m

M = {
    "desk": mat_desk(),
    "stone": mat_stone(),
    "vellum": mat_parchment(),
    "page_edge": mat_page_edge(),
    "cover": mat_leather("Ledger cover leather", "#2a0f08", "#5a2414"),
    "book_green": mat_leather("Old book green", "#0f1a12", "#2c3b25"),
    "book_brown": mat_leather("Old book brown", "#1e1208", "#4a2f19"),
    "book_red": mat_leather("Old book oxblood", "#240a08", "#55201a"),
    "gold": mat_basic("Gold leaf", "#dcae48", rough=0.38, metal=0.55),
    "gold_ink": mat_basic("Gold ink", "#8a5e10", rough=0.4, metal=0.3),
    "brass": mat_basic("Brass", "#b8893a", rough=0.32, metal=1.0),
    "iron": mat_basic("Black iron", "#1c1714", rough=0.55, metal=0.75),
    "oak_dark": mat_basic("Dark oak", "#2e1d10", rough=0.5),
    "turned_wood": mat_basic("Turned wood", "#3d2614", rough=0.42, coat=0.2),
    "ink": mat_basic("Iron gall ink", IRON, rough=0.5),
    "ink_soft": mat_basic("Ink faded", IRON2, rough=0.6),
    "rubric": mat_basic("Red ink", "#a3301c", rough=0.5),
    "lapis": mat_basic("Lapis paint", LAPIS, rough=0.65),
    "white": mat_basic("Lead white", "#fff4e0", rough=0.5),
    "ribbon": mat_basic("Ribbon silk", "#7d1410", rough=0.35, sss=0.1),
    "ink_pool": mat_basic("Ink in the well", "#050302", rough=0.05, coat=0.0),
    "glaze": mat_basic("Glazed clay", "#3a2a16", rough=0.22, coat=0.6),
    "quill": mat_basic("Quill feather", "#e9e1d2", rough=0.6, sss=0.25),
    "quill_shaft": mat_basic("Quill shaft", "#d9cbb0", rough=0.3, sss=0.2),
    "wick": mat_basic("Wick", "#140b06", rough=0.9),
    "ember": mat_basic("Ember", "#ff6a1a", rough=0.6, emit="#ff5a10", emit_strength=12.0),
    "wax": mat_wax("Beeswax", lit=False),
    "wax_lit": mat_wax("Beeswax lit", lit=True),
    "flame": mat_flame("Flame", "#fffbe0", "#ff8d22", 30.0),
    "flame_small": mat_flame("Flame small", "#fff2c8", "#ff7a1a", 22.0),
    "tag_flame": mat_basic("Tag flame", "#ffd34d", rough=0.4, emit="#ffd34d", emit_strength=1.2),
    # tile faces (tilePrimaryClass), body edge = the CSS border colour
    "face_plain": mat_gradient("Tile face plain", [(0.0, "#fcf3dc"), (0.55, "#eddcb4"), (1.0, "#d8bf8e")], 160, rough=0.35, coat=0.2),
    "face_ruby": mat_gradient("Tile face ruby", [(0.0, "#ffdcd4"), (0.55, "#ea6f52"), (1.0, "#b5301c")], 160),
    "face_sapphire": mat_gradient("Tile face sapphire", [(0.0, "#dbe9ff"), (0.55, "#5b8de0"), (1.0, "#1f4fa3")], 160),
    "face_catalyst": mat_gradient("Tile face catalyst", [(0.0, "#d7faec"), (0.55, "#52b89b"), (1.0, "#246b56")], 160),
    "face_prism": mat_gradient("Tile face prism", [(0.0, "#f9d8ff"), (0.35, "#c17be8"), (0.7, "#6294ea"), (1.0, "#f4d886")], 135, emit=0.25),
    "face_lantern": mat_gradient("Tile face lantern", [(0.0, "#fffbe6"), (0.55, "#ffd970"), (1.0, "#d9941e")], 160, emit=0.3),
    "face_gilded": mat_gradient("Tile face gilded", [(0.0, "#fff5c0"), (0.6, "#eec259"), (1.0, "#c89122")], 160, rough=0.28, coat=0.1, metal=0.75),
}
EDGE = {"plain": "#a88a5c", "ruby": "#6e1a0e", "sapphire": "#13306a", "catalyst": "#154033",
        "prism": "#4f1875", "lantern": "#8a5a0c", "gilded": "#7a5512"}
LTR = {"plain": IRON, "ruby": "#fff8f0", "sapphire": "#ffffff", "catalyst": "#ffffff",
       "prism": "#1b0a2b", "lantern": "#3d2202", "gilded": IRON}
VAL = {"plain": "#5c411f", "gilded": "#5c411f"}
for k, v in EDGE.items():
    M["edge_" + k] = mat_basic(f"Tile edge {k}", v, rough=0.45)
for k, v in LTR.items():
    M["ltr_" + k] = mat_basic(f"Tile letter {k}", v, rough=0.5)
for k, v in FORGE_COL.items():
    M["tag_" + k] = mat_basic(f"Tag enamel {k}", v, rough=0.25, coat=0.6)

# ---------- helpers ----------
PX = 0.01

def link(ob):
    col.objects.link(ob)
    return ob

def mesh_object(name, bm, mats):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me); bm.free()
    for m in mats:
        me.materials.append(m)
    ob = link(bpy.data.objects.new(name, me))
    return ob

def smooth(ob):
    for poly in ob.data.polygons:
        poly.use_smooth = True
    return ob

def box(name, cx, cy, w, h, z0, depth, mat, bevel=0.0, segs=3):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co.x *= w; v.co.y *= h; v.co.z *= depth
    ob = mesh_object(name, bm, [mat] if mat else [])
    ob.location = (cx, cy, z0 + depth / 2)
    if bevel > 0:
        md = ob.modifiers.new("Bevel", "BEVEL")
        md.width = min(bevel, w / 2.1, h / 2.1, depth / 2.1)
        md.segments = segs
        md.limit_method = "ANGLE"
    return smooth(ob)

def lathe(name, prof, mat, loc=(0, 0, 0), segs=48, smooth_it=True):
    """Spin a (radius, z) profile around Z."""
    bm = bmesh.new()
    vs = [bm.verts.new((r, 0, z)) for r, z in prof]
    es = [bm.edges.new((vs[i], vs[i + 1])) for i in range(len(vs) - 1)]
    bmesh.ops.spin(bm, geom=vs + es, cent=(0, 0, 0), axis=(0, 0, 1), angle=2 * math.pi, steps=segs)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    ob = mesh_object(name, bm, [mat])
    ob.location = loc
    return smooth(ob) if smooth_it else ob

def sphere(name, loc, scale, mat, segs=24, rings=12):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=segs, v_segments=rings, radius=1.0)
    ob = mesh_object(name, bm, [mat])
    ob.location = loc
    ob.scale = scale
    return smooth(ob)

_fonts = {}
def font(key):
    if key not in _fonts:
        woff, fallback = FONTS[key]
        path = os.path.join(FONT_DIR, woff) if woff else None
        _fonts[key] = bpy.data.fonts.load(path if path and os.path.exists(path) else fallback)
    return _fonts[key]

def text(name, body, x, y, z, size, mat, fkey="cinzel", align="CENTER", extrude=0.0, rot=(0, 0, 0), spacing=1.0):
    cu = bpy.data.curves.new(name, "FONT")
    cu.body = body
    cu.font = font(fkey)
    cu.size = size
    cu.align_x = align
    cu.align_y = "CENTER"
    cu.extrude = extrude
    cu.space_character = spacing
    ob = link(bpy.data.objects.new(name, cu))
    ob.location = (x, y, z)
    ob.rotation_euler = rot
    ob.data.materials.append(mat)
    return ob

def empty(name, loc, rot=(0, 0, 0)):
    e = link(bpy.data.objects.new(name, None))
    e.location = loc
    e.rotation_euler = rot
    return e

def parent_keep(child, parent):
    """Parent with the child's location given in the parent's local space."""
    child.parent = parent

# ======================================================================
# The ledger: top-bound, opened flat. Gutter runs left-right at y = YG.
# ======================================================================
YG = 0.0
PW = 8.9                 # page width
L_UP, L_LO = 2.45, 2.65  # page depth from the gutter, upper and lower
COVER_T = 0.06
PB = COVER_T + 0.04      # page surface height at the gutter

def zp(d):
    """Height of the page surface at distance d from the gutter (the leaves bow up, then flatten)."""
    return PB + 0.30 * (1 - math.exp(-d / 0.15)) - 0.02 * d

def zslope(d):
    return 0.30 / 0.15 * math.exp(-d / 0.15) - 0.02

def at(s, d, lift=0.003):
    """(y, z, tilt about X) of a point on page s (+1 upper, -1 lower) at depth d."""
    return YG + s * d, zp(d) + lift, s * math.atan(zslope(d))

def page_block(name, s, L):
    """A half of the open ledger: curved top leaf over a stack of page edges."""
    xs = [-PW / 2 + PW * i / 24 for i in range(25)]
    ds = [L * (j / 40) ** 1.6 for j in range(41)]
    bm = bmesh.new()
    top = [[bm.verts.new((x, YG + s * d, zp(d) + 0.0012 * math.sin(x * 1.3 + d * 2))) for x in xs] for d in ds]
    bot = [[bm.verts.new((x, YG + s * d, COVER_T)) for x in xs] for d in ds]
    nj, ni = len(ds), len(xs)
    def face(vs, mi):
        f = bm.faces.new(vs if s > 0 else vs[::-1])
        f.material_index = mi
    for j in range(nj - 1):
        for i in range(ni - 1):
            face([top[j][i], top[j][i + 1], top[j + 1][i + 1], top[j + 1][i]], 0)
            face([bot[j][i], bot[j + 1][i], bot[j + 1][i + 1], bot[j][i + 1]], 1)
    for j in range(nj - 1):  # left and right edges
        face([bot[j][0], top[j][0], top[j + 1][0], bot[j + 1][0]], 1)
        face([bot[j][-1], bot[j + 1][-1], top[j + 1][-1], top[j][-1]], 1)
    for i in range(ni - 1):  # outer edge and gutter edge
        face([bot[-1][i], top[-1][i], top[-1][i + 1], bot[-1][i + 1]], 1)
        face([bot[0][i], bot[0][i + 1], top[0][i + 1], top[0][i]], 1)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return smooth(mesh_object(name, bm, [M["vellum"], M["page_edge"]]))

class PageMesh:
    """Collects flat ink shapes that hug the curved page, one mesh per material."""
    def __init__(self, name, mat):
        self.name, self.mat, self.bm = name, mat, bmesh.new()
    def quad(self, s, x0, x1, d0, d1, lift=0.0042, nd=None):
        nd = nd or max(1, int(abs(d1 - d0) / 0.05))
        rows = []
        for j in range(nd + 1):
            d = d0 + (d1 - d0) * j / nd
            rows.append([self.bm.verts.new((x, YG + s * d, zp(d) + lift)) for x in (x0, x1)])
        for j in range(nd):
            vs = [rows[j][0], rows[j][1], rows[j + 1][1], rows[j + 1][0]]
            area_up = (vs[1].co - vs[0].co).cross(vs[3].co - vs[0].co).z > 0
            self.bm.faces.new(vs if area_up else vs[::-1])
    def disc(self, s, x, d, r, lift=0.0042, n=24):
        y, z, _ = at(s, d, lift)
        c = self.bm.verts.new((x, y, z))
        ring = [self.bm.verts.new((x + r * math.cos(a), y + r * math.sin(a), z)) for a in
                [2 * math.pi * k / n for k in range(n)]]
        for k in range(n):
            self.bm.faces.new((c, ring[k], ring[(k + 1) % n]))
    def done(self):
        return mesh_object(self.name, self.bm, [self.mat])

def page_text(name, body, s, x, d, size, mat, fkey, align="CENTER", spacing=1.0):
    y, z, tilt = at(s, d, 0.0058)
    return text(name, body, x, y, z, size, mat, fkey, align=align, rot=(tilt, 0, 0), spacing=spacing)

# ---------- desk, wall ----------
DESK_FRONT, DESK_BACK = -5.6, 4.7
box("Desk", 0, (DESK_FRONT + DESK_BACK) / 2, 19, DESK_BACK - DESK_FRONT, -0.4, 0.4, M["desk"], bevel=0.06)
wall = box("Stone wall", 0, DESK_BACK + 0.35, 22, 0.7, -0.4, 8.0, M["stone"])

# ---------- ledger covers and pages ----------
cov_y0, cov_y1 = YG - L_LO - 0.14, YG + L_UP + 0.14
box("Ledger cover", 0, (cov_y0 + cov_y1) / 2, PW + 0.28, cov_y1 - cov_y0, 0, COVER_T, M["cover"], bevel=0.03)
for sx in (-1, 1):
    for sy, yy in ((-1, cov_y0), (1, cov_y1)):
        cx, cy = sx * (PW / 2 + 0.14), yy
        box(f"Brass corner {sx}{sy} a", cx - sx * 0.16, cy - sy * 0.02, 0.36, 0.06, 0, COVER_T + 0.012, M["brass"], bevel=0.01)
        box(f"Brass corner {sx}{sy} b", cx - sx * 0.02, cy - sy * 0.16, 0.06, 0.36, 0, COVER_T + 0.012, M["brass"], bevel=0.01)
page_block("Ledger upper page", 1, L_UP)
page_block("Ledger lower page", -1, L_LO)

ink = PageMesh("Ink lines", M["ink_soft"])
red = PageMesh("Red ink lines", M["rubric"])
goldm = PageMesh("Gold leaf", M["gold"])

# double rubric frame around each page's writing block
for s, L in ((1, L_UP), (-1, L_LO)):
    for inset in (0.26, 0.31):
        x0, x1 = -PW / 2 + inset, PW / 2 - inset
        if s > 0:  # leave room for the running head
            red.quad(s, x0, -1.05, L - inset - 0.008, L - inset + 0.008)
            red.quad(s, 1.05, x1, L - inset - 0.008, L - inset + 0.008)
        else:
            red.quad(s, x0, x1, L - inset - 0.008, L - inset + 0.008)
        red.quad(s, x0 - 0.008, x0 + 0.008, 0.42, L - inset)
        red.quad(s, x1 - 0.008, x1 + 0.008, 0.42, L - inset)

# ---------- upper page: the account (the HUD as ledger entries) ----------
U = 1
page_text("Running head", "Tile Forge", U, 0, 2.17, 0.22, M["gold"], "fraktur")
# left column: Terrace, pips, Vigil, Goal
lx = -3.85
page_text("Terrace label", "TERRACE I", U, lx, 1.9, 0.14, M["rubric"], "cinzel", align="LEFT", spacing=1.1)
for i in range(3):
    if i == 0:
        goldm.disc(U, lx + 1.3 + i * 0.2, 1.9, 0.06)
    else:
        ink.disc(U, lx + 1.3 + i * 0.2, 1.9, 0.06)
page_text("Vigil name", "Vigil I", U, lx, 1.6, 0.36, M["ink"], "garamond_bold", align="LEFT")
page_text("Goal", "Goal: 300", U, lx, 1.32, 0.21, M["ink_soft"], "garamond_italic", align="LEFT")
# centre: the running score
page_text("Score label", "SCORE", U, 0, 1.92, 0.14, M["rubric"], "cinzel", spacing=1.15)
page_text("Score", "0", U, 0, 1.6, 0.46, M["ink"], "garamond_bold")
for x0, x1, d0, d1 in ((-1.0, 1.0, 1.3, 1.312), (-1.0, 1.0, 1.388, 1.4), (-1.0, -0.988, 1.3, 1.4), (0.988, 1.0, 1.3, 1.4)):
    ink.quad(U, x0, x1, d0, d1)
# right column: Words, Swaps, Gold
for i, (lbl, val) in enumerate((("WORDS", "4"), ("SWAPS", "3"), ("GOLD", "$4"))):
    x = 2.2 + i * 0.85
    page_text(f"{lbl} label", lbl, U, x, 1.9, 0.12, M["rubric"], "cinzel")
    page_text(f"{lbl} value", val, U, x, 1.58, 0.36, M["gold"] if lbl == "GOLD" else M["ink"], "garamond_bold")
red.quad(U, -3.9, 3.9, 1.16, 1.172)
# the angel's judgement line (the angel is Shalone's drawing; a gold roundel stands in)
ay = 0.92
goldm.disc(U, -2.92, ay, 0.2)
red.disc(U, -2.92, ay, 0.225, lift=0.0036)
page_text("Judgement word", "FORGE", U, -2.55, ay, 0.25, M["ink"], "cinzel_black", align="LEFT", spacing=1.08)
page_text("Judgement def", "to shape metal by heating and hammering", U, -1.1, ay, 0.22, M["ink_soft"],
          "garamond_italic", align="LEFT")

# ---------- lower page: the line being written ----------
D = -1
SLOT_X = [(-188 + i * 94) * PX for i in range(5)]
CELL = 0.86
CELL_D = 0.95          # depth of the slot centres below the gutter
level = [3 if i == CANDLE else 2 if abs(i - CANDLE) == 1 else 1 for i in range(5)]
for i, x in enumerate(SLOT_X):
    d0, d1 = CELL_D - CELL / 2, CELL_D + CELL / 2
    n = 7
    for k in range(n):   # dashed ink box (.vcell 2px dashed)
        a0 = -CELL / 2 + CELL / n * (k + 0.22)
        a1 = -CELL / 2 + CELL / n * (k + 0.78)
        ink.quad(D, x + a0, x + a1, d0 - 0.008, d0 + 0.008)
        ink.quad(D, x + a0, x + a1, d1 - 0.008, d1 + 0.008)
        ink.quad(D, x - CELL / 2 - 0.008, x - CELL / 2 + 0.008, CELL_D + a0, CELL_D + a1)
        ink.quad(D, x + CELL / 2 - 0.008, x + CELL / 2 + 0.008, CELL_D + a0, CELL_D + a1)
    if level[i] > 1:
        # round 3: nudged right so the bigger forge tags don't cover it
        page_text(f"Slot {i} light", f"×{level[i]}", D, x + 0.3, 0.36, 0.17,
                  M["gold_ink"] if level[i] == 3 else M["rubric"], "cinzel_black")
for sgn, glyph in ((-1, "‹"), (1, "›")):
    page_text(f"Shift {glyph}", glyph, D, sgn * 2.58, CELL_D, 0.42, M["rubric"], "garamond_bold")

# the word score: an illuminated lapis panel with a gold border (the game's blue play box)
WS_D = 1.8
ws_w, ws_h = 2.5, 0.6
lap = PageMesh("Word score panel", M["lapis"])
lap.quad(D, -ws_w / 2, ws_w / 2, WS_D - ws_h / 2, WS_D + ws_h / 2, lift=0.0048)
lap.done()
for x0, x1, d0, d1 in ((-ws_w / 2, ws_w / 2, WS_D - ws_h / 2 - 0.02, WS_D - ws_h / 2 + 0.02),
                       (-ws_w / 2, ws_w / 2, WS_D + ws_h / 2 - 0.02, WS_D + ws_h / 2 + 0.02),
                       (-ws_w / 2 - 0.02, -ws_w / 2 + 0.02, WS_D - ws_h / 2, WS_D + ws_h / 2),
                       (ws_w / 2 - 0.02, ws_w / 2 + 0.02, WS_D - ws_h / 2, WS_D + ws_h / 2)):
    goldm.quad(D, x0, x1, d0, d1, lift=0.0054)
page_text("Word score label", "TAP TO PLAY WORD", D, 0, WS_D - 0.15, 0.085, M["gold"], "cinzel", spacing=1.1)
page_text("Word score", "264", D, 0, WS_D + 0.06, 0.28, M["white"], "garamond_bold")
page_text("Word score sub", "Pentad  ·  36 left to goal", D, 0, 2.23, 0.15, M["ink_soft"], "garamond_italic")
ink.done(); red.done(); goldm.done()

# red silk ribbon from the gutter, over the lower page, down onto the desk
def ribbon(name, pts, width, mat):
    bm = bmesh.new()
    rows = []
    for i, p in enumerate(pts):
        p = Vector(p)
        t = (Vector(pts[min(i + 1, len(pts) - 1)]) - Vector(pts[max(i - 1, 0)])).normalized()
        side = t.cross(Vector((0, 0, 1)))
        if side.length < 1e-4:
            side = Vector((1, 0, 0))
        side = side.normalized() * (width / 2)
        rows.append((bm.verts.new(p - side), bm.verts.new(p + side)))
    for i in range(len(rows) - 1):
        bm.faces.new((rows[i][0], rows[i][1], rows[i + 1][1], rows[i + 1][0]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    ob = mesh_object(name, bm, [mat])
    md = ob.modifiers.new("Thickness", "SOLIDIFY"); md.thickness = 0.008
    return smooth(ob)

rx = 3.55
rpts = [(rx + 0.02 * d, YG - d, zp(d) + 0.006) for d in [0.02 + 0.05 * k for k in range(52)] if d <= L_LO]
edge_y = YG - L_LO
rpts += [(rx + 0.06, edge_y - 0.04, zp(L_LO) - 0.02), (rx + 0.08, edge_y - 0.09, 0.2), (rx + 0.1, edge_y - 0.14, 0.08),
         (rx + 0.13, edge_y - 0.24, 0.012), (rx + 0.2, edge_y - 0.6, 0.009), (rx + 0.32, edge_y - 0.95, 0.009)]
ribbon("Ribbon bookmark", rpts, 0.12, M["ribbon"])

# ---------- tiles with forged upgrades ----------
def tag_shape(name, label, direction, color_key, h, mat_text):
    """glyphHtml: a rounded plate whose nose points at the tile it affects (none = itself, both = whole word)."""
    flame = label == "*"
    w = h * (1.05 if flame else 0.5 + 0.4 * len(label))
    p = h * 0.4
    Lft = direction in ("left", "both"); Rgt = direction in ("right", "both")
    x0 = p if Lft else 0.0
    x1 = x0 + w
    hy = h / 2
    pts = [(x0, hy), (x1, hy)] + ([(x1 + p, 0)] if Rgt else []) + [(x1, -hy), (x0, -hy)] + ([(x0 - p, 0)] if Lft else [])
    total_w = x1 + (p if Rgt else 0)
    bm = bmesh.new()
    vs = [bm.verts.new((x, y, 0)) for x, y in pts]
    f = bm.faces.new(vs)
    ext = bmesh.ops.extrude_face_region(bm, geom=[f])
    for v in [e for e in ext["geom"] if isinstance(e, bmesh.types.BMVert)]:
        v.co.z += 0.016
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    plate = mesh_object(name, bm, [M["tag_" + color_key]])
    bv = plate.modifiers.new("Bevel", "BEVEL"); bv.width = h * 0.16; bv.segments = 4; bv.affect = "VERTICES"
    bv2 = plate.modifiers.new("Bevel edges", "BEVEL"); bv2.width = 0.004; bv2.segments = 2
    mid = (x0 + x1) / 2
    parts = [plate]
    if flame:
        fb = bmesh.new()
        n = 20
        prof = []
        for k in range(n + 1):
            t = k / n
            a = math.pi * 2 * t
            # teardrop: round bottom, pointed top
            r = 0.5 * (1 - math.sin(a / 2) ** 6)
            prof.append((mid + r * math.sin(a) * h * 0.55, -h * 0.05 + (-math.cos(a) * 0.5 + 0.12 * math.sin(a / 2) ** 2) * h * 0.78, 0.018))
        fv = [fb.verts.new(q) for q in prof[:-1]]
        fb.faces.new(fv)
        parts.append(mesh_object(name + " flame", fb, [M["tag_flame"]]))
    else:
        fk = "symbol" if "⧉" in label else "sans_bold"
        parts.append(text(name + " glyph", label, mid, -h * 0.02, 0.017, h * 0.62, mat_text, fk))
    return parts, total_w

def tile(name, letter, value, kind, cx, cy, z0, w=0.54, h=0.62, tilt=0.0, tags=(), wild=False):
    """A letter tile from tileHtml: material face, big letter, value at bottom right, forge tags at top left."""
    pivot = empty(name + " pivot", (cx, cy - h / 2, z0), (tilt, 0, 0))
    depth = 0.12
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co.x *= w; v.co.y *= h; v.co.z *= depth
    for f in bm.faces:
        f.material_index = 0 if f.normal.z > 0.5 else 1
    body = mesh_object(name, bm, [M["face_" + kind], M["edge_" + kind]])
    bvm = body.modifiers.new("Bevel", "BEVEL"); bvm.width = 0.035; bvm.segments = 3; bvm.limit_method = "ANGLE"
    smooth(body)
    body.parent = pivot
    body.location = (0, h / 2, depth / 2)
    top = depth + 0.001
    sc = w / 0.54
    combo = len(letter) > 1
    lsize = h * (0.40 if combo else 0.58)
    lmat = M["ltr_" + kind] if not (wild or (combo and kind == "plain")) else M["lapis"]
    lkey = "garamond_italic" if wild else "garamond_bold"
    lt = text(name + " letter", letter, 0, h / 2 + h * 0.04, top, lsize, lmat, lkey, spacing=0.92 if combo else 1.0)
    lt.parent = pivot
    parts = [lt]
    if value is not None:
        vmat = M["ltr_" + kind] if kind not in VAL else mat_basic("Tile value ink", VAL[kind], rough=0.6)
        vt = text(name + " value", str(value), w * 0.31, h / 2 - h * 0.35, top, h * 0.16, vmat, "garamond_bold")
        vt.parent = pivot
    if wild:  # dashed border
        dm = bmesh.new()
        n = 6
        for side in range(4):
            for k in range(n):
                a0 = (k + 0.2) / n; a1 = (k + 0.8) / n
                if side < 2:
                    yy = (h - 0.05) * (0.5 if side == 0 else -0.5)
                    quad = [(-w / 2 + 0.025 + (w - 0.05) * a0, yy - 0.01), (-w / 2 + 0.025 + (w - 0.05) * a1, yy - 0.01),
                            (-w / 2 + 0.025 + (w - 0.05) * a1, yy + 0.01), (-w / 2 + 0.025 + (w - 0.05) * a0, yy + 0.01)]
                else:
                    xx = (w - 0.05) * (0.5 if side == 2 else -0.5)
                    quad = [(xx - 0.01, -h / 2 + 0.025 + (h - 0.05) * a0), (xx + 0.01, -h / 2 + 0.025 + (h - 0.05) * a0),
                            (xx + 0.01, -h / 2 + 0.025 + (h - 0.05) * a1), (xx - 0.01, -h / 2 + 0.025 + (h - 0.05) * a1)]
                dm.faces.new([dm.verts.new((qx, qy + h / 2, top + 0.0005)) for qx, qy in quad])
        dob = mesh_object(name + " dashed edge", dm, [M["edge_" + kind]])
        dob.parent = pivot
    # forge tags: a row at the top-left corner (.tile-chips top:-9px left:-4px), 15 px tall at rack size
    th = 0.15 * sc * TAG_SCALE
    tx = -w / 2 - 0.04 * sc
    for j, (label, direction, ckey) in enumerate(tags[:3]):
        tparts, tw = tag_shape(f"{name} tag {j}", label, direction, ckey, th, M["white"])
        holder = empty(f"{name} tag {j} holder", (tx, h + 0.01 * sc, top + 0.012 + 0.003 * j))
        holder.parent = pivot
        for ob in tparts:
            ob.parent = holder
        tx += tw + 0.02
    return pivot

# tile kinds come from tilePrimaryClass; tags from GLYPHS (label, direction, colour)
LINE = [  # the word in the line: G R A C E
    ("G", 20, "ruby", [("×2", "self", "mult")]),
    ("R", 10, "lantern", [("*", "self", "gold")]),
    ("A", 50, "sapphire", [("+40", "self", "pts")]),  # round 3: one tag, so the bigger tags don't overlap
    ("C", 30, "prism", [("↻", "left", "echo")]),
    ("E", 10, "ruby", [("×2", "both", "mult"), ("⧉", "self", "green")]),
]
for i, (ch, val, kind, tags) in enumerate(LINE):
    y, z, a = at(D, CELL_D, 0.0)
    tile(f"Line tile {i} {ch}", ch, val, kind, SLOT_X[i], y, z, w=0.78, h=0.78, tilt=a, tags=tags)

# ---------- the book weight with the five slot candles ----------
BW_L, BW_W, BW_H = 5.5, 0.24, 0.09
bw_z = zp(BW_W / 2) - 0.012
box("Book weight", 0, YG, BW_L, BW_W, bw_z, BW_H, M["oak_dark"], bevel=0.025)
for sx in (-1, 1):
    box(f"Book weight cap {sx}", sx * (BW_L / 2 - 0.05), YG, 0.12, BW_W + 0.02, bw_z - 0.005, BW_H + 0.01, M["brass"], bevel=0.02)
BW_TOP = bw_z + BW_H

def candle(name, x, y, z0, r, hgt, lit, flame=1.0, light=0.0, drips=5, seed=1, shadow=True):
    """A beeswax candle with a melted, uneven top and drips down the side."""
    rnd = random.Random(seed)
    lip = 0.028 * (r / 0.1)
    prof = [(0.0, 0.0), (r * 1.02, 0.0), (r * 1.0, hgt * 0.5), (r * 0.99, hgt - lip),
            (r * 0.96, hgt - lip * 0.2), (r * 0.82, hgt - lip * 0.55), (r * 0.4, hgt - lip * 1.1), (0.0, hgt - lip * 1.2)]
    body = lathe(name + " wax", prof, M["wax_lit" if lit else "wax"], loc=(x, y, z0), segs=40)
    # uneven melted rim
    for v in body.data.vertices:
        if v.co.z > hgt - lip * 1.3 and math.hypot(v.co.x, v.co.y) > r * 0.5:
            ang = math.atan2(v.co.y, v.co.x)
            v.co.z += lip * 0.5 * math.sin(ang * 2 + seed) + lip * 0.35 * math.sin(ang * 5 + seed * 3)
    if lit:
        body.visible_shadow = False
    parts = [body]
    for k in range(drips):
        ang = rnd.uniform(0, 2 * math.pi)
        ln = rnd.uniform(0.15, 0.6) * hgt
        dr = r * rnd.uniform(0.12, 0.2)
        cxk, cyk = x + math.cos(ang) * r * 0.97, y + math.sin(ang) * r * 0.97
        top_z = z0 + hgt - lip * 0.3
        drip = sphere(f"{name} drip {k}", (cxk, cyk, top_z - ln / 2), (dr, dr, ln / 2), M["wax_lit" if lit else "wax"], 12, 8)
        drip.rotation_euler = (0, 0, ang)
        bulb = sphere(f"{name} drip {k} end", (x + math.cos(ang) * (r + dr * 0.3), y + math.sin(ang) * (r + dr * 0.3), top_z - ln),
                      (dr * 1.35, dr * 1.35, dr * 1.25), M["wax_lit" if lit else "wax"], 12, 8)
        if lit:
            drip.visible_shadow = False; bulb.visible_shadow = False
        parts += [drip, bulb]
    wick_base = z0 + hgt - lip * 1.2
    wick_h = 0.05 if lit else 0.035
    wk = lathe(name + " wick", [(0, 0), (0.007, 0), (0.006, wick_h * 0.6), (0.004, wick_h), (0, wick_h)], M["wick"],
               loc=(x, y, wick_base), segs=8)
    wk.rotation_euler = (0.25 * rnd.uniform(-1, 1), 0.3, 0)
    if not lit:
        sphere(name + " ember", (x + 0.008, y, wick_base + wick_h), (0.011, 0.011, 0.011), M["ember"], 10, 6)
    if lit:
        fl = sphere(name + " flame", (x, y, wick_base + wick_h + 0.08 * flame), (0.042 * flame, 0.042 * flame, 0.115 * flame),
                    M["flame" if flame >= 0.9 else "flame_small"], 32, 16)
        for v in fl.data.vertices:
            if v.co.z > 0:
                k = 1 - 0.72 * v.co.z
                v.co.x *= k; v.co.y *= k
        fl.visible_shadow = False
        if light:
            bpy.ops.object.light_add(type="POINT", location=(x, y, wick_base + wick_h + 0.07 * flame))
            lo = bpy.context.active_object
            lo.name = name + " light"
            lo.data.energy = light
            lo.data.color = (1.0, 0.56, 0.22)
            lo.data.shadow_soft_size = 0.03 * flame
    return parts

def dish(name, x, y, z0, r, mat):
    lathe(name, [(0, 0), (r * 0.7, 0), (r * 0.95, 0.01), (r, 0.032), (r * 0.93, 0.034), (r * 0.8, 0.014), (0, 0.014)],
          mat, loc=(x, y, z0), segs=40)
    bpy.ops.mesh.primitive_torus_add(major_radius=r * 0.22, minor_radius=0.008, location=(x + r * 1.08, y, z0 + 0.02),
                                     rotation=(math.radians(90), 0, 0))
    ring = bpy.context.active_object; ring.name = name + " ring"; ring.data.materials.append(mat)
    return z0 + 0.014

# one real candle at the candle slot, lit stubs next to it (x2), cold stubs with an ember beyond (x1)
for i, x in enumerate(SLOT_X):
    top = dish(f"Slot {i} dish", x, YG, BW_TOP, 0.13, M["iron"])
    lv = level[i]
    if lv == 3:
        candle(f"Slot {i} candle", x, YG, top, 0.085, 0.46, True, flame=1.0, light=120, drips=6, seed=11 + i)
    elif lv == 2:
        candle(f"Slot {i} candle", x, YG, top, 0.075, 0.2, True, flame=0.62, light=30, drips=4, seed=21 + i)
    else:
        candle(f"Slot {i} candle", x, YG, top, 0.07, 0.12, False, drips=3, seed=31 + i)

# ---------- the rack of hand tiles ----------
RACK_Y = cov_y0 - 0.72
RACK_W = 6.6
box("Rack base", 0, RACK_Y, RACK_W, 0.78, 0, 0.1, M["oak_dark"], bevel=0.03)
box("Rack lip", 0, RACK_Y - 0.36, RACK_W - 0.1, 0.07, 0.1, 0.07, M["turned_wood"], bevel=0.02)
box("Rack back", 0, RACK_Y + 0.33, RACK_W - 0.1, 0.1, 0.1, 0.22, M["oak_dark"], bevel=0.03)
RACK = [
    ("S", 10, "catalyst", [("⧉", "right", "green")], False),
    ("?", None, "catalyst", [("?", "self", "green")], True),
    ("TH", 50, "catalyst", [("TH", "self", "green")], False),
    ("N", 10, "gilded", [("+$3", "self", "gold")], False),
    ("O", 20, "sapphire", [("↑×2", "self", "pts")], False),
    ("T", 10, "plain", [], False),
    ("L", 10, "plain", [], False),
]
for i, (ch, val, kind, tags, wild) in enumerate(RACK):
    x = (i - (len(RACK) - 1) / 2) * 0.82
    tile(f"Rack tile {i} {ch}", ch, val, kind, x, RACK_Y - 0.2 + 0.31, 0.1, w=0.6, h=0.69, tilt=math.radians(30), tags=tags, wild=wild)

# ---------- desk props ----------
# inkwell with a quill, right of the ledger
IW = (5.35, 1.7)
lathe("Inkwell", [(0, 0), (0.5, 0), (0.56, 0.06), (0.58, 0.3), (0.52, 0.52), (0.36, 0.66), (0.22, 0.7), (0.21, 0.8),
                  (0.24, 0.84), (0.2, 0.86), (0.17, 0.8), (0.17, 0.62), (0, 0.62)], M["glaze"], loc=(IW[0], IW[1], 0))
lathe("Ink", [(0, 0), (0.17, 0), (0, 0)], M["ink_pool"], loc=(IW[0], IW[1], 0.74), segs=32)

def quill(name, base, direction, length, bend=0.25):
    d = Vector(direction).normalized()
    side = d.cross(Vector((0, 0, 1))).normalized()
    up = side.cross(d).normalized()
    def c(t):
        return Vector(base) + d * (t * length) + up * (bend * length * (t ** 2) * 0.35)
    bm = bmesh.new()
    n = 44
    rows = []
    for k in range(n + 1):
        t = k / n
        if t < 0.22:
            wl = wr = 0.0
        else:
            u = (t - 0.22) / 0.78
            prof = math.sin(math.pi * min(1.0, u ** 0.7)) * (1 - 0.25 * u)
            wl, wr = 0.16 * prof, 0.07 * prof
        p = c(t)
        rows.append((bm.verts.new(p - side * wl - up * 0.006), bm.verts.new(p), bm.verts.new(p + side * wr - up * 0.006)))
    for k in range(n):
        for a, b in ((0, 1), (1, 2)):
            bm.faces.new((rows[k][a], rows[k][b], rows[k + 1][b], rows[k + 1][a]))
    vane = mesh_object(name + " vane", bm, [M["quill"]])
    sol = vane.modifiers.new("Thickness", "SOLIDIFY"); sol.thickness = 0.006
    smooth(vane)
    curve = bpy.data.curves.new(name + " shaft", "CURVE"); curve.dimensions = "3D"
    sp = curve.splines.new("POLY"); sp.points.add(n)
    for k in range(n + 1):
        p = c(k / n); sp.points[k].co = (p.x, p.y, p.z, 1)
    curve.bevel_depth = 0.012; curve.bevel_resolution = 3
    shaft = link(bpy.data.objects.new(name + " shaft", curve))
    shaft.data.materials.append(M["quill_shaft"])
    return vane, shaft

quill("Quill", (IW[0] - 0.02, IW[1] + 0.02, 0.5), (0.55, 0.65, 1.3), 2.6, bend=0.5)

# stack of old books, back left, with a big candle on top
by = 3.3
stack = [(-5.9, by, 2.5, 1.9, 0.34, "book_brown", 4), (-5.75, by + 0.05, 2.25, 1.7, 0.3, "book_green", -6), (-5.95, by - 0.02, 2.0, 1.55, 0.28, "book_red", 9)]
zz = 0.0
for i, (bx, byy, bw, bh, bt, mk, rot) in enumerate(stack):
    e = empty(f"Book {i}", (bx, byy, zz), (0, 0, math.radians(rot)))
    for nm, ob in (("cover bottom", box(f"Book {i} board bottom", 0, 0, bw, bh, 0, 0.035, M[mk], bevel=0.012)),
                   ("pages", box(f"Book {i} pages", 0.04, 0, bw - 0.1, bh - 0.08, 0.035, bt - 0.07, M["page_edge"], bevel=0.008)),
                   ("cover top", box(f"Book {i} board top", 0, 0, bw, bh, bt - 0.035, 0.035, M[mk], bevel=0.012)),
                   ("spine", box(f"Book {i} spine", -bw / 2 + 0.03, 0, 0.08, bh, 0, bt, M[mk], bevel=0.035))):
        ob.parent = e
        ob.location = (ob.location.x, ob.location.y, ob.location.z)
    zz += bt
dtop = zz
lathe("Big candle dish", [(0, 0), (0.42, 0), (0.46, 0.06), (0.4, 0.07), (0.3, 0.03), (0.15, 0.04), (0.14, 0.14), (0, 0.14)],
      M["brass"], loc=(-5.85, by, dtop))
candle("Big candle left", -5.85, by, dtop + 0.14, 0.2, 0.95, True, flame=1.5, light=60, drips=9, seed=3)
sphere("Wax pool left", (-5.85, by, dtop + 0.15), (0.3, 0.3, 0.02), M["wax"], 24, 8)

# tall turned candlestick, back right
cs = (5.35, 3.75)
lathe("Candlestick", [(0, 0), (0.5, 0), (0.51, 0.06), (0.38, 0.11), (0.18, 0.18), (0.15, 0.36), (0.2, 0.42), (0.12, 0.5),
                      (0.11, 0.86), (0.17, 0.92), (0.11, 0.98), (0.1, 1.1), (0.34, 1.14), (0.36, 1.2), (0.18, 1.2),
                      (0.17, 1.26), (0, 1.26)], M["turned_wood"], loc=(cs[0], cs[1], 0))
candle("Big candle right", cs[0], cs[1], 1.26, 0.16, 0.7, True, flame=1.4, light=50, drips=8, seed=5)

# a few old drips on the desk
for i, (x, y, r) in enumerate([(-4.9, 2.6, 0.08), (-5.1, 2.4, 0.05), (5.2, 3.0, 0.07), (4.9, 3.1, 0.04), (-2.4, 3.1, 0.05)]):
    sphere(f"Desk wax drop {i}", (x, y, 0.0), (r, r * 0.9, 0.018), M["wax"], 16, 8)

# ---------- lighting ----------
world = bpy.data.worlds.new("Night")
scene.world = world
world.use_nodes = True
bg = world.node_tree.nodes["Background"]
bg.inputs["Color"].default_value = hexc("#0d0805")
bg.inputs["Strength"].default_value = 0.3

# cool moonlight from a window off to the left
bpy.ops.object.light_add(type="AREA", location=(-11, 1.0, 7.0))
moon = bpy.context.active_object
moon.name = "Window moonlight"
moon.data.size = 3.0
moon.data.energy = 420
moon.data.color = (0.55, 0.66, 1.0)
moon.rotation_euler = (Vector((0, 0, 0)) - moon.location).to_track_quat("-Z", "Y").to_euler()

# a faint warm fill from the viewer's side so the rack reads
bpy.ops.object.light_add(type="AREA", location=(0, -9.0, 5.0))
fill = bpy.context.active_object
fill.name = "Front fill"
fill.data.size = 7.0
fill.data.energy = 75
fill.data.color = (1.0, 0.78, 0.55)
fill.rotation_euler = (Vector((0, -1.5, 0)) - fill.location).to_track_quat("-Z", "Y").to_euler()

# ---------- cameras ----------
def camera(name, loc, target, lens, fstop=None, focus=None):
    cd = bpy.data.cameras.new(name)
    cd.lens = lens
    ob = link(bpy.data.objects.new(name, cd))
    ob.location = loc
    direction = Vector(target) - Vector(loc)
    ob.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    if fstop:
        cd.dof.use_dof = True
        cd.dof.aperture_fstop = fstop
        cd.dof.focus_distance = focus or direction.length
    return ob

tgt = Vector((0, -0.25, 0.0))
pitch = math.radians(42)
dist = 13.2
cam_screen = camera("Cam screen", (0, tgt.y - dist * math.sin(pitch), dist * math.cos(pitch)), tgt, 35, fstop=5.6,
                    focus=dist)
sx = SLOT_X[CANDLE]
foc = Vector((sx, YG - 0.75, 0.45))
close_loc = Vector((sx - 1.35, YG - 3.85, 2.05))
cam_close = camera("Cam close", close_loc, (sx + 0.85, YG - 0.35, 0.42), 31, fstop=11 if FLAT else 2.2,
                   focus=(foc - close_loc).length)

# ---------- render settings ----------
scene.render.engine = "CYCLES"
scene.cycles.device = "CPU"
scene.cycles.samples = SAMPLES
scene.cycles.use_adaptive_sampling = True
scene.cycles.use_denoising = bool(getattr(bpy.app.build_options, "openimagedenoise", False))
if scene.cycles.use_denoising:
    scene.cycles.denoiser = "OPENIMAGEDENOISE"
scene.cycles.max_bounces = 6
scene.cycles.blur_glossy = 1.0
scene.cycles.sample_clamp_indirect = 1.5
scene.render.resolution_x, scene.render.resolution_y = 1280, 800
scene.render.resolution_percentage = PCT
scene.render.image_settings.file_format = "PNG"
try:
    scene.view_settings.view_transform = "AgX"
    scene.view_settings.look = "AgX - Punchy"
except Exception:
    scene.view_settings.view_transform = "Filmic"
scene.view_settings.exposure = EXPOSURE
if FLAT:   # the compositor applies the exposure and AgX itself (see below)
    scene.view_settings.view_transform = "Standard"
    scene.view_settings.look = "None"
    scene.view_settings.exposure = 0.0

# ---------- compositor ----------
# Round 4 (FLAT, the default): the render becomes a flat painted illustration.
#   The look is built in display space: the compositor applies the exposure and AgX itself, the scene's
#   view transform is set to Standard, and the result is turned back to linear at the very end.
#   1. a strong painterly Kuwahara filter flattens every surface into broad brush patches
#   2. cel shading: brightness snaps to a few flat bands (hue kept), then a warm umber-to-cream palette
#   3. bold sepia ink outlines drawn by Freestyle with a broad-nib stroke
#   4. lettering and tags skip steps 1 and 2 so they stay crisp
#   5. paper: blotches, fibres and grain from Blender's old procedural textures (no image files), then burnt edges
# --no-flat gives round 2's plain render (glow and vignette only).
scene.use_nodes = True
nt = scene.node_tree
for n in list(nt.nodes):
    nt.nodes.remove(n)
L = nt.links.new

def node(kind, x, y, **props):
    n = nt.nodes.new(kind)
    n.location = (x, y)
    for k, v in props.items():
        try:
            setattr(n, k, v)
        except (AttributeError, TypeError, ValueError):
            print("skipped", kind, k)
    return n

def mix(blend, x, y, a, b, fac=1.0, color=None):
    m = node("CompositorNodeMixRGB", x, y, blend_type=blend)
    if isinstance(fac, (int, float)):
        m.inputs[0].default_value = fac
    else:
        L(fac, m.inputs[0])
    L(a, m.inputs[1])
    if color is not None:
        m.inputs[2].default_value = color
    else:
        L(b, m.inputs[2])
    return m.outputs["Image"]

def math_node(op, x, y, a, v1=None, v2=None):
    """a op v1 (op v2); v1 and v2 can be numbers or sockets."""
    m = node("CompositorNodeMath", x, y, operation=op)
    L(a, m.inputs[0])
    for i, v in ((1, v1), (2, v2)):
        if v is None:
            continue
        if isinstance(v, (int, float)):
            m.inputs[i].default_value = v
        else:
            L(v, m.inputs[i])
    return m.outputs["Value"]

def tex_node(name, ttype, x, y, scale=(1, 1, 1), **props):
    tex = bpy.data.textures.new(name, ttype)
    for k, v in props.items():
        setattr(tex, k, v)
    n = node("CompositorNodeTexture", x, y)
    n.texture = tex
    n.inputs["Scale"].default_value = scale
    return n.outputs["Value"]

def to_display(sock, x, y):
    """Scene exposure, then AgX, so the steps after work on what the eye sees."""
    ex = node("CompositorNodeExposure", x, y)
    ex.inputs["Exposure"].default_value = EXPOSURE
    L(sock, ex.inputs["Image"])
    cv = node("CompositorNodeConvertColorSpace", x + 180, y, from_color_space="Linear Rec.709",
              to_color_space="AgX Base sRGB")
    L(ex.outputs["Image"], cv.inputs["Image"])
    return cv.outputs["Image"]

def hsv_sat(sock, x, y, sat):
    hs = node("CompositorNodeHueSat", x, y)
    hs.inputs["Saturation"].default_value = sat
    L(sock, hs.inputs["Image"])
    return hs.outputs["Image"]

def palette(sock, x, y, fac):
    """Pull every colour toward a warm umber-to-cream ramp by its brightness (a gradient map)."""
    bw = node("CompositorNodeRGBToBW", x, y)
    L(sock, bw.inputs["Image"])
    ramp = node("CompositorNodeValToRGB", x + 160, y)
    els = ramp.color_ramp.elements
    stops = [(0.0, (0.10, 0.055, 0.03)), (0.3, (0.36, 0.20, 0.10)), (0.62, (0.78, 0.56, 0.30)), (1.0, (0.98, 0.92, 0.78))]
    els[0].position, els[0].color = stops[0][0], (*stops[0][1], 1)
    els[1].position, els[1].color = stops[-1][0], (*stops[-1][1], 1)
    for pos, col in stops[1:-1]:
        e = els.new(pos); e.color = (*col, 1)
    L(bw.outputs["Val"], ramp.inputs["Fac"])
    return mix("MIX", x + 400, y, sock, ramp.outputs["Image"], fac=fac)

rl = node("CompositorNodeRLayers", -2000, 0)
comp = node("CompositorNodeComposite", 2600, 0)
k = PCT / 100.0  # filter sizes are in pixels, so they follow the resolution

if not FLAT:
    glare = node("CompositorNodeGlare", -700, 100, glare_type="FOG_GLOW", quality="HIGH", threshold=1.2, size=8, mix=-0.55)
    L(rl.outputs["Image"], glare.inputs["Image"])
    img = glare.outputs["Image"]
else:
    vl = bpy.context.view_layer
    # text and the tag glyphs get pass index 1 (kept crisp); text, the flat ink on the pages and the candle flames get no outline
    nol = bpy.data.collections.new("No ink outline")
    scene.collection.children.link(nol)
    INK_SHEETS = {"Ink lines", "Red ink lines", "Gold leaf", "Word score panel"}
    for ob in list(scene.objects):
        tag_flame = ob.name.endswith(" flame") and " tag " in ob.name   # the lantern tag's little flame glyph
        candle_flame = "flame" in ob.name.lower() and not tag_flame
        if ob.type == "FONT" or tag_flame:
            ob.pass_index = 1
        if ob.type == "FONT" or ob.name in INK_SHEETS or candle_flame:
            nol.objects.link(ob)
    vl.use_pass_object_index = True

    # bold ink outlines, as their own pass
    scene.render.use_freestyle = True
    scene.render.line_thickness_mode = "RELATIVE"   # line widths follow the image height
    fs = vl.freestyle_settings
    fs.as_render_pass = True
    fs.crease_angle = math.radians(125)
    for old in list(fs.linesets):
        fs.linesets.remove(old)
    ls = fs.linesets.new("Ink outline")
    ls.select_by_visibility = True
    ls.visibility = "VISIBLE"
    ls.select_by_edge_types = True
    ls.select_silhouette = ls.select_border = True
    ls.select_material_boundary = ls.select_external_contour = True
    ls.select_by_collection = True
    ls.collection = nol
    ls.collection_negation = "EXCLUSIVE"
    st = ls.linestyle
    st.name = "Sepia quill"
    st.color = (0.03, 0.015, 0.007)
    st.alpha = 1.0
    st.thickness = 1.0
    st.caps = "ROUND"
    cal = st.thickness_modifiers.new(name="Broad nib", type="CALLIGRAPHY")
    cal.orientation = math.radians(40)
    cal.thickness_min, cal.thickness_max = 0.9, 2.5
    wob = st.geometry_modifiers.new(name="Hand wobble", type="PERLIN_NOISE_1D")
    wob.frequency, wob.amplitude, wob.seed = 7.0, 1.1, 3

    # painted branch: broad Kuwahara strokes, glow, then display space
    paint = node("CompositorNodeKuwahara", -1800, 300, variation="ANISOTROPIC", size=max(3, round(14 * k)),
                 uniformity=6, sharpness=0.8, eccentricity=1.4)
    L(rl.outputs["Image"], paint.inputs["Image"])
    glare = node("CompositorNodeGlare", -1600, 300, glare_type="FOG_GLOW", quality="HIGH", threshold=1.2, size=8, mix=-0.55)
    L(paint.outputs["Image"], glare.inputs["Image"])
    a = to_display(glare.outputs["Image"], -1400, 300)
    # cel shading: brightness to BANDS flat steps, hue and saturation kept
    sep = node("CompositorNodeSeparateColor", -1000, 300, mode="HSV")
    L(a, sep.inputs["Image"])
    v = math_node("MULTIPLY", -800, 200, sep.outputs["Blue"], BANDS)
    v = math_node("ROUND", -650, 200, v)
    v = math_node("DIVIDE", -500, 200, v, BANDS)
    v = math_node("MAXIMUM", -350, 200, v, 0.04)
    s = math_node("MULTIPLY", -500, 400, sep.outputs["Green"], 1.12)
    comb = node("CompositorNodeCombineColor", -200, 300, mode="HSV")
    L(sep.outputs["Red"], comb.inputs[0]); L(s, comb.inputs[1]); L(v, comb.inputs[2]); L(sep.outputs["Alpha"], comb.inputs[3])
    banded = mix("MIX", 0, 300, a, comb.outputs["Image"], fac=0.82)   # a little of the soft paint shows through the bands
    a = palette(banded, 200, 300, 0.3)

    # crisp branch for the lettering: same colour, no paint or bands
    b = to_display(rl.outputs["Image"], -1400, -100)
    b = hsv_sat(b, -1000, -100, 1.1)
    b = palette(b, -800, -100, 0.2)
    idm = node("CompositorNodeIDMask", -1400, -400, index=1, use_antialiasing=True)
    L(rl.outputs["IndexOB"], idm.inputs["ID value"])
    grow = node("CompositorNodeDilateErode", -1200, -400, mode="FEATHER", distance=max(1, round(3 * k)))
    L(idm.outputs["Alpha"], grow.inputs["Mask"])
    img = mix("MIX", 800, 200, a, b, fac=grow.outputs["Mask"])

    # ink outlines in a dark sepia, on top of everything
    fsep = node("CompositorNodeSeparateColor", 800, -100, mode="RGB")
    L(rl.outputs["Freestyle"], fsep.inputs["Image"])
    img = mix("MIX", 1000, 200, img, None, fac=fsep.outputs["Alpha"], color=(0.17, 0.09, 0.045, 1.0))

    inked = img   # kept for the lettering, which skips the paper so it stays sharp
    # paper: soft blotches, horizontal fibres and fine grain, mixed in as an overlay (0.5 = no change)
    blot = tex_node("Paper blotches", "CLOUDS", 800, -400, noise_scale=0.4, noise_depth=4)
    fib = tex_node("Paper fibres", "CLOUDS", 800, -600, scale=(1.0, 9.0, 1.0), noise_scale=0.06, noise_depth=2)
    grain = tex_node("Paper grain", "NOISE", 800, -800)
    p = math_node("MULTIPLY_ADD", 1000, -400, blot, 0.55, 0.5 - 0.275)
    p = math_node("MULTIPLY_ADD", 1150, -500, fib, 0.3, p)
    p = math_node("MULTIPLY_ADD", 1300, -600, grain, 0.3, p)
    p = math_node("SUBTRACT", 1450, -600, p, 0.3)
    img = mix("OVERLAY", 1600, 200, img, p, fac=0.42)
    # warm lift so nothing goes pure black, like ink on old paper
    img = mix("LIGHTEN", 1750, 200, img, None, fac=1.0, color=(0.085, 0.05, 0.03, 1.0))
    img = mix("MIX", 1800, 200, img, inked, fac=grow.outputs["Mask"])

# burnt edges (round 2's vignette)
mask = node("CompositorNodeEllipseMask", 1800, -250, width=1.1, height=1.05)
blur = node("CompositorNodeBlur", 2000, -250, filter_type="FAST_GAUSS", use_relative=True, factor_x=38, factor_y=38)
L(mask.outputs["Mask"], blur.inputs["Image"])
img = mix("MULTIPLY", 2200, 100, img, blur.outputs["Image"], fac=0.5)
if FLAT:
    back = node("CompositorNodeConvertColorSpace", 2400, 100, from_color_space="sRGB", to_color_space="Linear Rec.709")
    L(img, back.inputs["Image"])
    img = back.outputs["Image"]
L(img, comp.inputs["Image"])

scene.camera = cam_screen
blend_path = os.path.join(OUT, "tile-forge-mockup-r4.blend")
bpy.ops.file.pack_all()
bpy.ops.wm.save_as_mainfile(filepath=blend_path)
print("saved", blend_path)

if RENDER:
    shots = [(cam_screen, "tile-forge-mockup-r4-screen.png", "screen"), (cam_close, "tile-forge-mockup-r4-candle.png", "candle")]
    for cam, fname, key in shots:
        if ONLY and ONLY != key:
            continue
        scene.camera = cam
        scene.render.filepath = os.path.join(OUT, fname)
        bpy.ops.render.render(write_still=True)
        print("rendered", scene.render.filepath)
    scene.camera = cam_screen
