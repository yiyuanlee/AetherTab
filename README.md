# AetherTab

Chrome tab manager on the new tab page. Save open tabs into collections, close them, and reopen them later. Local storage. No account.

[![Add to Chrome](https://img.shields.io/badge/Chrome_Web_Store-Add_to_Chrome-4285F4?logo=googlechrome&logoColor=white)](https://chromewebstore.google.com/detail/aethertab/nnacnehbnklljafemehfhjekkoghfgok)
[![Website](https://img.shields.io/badge/aethertab.com-000000)](https://aethertab.com/)

[中文文档](README.zh-CN.md)

![AetherTab dark dashboard](promo/aethertab-dark-1280x800.png)

## Install

The usual path is the Chrome Web Store listing:

**[Add AetherTab to Chrome](https://chromewebstore.google.com/detail/aethertab/nnacnehbnklljafemehfhjekkoghfgok)**

Product page and privacy policy: [aethertab.com](https://aethertab.com/).

## What it does

- Drag an open tab from the sidebar into a collection. AetherTab saves the page and closes the tab.
- Save Session dumps the current window into a new collection.
- Group saved pages by site, or filter inside one collection.
- Cross-device sync via Chrome Sync (optional, enable in sidebar).
- Keyboard shortcuts, undo delete, first-run onboarding.
- Four accent themes, light and dark modes.
- Weather card (optional GPS or a city name), clock.
- Collections stay in `chrome.storage` on this browser.

## Development | 本地开发

```bash
npm run icons
npm install
npm run build
```

Load this folder as an unpacked extension in `chrome://extensions/` (Developer mode → Load unpacked). ES modules work without a bundle step.

Preview the UI without Chrome extension APIs by opening `newtab.html`. Mock tabs and collections load automatically.

Promo screenshots and tiles:

```bash
npm run promo
```

Site files for Cloudflare Pages live in `docs/`. Store listing paste copy lives in `store/`.

## License

[MIT License](LICENSE)
