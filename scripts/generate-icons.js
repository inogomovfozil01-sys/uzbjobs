const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Create a solid/gradient PNG with dimensions width x height
function createPng(width, height, r, g, b) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth: 8
  ihdrData[9] = 6; // Color type: RGBA
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Raw image data: scanlines with filter byte 0
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type None
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      // Gradient effect
      const factor = (x + y) / (width + height);
      const pr = Math.round(r * (1 - factor * 0.3));
      const pg = Math.round(g * (1 + factor * 0.2));
      const pb = Math.round(b * (1 - factor * 0.1));

      rawData[pxOffset] = Math.min(255, Math.max(0, pr));
      rawData[pxOffset + 1] = Math.min(255, Math.max(0, pg));
      rawData[pxOffset + 2] = Math.min(255, Math.max(0, pb));
      rawData[pxOffset + 3] = 255; // Alpha
    }
  }

  // Compress IDAT
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);

  // IEND chunk
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(8 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const crc = crc32(buf.subarray(4, 8 + len));
  buf.writeUInt32BE(crc, 8 + len);
  return buf;
}

// CRC32 implementation
function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[i] = c;
}

// Ensure public directory
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate icon.png (512x512)
const iconPng = createPng(512, 512, 2, 132, 199); // #0284c7
fs.writeFileSync(path.join(publicDir, 'icon.png'), iconPng);
console.log('Created icon.png (512x512)');

// Generate apple-touch-icon.png (180x180)
const appleIcon = createPng(180, 180, 2, 132, 199);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleIcon);
console.log('Created apple-touch-icon.png (180x180)');

// Generate favicon.ico (using 32x32 PNG inside or 32x32 raw ICO)
// Modern browsers support PNG inside ICO container
function createIco(pngBuf) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // ICO type
  header.writeUInt16LE(1, 4); // 1 image

  const entry = Buffer.alloc(16);
  entry.writeUInt8(32, 0); // Width
  entry.writeUInt8(32, 1); // Height
  entry.writeUInt8(0, 2);  // Colors
  entry.writeUInt8(0, 3);  // Reserved
  entry.writeUInt16LE(1, 4); // Color planes
  entry.writeUInt16LE(32, 6); // Bits per pixel
  entry.writeUInt32BE(pngBuf.length, 8); // Size
  entry.writeUInt32LE(22, 12); // Offset = 6 + 16 = 22

  return Buffer.concat([header, entry, pngBuf]);
}

const faviconPng = createPng(32, 32, 2, 132, 199);
const faviconIco = createIco(faviconPng);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), faviconIco);
console.log('Created favicon.ico');
