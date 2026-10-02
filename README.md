# ycells records

A record collection for three independent projects: SimplifyTrabaho, UniSort, and
airosu. Each project is an album, and its features are the tracks.

Pick a sleeve to put its record on the turntable. Flip the sleeves to read their
tracklists, select a track to explore a feature, and follow its link to the real
project. The player includes play/pause, previous/next, and a seekable 30-second
preview that advances through the feature tracks.

Sound starts muted. The optional listening mode plays original synth loops made
with Web Audio; it uses no song files or third-party samples. Playback pauses when
the tab is hidden. Reduced motion disables record rotation and sleeve animations.
On mobile, the collection becomes a shelf you can swipe through.

## Development

```sh
pnpm install
pnpm dev
```

## Checks

```sh
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

## Artwork and content

The three original sleeve photographs were generated with the built-in imagegen
tool and optimized as WebP files in `public/records/`. The exact prompts are in
`scripts/record-artwork-prompts.json`.

Project descriptions, feature tracks, and destinations are grounded in each
project's local source. SimplifyTrabaho's briefcase mark is copied from its brand
assets. UniSort's newspaper wordmark and airosu's pink cookie mark are adapted
from their existing interfaces.

The collection lives in `components/records/`. Album data is in `catalog.ts`,
playback state is in `player-state.ts`, and original audio is in `sound.ts`.
