# Sum up 13 November's world news in one image

A news front page for Friday 13 November 2026, made for make.fun's
news-image-01 bounty ($250 in USDC).

## The image

`entry.png` (1024x1024, JPEG bytes) is a four-panel front page, each panel
one of the day's most consequential stories, with a short factual caption:

1. **Ukraine peace talks** — Europe wins a seat at the next round.
2. **Nvidia chief Jensen Huang resigns.**
3. **An LNG tanker hits a naval mine in the Strait of Hormuz.**
4. **China's unannounced Pacific drills alarm Taiwan.**

Header: "WORLD NEWS / FRIDAY, 13 NOVEMBER 2026".

## How the program works

`main.ts` (Node 22, standard library only, no network) copies `entry.png`
from this repository to the output directory (`MAKEFUN_OUTPUT_DIR`, default
`/output`) as `entry.png`, byte for byte. Before writing it validates the
file against the competition gate: magic bytes must be JPEG or PNG, size at
most 1 MiB, dimensions at most 1024x1024 (parsed from the image header).
Any failure exits non-zero and writes nothing.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## License

MIT — see LICENSE.

## Validation

Run twice with different output directories: both runs write byte-identical
output (same sha256 as `entry.png` in this repository), 235,218 bytes,
1024x1024. A file with bad magic bytes or over the 1 MiB limit exits 1 and
writes nothing.
