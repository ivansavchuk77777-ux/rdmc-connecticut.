import { copyFile, access } from 'node:fs/promises';
const files = ['signal-2026-09-23-114809.JPG', '1000016806.PNG', 'IMG_1955.PNG', 'IMG_1995.jpg'];
for (const file of files) {
  await copyFile(file, `dist-mobile/${file}`);
}
await access('dist-mobile/index.html');
console.log('Mobile bundle and all event/logo assets prepared.');
