import { MOCK_COLLECTIONS, MOCK_ACTIVE_TABS } from './constants.js';
import { isChromeExtension, loadCollections } from './storage.js';
import { persistCollectionsWithSync, restoreFavicons } from './sync.js';
import { getFaviconUrl } from './utils.js';
import { state } from './state.js';
import { showToast } from './toast.js';
import { pushUndo, executeUndo } from './undo.js';
import { closeBrowserTab, openTabUrl, refreshActiveTabsNow } from './tabs.js';

export async function loadData() {
  if (isChromeExtension) {
    state.collections = restoreFavicons(await loadCollections());
    const { renderCollections } = await import('./render.js');
    renderCollections();
    const { loadActiveTabs } = await import('./tabs.js');
    loadActiveTabs();
  } else {
    const localSaved = localStorage.getItem('collections');
    state.collections = localSaved ? JSON.parse(localSaved) : MOCK_COLLECTIONS;
    state.activeTabs = MOCK_ACTIVE_TABS;
    const { renderCollections, renderActiveTabs } = await import('./render.js');
    renderCollections();
    renderActiveTabs();
  }
}

export function persistData(options = {}) {
  return persistCollectionsWithSync(state.collections, options);
}

export function createNewCollection(name = 'Untitled Collection') {
  state.collections.push({
    id: `col-${Date.now()}`,
    name,
    tabs: [],
  });
  persistData();
  showToast(`Created collection "${name}"`);
}

export function deleteCollection(id) {
  const index = state.collections.findIndex((c) => c.id === id);
  if (index === -1) return;

  const colName = state.collections[index].name;
  const snapshot = structuredClone(state.collections[index]);

  state.collections = state.collections.filter((c) => c.id !== id);
  persistData();

  pushUndo(() => {
    state.collections.splice(index, 0, snapshot);
    persistData();
    showToast(`Restored "${colName}"`);
  });

  showToast(`Deleted "${colName}"`, 'success', { onUndo: executeUndo });
}

export function renameCollection(id, newName) {
  if (!newName) return;
  const col = state.collections.find((c) => c.id === id);
  if (col) {
    col.name = newName;
    persistData();
  }
}

export function deleteSavedTab(collectionId, index) {
  const col = state.collections.find((c) => c.id === collectionId);
  if (!col || !col.tabs[index]) return;

  const tabName = col.tabs[index].title;
  const snapshot = structuredClone(col.tabs[index]);

  col.tabs.splice(index, 1);
  persistData();

  pushUndo(() => {
    const target = state.collections.find((c) => c.id === collectionId);
    if (!target) return;
    target.tabs.splice(index, 0, snapshot);
    persistData();
    showToast(`Restored "${tabName}"`);
  });

  showToast(`Removed "${tabName}"`, 'success', { onUndo: executeUndo });
}

export function handleTabDropOnCollection(targetCollectionId) {
  if (!state.draggedElementData) return;

  const targetCol = state.collections.find((c) => c.id === targetCollectionId);
  if (!targetCol) return;

  const { draggedElementData: drag } = state;

  if (drag.type === 'active') {
    const newTab = {
      title: drag.title,
      url: drag.url,
      favicon: getFaviconUrl(drag.url),
    };
    targetCol.tabs.push(newTab);
    closeBrowserTab(drag.tabId);
    persistData();
    showToast(`Saved "${newTab.title}" to ${targetCol.name}`);
  } else if (drag.type === 'saved') {
    const sourceCol = state.collections.find((c) => c.id === drag.collectionId);
    if (!sourceCol || sourceCol.id === targetCol.id) return;

    const movedTab = sourceCol.tabs.splice(drag.index, 1)[0];
    targetCol.tabs.push(movedTab);
    persistData();
    showToast(`Moved "${movedTab.title}" to ${targetCol.name}`);
  }

  state.draggedElementData = null;
}

export function handleCollectionDropOnCollection(sourceId, targetId) {
  if (sourceId === targetId) return;

  const sourceIndex = state.collections.findIndex((c) => c.id === sourceId);
  const targetIndex = state.collections.findIndex((c) => c.id === targetId);

  if (sourceIndex !== -1 && targetIndex !== -1) {
    const [movedCol] = state.collections.splice(sourceIndex, 1);
    state.collections.splice(targetIndex, 0, movedCol);
    persistData();
    showToast('Reordered collections');
  }
}

export function quickSaveTab(tab) {
  if (state.collections.length === 0) {
    createNewCollection('Inbox');
  }

  const inbox = state.collections[0];
  inbox.tabs.push({
    title: tab.title,
    url: tab.url,
    favicon: getFaviconUrl(tab.url),
  });

  closeBrowserTab(tab.id);
  persistData();
  showToast(`Saved "${tab.title}" to ${inbox.name}`);
}

export function saveSession() {
  if (state.activeTabs.length === 0) {
    showToast('No active tabs to save', 'error');
    return;
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const timeStr = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  const sessionName = `Session (${dateStr} ${timeStr})`;

  const savedTabs = state.activeTabs.map((tab) => ({
    title: tab.title,
    url: tab.url,
    favicon: getFaviconUrl(tab.url),
  }));

  state.collections.push({
    id: `col-${Date.now()}`,
    name: sessionName,
    tabs: savedTabs,
  });

  if (isChromeExtension) {
    const tabIds = state.activeTabs.map((t) => t.id);
    chrome.tabs.create({}, () => {
      chrome.tabs.remove(tabIds, () => {
        refreshActiveTabsNow();
      });
    });
  } else {
    state.activeTabs = [];
    import('./render.js').then(({ renderActiveTabs }) => renderActiveTabs());
  }

  persistData();
  showToast(`Saved session with ${savedTabs.length} tabs`);
}

export function openAllTabsInCollection(collectionId) {
  const col = state.collections.find((c) => c.id === collectionId);
  if (col && col.tabs.length > 0) {
    col.tabs.forEach((tab) => openTabUrl(tab.url));
    showToast(`Opening ${col.tabs.length} tabs...`);
  } else {
    showToast('Collection is empty', 'error');
  }
}

export function addCustomTabToCollection(collectionId, title, url) {
  const targetCol = state.collections.find((c) => c.id === collectionId);
  if (!targetCol) return false;

  targetCol.tabs.push({
    title,
    url,
    favicon: getFaviconUrl(url),
  });
  persistData();
  showToast(`Added custom link to ${targetCol.name}`);
  return true;
}

export function addImportedCollections(importedCollections) {
  if (!Array.isArray(importedCollections) || importedCollections.length === 0) return 0;

  const snapshot = structuredClone(state.collections);
  let importedCount = 0;

  importedCollections.forEach((collection) => {
    if (!collection?.tabs?.length) return;

    const existing = state.collections.find(
      (candidate) => candidate.name.trim().toLowerCase() === collection.name.trim().toLowerCase(),
    );

    if (existing) {
      existing.tabs.push(...collection.tabs);
    } else {
      state.collections.push(collection);
    }
    importedCount += collection.tabs.length;
  });

  if (importedCount === 0) return 0;

  persistData();
  pushUndo(() => {
    state.collections = snapshot;
    persistData();
    showToast('Reverted bookmark import');
  });
  showToast(`Imported ${importedCount} bookmarks`, 'success', { onUndo: executeUndo });
  return importedCount;
}

export function replaceAllCollections(nextCollections) {
  if (!Array.isArray(nextCollections) || nextCollections.length === 0) return false;

  const snapshot = structuredClone(state.collections);
  state.collections = nextCollections;
  persistData();

  pushUndo(() => {
    state.collections = snapshot;
    persistData();
    showToast('Restored your previous organization');
  });

  const linkCount = nextCollections.reduce((total, collection) => total + collection.tabs.length, 0);
  showToast(`Organized ${linkCount} links into ${nextCollections.length} collections`, 'success', {
    onUndo: executeUndo,
  });
  return true;
}
