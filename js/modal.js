import { state, dom } from './state.js';
import { addCustomTabToCollection } from './collections.js';
import { showToast } from './toast.js';

export function openCustomTabModal(collectionId) {
  state.activeModalCollectionId = collectionId;
  dom.customTitleInput.value = '';
  dom.customUrlInput.value = '';
  dom.customTabModal.classList.remove('hidden');
  dom.customTitleInput.focus();
}

export function closeCustomTabModal() {
  dom.customTabModal.classList.add('hidden');
  state.activeModalCollectionId = null;
}

export function handleSaveCustomTab() {
  const title = dom.customTitleInput.value.trim();
  let url = dom.customUrlInput.value.trim();

  if (!title || !url) {
    showToast('Please fill in both title and URL', 'error');
    return;
  }

  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  if (addCustomTabToCollection(state.activeModalCollectionId, title, url)) {
    closeCustomTabModal();
  }
}

export function setupModalListeners() {
  dom.closeModalBtn.addEventListener('click', closeCustomTabModal);
  dom.cancelModalBtn.addEventListener('click', closeCustomTabModal);
  dom.saveModalBtn.addEventListener('click', handleSaveCustomTab);
  dom.customUrlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSaveCustomTab();
  });
  dom.customTabModal.addEventListener('click', (e) => {
    if (e.target === dom.customTabModal) closeCustomTabModal();
  });
}
