import { TAB_REFRESH_DEBOUNCE_MS } from './constants.js';
import { isChromeExtension } from './storage.js';
import { state } from './state.js';
import { debounce } from './utils.js';
function queryActiveTabs() {
  if (!isChromeExtension) return;

  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    state.activeTabs = tabs.filter((tab) => {
      const isNewTab =
        tab.url.includes('chrome://newtab') ||
        tab.url.includes(chrome.runtime.id) ||
        tab.url.startsWith('chrome-extension://');
      return !isNewTab;
    });
    import('./render.js').then(({ renderActiveTabs }) => renderActiveTabs());
  });
}

export const refreshActiveTabs = debounce(queryActiveTabs, TAB_REFRESH_DEBOUNCE_MS);

export function activateBrowserTab(tabId) {
  if (isChromeExtension && tabId) {
    chrome.tabs.update(parseInt(tabId, 10), { active: true });
  }
}

export function closeBrowserTab(tabId) {
  if (isChromeExtension && tabId) {
    chrome.tabs.remove(parseInt(tabId, 10), () => refreshActiveTabs());
  } else {
    state.activeTabs = state.activeTabs.filter((t) => t.id !== tabId);
    import('./render.js').then(({ renderActiveTabs }) => renderActiveTabs());
  }
}

export function openTabUrl(url) {
  if (isChromeExtension) {
    chrome.tabs.create({ url });
  } else {
    window.open(url, '_blank');
  }
}

export function loadActiveTabs() {
  if (isChromeExtension) queryActiveTabs();
}

export function refreshActiveTabsNow() {
  refreshActiveTabs.flush();
}
