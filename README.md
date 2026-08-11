# AetherTab

[中文文档](README.zh-CN.md)

**A calm, visual workspace for the tabs you want to keep.**

AetherTab replaces Chrome's New Tab page with a focused workspace where you can save open tabs, organise links into collections, and return to important work without keeping dozens of tabs open.

## Highlights

- Save a tab by dragging it into a collection; the saved tab closes automatically.
- Save an entire browser session in one action.
- Create, search, reorder, and group collections by site.
- Keep collections, preferences, and theme choices in sync across signed-in Chrome browsers.
- Use local collection search, keyboard shortcuts, undo delete, and a focused weather widget.
- Choose from four calm accent themes, with light and dark modes.
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

### Sync when you need it

Enable Chrome Sync from the sidebar to synchronise collections and preferences between browsers signed in to the same Chrome account.

## Development

```bash
npm install
npm run build
```

The extension runs directly from ES modules during normal development, so a build is optional unless you want the bundled output.

## Project structure

```text
js/
  app.js           Application entry point
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

Collections and preferences stay in Chrome storage. Cross-device syncing is optional and uses Chrome Sync only after you enable it. Location access is requested only when you choose to use location-aware weather.

## License

[MIT](LICENSE)
