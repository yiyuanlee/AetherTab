import { FALLBACK_FAVICON_DATA_URL } from './constants.js';
import { state, dom } from './state.js';
import {
  escapeHtml,
  cleanUrl,
  getFaviconUrl,
  getDomainBadgeName,
  bindFaviconFallback,
} from './utils.js';
import {
  persistData,
  renameCollection,
  deleteCollection,
  deleteSavedTab,
  handleTabDropOnCollection,
  handleCollectionDropOnCollection,
  quickSaveTab,
  openAllTabsInCollection,
} from './collections.js';
import { activateBrowserTab, closeBrowserTab, openTabUrl } from './tabs.js';
import { openCustomTabModal } from './modal.js';
import { openShareCollectionModal } from './bookmark-manager.js';

function filterTabsInCard(col, localQuery) {
  return col.tabs.filter((tab) => {
    if (!localQuery) return true;
    return (
      tab.title.toLowerCase().includes(localQuery) ||
      tab.url.toLowerCase().includes(localQuery)
    );
  });
}

function createActiveTabEl(tab) {
  const item = document.createElement('div');
  item.className = 'tab-item';
  item.draggable = true;
  item.dataset.tabId = tab.id;

  const faviconUrl = getFaviconUrl(tab.url);

  item.innerHTML = `
    <div class="tab-favicon">
      <img src="${faviconUrl}" width="16" height="16" data-fallback="${FALLBACK_FAVICON_DATA_URL}">
    </div>
    <div class="tab-info">
      <div class="tab-title">${escapeHtml(tab.title)}</div>
      <div class="tab-url">${escapeHtml(cleanUrl(tab.url))}</div>
    </div>
    <div class="tab-actions">
      <button class="tab-action-btn save-single-tab" title="Save this tab">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
      </button>
      <button class="tab-action-btn close-single-tab delete-tab-btn" title="Close tab">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>
  `;

  bindFaviconFallback(item.querySelector('img'));

  item.addEventListener('dragstart', (e) => {
    item.classList.add('dragging');
    state.draggedElementData = {
      type: 'active',
      tabId: tab.id,
      title: tab.title,
      url: tab.url,
    };
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', tab.url);
  });

  item.addEventListener('dragend', () => item.classList.remove('dragging'));
  item.querySelector('.save-single-tab').addEventListener('click', (e) => {
    e.stopPropagation();
    quickSaveTab(tab);
  });
  item.querySelector('.close-single-tab').addEventListener('click', (e) => {
    e.stopPropagation();
    closeBrowserTab(tab.id);
  });
  item.addEventListener('click', () => activateBrowserTab(tab.id));

  return item;
}

function createSavedTabEl(tab, col, index) {
  const tabEl = document.createElement('div');
  tabEl.className = 'tab-item';
  tabEl.draggable = true;
  tabEl.dataset.index = index;
  tabEl.dataset.collectionId = col.id;

  const faviconUrl = getFaviconUrl(tab.url);
  const domain = cleanUrl(tab.url).split('/')[0];
  const badgeName = getDomainBadgeName(tab.url, domain);

  tabEl.innerHTML = `
    <div class="tab-favicon">
      <img src="${faviconUrl}" width="20" height="20" data-fallback="${FALLBACK_FAVICON_DATA_URL}">
    </div>
    <div class="tab-info">
      <div class="tab-title" title="${escapeHtml(tab.title)}">${escapeHtml(tab.title)}</div>
      <div class="tab-meta-row">
        <span class="domain-badge">${escapeHtml(badgeName)}</span>
        <div class="tab-url" title="${escapeHtml(tab.url)}">${escapeHtml(cleanUrl(tab.url))}</div>
      </div>
    </div>
    <div class="tab-actions">
      <button class="tab-action-btn delete-saved-tab delete-tab-btn" title="Remove link">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>
  `;

  bindFaviconFallback(tabEl.querySelector('img'));

  tabEl.addEventListener('dragstart', (e) => {
    tabEl.classList.add('dragging');
    state.draggedElementData = {
      type: 'saved',
      collectionId: col.id,
      index,
      title: tab.title,
      url: tab.url,
    };
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', tab.url);
  });

  tabEl.addEventListener('dragend', () => tabEl.classList.remove('dragging'));
  tabEl.addEventListener('click', (e) => {
    if (e.target.closest('.delete-saved-tab')) return;
    openTabUrl(tab.url);
  });
  tabEl.querySelector('.delete-saved-tab').addEventListener('click', (e) => {
    e.stopPropagation();
    deleteSavedTab(col.id, index);
  });

  return tabEl;
}

function renderTabsIntoContainer(col, tabsListContainer, activeTabsInCard) {
  tabsListContainer.innerHTML = '';

  if (col.isGrouped && activeTabsInCard.length > 0) {
    const groups = {};
    activeTabsInCard.forEach((tab) => {
      const originalIndex = col.tabs.findIndex((t) => t === tab);
      const domain = cleanUrl(tab.url).split('/')[0];
      if (!groups[domain]) groups[domain] = [];
      groups[domain].push({ tab, originalIndex });
    });

    Object.keys(groups).forEach((domain) => {
      const domainTabs = groups[domain];
      const groupKey = `${col.id}-${domain}`;
      const isCollapsed = state.collapsedDomainGroups[groupKey] || false;

      const groupDiv = document.createElement('div');
      groupDiv.className = `domain-group ${isCollapsed ? 'collapsed' : ''}`;

      const badgeName = getDomainBadgeName(domainTabs[0].tab.url, domain);
      const faviconUrl = getFaviconUrl(domainTabs[0].tab.url);

      groupDiv.innerHTML = `
        <div class="domain-group-header">
          <div class="domain-group-title">
            <img src="${faviconUrl}" data-fallback="${FALLBACK_FAVICON_DATA_URL}">
            <span>${escapeHtml(badgeName)}</span>
          </div>
          <div class="domain-group-actions">
            <span class="domain-group-count">${domainTabs.length}</span>
            <div class="domain-group-caret">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
          </div>
        </div>
        <div class="domain-group-list"></div>
      `;

      bindFaviconFallback(groupDiv.querySelector('img'));

      const groupListContainer = groupDiv.querySelector('.domain-group-list');
      domainTabs.forEach(({ tab, originalIndex }) => {
        groupListContainer.appendChild(createSavedTabEl(tab, col, originalIndex));
      });

      groupDiv.querySelector('.domain-group-header').addEventListener('click', () => {
        const collapsedState = !groupDiv.classList.contains('collapsed');
        groupDiv.classList.toggle('collapsed');
        state.collapsedDomainGroups[groupKey] = collapsedState;
      });

      tabsListContainer.appendChild(groupDiv);
    });
    return;
  }

  activeTabsInCard.forEach((tab) => {
    const originalIndex = col.tabs.findIndex((t) => t === tab);
    tabsListContainer.appendChild(createSavedTabEl(tab, col, originalIndex));
  });
}

export function renderCardTabsOnly(collectionId, cardElement) {
  const col = state.collections.find((c) => c.id === collectionId);
  if (!col) return;

  const localQuery = (state.cardSearchQueries[collectionId] || '').toLowerCase().trim();
  const tabsListContainer = cardElement.querySelector('.collection-tabs-list');
  const countBadge = cardElement.querySelector('.collection-badge');
  const activeTabsInCard = filterTabsInCard(col, localQuery);

  countBadge.textContent = activeTabsInCard.length;
  renderTabsIntoContainer(col, tabsListContainer, activeTabsInCard);
}

export function renderActiveTabs() {
  const filterQuery = dom.activeSearchInput.value.toLowerCase().trim();
  dom.activeTabsList.innerHTML = '';

  const filtered = state.activeTabs.filter(
    (tab) =>
      tab.title.toLowerCase().includes(filterQuery) ||
      tab.url.toLowerCase().includes(filterQuery),
  );

  dom.activeTabCount.textContent = filtered.length;

  if (filtered.length === 0) {
    dom.activeTabsList.innerHTML = `
      <div class="empty-state" style="padding: 20px; text-align: center; color: var(--text-muted); font-size: 13px;">
        No active tabs found
      </div>
    `;
    return;
  }

  filtered.forEach((tab) => dom.activeTabsList.appendChild(createActiveTabEl(tab)));
}

function buildCollectionCard(col) {
  const card = document.createElement('div');
  card.className = 'collection-card';
  card.dataset.id = col.id;

  const isGrouped = col.isGrouped || false;
  const isSearchActive = state.cardSearchActive[col.id] || false;
  const localQuery = (state.cardSearchQueries[col.id] || '').toLowerCase().trim();
  const activeTabsInCard = filterTabsInCard(col, localQuery);

  card.innerHTML = `
    <div class="collection-header-row">
      <div class="collection-title-container">
        <div class="collection-drag-handle" title="Drag to reorder collection">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg>
        </div>
        <input type="text" class="collection-title-input" value="${escapeHtml(col.name)}" title="Double click to edit title">
        <span class="collection-badge">${activeTabsInCard.length}</span>
      </div>
      <div class="collection-actions">
        <button class="collection-action-btn toggle-card-search-btn ${isSearchActive ? 'active' : ''}" title="Search in collection">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </button>
        <button class="collection-action-btn toggle-group-btn ${isGrouped ? 'active' : ''}" title="${isGrouped ? 'Show as List' : 'Group by Site'}">
          ${isGrouped
            ? '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>'
            : '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>'}
        </button>
        <button class="collection-action-btn add-custom-link-btn" title="Add custom link">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
        <button class="collection-action-btn open-all-tabs-btn" title="Open all tabs">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
        </button>
        <button class="collection-action-btn share-collection-btn" title="Share collection">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.6" y1="10.5" x2="15.4" y2="6.5"></line><line x1="8.6" y1="13.5" x2="15.4" y2="17.5"></line></svg>
        </button>
        <button class="collection-action-btn delete-collection-btn" title="Delete collection">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>
    </div>
    <div class="collection-card-search ${isSearchActive ? '' : 'hidden'}">
      <input type="text" placeholder="Filter inside this collection..." value="${escapeHtml(state.cardSearchQueries[col.id] || '')}">
    </div>
    <div class="collection-tabs-list"></div>
  `;

  const tabsListContainer = card.querySelector('.collection-tabs-list');
  renderTabsIntoContainer(col, tabsListContainer, activeTabsInCard);

  card.querySelector('.collection-card-search input').addEventListener('input', (e) => {
    state.cardSearchQueries[col.id] = e.target.value;
    renderCardTabsOnly(col.id, card);
  });

  card.querySelector('.toggle-card-search-btn').addEventListener('click', () => {
    const searchContainer = card.querySelector('.collection-card-search');
    const active = searchContainer.classList.contains('hidden');

    state.cardSearchActive[col.id] = active;
    searchContainer.classList.toggle('hidden');

    if (active) {
      searchContainer.querySelector('input').focus();
    } else {
      searchContainer.querySelector('input').value = '';
      state.cardSearchQueries[col.id] = '';
      renderCardTabsOnly(col.id, card);
    }
  });

  card.querySelector('.toggle-group-btn').addEventListener('click', () => {
    col.isGrouped = !col.isGrouped;
    persistData();
  });

  const titleInput = card.querySelector('.collection-title-input');
  titleInput.addEventListener('change', (e) => renameCollection(col.id, e.target.value.trim()));
  titleInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') titleInput.blur();
  });

  card.querySelector('.add-custom-link-btn').addEventListener('click', () => openCustomTabModal(col.id));
  card.querySelector('.open-all-tabs-btn').addEventListener('click', () => openAllTabsInCollection(col.id));
  card.querySelector('.share-collection-btn').addEventListener('click', () => openShareCollectionModal(col.id));
  card.querySelector('.delete-collection-btn').addEventListener('click', () => {
    if (confirm(`Are you sure you want to delete the collection "${col.name}"?`)) {
      deleteCollection(col.id);
    }
  });

  const dragHandle = card.querySelector('.collection-drag-handle');
  dragHandle.draggable = true;

  dragHandle.addEventListener('dragstart', (e) => {
    state.draggedElementData = { type: 'collection', id: col.id };
    card.classList.add('dragging-card');
    e.dataTransfer.effectAllowed = 'move';
    if (e.dataTransfer.setDragImage) e.dataTransfer.setDragImage(card, 20, 20);
  });

  dragHandle.addEventListener('dragend', () => {
    card.classList.remove('dragging-card');
    document.querySelectorAll('.collection-card').forEach((c) => {
      c.classList.remove('drag-over-card', 'drag-over');
    });
  });

  card.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (!state.draggedElementData) return;

    if (state.draggedElementData.type === 'collection') {
      if (state.draggedElementData.id !== col.id) card.classList.add('drag-over-card');
    } else {
      card.classList.add('drag-over');
    }
  });

  card.addEventListener('dragleave', () => {
    card.classList.remove('drag-over', 'drag-over-card');
  });

  card.addEventListener('drop', (e) => {
    e.preventDefault();
    card.classList.remove('drag-over', 'drag-over-card');

    if (!state.draggedElementData) return;

    if (state.draggedElementData.type === 'collection') {
      handleCollectionDropOnCollection(state.draggedElementData.id, col.id);
    } else {
      handleTabDropOnCollection(col.id);
    }
  });

  return card;
}

export function renderCollections() {
  const mainFilter = dom.workspaceSearchInput.value.toLowerCase().trim();
  dom.collectionsGrid.innerHTML = '';

  const filteredCollections = state.collections
    .map((col) => {
      if (col.name.toLowerCase().includes(mainFilter)) return col;
      const matchingTabs = col.tabs.filter(
        (tab) =>
          tab.title.toLowerCase().includes(mainFilter) ||
          tab.url.toLowerCase().includes(mainFilter),
      );
      if (matchingTabs.length > 0) return { ...col, tabs: matchingTabs };
      return null;
    })
    .filter(Boolean);

  if (filteredCollections.length === 0) {
    dom.collectionsGrid.innerHTML = `
      <div class="empty-state-workspace" style="grid-column: 1/-1; padding: 60px 20px; text-align: center; color: var(--text-muted);">
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 16px; opacity: 0.5; color: var(--accent-primary)">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
        </svg>
        <h3>No Collections Found</h3>
        <p style="margin-top: 8px; font-size: 14px;">Create a collection or try a different search query</p>
      </div>
    `;
    return;
  }

  filteredCollections.forEach((col) => {
    dom.collectionsGrid.appendChild(buildCollectionCard(col));
  });
}
