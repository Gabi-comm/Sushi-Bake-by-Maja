"""Procedural aluminium foil tray -> public/models/tray.glb.

Run inside Blender (4.x):  exec(open(r"<repo>/scripts/blender_tray.py").read())

The tray is normalized: flange outer edge is 1 x 1 and the wall is 1 tall, so the
site scales it per size (src/data/menu.ts) to real inch dimensions. Food sits on the
floor (`FLOOR`) and fills up to the wall top (`TOP`); those ratios are mirrored in
src/components/three/trayGeometry.ts.
"""
import math
from pathlib import Path

import bmesh
import bpy
from mathutils import Vector

REPO = Path(r"C:\Users\Gab\Documents\GitHub\Sushi-Bake-by-Maja")
SAMPLES = 800           # vertices per ring
WALL_STEPS = 12
FLUTES_PER_UNIT = 40    # pleats per unit of perimeter
AMP = 0.006             # pleat depth

# (half width, half depth, corner radius) per ring
EMBOSS = (0.33, 0.33, 0.03)
FLOOR = (0.40, 0.40, 0.06)
TOP = (0.455, 0.455, 0.075)
FLANGE = (0.485, 0.485, 0.09)


def rounded_rect(hw, hh, r):
    """Uniformly sampled perimeter: (point, outward normal, arc position, total length)."""
    parts = [
        ("arc", (hw - r, hh - r, 0)),
        ("line", (Vector((hw - r, hh)), Vector((-hw + r, hh)), Vector((0, 1)))),
        ("arc", (-hw + r, hh - r, 90)),
        ("line", (Vector((-hw, hh - r)), Vector((-hw, -hh + r)), Vector((-1, 0)))),
        ("arc", (-hw + r, -hh + r, 180)),
        ("line", (Vector((-hw + r, -hh)), Vector((hw - r, -hh)), Vector((0, -1)))),
        ("arc", (hw - r, -hh + r, 270)),
        ("line", (Vector((hw, -hh + r)), Vector((hw, hh - r)), Vector((1, 0)))),
    ]
    lengths = [math.pi * r / 2 if kind == "arc" else (d[1] - d[0]).length for kind, d in parts]
    total = sum(lengths)
    out = []
    for i in range(SAMPLES):
        pos = s = total * i / SAMPLES
        for (kind, d), length in zip(parts, lengths):
            if s <= length or (kind, d) == parts[-1]:
                t = s / length if length else 0
                if kind == "arc":
                    a = math.radians(d[2]) + t * math.pi / 2
                    n = Vector((math.cos(a), math.sin(a)))
                    out.append((Vector((d[0], d[1])) + n * r, n, pos, total))
                else:
                    out.append((d[0].lerp(d[1], t), d[2], pos, total))
                break
            s -= length
    return out


def lerp(a, b, t):
    return tuple(x + (y - x) * t for x, y in zip(a, b))


def build():
    for o in list(bpy.data.objects):
        bpy.data.objects.remove(o, do_unlink=True)

    bm = bmesh.new()
    rings = []

    def ring(spec, z, flute=0.0):
        verts = []
        for p, n, s, total in rounded_rect(*spec):
            count = round(total * FLUTES_PER_UNIT)  # whole pleats, so the seam closes
            q = p + n * flute * math.sin(2 * math.pi * count * s / total)
            verts.append(bm.verts.new((q.x, q.y, z)))
        rings.append(verts)

    ring(EMBOSS, 0.035)                       # raised embossed floor panel
    bm.faces.new(rings[0])
    ring(lerp(EMBOSS, FLOOR, 0.15), 0.0)
    ring(FLOOR, 0.0)
    for k in range(1, WALL_STEPS + 1):        # flared, pleated wall
        t = k / WALL_STEPS
        ring(lerp(FLOOR, TOP, t), t, flute=AMP * (0.35 + math.sin(math.pi * min(t, 0.98))))
    ring(lerp(TOP, FLANGE, 0.5), 1.0, flute=AMP * 0.5)
    ring(FLANGE, 1.0, flute=AMP * 0.4)
    for deg in (40, 80, 120, 160):            # rolled lip curling down
        a, r = math.radians(deg), 0.012
        ring(tuple(v + r * math.sin(a) for v in FLANGE), 1.0 - (r - r * math.cos(a)) / 0.15, flute=AMP * 0.4)

    for ra, rb in zip(rings, rings[1:]):
        for i in range(SAMPLES):
            j = (i + 1) % SAMPLES
            bm.faces.new((ra[i], ra[j], rb[j], rb[i]))
    bm.normal_update()

    mesh = bpy.data.meshes.new("Tray")
    bm.to_mesh(mesh)
    bm.free()
    for i, poly in enumerate(mesh.polygons):
        poly.use_smooth = i > 0
    obj = bpy.data.objects.new("Tray", mesh)
    bpy.context.collection.objects.link(obj)
    solid = obj.modifiers.new("thickness", "SOLIDIFY")
    solid.thickness, solid.offset = 0.004, 1

    mat = bpy.data.materials.new("Foil")
    mat.use_nodes = True
    bsdf = next(n for n in mat.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    bsdf.inputs["Base Color"].default_value = (0.86, 0.87, 0.89, 1)
    bsdf.inputs["Metallic"].default_value = 1.0
    bsdf.inputs["Roughness"].default_value = 0.28
    mesh.materials.append(mat)
    return obj


def export(obj):
    dest = REPO / "public" / "models" / "tray.glb"
    dest.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    kwargs = dict(filepath=str(dest), use_selection=True, export_apply=True, export_yup=True)
    try:
        bpy.ops.export_scene.gltf(export_draco_mesh_compression_enable=True, **kwargs)
    except TypeError:
        bpy.ops.export_scene.gltf(**kwargs)
    print(dest, dest.stat().st_size // 1024, "KB")


tray = build()
export(tray)
