"""Converts a CAD export (STL, OBJ, PLY, 3MF, or STEP) into a small .glb file
for the website's 3D viewer.

Setup, once (needs Python 3.9 or newer):
    pip install trimesh numpy
    pip install cascadio        # only needed for STEP files

Use:
    python3 scripts/convert_to_glb.py path/to/part.stl
    python3 scripts/convert_to_glb.py part.step --out src/content/projects/my-project/part.glb
    python3 scripts/convert_to_glb.py part.stl --units in --color 0.2,0.35,0.6

What it does:
- Loads the file and merges everything into one mesh.
- Converts units to meters (the 3D viewer's unit), centers the part, and turns it so
  CAD's "Z is up" becomes the viewer's "Y is up".
- Optionally simplifies dense meshes (--max-faces) so the file stays small.
- Gives it a metal material (--color, --roughness).
"""

import argparse
import sys
from pathlib import Path

try:
    import numpy as np
    import trimesh
except ImportError:
    sys.exit("This script needs trimesh and numpy. Install them with:  pip install trimesh numpy")

UNITS_TO_METERS = {"mm": 0.001, "cm": 0.01, "m": 1.0, "in": 0.0254}


def main():
    ap = argparse.ArgumentParser(description="Convert STL/STEP/OBJ to a web-ready GLB.")
    ap.add_argument("input", type=Path)
    ap.add_argument("--out", type=Path, help="output .glb path (default: next to the input)")
    ap.add_argument("--units", default="mm", choices=UNITS_TO_METERS, help="units the CAD file is in (default mm)")
    ap.add_argument("--max-faces", type=int, default=150_000, help="simplify meshes with more faces than this")
    ap.add_argument("--color", default="0.80,0.82,0.85", help="base color as r,g,b from 0 to 1 (default aluminum)")
    ap.add_argument("--roughness", type=float, default=0.35, help="0 = mirror, 1 = matte (default 0.35)")
    ap.add_argument("--metallic", type=float, default=1.0, help="1 = metal, 0 = plastic (default 1)")
    args = ap.parse_args()

    if not args.input.exists():
        sys.exit(f"Can't find {args.input}")
    if args.input.suffix.lower() in (".step", ".stp"):
        try:
            import cascadio  # noqa: F401  (lets trimesh read STEP)
        except ImportError:
            sys.exit("STEP files need one more package:  pip install cascadio\n"
                     "Or export an STL from your CAD program and convert that instead.")

    # force="mesh" merges multi-part files (assemblies, multi-body STEP) into one mesh.
    mesh = trimesh.load(args.input, force="mesh")
    if mesh.is_empty:
        sys.exit(f"{args.input} loaded but has no geometry. Try exporting it again from your CAD program.")
    mesh.apply_scale(UNITS_TO_METERS[args.units])
    mesh.apply_translation(-mesh.bounds.mean(axis=0))
    mesh.apply_transform(trimesh.transformations.rotation_matrix(-np.pi / 2, [1, 0, 0]))  # Z-up to Y-up

    if len(mesh.faces) > args.max_faces:
        try:
            mesh = mesh.simplify_quadric_decimation(face_count=args.max_faces)
        except Exception as e:  # simplification needs an optional package
            print(f"Couldn't simplify ({e}). Try:  pip install fast-simplification", file=sys.stderr)

    # Smooth shading on curved faces, sharp edges where faces meet at more than 30 degrees.
    try:
        mesh = trimesh.graph.smooth_shade(mesh, angle=np.radians(30))
    except Exception:
        pass  # older trimesh: keep the default shading

    r, g, b = (float(x) for x in args.color.split(","))
    mesh.visual = trimesh.visual.TextureVisuals(material=trimesh.visual.material.PBRMaterial(
        baseColorFactor=[r, g, b, 1.0], metallicFactor=args.metallic, roughnessFactor=args.roughness))

    out = args.out or args.input.with_suffix(".glb")
    out.parent.mkdir(parents=True, exist_ok=True)
    mesh.export(out)
    size_kb = out.stat().st_size / 1024
    print(f"Wrote {out} ({size_kb:.0f} KB, {len(mesh.faces):,} faces)")
    if size_kb > 5000:
        print("That's over 5 MB. Lower --max-faces (e.g. 60000) to make it load faster.")


if __name__ == "__main__":
    main()
