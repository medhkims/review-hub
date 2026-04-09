/**
 * Generates app icon, adaptive icon, splash screen, and favicon
 * using pure Node.js (no external dependencies).
 * Theme: #0F172A midnight background + #A855F7 purple star
 */
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

// ── CRC32 ────────────────────────────────────────────────────────────────────
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  crcTable[n] = c;
}
function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) crc = crcTable[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}
function pngChunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const t = Buffer.from(type, 'ascii');
  const c = Buffer.alloc(4); c.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, c]);
}
const PNG_SIG = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

// ── PNG writers ───────────────────────────────────────────────────────────────
function writeRGB(filePath, w, h, getPixel) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 2; // bit depth 8, color type RGB
  const raw = Buffer.alloc(h * (1 + w * 3));
  for (let y = 0; y < h; y++) {
    raw[y * (w * 3 + 1)] = 0;
    for (let x = 0; x < w; x++) {
      const [r, g, b] = getPixel(x, y);
      const i = y * (w * 3 + 1) + 1 + x * 3;
      raw[i] = r; raw[i + 1] = g; raw[i + 2] = b;
    }
  }
  const compressed = zlib.deflateSync(raw, { level: 6 });
  fs.writeFileSync(filePath, Buffer.concat([PNG_SIG, pngChunk('IHDR', ihdr), pngChunk('IDAT', compressed), pngChunk('IEND', Buffer.alloc(0))]));
  console.log(`  ✓ ${filePath}`);
}

function writeRGBA(filePath, w, h, getPixel) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; // bit depth 8, color type RGBA
  const raw = Buffer.alloc(h * (1 + w * 4));
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0;
    for (let x = 0; x < w; x++) {
      const [r, g, b, a] = getPixel(x, y);
      const i = y * (w * 4 + 1) + 1 + x * 4;
      raw[i] = r; raw[i + 1] = g; raw[i + 2] = b; raw[i + 3] = a;
    }
  }
  const compressed = zlib.deflateSync(raw, { level: 6 });
  fs.writeFileSync(filePath, Buffer.concat([PNG_SIG, pngChunk('IHDR', ihdr), pngChunk('IDAT', compressed), pngChunk('IEND', Buffer.alloc(0))]));
  console.log(`  ✓ ${filePath}`);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/**
 * Signed distance to a 5-pointed star.
 * Returns negative values inside the star (SDF).
 */
function starSDF(px, py, cx, cy, outerR, innerR) {
  const dx = px - cx, dy = py - cy;
  const angle = Math.atan2(dy, dx);
  const dist = Math.sqrt(dx * dx + dy * dy);
  const n = 5;
  const sector = (2 * Math.PI) / n;
  // Normalise angle so first outer point is at top (−π/2)
  const a = ((angle + Math.PI / 2) % sector + sector) % sector;
  const halfS = sector / 2;
  const t = Math.abs(a - halfS) / halfS; // 1 at tip, 0 at valley
  const r = lerp(innerR, outerR, t);
  return dist - r;
}

// ── Pixel functions ───────────────────────────────────────────────────────────

/**
 * Icon pixel: midnight bg + radial purple glow + white star with purple tint.
 */
function iconPixel(x, y, w = 1024, h = 1024) {
  const cx = w / 2, cy = h / 2;

  // Radial background glow: midnight #0F172A → slightly purple #1a1040 at center
  const dx = (x - cx) / (w * 0.45);
  const dy = (y - cy) / (h * 0.45);
  const glowDist = Math.sqrt(dx * dx + dy * dy);
  const glowT = clamp(glowDist, 0, 1);

  const bgR = Math.round(lerp(30, 15, glowT));
  const bgG = Math.round(lerp(18, 23, glowT));
  const bgB = Math.round(lerp(55, 42, glowT));

  // Outer glow ring around star (soft purple halo)
  const outerR = w * 0.37;
  const innerR = outerR * 0.4; // classic star ratio ≈ 0.382
  const sdf = starSDF(x, y, cx, cy, outerR, innerR);

  // Glow: up to 80px outside star
  const glowRadius = w * 0.09;
  const glowAlpha = clamp(1 - sdf / glowRadius, 0, 1);
  const glowR = Math.round(lerp(bgR, 130, glowAlpha * 0.45));
  const glowG = Math.round(lerp(bgG, 40, glowAlpha * 0.45));
  const glowB = Math.round(lerp(bgB, 220, glowAlpha * 0.45));

  // Star fill: gradient from bright white centre to primary #A855F7 tip
  const starFillT = clamp(1 - (-sdf) / outerR, 0, 1); // 0 = deep inside, 1 = at tip
  const starR = Math.round(lerp(255, 168, starFillT));
  const starG = Math.round(lerp(255, 85, starFillT));
  const starB = Math.round(lerp(255, 247, starFillT));

  // Anti-alias edge (2px)
  const aa = clamp(-sdf / 2.0, 0, 1);

  const r = Math.round(lerp(glowR, starR, aa));
  const g = Math.round(lerp(glowG, starG, aa));
  const b = Math.round(lerp(glowB, starB, aa));

  return [clamp(r, 0, 255), clamp(g, 0, 255), clamp(b, 0, 255)];
}

/**
 * Adaptive icon: transparent bg, purple-to-white star (safe zone 66%).
 * Foreground fills 108dp canvas; star is inset to fit safe zone.
 */
function adaptivePixel(x, y, w = 1024, h = 1024) {
  const cx = w / 2, cy = h / 2;
  // Scale star down to 66% for safe zone
  const outerR = w * 0.30;
  const innerR = outerR * 0.4;
  const sdf = starSDF(x, y, cx, cy, outerR, innerR);

  // Glow
  const glowRadius = w * 0.07;
  const glowAlpha = clamp(1 - sdf / glowRadius, 0, 1);

  const starFillT = clamp(1 - (-sdf) / outerR, 0, 1);
  const starR = Math.round(lerp(255, 168, starFillT));
  const starG = Math.round(lerp(255, 85, starFillT));
  const starB = Math.round(lerp(255, 247, starFillT));

  const aa = clamp(-sdf / 2.0, 0, 1);
  const glowA = Math.round(glowAlpha * 180); // semi-transparent glow
  const fillA = Math.round(aa * 255);

  if (fillA > 0) {
    return [starR, starG, starB, fillA];
  }
  // Glow only
  return [168, 85, 247, glowA];
}

/**
 * Splash: solid midnight bg with centred icon (same as iconPixel but scaled).
 */
function splashPixel(x, y, w = 1284, h = 2778) {
  // Map to the icon's 1024x1024 space, centred
  const iconSize = Math.min(w, h) * 0.45;
  const startX = (w - iconSize) / 2;
  const startY = (h - iconSize) / 2;

  if (x < startX || x >= startX + iconSize || y < startY || y >= startY + iconSize) {
    // Outside icon area: plain midnight
    return [15, 23, 42];
  }

  const lx = Math.floor(((x - startX) / iconSize) * 1024);
  const ly = Math.floor(((y - startY) / iconSize) * 1024);
  return iconPixel(lx, ly, 1024, 1024);
}

// ── Generate ──────────────────────────────────────────────────────────────────
const outDir = path.join(__dirname, '../assets/images');
fs.mkdirSync(outDir, { recursive: true });

console.log('Generating app assets...');
writeRGB(path.join(outDir, 'icon.png'), 1024, 1024, iconPixel);
writeRGBA(path.join(outDir, 'adaptive-icon.png'), 1024, 1024, adaptivePixel);
writeRGB(path.join(outDir, 'splash.png'), 1284, 2778, splashPixel);
writeRGB(path.join(outDir, 'favicon.png'), 48, 48,
  (x, y) => iconPixel(Math.floor(x / 48 * 1024), Math.floor(y / 48 * 1024)));
console.log('All assets generated.');
