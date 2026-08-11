# AetherTab

[中文文档](README.zh-CN.md)

**A calm, visual workspace for the tabs you want to keep.**

AetherTab replaces Chrome's New Tab page with a focused workspace where you can save open tabs, organise links into collections, and return to important work without keeping dozens of tabs open.

## Highlights

- Save a tab by dragging it into a collection; the saved tab closes automatically.
- Save an entire browser session in one action.
- Import bookmarks directly from Chrome or from Netscape HTML, Toby JSON/TXT, generic JSON, and AetherTab share files.
- Smart-organise links locally by site, title, keywords, and source-folder context, with duplicate removal and a confirmation preview.
- Share any collection as a portable code, direct import link, JSON file, or system share-sheet item.
- Create, search, reorder, and group collections by site.
- Keep collections, preferences, and theme choices in sync across signed-in Chrome browsers.
- Use local collection search, keyboard shortcuts, undo delete, and a focused weather widget.
- Choose from four cohesive page-wide color themes, each with light and dark modes.
- Guide new users through a short, skippable first-run introduction.

## Quick start

1. Clone or download this repository.
2. Open `chrome://extensions` in Chrome.
3. Enable **Developer mode**.
4. Select **Load unpacked** and choose this project folder.
5. Open a new tab.

For a visual-only preview, open `newtab.html` in a browser. Outside extension mode, it loads example data automatically.

## How it works

### Save your flow

Drag an open tab from the sidebar into any collection, or use **Save Session** to capture every open tab at once.

### Keep projects together

Create collections for work, study, trips, reading, or anything else you revisit. Use the per-collection search and site grouping controls to find links quickly.

### Import and smart-organise bookmarks

Select **Import** to read Chrome bookmarks directly, choose a browser/Toby HTML, JSON, or TXT export, or paste an AetherTab share code. Toby's legacy `lists → cards` and newer `spaces → collections → resources` layouts are recognized, with Space and collection context preserved. Pick **By category**, **Keep folders**, or **One collection**, then review the local preview before saving. Duplicate, tracking-only, invalid, and unsafe URLs are skipped automatically. Toby notes and tags remain out of scope because AetherTab collections currently store web links only.

Use **Organize** at any time to regroup the current workspace. Applying the preview can be undone for five seconds.

### Share a collection

Use the share icon on a collection card. A share code works across AetherTab installations, the JSON file is a portable backup, and the direct link offers one-click import where the receiving installation can open it. Sharing includes only collection name, link titles, and HTTP(S) URLs.

### Sync when you need it

Enable Chrome Sync from the sidebar to synchronise collections and preferences between browsers signed in to the same Chrome account.

## Development

```bash
npm install
npm test
npm run build
npm run test:preview
```

The extension runs directly from ES modules during normal development, so a build is optional unless you want the bundled output.

## Project structure

```text
js/
  app.js           Application entry point
  bookmark-manager.js Import, organize, and sharing UI workflows
  bookmark-tools.js   Bookmark parsing, classification, deduplication, and share format
  collections.js   Collection CRUD and session saving
  onboarding.js    First-run introduction
  storage.js       Local and Chrome Sync storage adapter
  sync.js          Cross-device synchronisation
  tabs.js          Active-tab synchronisation
  weather.js       Weather widget
newtab.html        Extension New Tab page
newtab.css         Interface styles
manifest.json      Chrome extension manifest
```

## Privacy

Collections and preferences stay in Chrome storage. Bookmark parsing, deduplication, and smart classification run entirely on the current device. A collection leaves the device only when you explicitly copy, download, or share it. Cross-device syncing is optional and uses Chrome Sync only after you enable it. Location access is requested only when you choose to use location-aware weather.

## License

[MIT](LICENSE)
