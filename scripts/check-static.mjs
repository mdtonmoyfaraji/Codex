import { readFileSync, existsSync } from 'node:fs';

const page = readFileSync('index.html', 'utf8');
for (const asset of ['./src/style.css', './src/main.js']) {
  if (!page.includes(asset) || !existsSync(asset.slice(2))) {
    throw new Error(`Missing locally resolvable asset: ${asset}`);
  }
}
console.log('Static assets resolve relative to index.html.');
