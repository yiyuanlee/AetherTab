import { isChromeExtension } from './storage.js';
import { dom } from './state.js';
import { createNewCollection, saveSession, loadData } from './collections.js';
import { initSync, toggleSync } from './sync.js';
import { toggleTheme } from './widgets.js';
import { renderActiveTabs, renderCollections } from './render.js';
import { refreshActiveTabs } from './tabs.js';
import { setupModalListeners } from './modal.js';

export function setupEventListeners() {
  dom.toggleSidebarBtn.addEventListener('click', () => {
    dom.sidebar.classList.add('collapsed');
    dom.expandSidebarBtn.classList.remove('hidden');
    document.querySelector('.main-content').classList.add('sidebar-collapsed');
  });

  dom.expandSidebarBtn.addEventListener('click', () => {
    dom.sidebar.classList.remove('collapsed');
    dom.expandSidebarBtn.classList.add('hidden');
    document.querySelector('.main-content').classList.remove('sidebar-collapsed');
  });

  dom.activeSearchInput.addEventListener('input', renderActiveTabs);
  dom.workspaceSearchInput.addEventListener('input', renderCollections);

  dom.newCollectionBtn.addEventListener('click', () => createNewCollection());
  dom.saveSessionBtn.addEventListener('click', saveSession);
  dom.themeToggleBtn.addEventListener('click', toggleTheme);
  dom.syncToggleBtn?.addEventListener('click', toggleSync);

  setupModalListeners();
  initSync();

  if (isChromeExtension) {
    chrome.tabs.onCreated.addListener(refreshActiveTabs);
    chrome.tabs.onUpdated.addListener((_tabId, changeInfo) => {
      if (changeInfo.title || changeInfo.url || changeInfo.status === 'complete') {
        refreshActiveTabs();
      }
    });
    chrome.tabs.onRemoved.addListener(refreshActiveTabs);
  }
}

export { loadData };
