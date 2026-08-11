export const MOCK_COLLECTIONS = [
  {
    id: 'col-1',
    name: 'Getting Started',
    tabs: [
      { title: 'Welcome to AetherTab', url: 'https://github.com', favicon: '' },
      { title: 'Chrome Extension Developer Guide', url: 'https://developer.chrome.com', favicon: '' },
    ],
  },
  {
    id: 'col-2',
    name: 'Design Inspiration',
    tabs: [
      { title: 'Dribbble - Discover Design', url: 'https://dribbble.com', favicon: '' },
      { title: 'Awwwards - Website Awards', url: 'https://awwwards.com', favicon: '' },
      { title: 'CSS-Tricks - Web Design Tips', url: 'https://css-tricks.com', favicon: '' },
    ],
  },
];

export const MOCK_ACTIVE_TABS = [
  { id: 101, title: 'AetherTab Dashboard', url: 'chrome://newtab' },
  { id: 102, title: 'YouTube - Lo-Fi Beats', url: 'https://youtube.com' },
  { id: 103, title: 'GitHub - Antigravity Repo', url: 'https://github.com' },
  { id: 104, title: 'Notion Workspace', url: 'https://notion.so' },
  { id: 105, title: 'Stack Overflow - Javascript Questions', url: 'https://stackoverflow.com' },
];

const GLOBE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`;
const FALLBACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#94a3b8" stroke-width="2"><circle cx="12" cy="12" r="10"></circle></svg>`;

export const GLOBE_FAVICON_DATA_URL = `data:image/svg+xml;base64,${btoa(GLOBE_SVG)}`;
export const FALLBACK_FAVICON_DATA_URL = `data:image/svg+xml;base64,${btoa(FALLBACK_SVG)}`;

export const WEATHER_CACHE_TTL_MS = 30 * 60 * 1000;
export const TAB_REFRESH_DEBOUNCE_MS = 250;
