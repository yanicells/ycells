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

Next.js, TypeScript, and Three.js. The original model and materials are generated
locally: a fractured pale matrix with dark red, tourmaline-inspired inclusions.
It is an artistic interpretation of a rubidium-bearing mineral specimen, **not
pure elemental rubidium** or a reconstruction of a particular photographed sample.
No third-party photographs, textures, fonts, or model downloads are used.

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

The checked-in poster needs no build-time tools. To update it after changing the
model, use Bun and Blender in background mode:

```sh
bun scripts/export-specimen.ts --output /tmp/ycells-specimen.json
blender --background --python scripts/render-specimen.py -- \
  --input /tmp/ycells-specimen.json --output public/specimen.webp \
  --preview /tmp/ycells-specimen-preview.png --size 1000
```

The poster uses the same mesh and camera fit with approximate Blender lighting;
it is not a browser screenshot. The live version adds pointer-responsive light
and physically based reflections.
