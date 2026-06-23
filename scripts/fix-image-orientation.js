#!/usr/bin/env node
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function fixOrientations() {
  // Find all catalog images
  const files = fs.readdirSync('public');
  const images = files
    .filter((f) => /-catalog\.(jpg|jpeg|png)$/i.test(f))
    .map((f) => path.join('public', f));

  let fixed = 0;
  let skipped = 0;

  for (const imagePath of images) {
    try {
      const metadata = await sharp(imagePath).metadata();

      // Only process if image has orientation metadata
      if (!metadata.orientation || metadata.orientation === 1) {
        skipped++;
        continue;
      }

      // Auto-rotate based on EXIF orientation and remove EXIF
      await sharp(imagePath)
        .rotate() // Auto-detects and applies EXIF rotation
        .withMetadata(false) // Remove all metadata to prevent re-rotation
        .toFile(`${imagePath}.tmp`);

      fs.renameSync(`${imagePath}.tmp`, imagePath);
      fixed++;
      console.log(`✓ Fixed: ${path.basename(imagePath)} (orientation ${metadata.orientation})`);
    } catch (err) {
      console.error(`✗ Error: ${path.basename(imagePath)} — ${err.message}`);
    }
  }

  console.log(`\nDone: ${fixed} fixed, ${skipped} already correct, ${images.length} total.`);
}

fixOrientations().catch(console.error);
