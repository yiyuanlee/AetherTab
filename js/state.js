export const state = {
  collections: [],
  activeTabs: [],
  draggedElementData: null,
  cardSearchQueries: {},
  cardSearchActive: {},
  collapsedDomainGroups: {},
  activeModalCollectionId: null,
};

export const dom = {
  sidebar: null,
  toggleSidebarBtn: null,
  expandSidebarBtn: null,
  themeToggleBtn: null,
  activeTabsList: null,
  activeTabCount: null,
  activeSearchInput: null,
  workspaceSearchInput: null,
  collectionsGrid: null,
  newCollectionBtn: null,
  saveSessionBtn: null,
  toastContainer: null,
  customTabModal: null,
  closeModalBtn: null,
  cancelModalBtn: null,
  saveModalBtn: null,
  customTitleInput: null,
  customUrlInput: null,
};

export function bindDomElements() {
  dom.sidebar = document.getElementById('sidebar');
  dom.toggleSidebarBtn = document.getElementById('toggle-sidebar');
  dom.expandSidebarBtn = document.getElementById('expand-sidebar');
  dom.themeToggleBtn = document.getElementById('theme-toggle');
  dom.activeTabsList = document.getElementById('active-tabs-list');
  dom.activeTabCount = document.getElementById('active-tab-count');
  dom.activeSearchInput = document.getElementById('active-search');
  dom.workspaceSearchInput = document.getElementById('workspace-search');
  dom.collectionsGrid = document.getElementById('collections-grid');
  dom.newCollectionBtn = document.getElementById('new-collection-btn');
  dom.saveSessionBtn = document.getElementById('save-session-btn');
  dom.toastContainer = document.getElementById('toast-container');
  dom.customTabModal = document.getElementById('custom-tab-modal');
  dom.closeModalBtn = document.getElementById('close-modal');
  dom.cancelModalBtn = document.getElementById('cancel-modal');
  dom.saveModalBtn = document.getElementById('save-modal');
  dom.customTitleInput = document.getElementById('custom-title');
  dom.customUrlInput = document.getElementById('custom-url');
}
