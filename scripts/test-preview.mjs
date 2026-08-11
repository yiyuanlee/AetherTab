import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { chromium } from 'playwright';

const projectRoot = resolve(import.meta.dirname, '..');
const screenshotPath = resolve(projectRoot, 'scripts', 'test-preview.png');
const importScreenshotPath = resolve(projectRoot, 'scripts', 'test-preview-import.png');
const shareScreenshotPath = resolve(projectRoot, 'scripts', 'test-preview-share.png');
const organizeScreenshotPath = resolve(projectRoot, 'scripts', 'test-preview-organize.png');
const mobileScreenshotPath = resolve(projectRoot, 'scripts', 'test-preview-mobile.png');
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
};

const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const requestedPath = pathname === '/' ? 'newtab.html' : pathname.replace(/^\/+/, '');
    const filePath = resolve(projectRoot, requestedPath);
    if (filePath !== projectRoot && !filePath.startsWith(`${projectRoot}${sep}`)) {
      response.writeHead(403).end('Forbidden');
      return;
    }

    const info = await stat(filePath);
    if (!info.isFile()) throw new Error('Not a file');
    response.writeHead(200, {
      'Content-Type': contentTypes[extname(filePath)] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    response.end(await readFile(filePath));
  } catch {
    response.writeHead(404).end('Not found');
  }
});

await new Promise((resolveListen) => server.listen(0, '127.0.0.1', resolveListen));
const address = server.address();
const previewUrl = `http://127.0.0.1:${address.port}/newtab.html`;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const pageErrors = [];
page.on('pageerror', (error) => pageErrors.push(error.message));

try {
  await page.addInitScript(() => localStorage.setItem('onboardingComplete', 'true'));
  await page.goto(previewUrl, { waitUntil: 'domcontentloaded' });
  await page.locator('.collection-card').first().waitFor();

  const title = await page.title();
  const greeting = await page.locator('#greeting').textContent();
  const collectionsHeader = await page.locator('.collections-header h2').textContent();
  const initialCollections = await page.locator('.collection-card').count();

  assert.equal(title, 'AetherTab — A calmer new tab');
  assert.equal(collectionsHeader?.trim(), 'Collections');
  assert.equal(initialCollections, 2);

  const expectedThemes = {
    default: { accent: '#0071e3', page: '#f5f5f7', surface: '#ffffff' },
    sage: { accent: '#40845a', page: '#eff4f0', surface: '#fbfdfb' },
    lilac: { accent: '#8067b7', page: '#f2f0f7', surface: '#fcfbfe' },
    sand: { accent: '#a9674b', page: '#f5f0eb', surface: '#fffdf9' },
  };
  const themeButtons = page.locator('.color-scheme-btn');
  assert.equal(await themeButtons.count(), Object.keys(expectedThemes).length);

  for (const [scheme, expectedTokens] of Object.entries(expectedThemes)) {
    const button = page.locator(`.color-scheme-btn[data-scheme="${scheme}"]`);
    await button.click();
    assert.equal(await page.locator('html').getAttribute('data-color-scheme'), scheme);
    assert.equal(await button.getAttribute('aria-checked'), 'true');
    assert.deepEqual(await page.locator('html').evaluate((root) => {
      const styles = getComputedStyle(root);
      return {
        accent: styles.getPropertyValue('--accent-primary').trim(),
        page: styles.getPropertyValue('--page-bg').trim(),
        surface: styles.getPropertyValue('--surface').trim(),
      };
    }), expectedTokens);
  }

  await page.locator('.color-scheme-btn[data-scheme="lilac"]').click();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('.collection-card').first().waitFor();
  assert.equal(await page.locator('html').getAttribute('data-color-scheme'), 'lilac');
  assert.equal(
    await page.locator('.color-scheme-btn[data-scheme="lilac"]').getAttribute('aria-checked'),
    'true',
  );
  await page.locator('.color-scheme-btn[data-scheme="default"]').click();

  await page.locator('#import-bookmarks-btn').click();
  await page.locator('#bookmark-file-input').setInputFiles({
    name: 'toby-export.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({
      product: 'Toby',
      spaces: [{
        name: 'Work',
        collections: [{
          name: 'Research',
          resources: [
            { name: 'Paper', resourceUrl: 'https://arxiv.org/abs/1234' },
            { name: 'Repository', resourceUrl: 'https://github.com/openai/example' },
          ],
        }],
      }],
    })),
  });
  await page.locator('#bookmark-import-preview:not(.hidden)').waitFor();
  assert.equal(
    await page.locator('input[name="bookmark-import-mode"][value="folders"]').isChecked(),
    true,
  );
  assert.equal(
    (await page.locator('.bookmark-preview-group strong').first().textContent())?.trim(),
    'Research',
  );
  await page.locator('#bookmark-tools-cancel').click();

  await page.locator('#import-bookmarks-btn').click();
  await page.locator('#bookmark-file-input').setInputFiles({
    name: 'bookmarks.html',
    mimeType: 'text/html',
    buffer: Buffer.from(`
      <!DOCTYPE NETSCAPE-Bookmark-file-1>
      <DL><p>
        <DT><H3>Bookmarks bar</H3>
        <DL><p>
          <DT><H3>New links</H3>
          <DL><p>
            <DT><A HREF="https://github.com/openai">OpenAI GitHub</A>
            <DT><A HREF="https://dribbble.com/shots/popular">Design ideas</A>
            <DT><A HREF="https://github.com/openai?utm_source=duplicate">Duplicate GitHub</A>
          </DL><p>
        </DL><p>
      </DL><p>`),
  });

  await page.locator('#bookmark-import-preview:not(.hidden)').waitFor();
  assert.match(await page.locator('#bookmark-source-status').textContent(), /3 links found/);
  assert.equal(await page.locator('.bookmark-preview-group').count(), 2);
  assert.match(await page.locator('#bookmark-tools-confirm').textContent(), /Import 2 links/);
  await page.screenshot({ path: importScreenshotPath, fullPage: true });
  await page.locator('#bookmark-tools-confirm').click();
  await page.locator('.collection-card').nth(3).waitFor();

  const importedCollections = await page.locator('.collection-card').count();
  assert.equal(importedCollections, 4);

  await page.locator('.share-collection-btn').first().click();
  await page.locator('#share-collection-modal:not(.hidden)').waitFor();
  assert.match(await page.locator('#share-collection-meta').textContent(), /web links/);
  await page.screenshot({ path: shareScreenshotPath, fullPage: true });
  await page.locator('#share-collection-done').click();

  await page.locator('#smart-organize-btn').click();
  await page.locator('#bookmark-tools-modal:not(.hidden)').waitFor();
  assert.match(await page.locator('#bookmark-tools-title').textContent(), /Organize collections/);
  assert.equal(await page.locator('#bookmark-tools-confirm').isDisabled(), false);
  await page.screenshot({ path: organizeScreenshotPath, fullPage: true });
  await page.locator('#bookmark-tools-cancel').click();

  assert.deepEqual(pageErrors, []);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  await page.setViewportSize({ width: 520, height: 900 });
  const mobileScrollWidth = await page.locator('body').evaluate((body) => body.scrollWidth);
  assert.ok(mobileScrollWidth <= 520, `Mobile layout overflows to ${mobileScrollWidth}px`);
  await page.screenshot({ path: mobileScreenshotPath, fullPage: true });

  console.log('Page title:', title);
  console.log('Greeting:', greeting?.trim());
  console.log('Initial collections:', initialCollections);
  console.log('Collections after import:', importedCollections);
  console.log('Four page-wide color themes and persistence: OK');
  console.log('Import, smart organize, and share dialogs: OK');
  console.log('Screenshot saved to scripts/test-preview.png');
} finally {
  await browser.close();
  await new Promise((resolveClose) => server.close(resolveClose));
}
