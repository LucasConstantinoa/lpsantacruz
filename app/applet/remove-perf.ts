import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');
content = content.replace(/will-change-transform/g, '');
content = content.replace(/blur-\[150px\]/g, 'blur-[64px]');
content = content.replace(/blur-\[100px\]/g, 'blur-[48px]');
content = content.replace(/translate-z-0/g, '');
fs.writeFileSync('src/App.tsx', content);
console.log('optimizations applied.');
