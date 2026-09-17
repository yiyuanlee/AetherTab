import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '..');
const newtabUrl = pathToFileURL(resolve(projectRoot, 'newtab.html')).href;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

await page.goto(newtabUrl, { waitUntil: 'networkidle' });

const title = await page.title();
const greeting = await page.locator('#greeting').textContent();
const syncBtn = page.locator('#sync-toggle');
const syncLabel = await syncBtn.locator('.sync-label').textContent();
const collectionsHeader = await page.locator('.collections-header h2').textContent();

console.log('Page title:', title);
console.log('Greeting:', greeting?.trim());
console.log('Sync button:', syncLabel?.trim());
console.log('Collections section:', collectionsHeader?.trim());

await syncBtn.click();
await page.waitForTimeout(300);

const mockCollections = await page.locator('.collection-card').count();
console.log('Mock collection cards:', mockCollections);

await page.screenshot({ path: resolve(projectRoot, 'scripts', 'test-preview.png'), fullPage: true });
console.log('Screenshot saved to scripts/test-preview.png');

await browser.close();
