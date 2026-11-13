// news-image-01 entry: "Sum up 13 November's world news in one image".
// The image (entry.png, shipped in this repository) is a news front page for
// Friday 13 November 2026: four stories from that day — Ukraine peace talks
// (Europe wins a seat at the next round), Nvidia chief Jensen Huang resigns,
// an LNG tanker hits a naval mine in the Strait of Hormuz, and China's
// unannounced Pacific drills alarm Taiwan. This program copies those exact
// bytes to the output directory. Node 22, standard library only, no network.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const srcPath = join(dirname(fileURLToPath(import.meta.url)), "entry.png");
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const outPath = join(outDir, "entry.png");

const bytes = readFileSync(srcPath);

// The gate tells the format from the first bytes: JPEG (FF D8 FF) or PNG.
const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
const isPng =
  bytes[0] === 0x89 &&
  bytes[1] === 0x50 &&
  bytes[2] === 0x4e &&
  bytes[3] === 0x47 &&
  bytes[4] === 0x0d &&
  bytes[5] === 0x0a &&
  bytes[6] === 0x1a &&
  bytes[7] === 0x0a;
if (!isJpeg && !isPng) {
  console.error("entry.png is neither a JPEG nor a PNG (bad magic bytes)");
  process.exit(1);
}

// The gate caps the file at 1 MiB and 1024 by 1024 pixels.
const MAX_IMAGE_BYTES = 1048576;
const MAX_DIMENSION = 1024;

if (bytes.length > MAX_IMAGE_BYTES) {
  console.error(`entry.png is ${bytes.length} bytes, over the ${MAX_IMAGE_BYTES}-byte limit`);
  process.exit(1);
}

// Dimensions, parsed from the image header itself (stdlib only): a JPEG's Start
// Of Frame marker carries height then width; a PNG's IHDR chunk carries width
// then height.
function dimensions(buf: Buffer): { width: number; height: number } {
  if (buf[0] === 0xff) {
    // JPEG: walk the segments after the SOI marker until a Start Of Frame.
    let i = 2;
    while (i + 1 < buf.length) {
      if (buf[i] !== 0xff) {
        i++;
        continue;
      }
      const marker = buf[i + 1];
      if (marker === 0xff) {
        i++;
        continue;
      } // fill byte
      if (marker === 0xd9) break; // EOI: no frame found
      if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
        i += 2;
        continue;
      }
      if (i + 3 >= buf.length) break;
      const len = buf.readUInt16BE(i + 2);
      if (
        [0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(
          marker,
        )
      ) {
        return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
      }
      i += 2 + len;
    }
    throw new Error("no JPEG Start Of Frame marker found");
  }
  if (buf.toString("ascii", 12, 16) !== "IHDR") throw new Error("PNG has no IHDR chunk");
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

const { width, height } = dimensions(bytes);
if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
  console.error(`entry.png is ${width}x${height}, over the ${MAX_DIMENSION}x${MAX_DIMENSION} limit`);
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
writeFileSync(outPath, bytes);
console.log(
  `wrote ${bytes.length} bytes (${isJpeg ? "JPEG" : "PNG"}, ${width}x${height}) to ${outPath}`,
);
