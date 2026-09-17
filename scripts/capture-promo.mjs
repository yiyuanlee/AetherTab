import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PROMO = path.join(ROOT, 'promo');
const ASSETS = path.join(ROOT, 'docs', 'assets');
const FRAMES = path.join(PROMO, '_frames');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const DEMO_COLLECTIONS = [
  {
    id: 'col-1',
    name: 'Work',
    tabs: [
      { title: 'Q3 planning doc', url: 'https://docs.google.com/document/d/planning', favicon: '' },
      { title: 'Standup notes', url: 'https://docs.google.com/document/d/standup', favicon: '' },
      { title: 'Hiring spreadsheet', url: 'https://docs.google.com/spreadsheets/d/hiring', favicon: '' },
      { title: 'AetherTab repository', url: 'https://github.com/yiyuanlee/AetherTab', favicon: '' },
      { title: 'Chrome extension docs', url: 'https://developer.chrome.com/docs/extensions', favicon: '' },
    ],
  },
  {
    id: 'col-2',
    name: 'Reading',
    tabs: [
      { title: 'Dribbble - Discover Design', url: 'https://dribbble.com', favicon: '' },
      { title: 'Awwwards - Website Awards', url: 'https://www.awwwards.com', favicon: '' },
      { title: 'CSS-Tricks - Web Design Tips', url: 'https://css-tricks.com', favicon: '' },
      { title: 'ChatGPT', url: 'https://chatgpt.com', favicon: '' },
    ],
  },
];

const WEATHER_CACHE = {
  lat: 40.71,
  lon: -74.01,
  timestamp: Date.now(),
  data: {
    latitude: 40.71,
    longitude: -74.01,
    current: {
      temperature_2m: 18.4,
      weather_code: 2,
      is_day: 1,
    },
    daily: {
      temperature_2m_min: [14.1],
      temperature_2m_max: [22.6],
    },
  },
};

const PROMO_FILES = [
  'aethertab-dark-1280x800.png',
  'aethertab-light-1280x800.png',
  'aethertab-drag-1280x800.png',
  'aethertab-group-1280x800.png',
  'aethertab-search-1280x800.png',
  'aethertab-small-promo-440x280.png',
  'aethertab-marquee-1400x560.png',
  'aethertab-demo.gif',
  'aethertab-demo.mp4',
];

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
      let filePath = path.join(ROOT, urlPath === '/' ? 'newtab.html' : urlPath);
      if (!filePath.startsWith(ROOT)) {
        res.writeHead(403).end();
        return;
      }
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404).end('Not found');
          return;
        }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
        res.end(data);
      });
    });
    server.listen(0, '127.0.0.1', () => {
      resolve({ server, port: server.address().port });
    });
  });
}

async function seedDemo(page) {
  await page.addInitScript(
    ({ collections, weatherCache }) => {
      localStorage.setItem('theme', 'dark');
      localStorage.setItem('collections', JSON.stringify(collections));
      localStorage.setItem('weatherUnit', JSON.stringify('C'));
      localStorage.setItem('weatherLocation', JSON.stringify({
        lat: weatherCache.lat,
        lon: weatherCache.lon,
        name: 'New York, US',
        timestamp: weatherCache.timestamp,
      }));
      localStorage.setItem('weatherCache', JSON.stringify(weatherCache));
    },
    { collections: DEMO_COLLECTIONS, weatherCache: WEATHER_CACHE },
  );
}

async function waitForUi(page) {
  await page.waitForSelector('.collection-card');
  await page.waitForSelector('#active-tabs-list .tab-item');
  await page.waitForTimeout(700);
}

async function shot(page, filename) {
  const dest = path.join(PROMO, filename);
  await page.screenshot({ path: dest, type: 'png' });
  console.log('Wrote', dest);
}

function pad(n) {
  return String(n).padStart(3, '0');
}

async function addCursor(page) {
  await page.evaluate(() => {
    const existing = document.getElementById('promo-cursor');
    if (existing) existing.remove();
    const cursor = document.createElement('div');
    cursor.id = 'promo-cursor';
    cursor.innerHTML = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M5 3l14 8.5-6.2 1.4L10.5 21 5 3z" fill="#f8fafc" stroke="#0f172a" stroke-width="1.4" stroke-linejoin="round"/>
    </svg>`;
    Object.assign(cursor.style, {
      position: 'fixed',
      left: '0px',
      top: '0px',
      width: '28px',
      height: '28px',
      zIndex: '2147483647',
      pointerEvents: 'none',
      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,.45))',
    });
    document.body.appendChild(cursor);
  });
}

async function moveCursor(page, x, y) {
  await page.evaluate(({ x, y }) => {
    const cursor = document.getElementById('promo-cursor');
    if (cursor) {
      cursor.style.left = `${x}px`;
      cursor.style.top = `${y}px`;
    }
  }, { x, y });
}

async function dragMetrics(page) {
  const tab = page.locator('#active-tabs-list .tab-item').nth(1);
  const card = page.locator('.collection-card').nth(1);
  const tabBox = await tab.boundingBox();
  const cardBox = await card.boundingBox();
  if (!tabBox || !cardBox) throw new Error('Could not find drag source or target');
  return {
    startX: tabBox.x + 56,
    startY: tabBox.y + tabBox.height / 2,
    endX: cardBox.x + Math.min(180, cardBox.width / 2),
    endY: cardBox.y + 72,
  };
}

async function captureDragStill(page) {
  const { startX, startY, endX, endY } = await dragMetrics(page);
  const midX = startX + (endX - startX) * 0.58;
  const midY = startY + (endY - startY) * 0.58;

  await page.evaluate(({ midX, midY }) => {
    const src = document.querySelectorAll('#active-tabs-list .tab-item')[1];
    if (!src) return;
    src.classList.add('dragging');
    const ghost = src.cloneNode(true);
    ghost.id = 'promo-drag-ghost';
    Object.assign(ghost.style, {
      position: 'fixed',
      left: `${midX - 28}px`,
      top: `${midY - 18}px`,
      width: `${src.getBoundingClientRect().width}px`,
      zIndex: '2147483646',
      pointerEvents: 'none',
      opacity: '0.96',
      transform: 'rotate(-6deg) scale(1.04)',
      boxShadow: '0 18px 40px rgba(0,0,0,.5)',
      background: 'rgba(18,20,38,0.94)',
      borderRadius: '12px',
    });
    document.body.appendChild(ghost);
    const target = document.querySelectorAll('.collection-card')[1];
    if (target) target.classList.add('drag-over');
  }, { midX, midY });

  await addCursor(page);
  await moveCursor(page, midX, midY);
  await page.waitForTimeout(150);
  await shot(page, 'aethertab-drag-1280x800.png');
}

async function captureGrouped(page) {
  await page.locator('.collection-card').first().locator('.toggle-group-btn').click();
  await page.waitForTimeout(400);
  const header = page.locator('.domain-group-header').first();
  if (await header.count()) {
    await header.click();
    await page.waitForTimeout(250);
  }
  await shot(page, 'aethertab-group-1280x800.png');
}

async function captureSearch(page) {
  const card = page.locator('.collection-card').nth(1);
  await card.locator('.toggle-card-search-btn').click();
  await page.waitForTimeout(200);
  await card.locator('.collection-card-search input').fill('Dribbble');
  await page.waitForTimeout(250);
  await shot(page, 'aethertab-search-1280x800.png');
}

async function captureGifFrames(page) {
  fs.rmSync(FRAMES, { recursive: true, force: true });
  fs.mkdirSync(FRAMES, { recursive: true });
  await addCursor(page);

  let i = 0;
  const frame = async (copies = 1) => {
    const buf = await page.screenshot({ type: 'png' });
    for (let c = 0; c < copies; c++) {
      fs.writeFileSync(path.join(FRAMES, `frame-${pad(i)}.png`), buf);
      i += 1;
    }
  };

  const { startX, startY, endX, endY } = await dragMetrics(page);

  await moveCursor(page, startX, startY);
  await page.mouse.move(startX, startY);
  await frame(8);

  await page.mouse.down();
  await frame(2);

  const steps = 18;
  for (let s = 1; s <= steps; s++) {
    const t = s / steps;
    const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    const x = startX + (endX - startX) * ease;
    const y = startY + (endY - startY) * ease;
    await page.mouse.move(x, y);
    await moveCursor(page, x, y);
    await frame(1);
  }

  await frame(2);
  await page.mouse.up();
  await page.waitForTimeout(500);
  await addCursor(page);
  await moveCursor(page, endX, endY);
  await frame(10);

  const groupBtn = page.locator('.collection-card').nth(1).locator('.toggle-group-btn');
  const groupBox = await groupBtn.boundingBox();
  if (groupBox) {
    const gx = groupBox.x + groupBox.width / 2;
    const gy = groupBox.y + groupBox.height / 2;
    const stepsBack = 8;
    for (let s = 1; s <= stepsBack; s++) {
      const t = s / stepsBack;
      const x = endX + (gx - endX) * t;
      const y = endY + (gy - endY) * t;
      await page.mouse.move(x, y);
      await moveCursor(page, x, y);
      await frame(1);
    }
    await groupBtn.click();
    await page.waitForTimeout(350);
    await addCursor(page);
    await moveCursor(page, gx, gy);
  }
  await frame(12);

  return i;
}

function runFfmpeg(args, label) {
  const result = spawnSync('ffmpeg', args, { encoding: 'utf8' });
  if (result.status !== 0) {
    console.error(result.stderr);
    throw new Error(`${label} failed`);
  }
}

function buildGif() {
  const gifPath = path.join(PROMO, 'aethertab-demo.gif');
  const palette = path.join(PROMO, '_palette.png');
  const input = path.join(FRAMES, 'frame-%03d.png');

  runFfmpeg([
    '-y', '-framerate', '10', '-i', input,
    '-vf', 'scale=1280:-1:flags=lanczos,palettegen=max_colors=128:stats_mode=diff',
    palette,
  ], 'ffmpeg palettegen');

  runFfmpeg([
    '-y', '-framerate', '10', '-i', input, '-i', palette,
    '-lavfi', 'scale=1280:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=4',
    '-loop', '0',
    gifPath,
  ], 'ffmpeg gif encode');

  fs.rmSync(palette, { force: true });
  fs.rmSync(FRAMES, { recursive: true, force: true });
  const sizeMb = (fs.statSync(gifPath).size / (1024 * 1024)).toFixed(2);
  console.log(`Wrote ${gifPath} (${sizeMb} MB)`);
}

function buildMp4() {
  const gifPath = path.join(PROMO, 'aethertab-demo.gif');
  const mp4Path = path.join(PROMO, 'aethertab-demo.mp4');
  runFfmpeg([
    '-y', '-i', gifPath,
    '-movflags', 'faststart',
    '-pix_fmt', 'yuv420p',
    '-vf', 'scale=1280:-2',
    '-an',
    mp4Path,
  ], 'ffmpeg mp4 encode');
  console.log('Wrote', mp4Path);
}

async function capturePromoTiles(browser) {
  const darkPng = path.join(PROMO, 'aethertab-dark-1280x800.png');
  const img = fs.readFileSync(darkPng).toString('base64');
  const page = await browser.newPage({
    viewport: { width: 1400, height: 560 },
    deviceScaleFactor: 1,
  });

  await page.setContent(`<!DOCTYPE html>
  <html>
  <head>
    <style>
      html, body { margin: 0; width: 1400px; height: 560px; overflow: hidden; font-family: Segoe UI, system-ui, sans-serif; }
      .bg {
        position: absolute; inset: 0;
        background: #07080e url("data:image/png;base64,${img}") center / cover no-repeat;
        filter: saturate(1.05);
      }
      .bg::after {
        content: "";
        position: absolute; inset: 0;
        background: linear-gradient(90deg, rgba(7,8,14,.88) 0%, rgba(7,8,14,.55) 48%, rgba(7,8,14,.18) 100%);
      }
      .copy {
        position: relative; z-index: 1;
        height: 560px; width: 720px;
        padding: 72px 64px;
        color: #f8fafc;
      }
      .name { font-size: 64px; font-weight: 700; letter-spacing: -0.04em; margin: 0 0 12px; }
      .tag { font-size: 28px; color: #cbd5e1; margin: 0; max-width: 520px; line-height: 1.35; }
    </style>
  </head>
  <body>
    <div class="bg"></div>
    <div class="copy">
      <p class="name">AetherTab</p>
      <p class="tag">Tab manager for Chrome's new tab page</p>
    </div>
  </body>
  </html>`);
  await page.screenshot({ path: path.join(PROMO, 'aethertab-marquee-1400x560.png'), type: 'png' });
  console.log('Wrote', path.join(PROMO, 'aethertab-marquee-1400x560.png'));

  await page.setViewportSize({ width: 440, height: 280 });
  await page.setContent(`<!DOCTYPE html>
  <html>
  <head>
    <style>
      html, body { margin: 0; width: 440px; height: 280px; overflow: hidden; font-family: Segoe UI, system-ui, sans-serif; }
      .bg {
        position: absolute; inset: 0;
        background: #07080e url("data:image/png;base64,${img}") 20% center / cover no-repeat;
      }
      .bg::after {
        content: "";
        position: absolute; inset: 0;
        background: linear-gradient(180deg, rgba(7,8,14,.35), rgba(7,8,14,.82));
      }
      .copy {
        position: relative; z-index: 1;
        height: 280px;
        display: flex; flex-direction: column; justify-content: flex-end;
        padding: 20px 22px 22px;
        color: #f8fafc;
        text-shadow: 0 2px 12px rgba(0,0,0,.65);
      }
      .name { font-size: 32px; font-weight: 700; letter-spacing: -0.03em; margin: 0 0 6px; }
      .tag { font-size: 16px; color: #e2e8f0; margin: 0; }
    </style>
  </head>
  <body>
    <div class="bg"></div>
    <div class="copy">
      <p class="name">AetherTab</p>
      <p class="tag">Save tabs. Clear the window.</p>
    </div>
  </body>
  </html>`);
  await page.screenshot({ path: path.join(PROMO, 'aethertab-small-promo-440x280.png'), type: 'png' });
  console.log('Wrote', path.join(PROMO, 'aethertab-small-promo-440x280.png'));
  await page.close();
}

function copyToDocs() {
  fs.mkdirSync(ASSETS, { recursive: true });
  for (const name of PROMO_FILES) {
    const src = path.join(PROMO, name);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(ASSETS, name));
    }
  }
  const icon = path.join(ROOT, 'icons', 'icon128.png');
  if (fs.existsSync(icon)) {
    fs.copyFileSync(icon, path.join(ASSETS, 'icon128.png'));
  }
  console.log('Copied promo assets into', ASSETS);
}

async function main() {
  fs.mkdirSync(PROMO, { recursive: true });
  const { server, port } = await startServer();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
    locale: 'en-US',
    timezoneId: 'America/New_York',
  });

  try {
    await seedDemo(page);
    await page.goto(`http://127.0.0.1:${port}/newtab.html`, { waitUntil: 'networkidle' });
    await waitForUi(page);
    await shot(page, 'aethertab-dark-1280x800.png');

    await captureDragStill(page);

    await page.reload({ waitUntil: 'networkidle' });
    await waitForUi(page);
    await captureGrouped(page);

    await page.reload({ waitUntil: 'networkidle' });
    await waitForUi(page);
    await captureSearch(page);

    await page.reload({ waitUntil: 'networkidle' });
    await waitForUi(page);
    await captureGifFrames(page);

    await page.reload({ waitUntil: 'networkidle' });
    await waitForUi(page);
    await page.locator('#theme-toggle').click();
    await page.waitForTimeout(400);
    await shot(page, 'aethertab-light-1280x800.png');

    buildGif();
    buildMp4();
    await capturePromoTiles(browser);
    copyToDocs();
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
