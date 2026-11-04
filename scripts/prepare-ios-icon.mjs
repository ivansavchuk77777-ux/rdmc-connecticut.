import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile, access } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

// Package the existing artwork without cropping, recoloring, or changing its source.
const source = 'IMG_1995.jpg';
const catalog = 'ios/App/App/Assets.xcassets/AppIcon.appiconset';
await access(join(catalog, 'Contents.json')); // Fail if the native project is missing.
const original = await readFile(source);
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const filename = 'RDMC-AppIcon-1024.png';
await sharp(original)
  .resize(928, 928, { fit: 'contain', background: '#000000' })
  .extend({ top: 48, bottom: 48, left: 48, right: 48, background: '#000000' })
  .flatten({ background: '#000000' })
  .removeAlpha()
  .png()
  .toFile(join(catalog, filename));
const metadata = await sharp(join(catalog, filename)).metadata();
assert.equal(metadata.width, 1024);
assert.equal(metadata.height, 1024);
assert.equal(metadata.hasAlpha, false);
assert.equal(hash(await readFile(source)), hash(original), 'Original artwork changed');
await writeFile(join(catalog, 'Contents.json'), JSON.stringify({
  images: [{ filename, idiom: 'universal', platform: 'ios', size: '1024x1024' }],
  info: { author: 'xcode', version: 1 },
}, null, 2) + '\n');
console.log('RDMC iOS icon configured: 1024x1024, opaque, original artwork preserved.');
