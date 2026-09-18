// Renders tools/og/og-image.html to assets/og-image.png. Needs puppeteer-core
// and a local Chrome:  CHROME=/path/to/chrome node tools/og/render.mjs
import puppeteer from 'puppeteer-core';
import path from 'path';
const b = await puppeteer.launch({ executablePath: process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const p = await b.newPage();
await p.setViewport({ width: 1200, height: 630 });
await p.goto('file://' + path.resolve('tools/og/og-image.html'), { waitUntil: 'networkidle0' });
await p.screenshot({ path: 'assets/og-image.png' });
await b.close();
