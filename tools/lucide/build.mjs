// Builds assets/lucide.js: only the Lucide icons the site uses, instead of the
// full library from unpkg. Run from the repo root after adding an icon:
//   npm --prefix tools/lucide install && node tools/lucide/build.mjs
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const esbuild = require('esbuild');
const lucide = require('lucide');

const root = process.cwd();
const files = [
  ...fs.readdirSync(root).filter(f => f.endsWith('.html')),
  ...fs.readdirSync(path.join(root, 'assets')).filter(f => f.endsWith('.js') && f !== 'lucide.js').map(f => 'assets/' + f),
];
const names = new Set(['moon', 'sun']); // theme toggle builds these at runtime
for (const f of files) for (const m of fs.readFileSync(f, 'utf8').matchAll(/data-lucide="([a-z0-9-]+)"/g)) names.add(m[1]);

const pascal = s => s.replace(/(^|-)([a-z0-9])/g, (_, a, b) => b.toUpperCase());
const missing = [...names].filter(n => !lucide.icons[pascal(n)]);
if (missing.length) { console.error('Unknown icons:', missing.join(', ')); process.exit(1); }
const ids = [...new Set([...names].map(pascal))].sort();

const entry = `import { createIcons, ${ids.join(', ')} } from 'lucide';
const icons = { ${ids.join(', ')} };
window.lucide = { createIcons: (opts = {}) => createIcons({ ...opts, icons: { ...icons, ...(opts.icons || {}) } }) };`;

await esbuild.build({
  stdin: { contents: entry, resolveDir: path.dirname(new URL(import.meta.url).pathname) },
  bundle: true, minify: true, format: 'iife',
  outfile: path.join(root, 'assets/lucide.js'),
  banner: { js: `/* Lucide ${require('lucide/package.json').version} subset (${ids.length} icons), built by tools/lucide/build.mjs — ISC license */` },
});
console.log(`assets/lucide.js: ${ids.length} icons`);
