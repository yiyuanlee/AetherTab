import {
  isChromeExtension,
  isSyncEnabled,
  setSyncEnabled,
  loadCollections,
  saveCollections,
  onStorageChanged,
  SYNC_META_KEY,
  SYNC_CHUNK_PREFIX,
  SYNC_ENABLED_KEY,
} from './storage.js';
import { state } from './state.js';
import { getFaviconUrl } from './utils.js';
import { showToast } from './toast.js';
import { setTheme, setColorScheme } from './widgets.js';

let syncStatus = 'off';
let applyingRemoteUpdate = false;
let unsubscribeStorage = null;

const COLLECTIONS_CHANGE_KEYS = new Set([
  'collections',
  SYNC_META_KEY,
  `${SYNC_CHUNK_PREFIX}0`,
]);

function stripFavicons(collections) {
  return collections.map((collection) => ({
    ...collection,
    tabs: collection.tabs.map(({ title, url }) => ({ title, url })),
  }));
}

export function restoreFavicons(collections) {
  return collections.map((collection) => ({
    ...collection,
    tabs: collection.tabs.map((tab) => ({
      ...tab,
      favicon: tab.favicon || getFaviconUrl(tab.url),
    })),
  }));
}

export function getSyncStatus() {
  return syncStatus;
}

function setSyncStatus(status) {
  syncStatus = status;
  updateSyncUi();
}

function updateSyncUi() {
  const btn = document.getElementById('sync-toggle');
  if (!btn) return;

  const label = btn.querySelector('.sync-label');
  const dot = btn.querySelector('.sync-status-dot');

  btn.classList.remove('sync-on', 'sync-off', 'sync-pending', 'sync-error');
  btn.classList.add(`sync-${syncStatus === 'on' ? 'on' : syncStatus === 'pending' ? 'pending' : syncStatus === 'error' ? 'error' : 'off'}`);

  if (label) {
    const labels = {
      on: 'Sync On',
      off: 'Sync Off',
      pending: 'Syncing...',
      error: 'Sync Error',
    };
    label.textContent = labels[syncStatus] || 'Sync Off';
  }

  if (dot) {
    dot.title =
      syncStatus === 'on'
        ? 'Collections sync across your Chrome profile'
        : syncStatus === 'pending'
          ? 'Applying changes...'
          : syncStatus === 'error'
            ? 'Sync failed — check Chrome sync settings'
            : 'Local only — enable to sync across devices';
  }
}

async function applyRemoteCollections(collections, updatedAt) {
  applyingRemoteUpdate = true;
  try {
    state.collections = restoreFavicons(collections);
    await saveCollections(stripFavicons(state.collections), {
      updatedAt,
      source: 'remote-echo',
    }, { skipSync: true });
    const { renderCollections } = await import('./render.js');
    renderCollections();
  } finally {
    applyingRemoteUpdate = false;
  }
}

function isCollectionsChange(changes) {
  return Object.keys(changes).some((key) => {
    if (COLLECTIONS_CHANGE_KEYS.has(key)) return true;
    return key.startsWith(SYNC_CHUNK_PREFIX);
  });
}

async function handleRemoteChanges(changes, areaName) {
  if (!isChromeExtension || applyingRemoteUpdate) return;

  const syncEnabled = await isSyncEnabled();
  if (!syncEnabled) return;

  if (areaName === 'sync') {
    if (changes[SYNC_ENABLED_KEY]?.newValue === false) {
      setSyncStatus('off');
      return;
    }

    if (changes.theme?.newValue) {
      setTheme(changes.theme.newValue);
    }

    if (changes.colorScheme?.newValue) {
      setColorScheme(changes.colorScheme.newValue);
    }

    if (isCollectionsChange(changes)) {
      setSyncStatus('pending');
      try {
        const remoteCollections = restoreFavicons(await loadCollections());
        const remoteMeta = changes[SYNC_META_KEY]?.newValue;
        const localMeta = (await chrome.storage.sync.get([SYNC_META_KEY]))[SYNC_META_KEY];
        const remoteUpdatedAt = remoteMeta?.updatedAt || localMeta?.updatedAt || 0;

        if (JSON.stringify(remoteCollections) !== JSON.stringify(state.collections)) {
          await applyRemoteCollections(stripFavicons(remoteCollections), remoteUpdatedAt);
          showToast('Collections updated from another device');
        }
        setSyncStatus('on');
      } catch {
        setSyncStatus('error');
        showToast('Failed to apply synced collections', 'error');
      }
    }
  }
}

export async function initSync() {
  if (!isChromeExtension) {
    setSyncStatus('off');
    return;
  }

  const enabled = await isSyncEnabled();
  setSyncStatus(enabled ? 'on' : 'off');
  updateSyncUi();

  if (unsubscribeStorage) {
    unsubscribeStorage();
  }
  unsubscribeStorage = onStorageChanged(handleRemoteChanges);
}

export async function toggleSync() {
  if (!isChromeExtension) {
    showToast('Sync requires the Chrome extension', 'error');
    return;
  }

  const currentlyEnabled = await isSyncEnabled();
  setSyncStatus('pending');

  try {
    if (!currentlyEnabled) {
      const localCollections = restoreFavicons(await loadCollections());
      state.collections = localCollections;
      await setSyncEnabled(true);
      await saveCollections(stripFavicons(localCollections), {
        updatedAt: Date.now(),
        source: 'enable-sync',
      });

      const { theme, colorScheme } = await chrome.storage.local.get(['theme', 'colorScheme']);
      const weather = await chrome.storage.local.get(['weatherLocation', 'weatherUnit']);
      const syncPayload = {};
      if (theme) syncPayload.theme = theme;
      if (colorScheme) syncPayload.colorScheme = colorScheme;
      if (weather.weatherLocation) syncPayload.weatherLocation = weather.weatherLocation;
      if (weather.weatherUnit) syncPayload.weatherUnit = weather.weatherUnit;
      if (Object.keys(syncPayload).length > 0) {
        await chrome.storage.sync.set(syncPayload);
      }

      setSyncStatus('on');
      showToast('Sync enabled — collections will follow your Chrome profile');
      return;
    }

    const syncedCollections = restoreFavicons(await loadCollections());
    state.collections = syncedCollections;
    await saveCollections(stripFavicons(syncedCollections), {
      updatedAt: Date.now(),
      source: 'disable-sync',
    });
    await setSyncEnabled(false);

    const { renderCollections } = await import('./render.js');
    renderCollections();
    setSyncStatus('off');
    showToast('Sync disabled — data kept on this device');
  } catch (error) {
    setSyncStatus('error');
    showToast(error.message || 'Sync operation failed', 'error');
  }
}

export async function persistCollectionsWithSync(collections, options = {}) {
  if (applyingRemoteUpdate) {
    return;
  }

  const { rerender = true } = options;
  const payload = stripFavicons(collections);

  setSyncStatus((await isSyncEnabled()) ? 'pending' : 'off');

  try {
    await saveCollections(payload, {
      updatedAt: Date.now(),
      source: 'local-edit',
    });
    setSyncStatus((await isSyncEnabled()) ? 'on' : 'off');
  } catch (error) {
    setSyncStatus('error');
    showToast(error.message || 'Failed to save collections', 'error');
    throw error;
  }

  if (rerender) {
    const { renderCollections } = await import('./render.js');
    renderCollections();
  }
}
