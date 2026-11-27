"""Tile Forge web demo backgrounds, in the round 4 flat painted look.

Run after build_scene.py in the same Blender session:
  blender -b -P build_scene.py -P build_backgrounds.py -- --no-render --out DIR [--samples N] [--only wide|tall|vellum] [--test]

It keeps the desk, the stone wall and the props (books, candles, candlestick, inkwell, quill), removes the
ledger, tiles and rack (the game draws those itself in the page), and renders:
  desk-wide.png   1600 x 1000, for screens wider than tall
  desk-tall.png    960 x 1600, for phones held upright (props moved in so they stay in frame)
  vellum.png      1024 x  640, the ledger page as a flat painted texture (no ruling: the page draws its own)
"""
import bpy, math, os, sys
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
def opt(name, default):
    return argv[argv.index(name) + 1] if name in argv else default
OUT = os.path.abspath(opt("--out", "."))
BG_SAMPLES = int(opt("--bg-samples", 96))
ONLY = opt("--only", "")
def want(k):
    return not ONLY or k in ONLY.split(",")
TEST = "--test" in argv
scene = bpy.context.scene
scene.cycles.samples = 24 if TEST else BG_SAMPLES

KEEP_PREFIX = ("Desk", "Stone wall", "Inkwell", "Quill", "Book ", "Big candle", "Wax pool", "Candlestick",
               "Window moonlight", "Front fill")
KEEP_EXACT = {"Ink"}
for ob in list(scene.objects):
    if ob.type == "CAMERA":
        continue
    keep = ob.name in KEEP_EXACT or (ob.name.startswith(KEEP_PREFIX) and not ob.name.startswith("Book weight"))
    if not keep:
        bpy.data.objects.remove(ob, do_unlink=True)

# a longer desk, so a phone held upright never sees past its front edge (a second board, joined)
desk = scene.objects["Desk"]
front = desk.copy()
front.name = "Desk front board"
front.location.y -= desk.dimensions.y - 0.02
scene.collection.objects.link(front)

# a quieter oak for a background: finer grain, lighter grime, even sheen (big dark blotches fight the game)
dm = bpy.data.materials["Desk oak (worn)"]
for n in dm.node_tree.nodes:
    if n.type == "TEX_NOISE" and abs(n.inputs["Scale"].default_value - 5.0) < 1e-6:
        n.inputs["Scale"].default_value = 9.0                      # wood grain
    if n.type == "MAPPING" and abs(n.inputs["Scale"].default_value[1] - 0.06) < 1e-6:
        n.inputs["Scale"].default_value = (1.0, 0.12, 1.0)
    if n.type == "VALTORGB":
        els = n.color_ramp.elements
        if len(els) == 2 and abs(els[0].position - 0.42) < 1e-3:   # grime
            els[1].color = (0.93, 0.89, 0.85, 1.0)   # almost no grime: its big blotches became islands of light
        if len(els) == 2 and abs(els[0].color[0] - 0.38) < 1e-3:   # roughness from grime
            els[0].color = els[1].color = (0.6, 0.6, 0.6, 1.0)

# calmer cel shading for a background: the bands follow a blurred brightness, so the light falls off in
# clean steps instead of islands, and more of the wood grain shows through
nt = scene.node_tree
sep = next(n for n in nt.nodes if n.type == "SEPARATE_COLOR" and n.mode == "HSV")
src_link = sep.inputs["Image"].links[0]
blur = nt.nodes.new("CompositorNodeBlur")
blur.filter_type = "FAST_GAUSS"
blur.use_relative = True               # a share of the picture's size, so test and final renders match
blur.factor_x = blur.factor_y = 6.0    # 6 % (about 96 px on a 1600 px picture)
nt.links.new(src_link.from_socket, blur.inputs["Image"])
sep_v = nt.nodes.new("CompositorNodeSeparateColor")
sep_v.mode = "HSV"
nt.links.new(blur.outputs["Image"], sep_v.inputs["Image"])
for lk in list(sep.outputs["Blue"].links):
    nt.links.new(sep_v.outputs["Blue"], lk.to_socket)
banded_mix = next(n for n in nt.nodes if n.type == "MIX_RGB" and tuple(n.location) == (0.0, 300.0))
banded_mix.inputs[0].default_value = 0.6

# the five slot candles lit the middle of the desk; the page draws them now, so a soft warm pool stands in
bpy.ops.object.light_add(type="POINT", location=(0, -0.3, 2.6))
pool = bpy.context.active_object
pool.name = "Centre glow"
pool.data.energy = 260
pool.data.color = (1.0, 0.72, 0.42)
pool.data.shadow_soft_size = 1.2

def camera(name, loc, target, lens, ortho=None):
    cd = bpy.data.cameras.new(name)
    cd.lens = lens
    if ortho:
        cd.type = "ORTHO"
        cd.ortho_scale = ortho
    ob = bpy.data.objects.new(name, cd)
    scene.collection.objects.link(ob)
    ob.location = loc
    ob.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    return ob

def move(prefixes, dx, dy):
    for ob in scene.objects:
        if ob.parent is None and ob.name.startswith(prefixes) and not ob.name.startswith("Book weight"):
            ob.location.x += dx
            ob.location.y += dy

def shoot(cam, w, h, name):
    scene.camera = cam
    scene.render.resolution_x, scene.render.resolution_y = w, h
    scene.render.resolution_percentage = 50 if TEST else 100
    scene.render.filepath = os.path.join(OUT, name)
    bpy.ops.render.render(write_still=True)
    print("rendered", scene.render.filepath)

LEFT = ("Book ", "Big candle dish", "Big candle left", "Wax pool left")
RIGHT_TALL = ("Candlestick", "Big candle right")
INK = ("Inkwell", "Ink", "Quill")

# wide: the round 4 screen camera, with the ledger gone
tgt = Vector((0, -0.25, 0.0))
pitch, dist = math.radians(42), 13.2
cam_wide = camera("Cam wide", (0, tgt.y - dist * math.sin(pitch), dist * math.cos(pitch)), tgt, 35)
if want("wide"):
    shoot(cam_wide, 1600, 1000, "desk-wide.png")

# tall: props pulled in toward the middle so a phone held upright still sees them
if want("tall"):
    move(LEFT, 3.35, 0.35)
    move(RIGHT_TALL, -2.55, 0.1)
    move(INK, -2.75, -0.15)
    tp, td = math.radians(38), 12.0
    tt = Vector((0, 0.3, 0.0))
    cam_tall = camera("Cam tall", (0, tt.y - td * math.sin(tp), td * math.cos(tp)), tt, 30)
    shoot(cam_tall, 960, 1600, "desk-tall.png")

# vellum: the page material on its own, flat and evenly lit, seen straight down
if want("vellum"):
    for ob in scene.objects:
        if ob.type != "CAMERA":
            ob.hide_render = True
    src = bpy.data.materials["Ledger vellum"]
    vm = src.copy()
    vm.name = "Vellum swatch"
    for n in vm.node_tree.nodes:          # drop the drypoint ruling: the page draws its own lines
        if n.type == "TEX_WAVE":
            n.inputs["Scale"].default_value = 0.0
    bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 0, 3.0))
    pl = bpy.context.active_object
    pl.name = "Vellum swatch"
    pl.scale = (8.0, 5.0, 1.0)
    pl.data.materials.append(vm)
    nol = bpy.data.collections.get("No ink outline")
    if nol:
        nol.objects.link(pl)
    bpy.ops.object.light_add(type="AREA", location=(-2.0, -3.0, 9.0))
    soft = bpy.context.active_object
    soft.name = "Swatch light"
    soft.data.size = 12.0
    soft.data.energy = 900
    soft.data.color = (1.0, 0.86, 0.66)
    soft.rotation_euler = (Vector((0, 0, 3.0)) - soft.location).to_track_quat("-Z", "Y").to_euler()
    scene.world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.0
    # soften the burnt-edge vignette: the swatch already darkens toward its edges
    for n in scene.node_tree.nodes:
        if n.type == "MIX_RGB" and n.blend_type == "MULTIPLY" and tuple(n.location) == (2200.0, 100.0):
            n.inputs[0].default_value = 0.12
    cam_v = camera("Cam vellum", (0, 0, 12.0), (0, 0, 3.0), 50, ortho=8.0)
    shoot(cam_v, 1024, 640, "vellum.png")
