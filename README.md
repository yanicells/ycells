# Rb

A single interactive mineral specimen on black. No visible text or interface.

```sh
pnpm install
pnpm dev
```

Drag or swipe to rotate; scroll or pinch to zoom. Double-click to reset.
Keyboard: focus the specimen with Tab, use arrow keys to rotate, `+` / `-`
to zoom, and Home or Escape to reset.

## Implementation

Next.js, TypeScript, and Three.js. The specimen is generated locally with no
downloaded models or textures: a fractured smoky-quartz block with iron-oxide
staining, dark mica, a chalky pocket, translucent rubellite (pink tourmaline)
prisms and olive-green crystals. It is an artistic interpretation of a
rubidium-bearing mineral specimen, **not pure elemental rubidium**.

- `rock.ts` carves the block from fracture planes, bakes cavity shading, and
  computes broad colour per vertex.
- `rockMaterial.ts` draws the fine detail per pixel in object space: cellular
  mineral grains, feldspar flecks, sugary rust, and micro-relief bump.
- `crystals.ts` builds the striated hexagonal prisms; `mineral.ts` assembles
  and places them, and `scene.ts` sets up lighting and controls.

The 3D engine loads separately from the page. Rendering runs on demand, pauses in
hidden tabs, and caps the drawing-buffer resolution. Reduced motion disables
inertia, animated lighting, and the entrance fade. A locally rendered poster
remains available without JavaScript or WebGL.

```sh
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

Reference: [rubidium's properties and occurrence](https://periodic-table.rsc.org/element/37/rubidium).

## Regenerating the poster

The checked-in poster (`public/specimen.webp`) is a 1000×1000 capture of the live
scene, shown until WebGL is ready. Rebuild it after changing the model or camera:

```sh
pnpm build && pnpm start -p 3112 &
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new \
  --screenshot=/tmp/poster.png --window-size=1000,1000 --hide-scrollbars \
  --virtual-time-budget=40000 --use-angle=swiftshader --enable-unsafe-swiftshader \
  --ignore-gpu-blocklist http://localhost:3112
```

Then convert `/tmp/poster.png` to WebP (for example with Pillow:
`Image.open(...).save("public/specimen.webp", "WEBP", quality=88)`).
`scripts/export-specimen.ts` and `scripts/render-specimen.py` are the older Blender
route; they do not reproduce the shader-based surface.
