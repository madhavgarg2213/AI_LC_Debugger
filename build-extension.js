import fs from 'fs';
import path from 'path';

// Create dist directory if it doesn't exist
const distDir = 'dist';
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

// Copy manifest.json to dist
fs.copyFileSync('public/manifest.json', 'dist/manifest.json');

// Copy icons to dist
if (fs.existsSync('public/vite.svg')) {
  fs.copyFileSync('public/vite.svg', 'dist/vite.svg');
}

// The background and content scripts are now built directly in dist/
// No need to copy them since Vite builds them there

console.log('Extension files ready in dist/ directory');
console.log('You can now load the extension from the dist/ folder in Chrome'); 