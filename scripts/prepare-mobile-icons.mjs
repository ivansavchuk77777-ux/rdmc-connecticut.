import { mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
const require = createRequire(import.meta.url);
const sharp = require('sharp');
await mkdir('assets', { recursive: true });
await sharp('IMG_1995.jpg').png().toFile('assets/logo.png');
const result = spawnSync(process.execPath, [
  'node_modules/@capacitor/assets/bin/capacitor-assets', 'generate', '--android', '--ios',
  '--iconBackgroundColor', '#090909', '--iconBackgroundColorDark', '#090909',
  '--splashBackgroundColor', '#090909', '--splashBackgroundColorDark', '#090909',
], { stdio: 'inherit' });
if (result.status !== 0) process.exit(result.status ?? 1);
