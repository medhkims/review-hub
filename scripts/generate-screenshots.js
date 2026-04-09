/**
 * Generates 5 App Store screenshots (1284×2778px) for TChecki
 * Pure Node.js — no external dependencies.
 */
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

// ── PNG helpers ───────────────────────────────────────────────────────────────
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
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const t = Buffer.from(type, 'ascii');
  const c = Buffer.alloc(4); c.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, c]);
}
const SIG = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function writePNG(filePath, w, h, pixels) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 2;
  const raw = Buffer.alloc(h * (1 + w * 3));
  for (let y = 0; y < h; y++) {
    raw[y * (w * 3 + 1)] = 0;
    for (let x = 0; x < w; x++) {
      const [r, g, b] = pixels[y * w + x];
      const i = y * (w * 3 + 1) + 1 + x * 3;
      raw[i] = r; raw[i + 1] = g; raw[i + 2] = b;
    }
  }
  const comp = zlib.deflateSync(raw, { level: 6 });
  fs.writeFileSync(filePath, Buffer.concat([SIG, chunk('IHDR', ihdr), chunk('IDAT', comp), chunk('IEND', Buffer.alloc(0))]));
  console.log(`  ✓ ${path.basename(filePath)}`);
}

// ── Colours ───────────────────────────────────────────────────────────────────
const C = {
  bg:        [15, 23, 42],       // #0F172A midnight
  card:      [30, 41, 59],       // #1E293B card
  cardLight: [51, 65, 85],       // #334155
  purple:    [168, 85, 247],     // #A855F7
  purpleDim: [109, 40, 217],     // #6D28D9
  white:     [255, 255, 255],
  gray:      [148, 163, 184],    // #94A3B8
  grayDim:   [71, 85, 105],      // #475569
  gold:      [251, 191, 36],     // #FBBF24
  green:     [34, 197, 94],      // #22C55E
  red:       [239, 68, 68],      // #EF4444
  teal:      [20, 184, 166],     // #14B8A6
  orange:    [249, 115, 22],     // #F97316
};

const W = 1284, H = 2778;

// ── Drawing primitives ────────────────────────────────────────────────────────
function makeCanvas(bg = C.bg) {
  const px = new Array(W * H);
  for (let i = 0; i < px.length; i++) px[i] = [...bg];
  return px;
}

function setPixel(px, x, y, col) {
  if (x < 0 || x >= W || y < 0 || y >= H) return;
  px[y * W + x] = col;
}

function fillRect(px, x, y, w, h, col) {
  for (let dy = 0; dy < h; dy++)
    for (let dx = 0; dx < w; dx++)
      setPixel(px, x + dx, y + dy, col);
}

function fillRoundRect(px, x, y, w, h, r, col) {
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      const cx = x + dx, cy = y + dy;
      // corner checks
      if (dx < r && dy < r && (dx - r) ** 2 + (dy - r) ** 2 > r * r) continue;
      if (dx >= w - r && dy < r && (dx - (w - r - 1)) ** 2 + (dy - r) ** 2 > r * r) continue;
      if (dx < r && dy >= h - r && (dx - r) ** 2 + (dy - (h - r - 1)) ** 2 > r * r) continue;
      if (dx >= w - r && dy >= h - r && (dx - (w - r - 1)) ** 2 + (dy - (h - r - 1)) ** 2 > r * r) continue;
      setPixel(px, cx, cy, col);
    }
  }
}

function fillCircle(px, cx, cy, r, col) {
  for (let dy = -r; dy <= r; dy++)
    for (let dx = -r; dx <= r; dx++)
      if (dx * dx + dy * dy <= r * r)
        setPixel(px, cx + dx, cy + dy, col);
}

// Simple bitmap font — each char is 5×7, encoded as 5 column bytes (LSB=top)
const FONT = {
  ' ': [0,0,0,0,0],
  'A': [0x7E,0x11,0x11,0x11,0x7E],
  'B': [0x7F,0x49,0x49,0x49,0x36],
  'C': [0x3E,0x41,0x41,0x41,0x22],
  'D': [0x7F,0x41,0x41,0x22,0x1C],
  'E': [0x7F,0x49,0x49,0x49,0x41],
  'F': [0x7F,0x09,0x09,0x09,0x01],
  'G': [0x3E,0x41,0x49,0x49,0x7A],
  'H': [0x7F,0x08,0x08,0x08,0x7F],
  'I': [0x41,0x7F,0x41,0,0],
  'J': [0x20,0x40,0x41,0x3F,0x01],
  'K': [0x7F,0x08,0x14,0x22,0x41],
  'L': [0x7F,0x40,0x40,0x40,0x40],
  'M': [0x7F,0x02,0x0C,0x02,0x7F],
  'N': [0x7F,0x04,0x08,0x10,0x7F],
  'O': [0x3E,0x41,0x41,0x41,0x3E],
  'P': [0x7F,0x09,0x09,0x09,0x06],
  'Q': [0x3E,0x41,0x51,0x21,0x5E],
  'R': [0x7F,0x09,0x19,0x29,0x46],
  'S': [0x46,0x49,0x49,0x49,0x31],
  'T': [0x01,0x01,0x7F,0x01,0x01],
  'U': [0x3F,0x40,0x40,0x40,0x3F],
  'V': [0x1F,0x20,0x40,0x20,0x1F],
  'W': [0x3F,0x40,0x38,0x40,0x3F],
  'X': [0x63,0x14,0x08,0x14,0x63],
  'Y': [0x07,0x08,0x70,0x08,0x07],
  'Z': [0x61,0x51,0x49,0x45,0x43],
  'a': [0x20,0x54,0x54,0x54,0x78],
  'b': [0x7F,0x48,0x44,0x44,0x38],
  'c': [0x38,0x44,0x44,0x44,0x20],
  'd': [0x38,0x44,0x44,0x48,0x7F],
  'e': [0x38,0x54,0x54,0x54,0x18],
  'f': [0x08,0x7E,0x09,0x01,0x02],
  'g': [0x08,0x14,0x54,0x54,0x3C],
  'h': [0x7F,0x08,0x04,0x04,0x78],
  'i': [0x44,0x7D,0x40,0,0],
  'j': [0x20,0x40,0x44,0x3D,0],
  'k': [0x7F,0x10,0x28,0x44,0],
  'l': [0x41,0x7F,0x40,0,0],
  'm': [0x7C,0x04,0x18,0x04,0x78],
  'n': [0x7C,0x08,0x04,0x04,0x78],
  'o': [0x38,0x44,0x44,0x44,0x38],
  'p': [0x7C,0x14,0x14,0x14,0x08],
  'q': [0x08,0x14,0x14,0x18,0x7C],
  'r': [0x7C,0x08,0x04,0x04,0x08],
  's': [0x48,0x54,0x54,0x54,0x20],
  't': [0x04,0x3F,0x44,0x40,0x20],
  'u': [0x3C,0x40,0x40,0x20,0x7C],
  'v': [0x1C,0x20,0x40,0x20,0x1C],
  'w': [0x3C,0x40,0x30,0x40,0x3C],
  'x': [0x44,0x28,0x10,0x28,0x44],
  'y': [0x0C,0x50,0x50,0x50,0x3C],
  'z': [0x44,0x64,0x54,0x4C,0x44],
  '0': [0x3E,0x51,0x49,0x45,0x3E],
  '1': [0x00,0x42,0x7F,0x40,0x00],
  '2': [0x42,0x61,0x51,0x49,0x46],
  '3': [0x21,0x41,0x45,0x4B,0x31],
  '4': [0x18,0x14,0x12,0x7F,0x10],
  '5': [0x27,0x45,0x45,0x45,0x39],
  '6': [0x3C,0x4A,0x49,0x49,0x30],
  '7': [0x01,0x71,0x09,0x05,0x03],
  '8': [0x36,0x49,0x49,0x49,0x36],
  '9': [0x06,0x49,0x49,0x29,0x1E],
  '.': [0x00,0x60,0x60,0x00,0x00],
  ',': [0x00,0x50,0x30,0x00,0x00],
  '!': [0x00,0x5F,0x00,0x00,0x00],
  '?': [0x02,0x01,0x51,0x09,0x06],
  '/': [0x20,0x10,0x08,0x04,0x02],
  '\\': [0x02,0x04,0x08,0x10,0x20],
  '-': [0x08,0x08,0x08,0x08,0x08],
  '+': [0x08,0x08,0x3E,0x08,0x08],
  ':': [0x00,0x36,0x36,0x00,0x00],
  '*': [0x14,0x08,0x3E,0x08,0x14],
  '(': [0x1C,0x22,0x41,0x00,0x00],
  ')': [0x00,0x41,0x22,0x1C,0x00],
  '#': [0x14,0x7F,0x14,0x7F,0x14],
  '@': [0x3E,0x41,0x5D,0x55,0x1E],
  '&': [0x26,0x49,0x55,0x22,0x50],
  '%': [0x23,0x13,0x08,0x64,0x62],
  '\'': [0x03,0x00,0x00,0x00,0x00],
  '"': [0x03,0x00,0x03,0x00,0x00],
  '>': [0x41,0x22,0x14,0x08,0x00],
  '<': [0x00,0x08,0x14,0x22,0x41],
  '|': [0x00,0x7F,0x00,0x00,0x00],
  '_': [0x40,0x40,0x40,0x40,0x40],
  '~': [0x08,0x04,0x08,0x10,0x08],
};

function drawChar(px, ch, x, y, col, scale = 1) {
  const cols = FONT[ch] || FONT[' '];
  for (let c = 0; c < 5; c++) {
    const colByte = cols[c];
    for (let row = 0; row < 7; row++) {
      if (colByte & (1 << row)) {
        fillRect(px, x + c * scale, y + row * scale, scale, scale, col);
      }
    }
  }
}

function drawText(px, text, x, y, col, scale = 1) {
  let cx = x;
  for (const ch of text) {
    drawChar(px, ch, cx, y, col, scale);
    cx += (5 + 1) * scale;
  }
}

function textWidth(text, scale = 1) {
  return text.length * (5 + 1) * scale;
}

function drawTextCentered(px, text, cx, y, col, scale = 1) {
  const w = textWidth(text, scale);
  drawText(px, text, cx - Math.floor(w / 2), y, col, scale);
}

// ── Shared UI components ──────────────────────────────────────────────────────

function drawStatusBar(px) {
  fillRect(px, 0, 0, W, 50, C.bg);
  drawText(px, '9:41', 60, 18, C.white, 2);
  // battery
  fillRoundRect(px, W - 120, 18, 60, 22, 4, C.white);
  fillRect(px, W - 58, 24, 6, 10, C.white);
  fillRoundRect(px, W - 118, 20, 50, 18, 3, C.green);
  // wifi dots
  for (let i = 0; i < 3; i++) fillCircle(px, W - 170 + i * 20, 28, 5 + i * 2, C.white);
}

function drawTabBar(px) {
  fillRect(px, 0, H - 140, W, 140, C.card);
  fillRect(px, 0, H - 141, W, 1, C.cardLight);
  const tabs = [
    { label: 'Home',    icon: 'H', x: 128  },
    { label: 'Search',  icon: 'S', x: 385  },
    { label: 'Notifs',  icon: 'N', x: 642  },
    { label: 'Wishlist',icon: 'W', x: 899  },
    { label: 'Profile', icon: 'P', x: 1156 },
  ];
  tabs.forEach(({ label, icon, x }, i) => {
    const active = i === 0;
    const col = active ? C.purple : C.grayDim;
    if (active) fillCircle(px, x, H - 100, 30, [50, 20, 80]);
    drawTextCentered(px, icon, x, H - 115, col, 3);
    drawTextCentered(px, label, x, H - 68, col, 1);
  });
}

function drawSearchBar(px, y, placeholder = 'Search businesses...') {
  fillRoundRect(px, 40, y, W - 80, 80, 20, C.card);
  drawText(px, placeholder, 110, y + 28, C.grayDim, 2);
  fillCircle(px, W - 100, y + 40, 20, C.purple);
  drawText(px, 'S', W - 107, y + 33, C.white, 1);
}

function drawStars(px, x, y, rating, scale = 2) {
  for (let i = 0; i < 5; i++) {
    const col = i < rating ? C.gold : C.cardLight;
    fillRect(px, x + i * (8 * scale + 4), y, 8 * scale, 8 * scale, col);
  }
}

function drawBusinessCard(px, y, name, category, rating, reviews, tag, tagCol) {
  fillRoundRect(px, 40, y, W - 80, 200, 20, C.card);
  // cover image area
  fillRoundRect(px, 40, y, W - 80, 110, 20, C.cardLight);
  // gradient overlay
  for (let i = 0; i < 60; i++) {
    const alpha = i / 60;
    const col = [
      Math.round(C.card[0] * alpha + C.cardLight[0] * (1 - alpha)),
      Math.round(C.card[1] * alpha + C.cardLight[1] * (1 - alpha)),
      Math.round(C.card[2] * alpha + C.cardLight[2] * (1 - alpha)),
    ];
    fillRect(px, 40, y + 50 + i, W - 80, 1, col);
  }
  // logo circle
  fillCircle(px, 130, y + 90, 38, C.bg);
  fillCircle(px, 130, y + 90, 32, C.purple);
  drawTextCentered(px, name[0], 130, y + 82, C.white, 3);
  // name & category
  drawText(px, name, 185, y + 118, C.white, 3);
  drawText(px, category, 185, y + 155, C.gray, 2);
  // stars
  drawStars(px, 185, y + 120 + 60, Math.round(rating));
  drawText(px, '(' + reviews + ')', 185 + 5 * 20 + 10, y + 182, C.grayDim, 2);
  // tag badge
  if (tag) {
    fillRoundRect(px, W - 200, y + 145, 150, 36, 10, tagCol);
    drawTextCentered(px, tag, W - 125, y + 155, C.white, 2);
  }
}

function drawSectionTitle(px, title, y) {
  drawText(px, title, 40, y, C.white, 3);
}

function drawCategoryPill(px, x, y, label, col) {
  fillRoundRect(px, x, y, 200, 70, 20, col);
  drawTextCentered(px, label, x + 100, y + 26, C.white, 2);
}

function drawNotifCard(px, y, title, body, time, read) {
  fillRoundRect(px, 40, y, W - 80, 150, 16, read ? C.card : [25, 35, 55]);
  if (!read) fillCircle(px, 70, y + 50, 10, C.purple);
  drawText(px, title, 100, y + 28, C.white, 2);
  drawText(px, body, 100, y + 68, C.gray, 2);
  drawText(px, time, 100, y + 108, C.grayDim, 2);
}

function drawReviewCard(px, y, author, text, rating, time) {
  fillRoundRect(px, 40, y, W - 80, 200, 16, C.card);
  fillCircle(px, 100, y + 60, 36, C.purpleDim);
  drawTextCentered(px, author[0], 100, y + 48, C.white, 3);
  drawText(px, author, 150, y + 32, C.white, 2);
  drawStars(px, 150, y + 72, rating);
  drawText(px, time, 150 + 5 * 20 + 20, y + 72, C.grayDim, 2);
  drawText(px, text.substring(0, 30), 60, y + 120, C.gray, 2);
  if (text.length > 30) drawText(px, text.substring(30, 60), 60, y + 152, C.gray, 2);
}

// ── Screenshot 1: Home / Discover ────────────────────────────────────────────
function makeScreenshot1() {
  const px = makeCanvas();
  drawStatusBar(px);

  // header gradient
  for (let y = 50; y < 280; y++) {
    const t = (y - 50) / 230;
    const col = [
      Math.round(30 + 20 * (1 - t)),
      Math.round(10 + 10 * (1 - t)),
      Math.round(60 + 30 * (1 - t)),
    ];
    fillRect(px, 0, y, W, 1, col);
  }

  drawTextCentered(px, 'Good Morning!', W / 2, 80, C.gray, 2);
  drawTextCentered(px, 'Discover TChecki', W / 2, 118, C.white, 4);

  drawSearchBar(px, 240);

  // Banner
  fillRoundRect(px, 40, 360, W - 80, 220, 20, [35, 20, 70]);
  for (let x = 40; x < W - 40; x++) {
    const t = (x - 40) / (W - 80);
    fillRect(px, x, 360, 1, 220, [
      Math.round(80 + 88 * t),
      Math.round(20 + 20 * t),
      Math.round(120 + 127 * t),
    ]);
  }
  drawTextCentered(px, 'Summer Deals', W / 2, 420, C.white, 4);
  drawTextCentered(px, 'Up to 50% off local restaurants', W / 2, 475, [220, 190, 255], 2);
  fillRoundRect(px, W / 2 - 130, 520, 260, 50, 15, C.purple);
  drawTextCentered(px, 'Explore Now', W / 2, 534, C.white, 2);

  // Categories
  drawSectionTitle(px, 'Categories', 625);
  const cats = [
    ['Food', C.orange],
    ['Cafe', C.teal],
    ['Health', C.green],
    ['Shop', C.purpleDim],
    ['Beauty', [219, 39, 119]],
  ];
  cats.forEach(([label, col], i) => {
    drawCategoryPill(px, 40 + i * 240, 680, label, col);
  });

  drawSectionTitle(px, 'Top Rated', 800);
  drawBusinessCard(px, 850, 'Le Baroque', 'Restaurant', 5, '128', 'OPEN', C.green);
  drawBusinessCard(px, 1075, 'Sushi House', 'Japanese', 4, '89', 'NEW', C.teal);
  drawBusinessCard(px, 1300, 'Cafe Bloom', 'Cafe', 5, '214', 'HOT', C.orange);

  drawSectionTitle(px, 'Near You', 1540);
  drawBusinessCard(px, 1590, 'Pizza Roma', 'Italian', 4, '76', 'OPEN', C.green);
  drawBusinessCard(px, 1815, 'Green Spa', 'Wellness', 5, '45', 'PREM', C.purple);

  drawTabBar(px);

  // Promo label
  fillRoundRect(px, W / 2 - 300, H - 170, 600, 0, 0, C.bg);

  return px;
}

// ── Screenshot 2: Business Detail ────────────────────────────────────────────
function makeScreenshot2() {
  const px = makeCanvas();
  drawStatusBar(px);

  // Cover image
  for (let y = 50; y < 420; y++) {
    const t = y / 420;
    fillRect(px, 0, y, W, 1, [
      Math.round(50 + 80 * t),
      Math.round(15 + 30 * t),
      Math.round(100 + 80 * t),
    ]);
  }

  // Gradient overlay on cover
  for (let y = 300; y < 420; y++) {
    const t = (y - 300) / 120;
    fillRect(px, 0, y, W, 1, [
      Math.round(15 * t),
      Math.round(23 * t),
      Math.round(42 * t),
    ]);
  }

  // Back button
  fillCircle(px, 80, 100, 36, [0, 0, 0, 120]);
  drawText(px, '<', 68, 89, C.white, 3);

  // Wishlist button
  fillCircle(px, W - 80, 100, 36, [0, 0, 0, 120]);
  drawText(px, '*', W - 95, 89, C.gold, 3);

  // Business info card
  fillRoundRect(px, 0, 380, W, H - 380 - 140, 30, C.bg);
  fillCircle(px, 160, 380, 80, C.bg);
  fillCircle(px, 160, 380, 70, C.purple);
  drawTextCentered(px, 'L', 160, 355, C.white, 5);

  drawText(px, 'Le Baroque', 270, 400, C.white, 4);
  drawText(px, 'Fine Dining Restaurant', 270, 455, C.gray, 2);

  drawStars(px, 270, 500, 5, 2);
  drawText(px, '4.9  (128 reviews)', 270 + 5 * 20 + 10, 500, C.gray, 2);

  // Open badge
  fillRoundRect(px, 270, 545, 130, 40, 12, [20, 60, 30]);
  fillCircle(px, 295, 565, 8, C.green);
  drawText(px, 'OPEN', 310, 553, C.green, 2);

  // Price range
  fillRoundRect(px, 420, 545, 100, 40, 12, C.card);
  drawText(px, '$$$', 435, 553, C.gold, 2);

  // Action buttons
  const btns = [
    { label: 'Review', x: 60,  col: C.purple },
    { label: 'Call',   x: 380, col: C.card   },
    { label: 'Map',    x: 700, col: C.card   },
    { label: 'Share',  x: 1020,col: C.card   },
  ];
  btns.forEach(({ label, x, col }) => {
    fillRoundRect(px, x, 630, 270, 80, 20, col);
    drawTextCentered(px, label, x + 135, 656, C.white, 2);
  });

  // Info section
  drawSectionTitle(px, 'Information', 760);
  const infos = [
    'Rue de la Liberte, Tunis',
    'Open 12:00 - 23:00',
    '+216 71 234 567',
    'www.lebaroque.tn',
  ];
  infos.forEach((info, i) => {
    fillRoundRect(px, 40, 815 + i * 100, W - 80, 80, 12, C.card);
    drawText(px, info, 80, 845 + i * 100, C.gray, 2);
  });

  // Reviews preview
  drawSectionTitle(px, 'Reviews', 1240);
  drawReviewCard(px, 1295, 'Ahmed B.', 'Amazing food and great atmosphere!', 5, '2d ago');
  drawReviewCard(px, 1515, 'Sarah M.', 'Best restaurant in Tunis. Highly recommended', 5, '1w ago');
  drawReviewCard(px, 1735, 'Karim T.', 'Excellent service, will come back again', 4, '2w ago');

  drawTabBar(px);
  return px;
}

// ── Screenshot 3: Search / Categories ────────────────────────────────────────
function makeScreenshot3() {
  const px = makeCanvas();
  drawStatusBar(px);

  drawTextCentered(px, 'Explore', W / 2, 80, C.white, 4);

  drawSearchBar(px, 150);

  // Filter chips
  const filters = ['All', 'Open Now', 'Top Rated', 'Near Me', 'Premium'];
  let fx = 40;
  filters.forEach((f, i) => {
    const active = i === 0;
    const w = textWidth(f, 2) + 40;
    fillRoundRect(px, fx, 280, w, 56, 16, active ? C.purple : C.card);
    drawText(px, f, fx + 20, 294, active ? C.white : C.gray, 2);
    fx += w + 20;
  });

  drawSectionTitle(px, 'Browse by Category', 390);

  // Category grid
  const catGrid = [
    { label: 'Restaurants', col: C.orange,    icon: 'F' },
    { label: 'Cafes',       col: C.teal,      icon: 'C' },
    { label: 'Health',      col: C.green,     icon: 'H' },
    { label: 'Shopping',    col: C.purpleDim, icon: 'S' },
    { label: 'Beauty',      col: [219,39,119],icon: 'B' },
    { label: 'Auto',        col: [37,99,235], icon: 'A' },
    { label: 'Education',   col: [217,119,6], icon: 'E' },
    { label: 'Sports',      col: [5,150,105], icon: 'G' },
  ];
  catGrid.forEach(({ label, col, icon }, i) => {
    const col2 = i % 2, row = Math.floor(i / 2);
    const cx = 40 + col2 * 630, cy = 450 + row * 260;
    fillRoundRect(px, cx, cy, 590, 230, 20, col);
    fillCircle(px, cx + 70, cy + 80, 40, [255, 255, 255, 40]);
    drawText(px, icon, cx + 55, cy + 65, C.white, 4);
    drawText(px, label, cx + 140, cy + 60, C.white, 3);
    drawText(px, '120+ places', cx + 140, cy + 110, [255,255,255,180], 2);
  });

  drawSectionTitle(px, 'Trending Now', 1560);

  drawBusinessCard(px, 1615, 'Sushi World', 'Japanese', 5, '203', 'HOT', C.orange);
  drawBusinessCard(px, 1840, 'Zen Spa', 'Wellness', 4, '67', 'OPEN', C.green);

  drawTabBar(px);
  return px;
}

// ── Screenshot 4: Notifications ───────────────────────────────────────────────
function makeScreenshot4() {
  const px = makeCanvas();
  drawStatusBar(px);

  drawTextCentered(px, 'Notifications', W / 2, 80, C.white, 4);

  // Mark all read btn
  fillRoundRect(px, W - 260, 65, 220, 50, 14, C.card);
  drawText(px, 'Mark all', W - 250, 79, C.purple, 2);

  // Filter
  const tabs2 = ['All', 'Reviews', 'Offers', 'System'];
  tabs2.forEach((t, i) => {
    const active = i === 0;
    fillRoundRect(px, 40 + i * 300, 155, 260, 55, 14, active ? C.purple : C.card);
    drawTextCentered(px, t, 40 + i * 300 + 130, 170, active ? C.white : C.gray, 2);
  });

  const notifs = [
    { title: 'New review on Le Baroque', body: 'Ahmed left a 5-star review!', time: '2 min ago', read: false },
    { title: 'Special offer nearby!', body: 'Cafe Bloom: 30% off today only', time: '1 hour ago', read: false },
    { title: 'Your review was liked', body: '12 people found it helpful', time: '3 hours ago', read: false },
    { title: 'New business near you', body: 'Sushi World just opened', time: 'Yesterday', read: true },
    { title: 'Weekly digest', body: '5 new businesses in your area', time: '2 days ago', read: true },
    { title: 'Business reply', body: 'Le Baroque replied to your review', time: '3 days ago', read: true },
    { title: 'Trending in Tunis', body: 'Check out the hottest spots', time: '1 week ago', read: true },
    { title: 'Profile verified!', body: 'Your account is now verified', time: '2 weeks ago', read: true },
  ];

  notifs.forEach(({ title, body, time, read }, i) => {
    drawNotifCard(px, 255 + i * 170, title, body, time, read);
  });

  drawTabBar(px);
  return px;
}

// ── Screenshot 5: Profile ─────────────────────────────────────────────────────
function makeScreenshot5() {
  const px = makeCanvas();
  drawStatusBar(px);

  // Header gradient
  for (let y = 50; y < 500; y++) {
    const t = (y - 50) / 450;
    fillRect(px, 0, y, W, 1, [
      Math.round(20 + 15 * (1 - t)),
      Math.round(8 + 5 * (1 - t)),
      Math.round(50 + 30 * (1 - t)),
    ]);
  }

  drawTextCentered(px, 'Profile', W / 2, 80, C.white, 4);

  // Avatar
  fillCircle(px, W / 2, 240, 110, C.purpleDim);
  fillCircle(px, W / 2, 240, 95, C.purple);
  drawTextCentered(px, 'A', W / 2, 206, C.white, 7);

  // Verified badge
  fillCircle(px, W / 2 + 80, 295, 28, C.bg);
  fillCircle(px, W / 2 + 80, 295, 22, C.green);
  drawTextCentered(px, 'V', W / 2 + 80, 286, C.white, 2);

  drawTextCentered(px, 'Ahmed Ben Ali', W / 2, 385, C.white, 4);
  drawTextCentered(px, 'ahmed@email.com', W / 2, 435, C.gray, 2);

  // Stats
  fillRoundRect(px, 40, 490, W - 80, 140, 20, C.card);
  const stats = [
    { val: '47', label: 'Reviews' },
    { val: '128', label: 'Likes' },
    { val: '12', label: 'Wishlisted' },
    { val: '4.8', label: 'Avg Rating' },
  ];
  stats.forEach(({ val, label }, i) => {
    const sx = 120 + i * 270;
    drawTextCentered(px, val, sx, 516, C.purple, 4);
    drawTextCentered(px, label, sx, 572, C.gray, 2);
    if (i < 3) fillRect(px, sx + 110, 510, 2, 70, C.cardLight);
  });

  // Menu items
  const items = [
    { label: 'My Reviews',      sub: '47 reviews written' },
    { label: 'Wishlist',        sub: '12 saved businesses' },
    { label: 'Settings',        sub: 'Account & preferences' },
    { label: 'Help Center',     sub: 'FAQ & support' },
    { label: 'Privacy Policy',  sub: 'Terms & conditions' },
    { label: 'Sign Out',        sub: '' },
  ];
  items.forEach(({ label, sub }, i) => {
    const iy = 680 + i * 170;
    fillRoundRect(px, 40, iy, W - 80, 150, 16, C.card);
    drawText(px, label, 90, iy + 30, label === 'Sign Out' ? C.red : C.white, 3);
    if (sub) drawText(px, sub, 90, iy + 86, C.grayDim, 2);
    drawText(px, '>', W - 120, iy + 50, C.grayDim, 3);
    if (i < items.length - 1) fillRect(px, 90, iy + 148, W - 180, 1, C.cardLight);
  });

  drawTabBar(px);
  return px;
}

// ── Generate all ──────────────────────────────────────────────────────────────
const outDir = path.join(__dirname, '../screenshots');
fs.mkdirSync(outDir, { recursive: true });

console.log('Generating App Store screenshots (1284×2778px)...');

const screens = [
  { name: '01-home.png',    fn: makeScreenshot1 },
  { name: '02-detail.png',  fn: makeScreenshot2 },
  { name: '03-search.png',  fn: makeScreenshot3 },
  { name: '04-notifs.png',  fn: makeScreenshot4 },
  { name: '05-profile.png', fn: makeScreenshot5 },
];

screens.forEach(({ name, fn }) => {
  const px = fn();
  writePNG(path.join(outDir, name), W, H, px);
});

console.log(`\nAll screenshots saved to: ${outDir}`);
console.log('Upload these in App Store Connect → Screenshots → iPhone 6.5"');
