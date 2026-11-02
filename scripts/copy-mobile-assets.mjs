import {copyFileSync} from 'node:fs';
for(const file of ['signal-2026-09-23-114809.JPG','1000016806.PNG','IMG_1955.PNG','IMG_1995.jpg','sol-preview.html','sol-vivora.html','sol-avatar.jpg'])copyFileSync(file,'dist/'+file);
