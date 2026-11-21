"""Generates the sample 3D models (.glb) and product-shot images used by the
sample projects. Only numpy and Pillow are needed (no 3D libraries).

    python3 scripts/make_placeholder_media.py

You don't need this for your own projects: use real photos, and convert your
CAD files with scripts/convert_to_glb.py. It's kept so the samples can be remade.
"""

import json
import math
import struct
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
PROJECTS = ROOT / "src" / "content" / "projects"


# ── Geometry ──────────────────────────────────────────────────────────────


class Mesh:
    def __init__(self):
        self.pos, self.nrm, self.idx = [], [], []

    def add(self, positions, normals, triangles):
        base = sum(len(p) for p in self.pos)
        self.pos.append(np.asarray(positions, dtype=np.float64))
        self.nrm.append(np.asarray(normals, dtype=np.float64))
        self.idx.append(np.asarray(triangles, dtype=np.int64) + base)

    def arrays(self):
        p = np.concatenate(self.pos)
        n = np.concatenate(self.nrm)
        n /= np.linalg.norm(n, axis=1, keepdims=True)
        t = np.concatenate(self.idx)
        # Make every triangle wind counter-clockwise seen from outside (glTF front face).
        a, b, c = p[t[:, 0]], p[t[:, 1]], p[t[:, 2]]
        face = np.cross(b - a, c - a)
        flip = np.einsum("ij,ij->i", face, n[t].sum(axis=1)) < 0
        t[flip] = t[flip][:, [0, 2, 1]]
        return p, n, t


def grid_triangles(rows, cols, wrap=True):
    """Triangles for a rows x cols vertex grid; columns wrap around if wrap."""
    tris = []
    cmax = cols if wrap else cols - 1
    for i in range(rows - 1):
        for j in range(cmax):
            j2 = (j + 1) % cols
            a, b, c, d = i * cols + j, i * cols + j2, (i + 1) * cols + j, (i + 1) * cols + j2
            tris += [(a, c, b), (b, c, d)]
    return tris


def revolve(mesh, profile, segments=144, smooth_deg=35):
    """Turns an (r, z) profile around the z axis, like a part on a lathe.
    Each profile segment gets its own ring of vertices, so sharp corners stay
    sharp while gentle curves (fillets) shade smoothly."""
    pts = np.asarray(profile, dtype=float)
    theta = np.linspace(0, 2 * math.pi, segments, endpoint=False)
    cos, sin = np.cos(theta), np.sin(theta)
    seg_n = []
    for (r0, z0), (r1, z1) in zip(pts[:-1], pts[1:]):
        n = np.array([z1 - z0, -(r1 - r0)])
        seg_n.append(n / np.linalg.norm(n))
    limit = math.cos(math.radians(smooth_deg))
    for k, ((r0, z0), (r1, z1)) in enumerate(zip(pts[:-1], pts[1:])):
        n = seg_n[k]
        ends = []
        for other in (k - 1, k + 1):
            if 0 <= other < len(seg_n) and np.dot(seg_n[other], n) > limit:
                m = seg_n[other] + n
                ends.append(m / np.linalg.norm(m))
            else:
                ends.append(n)
        rows = []
        normals = []
        for (r, z), (nr, nz) in (((r0, z0), ends[0]), ((r1, z1), ends[1])):
            rows.append(np.stack([r * cos, r * sin, np.full_like(cos, z)], axis=1))
            normals.append(np.stack([nr * cos, nr * sin, np.full_like(cos, nz)], axis=1))
        mesh.add(np.concatenate(rows), np.concatenate(normals), grid_triangles(2, segments))


def scalloped_flange(mesh, bore, radius, z0, z1, lobes=6, depth=9, width=0.22, samples=360):
    """A flange plate whose edge has rounded bolt slots, plus its bore."""
    theta = np.linspace(0, 2 * math.pi, samples, endpoint=False)
    phase = (theta * lobes / (2 * math.pi)) % 1.0 - 0.5  # -0.5..0.5 around each slot
    bump = np.clip(1 - (phase / (width / 2)) ** 2, 0, None) ** 0.5  # round-bottomed slot
    r = radius - depth * bump
    cos, sin = np.cos(theta), np.sin(theta)
    outer = np.stack([r * cos, r * sin], axis=1)
    inner = np.stack([bore * cos, bore * sin], axis=1)
    # Top and bottom faces, split into rings so no triangle is a long sliver.
    rings = 8
    for z, nz in ((z1, 1.0), (z0, -1.0)):
        pts = np.concatenate([np.c_[inner + (outer - inner) * k / rings, np.full(samples, z)] for k in range(rings + 1)])
        mesh.add(pts, np.tile([0, 0, nz], ((rings + 1) * samples, 1)), grid_triangles(rings + 1, samples))
    # Outer edge: normal from the contour's tangent.
    tangent = np.roll(outer, -1, axis=0) - np.roll(outer, 1, axis=0)
    edge_n = np.stack([tangent[:, 1], -tangent[:, 0], np.zeros(samples)], axis=1)
    pts = np.concatenate([np.c_[outer, np.full(samples, z0)], np.c_[outer, np.full(samples, z1)]])
    mesh.add(pts, np.concatenate([edge_n, edge_n]), grid_triangles(2, samples))
    # Bore wall (faces the axis).
    bore_n = np.stack([-cos, -sin, np.zeros(samples)], axis=1)
    pts = np.concatenate([np.c_[inner, np.full(samples, z0)], np.c_[inner, np.full(samples, z1)]])
    mesh.add(pts, np.concatenate([bore_n, bore_n]), grid_triangles(2, samples))


def quad(mesh, a, b, c, d, steps=10, n=None):
    """A flat four-sided face split into a grid (keeps the renderer's depth sort honest)."""
    a, b, c, d = (np.asarray(v, float) for v in (a, b, c, d))
    if n is None:
        n = np.cross(b - a, d - a)
    n = np.asarray(n, float) / np.linalg.norm(n)
    g = np.linspace(0, 1, steps + 1)
    pts = [(1 - v) * ((1 - w) * a + w * b) + v * ((1 - w) * d + w * c) for v in g for w in g]
    mesh.add(pts, [n] * len(pts), grid_triangles(steps + 1, steps + 1, wrap=False))


def box(mesh, lo, hi):
    (x0, y0, z0), (x1, y1, z1) = lo, hi
    v = lambda i: (x1 if i & 1 else x0, y1 if i & 2 else y0, z1 if i & 4 else z0)
    for face in ((0, 2, 3, 1), (4, 5, 7, 6), (0, 1, 5, 4), (2, 6, 7, 3), (0, 4, 6, 2), (1, 3, 7, 5)):
        quad(mesh, *(v(i) for i in face))


def gusset(mesh, x0, x1, y_wall, y_tip, z_base, z_tip):
    """Triangular rib between the base plate and the upright."""
    for x, nx in ((x0, -1), (x1, 1)):
        a, b, c = (x, y_wall, z_base), (x, y_tip, z_base), (x, y_wall, z_tip)
        quad(mesh, a, b, c, c, steps=8, n=(nx, 0, 0))
    slope = np.array([0, z_tip - z_base, -(y_wall - y_tip)], float)  # n = -slope faces up, away from the upright
    quad(mesh, (x0, y_tip, z_base), (x1, y_tip, z_base), (x1, y_wall, z_tip), (x0, y_wall, z_tip), n=-slope)


def arc(cx, cz, radius, a0, a1, steps=10):
    return [(cx + radius * math.cos(math.radians(a)), cz + radius * math.sin(math.radians(a)))
            for a in np.linspace(a0, a1, steps)]


def output_hub():
    """Gearbox output hub: scalloped flange, filleted hub, snap-ring groove, bore."""
    m = Mesh()
    scalloped_flange(m, bore=12, radius=45, z0=0, z1=8)
    profile = arc(26, 12, 4, -90, -180) + [
        (22, 29), (20.6, 29), (20.6, 31), (22, 31), (22, 36.8), (20.8, 38),
        (13.2, 38), (12, 36.8), (12, 8),
    ]
    revolve(m, profile)
    return m


def load_adapter():
    """Load-cell adapter: wide boss, neck, threaded stud, center hole."""
    m = Mesh()
    profile = [(5, 0), (19, 0), (20, 1), (20, 9), (19, 10)] + [
        (13, 10), (12, 11), (12, 14), (8.6, 15)]
    z = 15.6
    while z < 32:  # thread-like grooves at 1.25 mm pitch
        profile += [(8, z), (7.25, z + 0.62)]
        z += 1.25
    profile += [(8, z), (8, 33), (7, 34), (5, 34), (4, 33), (4, 1), (5, 0)]
    revolve(m, profile, segments=160, smooth_deg=20)
    return m


def bracket():
    """Sheet-metal-style L bracket with a gusset (simple boxes)."""
    m = Mesh()
    box(m, (-30, -20, 0), (30, 20, 5))
    box(m, (-30, 15, 5), (30, 20, 45))
    for x in (-24, 19):
        gusset(m, x, x + 5, 15, -12, 5, 32)
    return m


# ── GLB writer ────────────────────────────────────────────────────────────


def write_glb(mesh, path, color, roughness, metallic=1.0):
    p, n, t = mesh.arrays()
    # Part units are mm with z up; glTF wants meters with y up (a rotation, so winding is kept).
    p = p[:, [0, 2, 1]] * np.array([1, 1, -1]) / 1000.0
    n = n[:, [0, 2, 1]] * np.array([1, 1, -1])
    pos = p.astype("<f4").tobytes()
    nrm = n.astype("<f4").tobytes()
    idx = t.astype("<u4").tobytes()
    blob = pos + nrm + idx
    gltf = {
        "asset": {"version": "2.0", "generator": "make_placeholder_media.py"},
        "scene": 0,
        "scenes": [{"nodes": [0]}],
        "nodes": [{"mesh": 0, "name": path.stem}],
        "meshes": [{"name": path.stem, "primitives": [{"attributes": {"POSITION": 0, "NORMAL": 1}, "indices": 2, "material": 0}]}],
        "materials": [{
            "name": "machined",
            "pbrMetallicRoughness": {"baseColorFactor": [*color, 1.0], "metallicFactor": metallic, "roughnessFactor": roughness},
        }],
        "buffers": [{"byteLength": len(blob)}],
        "bufferViews": [
            {"buffer": 0, "byteOffset": 0, "byteLength": len(pos), "target": 34962},
            {"buffer": 0, "byteOffset": len(pos), "byteLength": len(nrm), "target": 34962},
            {"buffer": 0, "byteOffset": len(pos) + len(nrm), "byteLength": len(idx), "target": 34963},
        ],
        "accessors": [
            {"bufferView": 0, "componentType": 5126, "count": len(p), "type": "VEC3",
             "min": p.min(axis=0).tolist(), "max": p.max(axis=0).tolist()},
            {"bufferView": 1, "componentType": 5126, "count": len(n), "type": "VEC3"},
            {"bufferView": 2, "componentType": 5125, "count": t.size, "type": "SCALAR"},
        ],
    }
    js = json.dumps(gltf, separators=(",", ":")).encode()
    js += b" " * (-len(js) % 4)
    blob += b"\0" * (-len(blob) % 4)
    total = 12 + 8 + len(js) + 8 + len(blob)
    with open(path, "wb") as f:
        f.write(struct.pack("<4sII", b"glTF", 2, total))
        f.write(struct.pack("<I4s", len(js), b"JSON") + js)
        f.write(struct.pack("<I4s", len(blob), b"BIN\0") + blob)
    return path


# ── Product-shot renderer (flat triangles, painter's algorithm) ───────────


def look_at(eye, target):
    f = target - eye
    f /= np.linalg.norm(f)
    r = np.cross(f, [0, 0, 1.0])
    r /= np.linalg.norm(r)
    u = np.cross(r, f)
    return r, u, f


def render(mesh, out, size=(2400, 1500), azimuth=35, elevation=28, distance=3.2, color=(0.78, 0.8, 0.83),
           shininess=60, backdrop=((236, 237, 239), (198, 201, 206)), label="Sample image", fill=0.6, ss=2):
    p, n, t = mesh.arrays()
    center = (p.min(axis=0) + p.max(axis=0)) / 2
    extent = np.linalg.norm(p.max(axis=0) - p.min(axis=0))
    az, el = math.radians(azimuth), math.radians(elevation)
    eye = center + extent * distance * 0.5 * np.array([math.cos(el) * math.cos(az), math.cos(el) * math.sin(az), math.sin(el)])
    r, u, f = look_at(eye, center)
    W, H = size[0] * ss, size[1] * ss
    # Frame the part: fit its on-screen extent to about 60% of the image.
    d = p - eye
    sx, sy = (d @ r) / (d @ f), (d @ u) / (d @ f)
    focal = min(fill * H / (sy.max() - sy.min()), fill * W / (sx.max() - sx.min()))
    cx, cy = (sx.max() + sx.min()) / 2, (sy.max() + sy.min()) / 2

    def project(points):
        d = points - eye
        z = d @ f
        return np.stack([W / 2 + focal * ((d @ r) / z - cx), H * 0.5 - focal * ((d @ u) / z - cy)], axis=-1), z

    # Backdrop: a seamless studio sweep.
    yy = np.linspace(0, 1, H)[:, None]
    xx = np.linspace(-1, 1, W)[None, :]
    top, bottom = np.array(backdrop[0], float), np.array(backdrop[1], float)
    mix = np.clip(yy ** 1.6 + 0.12 * xx ** 2, 0, 1)[..., None]
    bg = top * (1 - mix) + bottom * mix
    img = Image.fromarray(bg.astype(np.uint8), "RGB")

    # Soft contact shadow from the part's footprint on the floor.
    floor = p.copy()
    floor[:, 2] = p[:, 2].min()
    fp, _ = project(floor)
    shadow = Image.new("L", (W, H), 0)
    hull = convex_hull(fp)
    ImageDraw.Draw(shadow).polygon([tuple(x) for x in hull], fill=230)
    wide = shadow.filter(ImageFilter.GaussianBlur(28 * ss))
    tight = shadow.filter(ImageFilter.GaussianBlur(5 * ss)).point(lambda v: v * 0.55)
    for layer in (wide, tight):
        img.paste((40, 42, 46), (0, 0), layer.point(lambda v: v * 0.75))

    # Shade each triangle.
    tri = p[t]
    nrm = n[t].mean(axis=1)
    nrm /= np.linalg.norm(nrm, axis=1, keepdims=True)
    cen = tri.mean(axis=1)
    view = eye - cen
    view /= np.linalg.norm(view, axis=1, keepdims=True)
    visible = np.einsum("ij,ij->i", nrm, view) > -0.05
    lights = [  # direction (toward light), intensity
        (np.array([-0.5, -0.9, 1.1]), 1.0),
        (np.array([1.0, 0.4, 0.5]), 0.45),
        (np.array([0.2, 1.0, 0.25]), 0.55),
    ]
    albedo = np.array(color)
    shade = np.full((len(t), 3), 0.10) * albedo
    for direction, intensity in lights:
        l = direction / np.linalg.norm(direction)
        diff = np.clip(nrm @ l, 0, None)[:, None]
        h = l + view
        h /= np.linalg.norm(h, axis=1, keepdims=True)
        spec = np.clip(np.einsum("ij,ij->i", nrm, h), 0, None)[:, None] ** shininess
        shade += intensity * (0.55 * diff * albedo + 0.9 * spec * (0.6 + 0.4 * albedo))
    # Studio reflection: bright above, dark floor, like a softbox.
    refl = 2 * np.einsum("ij,ij->i", nrm, view)[:, None] * nrm - view
    sky = np.clip(refl[:, 2] * 0.5 + 0.5, 0, 1)[:, None] ** 1.5
    shade += albedo * (0.12 + 0.38 * sky)
    rgb = np.clip(shade, 0, 1) ** (1 / 1.25) * 255

    screen, depth = project(cen)
    order = np.argsort(-depth)
    pts2d, _ = project(tri.reshape(-1, 3))
    pts2d = pts2d.reshape(-1, 3, 2)
    draw = ImageDraw.Draw(img)
    for i in order:
        if visible[i]:
            c = tuple(int(v) for v in rgb[i])
            draw.polygon([tuple(x) for x in pts2d[i]], fill=c, outline=c)

    img = img.resize(size, Image.LANCZOS)
    if label:
        font = ImageFont.load_default(size=max(18, size[0] // 90))
        ImageDraw.Draw(img).text((size[0] // 45, size[1] - size[1] // 18), label, fill=(110, 113, 118), font=font)
    img.save(out, quality=84, optimize=True, progressive=True)
    return out


def convex_hull(points):
    pts = sorted(set(map(tuple, np.round(points, 1))))
    if len(pts) < 3:
        return pts

    def cross(o, a, b):
        return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])

    lower, upper = [], []
    for pt in pts:
        while len(lower) >= 2 and cross(lower[-2], lower[-1], pt) <= 0:
            lower.pop()
        lower.append(pt)
    for pt in reversed(pts):
        while len(upper) >= 2 and cross(upper[-2], upper[-1], pt) <= 0:
            upper.pop()
        upper.append(pt)
    return lower[:-1] + upper[:-1]


def placeholder_plate(out, text, size=(2400, 1500)):
    """A plain 'replace me' image for the template folder."""
    img = Image.new("RGB", size, (226, 228, 232))
    d = ImageDraw.Draw(img)
    w, h = size
    for x in range(0, w, 60):
        d.line([(x, 0), (x, h)], fill=(216, 219, 223), width=2)
    for y in range(0, h, 60):
        d.line([(0, y), (w, y)], fill=(216, 219, 223), width=2)
    font = ImageFont.load_default(size=56)
    box = d.textbbox((0, 0), text, font=font)
    d.text(((w - box[2]) / 2, (h - box[3]) / 2), text, fill=(90, 94, 100), font=font)
    img.save(out, quality=80, optimize=True)


# ── Build everything ──────────────────────────────────────────────────────

ALUMINUM = (0.80, 0.82, 0.85)
ANODIZED_BLUE = (0.20, 0.36, 0.62)
BLACK_OXIDE = (0.16, 0.16, 0.17)
STEEL = (0.62, 0.63, 0.65)

if __name__ == "__main__":
    hub_dir = PROJECTS / "sample-gearbox-output-hub"
    fix_dir = PROJECTS / "sample-fatigue-test-fixture"
    brk_dir = PROJECTS / "sample-bracket-redesign"
    tpl_dir = PROJECTS / "_template"
    upd_dir = ROOT / "src" / "content" / "updates"
    for d in (hub_dir, fix_dir, brk_dir, tpl_dir, upd_dir):
        d.mkdir(parents=True, exist_ok=True)

    hub, adapter, brk = output_hub(), load_adapter(), bracket()
    write_glb(hub, hub_dir / "output-hub.glb", ALUMINUM, roughness=0.32)
    write_glb(adapter, fix_dir / "load-adapter.glb", STEEL, roughness=0.4)

    render(hub, hub_dir / "cover.jpg", azimuth=-55, elevation=30, distance=2.6, color=ALUMINUM)
    render(hub, hub_dir / "top-view.jpg", size=(1800, 1200), azimuth=20, elevation=72, distance=2.5, color=ALUMINUM)
    render(hub, hub_dir / "rev-a.jpg", size=(1800, 1350), azimuth=-120, elevation=18, distance=2.7, color=BLACK_OXIDE,
           backdrop=((214, 216, 220), (170, 174, 180)), shininess=40)
    render(hub, hub_dir / "rev-b.jpg", size=(1800, 1350), azimuth=-20, elevation=40, distance=2.7, color=ANODIZED_BLUE)
    render(hub, hub_dir / "rev-c.jpg", size=(1800, 1350), azimuth=60, elevation=10, distance=2.6, color=ALUMINUM)

    render(adapter, fix_dir / "cover.jpg", azimuth=-40, elevation=22, distance=2.8, color=STEEL)
    for i, (az, el, col) in enumerate([(-10, 35, STEEL), (80, 15, BLACK_OXIDE), (150, 50, STEEL), (-100, 5, ANODIZED_BLUE)], 1):
        render(adapter, fix_dir / f"fixture-{i}.jpg", size=(1800, 1350), azimuth=az, elevation=el, distance=2.8, color=col)

    render(brk, brk_dir / "cover.jpg", azimuth=-35, elevation=25, distance=2.7, color=ALUMINUM)
    render(hub, upd_dir / "2026-10-first-article.jpg", size=(1600, 1000), azimuth=150, elevation=25, distance=2.7,
           color=ANODIZED_BLUE)
    placeholder_plate(tpl_dir / "cover.jpg", "Replace with your cover image")
    print("done")
