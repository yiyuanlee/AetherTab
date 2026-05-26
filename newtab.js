// AetherTab Frontend Application Logic

// Mock Data for fallback when running outside of Chrome Extension environment
const MOCK_COLLECTIONS = [
  {
    id: "col-1",
    name: "🚀 Getting Started",
    tabs: [
      { title: "Welcome to AetherTab", url: "https://github.com", favicon: "" },
      { title: "Chrome Extension Developer Guide", url: "https://developer.chrome.com", favicon: "" }
    ]
  },
  {
    id: "col-2",
    name: "🎨 Design Inspiration",
    tabs: [
      { title: "Dribbble - Discover Design", url: "https://dribbble.com", favicon: "" },
      { title: "Awwwards - Website Awards", url: "https://awwwards.com", favicon: "" },
      { title: "CSS-Tricks - Web Design Tips", url: "https://css-tricks.com", favicon: "" }
    ]
  }
];

const MOCK_ACTIVE_TABS = [
  { id: 101, title: "AetherTab Dashboard", url: "chrome://newtab" },
  { id: 102, title: "YouTube - Lo-Fi Beats", url: "https://youtube.com" },
  { id: 103, title: "GitHub - Antigravity Repo", url: "https://github.com" },
  { id: 104, title: "Notion Workspace", url: "https://notion.so" },
  { id: 105, title: "Stack Overflow - Javascript Questions", url: "https://stackoverflow.com" }
];

// State variables
let collections = [];
let activeTabs = [];
let isChromeExtension = typeof chrome !== 'undefined' && chrome.tabs && chrome.storage;
let draggedElementData = null; // Stores dragging info: { type: 'active'|'saved', tabId: int, collectionId: string, index: int }

// Base64 SVG constants to prevent HTML quotes clashing
const GLOBE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`;
const GLOBE_FAVICON_DATA_URL = `data:image/svg+xml;base64,${btoa(GLOBE_SVG)}`;

const FALLBACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#94a3b8" stroke-width="2"><circle cx="12" cy="12" r="10"></circle></svg>`;
const FALLBACK_FAVICON_DATA_URL = `data:image/svg+xml;base64,${btoa(FALLBACK_SVG)}`;


// DOM Elements
const sidebar = document.getElementById('sidebar');
const toggleSidebarBtn = document.getElementById('toggle-sidebar');
const expandSidebarBtn = document.getElementById('expand-sidebar');
const themeToggleBtn = document.getElementById('theme-toggle');
const activeTabsList = document.getElementById('active-tabs-list');
const activeTabCount = document.getElementById('active-tab-count');
const activeSearchInput = document.getElementById('active-search');
const workspaceSearchInput = document.getElementById('workspace-search');
const collectionsGrid = document.getElementById('collections-grid');
const newCollectionBtn = document.getElementById('new-collection-btn');
const saveSessionBtn = document.getElementById('save-session-btn');
const toastContainer = document.getElementById('toast-container');

// Modal Elements
const customTabModal = document.getElementById('custom-tab-modal');
const closeModalBtn = document.getElementById('close-modal');
const cancelModalBtn = document.getElementById('cancel-modal');
const saveModalBtn = document.getElementById('save-modal');
const customTitleInput = document.getElementById('custom-title');
const customUrlInput = document.getElementById('custom-url');
let activeModalCollectionId = null;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  initClock();
  initTheme();
  loadData();
  setupEventListeners();
});

// Clock, Greeting & Date Widget
function initClock() {
  const clockEl = document.getElementById('digital-clock');
  const greetingEl = document.getElementById('greeting');
  const dateEl = document.getElementById('date-string');

  function updateClock() {
    const now = new Date();
    
    // Time
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    clockEl.textContent = `${hours}:${minutes}:${seconds}`;

    // Greeting
    const hour = now.getHours();
    let greeting = "Hello";
    if (hour >= 5 && hour < 12) greeting = "Good morning";
    else if (hour >= 12 && hour < 17) greeting = "Good afternoon";
    else if (hour >= 17 && hour < 22) greeting = "Good evening";
    else greeting = "Hello, night owl";
    
    greetingEl.textContent = greeting;

    // Date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateEl.textContent = now.toLocaleDateString(undefined, options);
  }

  updateClock();
  setInterval(updateClock, 1000);
}

// Theme management
function initTheme() {
  if (isChromeExtension) {
    chrome.storage.local.get(['theme'], (result) => {
      const theme = result.theme || 'dark';
      setTheme(theme);
    });
  } else {
    const theme = localStorage.getItem('theme') || 'dark';
    setTheme(theme);
  }
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const themeLabel = themeToggleBtn.querySelector('.theme-label');
  if (theme === 'dark') {
    themeLabel.textContent = 'Dark Mode';
  } else {
    themeLabel.textContent = 'Light Mode';
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
  
  if (isChromeExtension) {
    chrome.storage.local.set({ theme: newTheme });
  } else {
    localStorage.setItem('theme', newTheme);
  }
}

// Load Collections and Active Tabs
function loadData() {
  if (isChromeExtension) {
    // Load collections
    chrome.storage.local.get(['collections'], (result) => {
      collections = result.collections || [];
      renderCollections();
    });

    // Load active open tabs
    refreshActiveTabs();
  } else {
    // Fallback Mock Data
    const localSaved = localStorage.getItem('collections');
    collections = localSaved ? JSON.parse(localSaved) : MOCK_COLLECTIONS;
    activeTabs = MOCK_ACTIVE_TABS;
    renderCollections();
    renderActiveTabs();
  }
}

function refreshActiveTabs() {
  if (!isChromeExtension) return;

  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    // Filter out our own newtab dashboard to avoid inception
    const currentTabId = getQueryParam('id');
    activeTabs = tabs.filter(tab => {
      const isNewTab = tab.url.includes('chrome://newtab') || 
                        tab.url.includes(chrome.runtime.id) || 
                        tab.url.startsWith('chrome-extension://');
      return !isNewTab;
    });
    renderActiveTabs();
  });
}

function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// Get Favicon URL in MV3
function getFaviconUrl(url) {
  if (!url) return '';
  if (url.startsWith('chrome://') || url.startsWith('chrome-extension://') || url.startsWith('edge://')) {
    return GLOBE_FAVICON_DATA_URL;
  }
  if (isChromeExtension) {
    return `chrome-extension://${chrome.runtime.id}/_favicon/?pageUrl=${encodeURIComponent(url)}&size=32`;
  }
  // Generic public fallback
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch (e) {
    return '';
  }
}

// Render Active Tabs in Sidebar
function renderActiveTabs() {
  const filterQuery = activeSearchInput.value.toLowerCase().trim();
  activeTabsList.innerHTML = '';
  
  const filtered = activeTabs.filter(tab => 
    tab.title.toLowerCase().includes(filterQuery) || 
    tab.url.toLowerCase().includes(filterQuery)
  );

  activeTabCount.textContent = filtered.length;

  if (filtered.length === 0) {
    activeTabsList.innerHTML = `
      <div class="empty-state" style="padding: 20px; text-align: center; color: var(--text-muted); font-size: 13px;">
        No active tabs found
      </div>
    `;
    return;
  }

  filtered.forEach((tab) => {
    const item = document.createElement('div');
    item.className = 'tab-item';
    item.draggable = true;
    item.dataset.tabId = tab.id;
    item.dataset.title = tab.title;
    item.dataset.url = tab.url;

    // Favicon Image
    const faviconUrl = getFaviconUrl(tab.url);
    
    item.innerHTML = `
      <div class="tab-favicon">
        <img src="${faviconUrl}" width="16" height="16" onerror="this.onerror=null; this.src='${FALLBACK_FAVICON_DATA_URL}'">
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

    // Drag-start event
    item.addEventListener('dragstart', (e) => {
      item.classList.add('dragging');
      draggedElementData = {
        type: 'active',
        tabId: tab.id,
        title: tab.title,
        url: tab.url
      };
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', tab.url);
    });

    item.addEventListener('dragend', () => {
      item.classList.remove('dragging');
    });

    // Quick save click
    item.querySelector('.save-single-tab').addEventListener('click', (e) => {
      e.stopPropagation();
      quickSaveTab(tab);
    });

    // Close single tab click
    item.querySelector('.close-single-tab').addEventListener('click', (e) => {
      e.stopPropagation();
      closeBrowserTab(tab.id);
    });

    // Simple click to focus/activate tab
    item.addEventListener('click', () => {
      activateBrowserTab(tab.id);
    });

    activeTabsList.appendChild(item);
  });
}

// Render Collections Grid
function renderCollections() {
  const filterQuery = workspaceSearchInput.value.toLowerCase().trim();
  collectionsGrid.innerHTML = '';

  const filteredCollections = collections.map(col => {
    // If collection title matches, keep all its tabs
    if (col.name.toLowerCase().includes(filterQuery)) {
      return col;
    }
    // Otherwise filter its tabs
    const matchingTabs = col.tabs.filter(tab => 
      tab.title.toLowerCase().includes(filterQuery) || 
      tab.url.toLowerCase().includes(filterQuery)
    );
    if (matchingTabs.length > 0) {
      return { ...col, tabs: matchingTabs };
    }
    return null;
  }).filter(col => col !== null);

  if (filteredCollections.length === 0) {
    collectionsGrid.innerHTML = `
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
    const card = document.createElement('div');
    card.className = 'collection-card';
    card.dataset.id = col.id;

    card.innerHTML = `
      <div class="collection-header-row">
        <div class="collection-title-container">
          <input type="text" class="collection-title-input" value="${escapeHtml(col.name)}" title="Double click to edit title">
          <span class="collection-badge">${col.tabs.length}</span>
        </div>
        <div class="collection-actions">
          <button class="collection-action-btn add-custom-link-btn" title="Add custom link">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>
          <button class="collection-action-btn open-all-tabs-btn" title="Open all tabs">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          </button>
          <button class="collection-action-btn delete-collection-btn" title="Delete collection">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </div>
      <div class="collection-tabs-list" dataset-id="${col.id}">
        <!-- Saved tabs in collection -->
      </div>
    `;

    // Populate Saved Tabs
    const tabsListContainer = card.querySelector('.collection-tabs-list');
    col.tabs.forEach((tab, index) => {
      const tabEl = document.createElement('div');
      tabEl.className = 'tab-item';
      tabEl.draggable = true;
      tabEl.dataset.index = index;
      tabEl.dataset.collectionId = col.id;

      const faviconUrl = getFaviconUrl(tab.url);

      tabEl.innerHTML = `
        <div class="tab-favicon">
          <img src="${faviconUrl}" width="16" height="16" onerror="this.onerror=null; this.src='${FALLBACK_FAVICON_DATA_URL}'">
        </div>
        <div class="tab-info">
          <div class="tab-title">${escapeHtml(tab.title)}</div>
          <div class="tab-url">${escapeHtml(cleanUrl(tab.url))}</div>
        </div>
        <div class="tab-actions">
          <button class="tab-action-btn delete-saved-tab delete-tab-btn" title="Remove link">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      `;

      // Drag saved tabs (for re-organizing)
      tabEl.addEventListener('dragstart', (e) => {
        tabEl.classList.add('dragging');
        draggedElementData = {
          type: 'saved',
          collectionId: col.id,
          index: index,
          title: tab.title,
          url: tab.url
        };
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', tab.url);
      });

      tabEl.addEventListener('dragend', () => {
        tabEl.classList.remove('dragging');
      });

      // Click to open tab
      tabEl.addEventListener('click', (e) => {
        if (e.target.closest('.delete-saved-tab')) return;
        openTabUrl(tab.url);
      });

      // Delete saved tab click
      tabEl.querySelector('.delete-saved-tab').addEventListener('click', (e) => {
        e.stopPropagation();
        deleteSavedTab(col.id, index);
      });

      tabsListContainer.appendChild(tabEl);
    });

    // Collection title renaming events
    const titleInput = card.querySelector('.collection-title-input');
    titleInput.addEventListener('change', (e) => {
      renameCollection(col.id, e.target.value.trim());
    });

    titleInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        titleInput.blur();
      }
    });

    // Add manual link click
    card.querySelector('.add-custom-link-btn').addEventListener('click', () => {
      openCustomTabModal(col.id);
    });

    // Open all tabs click
    card.querySelector('.open-all-tabs-btn').addEventListener('click', () => {
      openAllTabsInCollection(col.id);
    });

    // Delete collection click
    card.querySelector('.delete-collection-btn').addEventListener('click', () => {
      if (confirm(`Are you sure you want to delete the collection "${col.name}"?`)) {
        deleteCollection(col.id);
      }
    });

    // Drag over card events (for drop zone)
    card.addEventListener('dragover', (e) => {
      e.preventDefault();
      card.classList.add('drag-over');
    });

    card.addEventListener('dragleave', () => {
      card.classList.remove('drag-over');
    });

    card.addEventListener('drop', (e) => {
      e.preventDefault();
      card.classList.remove('drag-over');
      handleTabDropOnCollection(col.id);
    });

    collectionsGrid.appendChild(card);
  });
}

// Data Mutation Operations
function persistData() {
  if (isChromeExtension) {
    chrome.storage.local.set({ collections }, () => {
      renderCollections();
    });
  } else {
    localStorage.setItem('collections', JSON.stringify(collections));
    renderCollections();
  }
}

function createNewCollection(name = "Untitled Collection") {
  const newCol = {
    id: 'col-' + Date.now(),
    name: name,
    tabs: []
  };
  collections.push(newCol);
  persistData();
  showToast(`Created collection "${name}"`);
}

function deleteCollection(id) {
  const colName = collections.find(c => c.id === id)?.name || "Collection";
  collections = collections.filter(c => c.id !== id);
  persistData();
  showToast(`Deleted "${colName}"`);
}

function renameCollection(id, newName) {
  if (!newName) return;
  const col = collections.find(c => c.id === id);
  if (col) {
    col.name = newName;
    persistData();
  }
}

function deleteSavedTab(collectionId, index) {
  const col = collections.find(c => c.id === collectionId);
  if (col) {
    const tabName = col.tabs[index].title;
    col.tabs.splice(index, 1);
    persistData();
    showToast(`Removed "${tabName}"`);
  }
}

// Drag & Drop Drop handler
function handleTabDropOnCollection(targetCollectionId) {
  if (!draggedElementData) return;

  const targetCol = collections.find(c => c.id === targetCollectionId);
  if (!targetCol) return;

  if (draggedElementData.type === 'active') {
    // Adding active browser tab to collection
    const newTab = {
      title: draggedElementData.title,
      url: draggedElementData.url,
      favicon: getFaviconUrl(draggedElementData.url)
    };
    targetCol.tabs.push(newTab);
    
    // Close the browser tab as satisfying "cleanup"
    closeBrowserTab(draggedElementData.tabId);
    
    persistData();
    showToast(`Saved "${newTab.title}" to ${targetCol.name}`);
  } else if (draggedElementData.type === 'saved') {
    // Moving/sorting tab from collection to collection
    const sourceCol = collections.find(c => c.id === draggedElementData.collectionId);
    if (!sourceCol) return;

    // If drop is on the same collection, we don't need to do anything since simple ordering isn't complex,
    // but if it is a different collection we move the tab.
    if (sourceCol.id !== targetCol.id) {
      const movedTab = sourceCol.tabs.splice(draggedElementData.index, 1)[0];
      targetCol.tabs.push(movedTab);
      persistData();
      showToast(`Moved "${movedTab.title}" to ${targetCol.name}`);
    }
  }

  draggedElementData = null;
}

// Quick saves
function quickSaveTab(tab) {
  if (collections.length === 0) {
    createNewCollection("Inbox");
  }
  
  const inbox = collections[0]; // save to first collection
  inbox.tabs.push({
    title: tab.title,
    url: tab.url,
    favicon: getFaviconUrl(tab.url)
  });
  
  closeBrowserTab(tab.id);
  persistData();
  showToast(`Saved "${tab.title}" to ${inbox.name}`);
}

function saveSession() {
  if (activeTabs.length === 0) {
    showToast("No active tabs to save", "error");
    return;
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const timeStr = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  const sessionName = `Session (${dateStr} ${timeStr})`;

  const savedTabs = activeTabs.map(tab => ({
    title: tab.title,
    url: tab.url,
    favicon: getFaviconUrl(tab.url)
  }));

  const newCol = {
    id: 'col-' + Date.now(),
    name: sessionName,
    tabs: savedTabs
  };

  collections.push(newCol);
  
  // Close all these tabs
  if (isChromeExtension) {
    const tabIds = activeTabs.map(t => t.id);
    // Create a new empty tab first, so browser doesn't close
    chrome.tabs.create({}, () => {
      chrome.tabs.remove(tabIds, () => {
        // Refresh active list which is now clean
        refreshActiveTabs();
      });
    });
  } else {
    activeTabs = [];
    renderActiveTabs();
  }

  persistData();
  showToast(`Saved session with ${savedTabs.length} tabs`);
}

// Browser Tab Operations (Wrappers for Chrome Ext vs Mock Webpage)
function activateBrowserTab(tabId) {
  if (isChromeExtension && tabId) {
    chrome.tabs.update(parseInt(tabId), { active: true });
  } else {
    showToast(`Focused active tab ID: ${tabId}`);
  }
}

function closeBrowserTab(tabId) {
  if (isChromeExtension && tabId) {
    chrome.tabs.remove(parseInt(tabId), () => {
      refreshActiveTabs();
    });
  } else {
    activeTabs = activeTabs.filter(t => t.id !== tabId);
    renderActiveTabs();
    showToast("Closed simulated active tab");
  }
}

function openTabUrl(url) {
  if (isChromeExtension) {
    chrome.tabs.create({ url });
  } else {
    window.open(url, '_blank');
  }
}

function openAllTabsInCollection(collectionId) {
  const col = collections.find(c => c.id === collectionId);
  if (col && col.tabs.length > 0) {
    col.tabs.forEach(tab => {
      openTabUrl(tab.url);
    });
    showToast(`Opening ${col.tabs.length} tabs...`);
  } else {
    showToast("Collection is empty", "error");
  }
}

// Custom Modal for adding links
function openCustomTabModal(collectionId) {
  activeModalCollectionId = collectionId;
  customTitleInput.value = '';
  customUrlInput.value = '';
  customTabModal.classList.remove('hidden');
  customTitleInput.focus();
}

function closeCustomTabModal() {
  customTabModal.classList.add('hidden');
  activeModalCollectionId = null;
}

function handleSaveCustomTab() {
  const title = customTitleInput.value.trim();
  let url = customUrlInput.value.trim();

  if (!title || !url) {
    showToast("Please fill in both title and URL", "error");
    return;
  }

  // Auto add protocol if missing
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }

  const targetCol = collections.find(c => c.id === activeModalCollectionId);
  if (targetCol) {
    targetCol.tabs.push({
      title: title,
      url: url,
      favicon: getFaviconUrl(url)
    });
    persistData();
    closeCustomTabModal();
    showToast(`Added custom link to ${targetCol.name}`);
  }
}

// Sidebar responsiveness toggle
function setupEventListeners() {
  // Sidebar toggles
  toggleSidebarBtn.addEventListener('click', () => {
    sidebar.classList.add('collapsed');
    expandSidebarBtn.classList.remove('hidden');
    document.querySelector('.main-content').style.paddingLeft = '40px';
  });

  expandSidebarBtn.addEventListener('click', () => {
    sidebar.classList.remove('collapsed');
    expandSidebarBtn.classList.add('hidden');
    document.querySelector('.main-content').style.paddingLeft = '60px';
  });

  // Search input events
  activeSearchInput.addEventListener('input', () => {
    renderActiveTabs();
  });

  workspaceSearchInput.addEventListener('input', () => {
    renderCollections();
  });

  // Action Buttons
  newCollectionBtn.addEventListener('click', () => {
    createNewCollection();
  });

  saveSessionBtn.addEventListener('click', () => {
    saveSession();
  });

  themeToggleBtn.addEventListener('click', () => {
    toggleTheme();
  });

  // Modal events
  closeModalBtn.addEventListener('click', closeCustomTabModal);
  cancelModalBtn.addEventListener('click', closeCustomTabModal);
  saveModalBtn.addEventListener('click', handleSaveCustomTab);
  customUrlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSaveCustomTab();
  });

  // Close modal on click outside
  customTabModal.addEventListener('click', (e) => {
    if (e.target === customTabModal) closeCustomTabModal();
  });

  // Listen to chrome events for active tabs if running as extension
  if (isChromeExtension) {
    chrome.tabs.onCreated.addListener(refreshActiveTabs);
    chrome.tabs.onUpdated.addListener(refreshActiveTabs);
    chrome.tabs.onRemoved.addListener(refreshActiveTabs);
  }
}

// Toast System helper
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icon = type === 'success' ? 
    `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>` : 
    `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;

  toast.innerHTML = `
    ${icon}
    <span>${escapeHtml(message)}</span>
  `;

  toastContainer.appendChild(toast);

  // Auto remove
  setTimeout(() => {
    toast.style.animation = 'toast-in 0.3s ease reverse forwards';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

// Utility functions
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function cleanUrl(url) {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    return parsed.hostname + (parsed.pathname === '/' ? '' : parsed.pathname);
  } catch (e) {
    return url;
  }
}
