// Pure Node.js script to generate valid PNG icons for PWA
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

function createCRC32Table() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  return table;
}

const crcTable = createCRC32Table();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function generatePNG(width, height, isMaskable = false) {
  const rowBytes = 1 + width * 4; // 1 filter byte + RGBA per pixel
  const rawData = Buffer.alloc(rowBytes * height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.42;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowBytes;
    rawData[rowOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background deep blue/slate gradient
      let r = 15;
      let g = 23;
      let b = 42;
      let a = 255;

      if (!isMaskable && dist > radius) {
        // Soft rounded corner for standard icon
        const cornerDist = Math.max(Math.abs(dx), Math.abs(dy)) - (width * 0.38);
        if (cornerDist > 0) {
          const cornerAlpha = Math.max(0, 1 - cornerDist / 10);
          a = Math.round(255 * cornerAlpha);
        }
      }

      // Draw Earth globe
      const earthRadius = width * 0.28;
      if (dist < earthRadius) {
        // Earth deep blue with atmosphere cyan rim
        const rim = dist / earthRadius;
        if (rim > 0.88) {
          r = 56; g = 189; b = 248; // Cyan atmosphere
        } else {
          r = 10; g = 40; b = 75;
          // Grid lines
          if (Math.abs(dy) < 2 || Math.abs(dx) < 2 || Math.abs(Math.sin(dist / 12)) > 0.95) {
            r = 30; g = 80; b = 130;
          }
        }
      } else if (dist < earthRadius + 15 && dist >= earthRadius) {
        r = 14; g = 165; b = 233; // Outer glow
        a = 220;
      } else if (Math.abs(dist - width * 0.38) < 2.5) {
        r = 245; g = 158; b = 11; // Golden solar orbit
        a = 180;
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);

  // PNG Header
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  const ihdrChunk = createChunk('IHDR', ihdrData);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crcInput = chunk.subarray(4, 8 + len);
  const crcVal = crc32(crcInput);
  chunk.writeUInt32BE(crcVal, 8 + len);
  return chunk;
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), generatePNG(192, 192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), generatePNG(512, 512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), generatePNG(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), generatePNG(180, 180, true));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), generatePNG(32, 32, false));

console.log('Generated PWA PNG and ICO icons successfully.');
