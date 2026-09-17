/**
 * Cursor sandbox sets PLAYWRIGHT_BROWSERS_PATH to an empty cache dir.
 * Unset it so Playwright uses the default install (e.g. %LOCALAPPDATA%/ms-playwright).
 */
delete process.env.PLAYWRIGHT_BROWSERS_PATH;
await import("./test-preview.mjs");
