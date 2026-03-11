/**
 * Creates a favicon with the logo on a dark blue background (#0b1220).
 * Run: node scripts/create-favicon.js
 */
const path = require('path');

async function main() {
  let sharp;
  try {
    sharp = require('sharp');
  } catch {
    console.log('Installing sharp...');
    const { execSync } = require('child_process');
    execSync('npm install sharp --no-save', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    sharp = require('sharp');
  }

  const logoPath = path.join(__dirname, '..', 'assets', 'axiant-logo.png');
  const faviconPath = path.join(__dirname, '..', 'assets', 'favicon.png');
  const DARK_BLUE = '#0b1220';

  // Create mask: black pixels -> transparent, colored pixels -> opaque
  const mask = await sharp(logoPath)
    .resize(32, 32)
    .grayscale()
    .threshold(20)
    .toBuffer();

  // Apply mask as alpha to logo (black bg becomes transparent)
  const logoWithAlpha = await sharp(logoPath)
    .resize(32, 32)
    .ensureAlpha()
    .joinChannel(mask)
    .png()
    .toBuffer();

  // Composite logo onto dark blue background
  const bgSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" fill="${DARK_BLUE}"/></svg>`;
  const bg = await sharp(Buffer.from(bgSvg)).png().toBuffer();

  await sharp(bg)
    .composite([{ input: logoWithAlpha, blend: 'over' }])
    .png()
    .toFile(faviconPath);

  console.log('Created favicon at assets/favicon.png');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
