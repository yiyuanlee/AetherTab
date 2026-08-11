import { state } from './state.js';
import { isChromeExtension } from './storage.js';
import { addImportedCollections, replaceAllCollections } from './collections.js';
import { showToast } from './toast.js';
import { escapeHtml } from './utils.js';
import {
  buildSharePayload,
  createShareLink,
  decodeShareCode,
  dedupeBookmarks,
  encodeShareCode,
  flattenChromeBookmarkTree,
  organizeBookmarks,
  parseBookmarkImport,
} from './bookmark-tools.js';

const MAX_SHARE_LINK_LENGTH = 16000;

let workflow = null;
let activeShareCollection = null;
let elements = null;

function getElements() {
  if (elements) return elements;

  elements = {
    importButton: document.getElementById('import-bookmarks-btn'),
    organizeButton: document.getElementById('smart-organize-btn'),
    toolsModal: document.getElementById('bookmark-tools-modal'),
    toolsTitle: document.getElementById('bookmark-tools-title'),
    toolsSubtitle: document.getElementById('bookmark-tools-subtitle'),
    toolsClose: document.getElementById('bookmark-tools-close'),
    toolsCancel: document.getElementById('bookmark-tools-cancel'),
    toolsConfirm: document.getElementById('bookmark-tools-confirm'),
    sourcePanel: document.getElementById('bookmark-source-panel'),
    sourceStatus: document.getElementById('bookmark-source-status'),
    browserSource: document.getElementById('browser-bookmarks-source'),
    fileSource: document.getElementById('bookmark-file-source'),
    fileInput: document.getElementById('bookmark-file-input'),
    shareCodeInput: document.getElementById('bookmark-share-code'),
    loadShareCode: document.getElementById('load-share-code-btn'),
    modePanel: document.getElementById('bookmark-mode-panel'),
    preview: document.getElementById('bookmark-import-preview'),
    previewSummary: document.getElementById('bookmark-preview-summary'),
    previewGroups: document.getElementById('bookmark-preview-groups'),
    shareModal: document.getElementById('share-collection-modal'),
    shareClose: document.getElementById('share-collection-close'),
    shareDone: document.getElementById('share-collection-done'),
    shareName: document.getElementById('share-collection-name'),
    shareMeta: document.getElementById('share-collection-meta'),
    shareCopyCode: document.getElementById('share-copy-code-btn'),
    shareCopyLink: document.getElementById('share-copy-link-btn'),
    shareDownload: document.getElementById('share-download-btn'),
    shareNative: document.getElementById('share-native-btn'),
  };

  return elements;
}

function allSavedBookmarks() {
  return state.collections.flatMap((collection) => collection.tabs || []);
}

function selectedImportMode() {
  return document.querySelector('input[name="bookmark-import-mode"]:checked')?.value || 'smart';
}

function setSourceStatus(label, count, kind = 'ready') {
  const { sourceStatus } = getElements();
  sourceStatus.className = `bookmark-source-status ${kind}`;
  sourceStatus.innerHTML = `
    <span class="source-status-dot" aria-hidden="true"></span>
    <span><strong>${escapeHtml(label)}</strong>${Number.isFinite(count) ? ` · ${count} links found` : ''}</span>
  `;
}

function setModalVisible(modal, visible) {
  modal?.classList.toggle('hidden', !visible);
  if (visible) modal?.setAttribute('aria-hidden', 'false');
  else modal?.setAttribute('aria-hidden', 'true');
}

function renderPreview() {
  if (!workflow?.sourceBookmarks) return;

  const { preview, previewSummary, previewGroups, toolsConfirm } = getElements();
  const existing = workflow.type === 'import' ? allSavedBookmarks() : [];
  const result = dedupeBookmarks(workflow.sourceBookmarks, existing);
  const mode = workflow.type === 'organize' ? 'smart' : selectedImportMode();
  const groups = organizeBookmarks(result.bookmarks, mode, {
    singleName: workflow.suggestedCollectionName || 'Imported Bookmarks',
  });

  workflow.previewGroups = groups;
  workflow.stats = {
    importedCount: result.bookmarks.length,
    duplicateCount: result.duplicateCount,
    invalidCount: result.invalidCount,
  };

  preview.classList.remove('hidden');
  previewSummary.innerHTML = '';
  const stats = [
    ['Ready', result.bookmarks.length],
    ['Collections', groups.length],
    ['Duplicates skipped', result.duplicateCount],
    ['Invalid skipped', result.invalidCount],
  ];

  stats.forEach(([label, value]) => {
    const item = document.createElement('div');
    item.className = 'bookmark-stat';
    item.innerHTML = `<strong>${value}</strong><span>${label}</span>`;
    previewSummary.appendChild(item);
  });

  previewGroups.innerHTML = '';
  groups.forEach((group) => {
    const item = document.createElement('div');
    item.className = 'bookmark-preview-group';

    const samples = group.tabs.slice(0, 2).map((tab) => tab.title).join(' · ');
    item.innerHTML = `
      <div>
        <strong>${escapeHtml(group.name)}</strong>
        <span>${escapeHtml(samples || 'No links')}</span>
      </div>
      <b>${group.tabs.length}</b>
    `;
    previewGroups.appendChild(item);
  });

  if (groups.length === 0) {
    previewGroups.innerHTML = `
      <div class="bookmark-preview-empty">
        No new links to import. Existing and repeated URLs were safely skipped.
      </div>
    `;
  }

  toolsConfirm.disabled = groups.length === 0;
  toolsConfirm.textContent = workflow.type === 'organize'
    ? `Apply ${groups.length} collections`
    : `Import ${result.bookmarks.length} links`;
}

function setWorkflowSource(bookmarks, options = {}) {
  if (!workflow) return;
  workflow.sourceBookmarks = Array.isArray(bookmarks) ? bookmarks : [];
  workflow.suggestedCollectionName = options.suggestedCollectionName || '';

  if (options.preferredMode) {
    const radio = document.querySelector(
      `input[name="bookmark-import-mode"][value="${options.preferredMode}"]`,
    );
    if (radio) radio.checked = true;
  }

  setSourceStatus(options.label || 'Bookmarks loaded', workflow.sourceBookmarks.length);
  renderPreview();
}

function resetImportWorkflow() {
  const {
    toolsTitle,
    toolsSubtitle,
    sourcePanel,
    sourceStatus,
    modePanel,
    preview,
    toolsConfirm,
    shareCodeInput,
  } = getElements();

  workflow = {
    type: 'import',
    sourceBookmarks: null,
    suggestedCollectionName: '',
    previewGroups: [],
  };

  toolsTitle.textContent = 'Import bookmarks';
  toolsSubtitle.textContent = 'Bring in browser bookmarks, Toby exports, or a shared AetherTab collection.';
  sourcePanel.classList.remove('hidden');
  modePanel.classList.remove('hidden');
  preview.classList.add('hidden');
  toolsConfirm.disabled = true;
  toolsConfirm.textContent = 'Import links';
  shareCodeInput.value = '';
  sourceStatus.className = 'bookmark-source-status idle';
  sourceStatus.innerHTML = '<span class="source-status-dot" aria-hidden="true"></span><span>Choose a source to build a private local preview.</span>';

  const smartRadio = document.querySelector('input[name="bookmark-import-mode"][value="smart"]');
  if (smartRadio) smartRadio.checked = true;
}

export function openBookmarkImportModal() {
  resetImportWorkflow();
  setModalVisible(getElements().toolsModal, true);
  getElements().browserSource?.focus();
}

export function openSmartOrganizeModal() {
  const { toolsModal, toolsTitle, toolsSubtitle, sourcePanel, modePanel } = getElements();
  const bookmarks = state.collections.flatMap((collection) =>
    (collection.tabs || []).map((tab) => ({ ...tab, folderPath: [collection.name] })),
  );

  if (bookmarks.length === 0) {
    showToast('Add or import some bookmarks before organizing', 'error');
    return;
  }

  workflow = {
    type: 'organize',
    sourceBookmarks: bookmarks,
    suggestedCollectionName: '',
    previewGroups: [],
  };

  toolsTitle.textContent = 'Organize collections';
  toolsSubtitle.textContent = 'Preview a cleaner layout based on site, title, and current folder context.';
  sourcePanel.classList.add('hidden');
  modePanel.classList.add('hidden');
  setSourceStatus('Current workspace', bookmarks.length);
  renderPreview();
  setModalVisible(toolsModal, true);
  getElements().toolsConfirm?.focus();
}

export function closeBookmarkToolsModal() {
  setModalVisible(getElements().toolsModal, false);
  workflow = null;
}

function applyWorkflow() {
  if (!workflow?.previewGroups?.length) return;

  if (workflow.type === 'organize') {
    replaceAllCollections(workflow.previewGroups);
  } else {
    addImportedCollections(workflow.previewGroups);
  }
  closeBookmarkToolsModal();
}

function getChromeBookmarkTree() {
  return new Promise((resolve, reject) => {
    chrome.bookmarks.getTree((tree) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve(tree);
    });
  });
}

async function loadBrowserBookmarks() {
  if (!isChromeExtension || !chrome.bookmarks?.getTree) {
    showToast('Browser bookmark access is available in the installed extension', 'error');
    return;
  }

  try {
    setSourceStatus('Reading browser bookmarks…', undefined, 'loading');
    const tree = await getChromeBookmarkTree();
    setWorkflowSource(flattenChromeBookmarkTree(tree), { label: 'Browser bookmarks' });
  } catch (error) {
    setSourceStatus('Could not read browser bookmarks', undefined, 'error');
    showToast(error.message || 'Bookmark import failed', 'error');
  }
}

async function loadBookmarkFile(file) {
  if (!file) return;

  try {
    setSourceStatus(`Reading ${file.name}…`, undefined, 'loading');
    const imported = parseBookmarkImport(await file.text(), file.name);
    setWorkflowSource(imported.bookmarks, {
      label: file.name,
      suggestedCollectionName: imported.suggestedCollectionName,
      preferredMode: imported.kind === 'share'
        ? 'single'
        : imported.kind === 'toby'
          ? 'folders'
          : undefined,
    });
  } catch (error) {
    setSourceStatus('Could not read that file', undefined, 'error');
    showToast(error.message || 'Bookmark file could not be imported', 'error');
  }
}

function loadPastedShareCode() {
  const code = getElements().shareCodeInput.value.trim();
  if (!code) {
    showToast('Paste a share code or AetherTab share link first', 'error');
    return;
  }

  try {
    const shared = decodeShareCode(code);
    setWorkflowSource(shared.bookmarks, {
      label: `Shared collection · ${shared.name}`,
      suggestedCollectionName: shared.name,
      preferredMode: 'single',
    });
  } catch (error) {
    setSourceStatus('Share code is not valid', undefined, 'error');
    showToast(error.message, 'error');
  }
}

function closeShareModal() {
  setModalVisible(getElements().shareModal, false);
  activeShareCollection = null;
}

async function copyText(value, successMessage) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand('copy');
    textarea.remove();
    if (!copied) throw new Error('Clipboard access was blocked');
  }
  showToast(successMessage);
}

function shareFileName(collection) {
  const safeName = String(collection.name || 'collection')
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80) || 'collection';
  return `${safeName}.aethertab.json`;
}

function createShareFile(collection) {
  const payload = JSON.stringify(buildSharePayload(collection), null, 2);
  return new File([payload], shareFileName(collection), { type: 'application/json' });
}

function downloadSharedCollection() {
  if (!activeShareCollection) return;
  const file = createShareFile(activeShareCollection);
  const objectUrl = URL.createObjectURL(file);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = file.name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  showToast('Share file downloaded');
}

async function nativeShareCollection() {
  if (!activeShareCollection || !navigator.share) return;
  const file = createShareFile(activeShareCollection);
  const shareData = {
    title: activeShareCollection.name,
    text: `AetherTab collection: ${activeShareCollection.name}`,
  };

  if (!navigator.canShare || navigator.canShare({ files: [file] })) {
    shareData.files = [file];
  } else {
    shareData.text = `${shareData.text}\n\n${encodeShareCode(activeShareCollection)}`;
  }

  try {
    await navigator.share(shareData);
  } catch (error) {
    if (error.name !== 'AbortError') showToast(error.message || 'Could not open the share sheet', 'error');
  }
}

export function openShareCollectionModal(collectionId) {
  const collection = state.collections.find((candidate) => candidate.id === collectionId);
  if (!collection) return;

  try {
    const payload = buildSharePayload(collection);
    const code = encodeShareCode(collection);
    const { shareModal, shareName, shareMeta, shareCopyLink, shareNative } = getElements();
    activeShareCollection = collection;
    shareName.textContent = payload.collection.name;
    shareMeta.textContent = `${payload.collection.tabs.length} web links · private share package`;

    const canCreateLink = location.protocol !== 'file:' && code.length <= MAX_SHARE_LINK_LENGTH;
    shareCopyLink.disabled = !canCreateLink;
    shareCopyLink.title = canCreateLink
      ? 'Copy a direct import link for the same AetherTab installation'
      : 'Use a share code or file for this collection';
    shareNative.disabled = !navigator.share;
    setModalVisible(shareModal, true);
    getElements().shareCopyCode?.focus();
  } catch (error) {
    showToast(error.message, 'error');
  }
}

export function isBookmarkToolsModalOpen() {
  const { toolsModal, shareModal } = getElements();
  return !toolsModal?.classList.contains('hidden') || !shareModal?.classList.contains('hidden');
}

export function closeOpenBookmarkModal() {
  const { toolsModal, shareModal } = getElements();
  if (!shareModal?.classList.contains('hidden')) {
    closeShareModal();
    return true;
  }
  if (!toolsModal?.classList.contains('hidden')) {
    closeBookmarkToolsModal();
    return true;
  }
  return false;
}

function openSharedCollectionFromHash() {
  const params = new URLSearchParams(location.hash.replace(/^#/, ''));
  if (!params.has('share')) return;

  try {
    const shared = decodeShareCode(location.href);
    openBookmarkImportModal();
    setWorkflowSource(shared.bookmarks, {
      label: `Shared collection · ${shared.name}`,
      suggestedCollectionName: shared.name,
      preferredMode: 'single',
    });
    history.replaceState(null, '', `${location.pathname}${location.search}`);
  } catch (error) {
    showToast(error.message, 'error');
  }
}

export function setupBookmarkTools() {
  const dom = getElements();
  const browserImportAvailable = Boolean(isChromeExtension && chrome.bookmarks?.getTree);

  dom.browserSource.disabled = !browserImportAvailable;
  dom.browserSource.title = browserImportAvailable
    ? 'Import bookmarks directly from this browser'
    : 'Available when AetherTab is loaded as a Chrome extension';

  dom.importButton.addEventListener('click', openBookmarkImportModal);
  dom.organizeButton.addEventListener('click', openSmartOrganizeModal);
  dom.toolsClose.addEventListener('click', closeBookmarkToolsModal);
  dom.toolsCancel.addEventListener('click', closeBookmarkToolsModal);
  dom.toolsConfirm.addEventListener('click', applyWorkflow);
  dom.browserSource.addEventListener('click', loadBrowserBookmarks);
  dom.fileSource.addEventListener('click', () => dom.fileInput.click());
  dom.fileInput.addEventListener('change', () => {
    loadBookmarkFile(dom.fileInput.files?.[0]);
    dom.fileInput.value = '';
  });
  dom.loadShareCode.addEventListener('click', loadPastedShareCode);
  dom.shareCodeInput.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') loadPastedShareCode();
  });
  document.querySelectorAll('input[name="bookmark-import-mode"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      if (workflow?.sourceBookmarks) renderPreview();
    });
  });
  dom.toolsModal.addEventListener('click', (event) => {
    if (event.target === dom.toolsModal) closeBookmarkToolsModal();
  });

  dom.shareClose.addEventListener('click', closeShareModal);
  dom.shareDone.addEventListener('click', closeShareModal);
  dom.shareModal.addEventListener('click', (event) => {
    if (event.target === dom.shareModal) closeShareModal();
  });
  dom.shareCopyCode.addEventListener('click', () => {
    if (activeShareCollection) copyText(encodeShareCode(activeShareCollection), 'Share code copied');
  });
  dom.shareCopyLink.addEventListener('click', () => {
    if (!activeShareCollection) return;
    copyText(createShareLink(activeShareCollection, location.href), 'Share link copied');
  });
  dom.shareDownload.addEventListener('click', downloadSharedCollection);
  dom.shareNative.addEventListener('click', nativeShareCollection);

  openSharedCollectionFromHash();
}
