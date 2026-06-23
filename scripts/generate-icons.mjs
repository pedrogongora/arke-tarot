import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const svgPath = join(root, 'public', 'icon.svg');
const outDir = join(root, 'public', 'icons');

mkdirSync(outDir, { recursive: true });

const svgBuffer = readFileSync(svgPath);

const sizes = [48, 72, 96, 128, 144, 152, 180, 192, 384, 512];

for (const size of sizes) {
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(join(outDir, `icon-${size}.png`));
  console.log(`Generated icon-${size}.png`);
}

// Apple touch icon at expected location
await sharp(svgBuffer)
  .resize(180, 180)
  .png()
  .toFile(join(root, 'public', 'apple-touch-icon.png'));
console.log('Generated apple-touch-icon.png');

// Favicon
await sharp(svgBuffer)
  .resize(32, 32)
  .png()
  .toFile(join(root, 'public', 'favicon.png'));
console.log('Generated favicon.png');

console.log('All icons generated successfully.');
