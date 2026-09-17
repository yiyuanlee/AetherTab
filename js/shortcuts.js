import { dom } from './state.js';
import { createNewCollection } from './collections.js';
import { closeCustomTabModal, isModalOpen } from './modal.js';
import { renderActiveTabs, renderCollections } from './render.js';
import { executeUndo } from './undo.js';
import { closeOpenBookmarkModal, isBookmarkToolsModalOpen } from './bookmark-manager.js';

function isEditableTarget(target) {
  if (!target || !(target instanceof Element)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (target.isContentEditable) return true;
  return false;
}

function focusWorkspaceSearch() {
  dom.workspaceSearchInput?.focus();
  dom.workspaceSearchInput?.select();
}

function clearSearchInput(input) {
  if (!input) return;
  input.value = '';
  input.blur();
  if (input === dom.workspaceSearchInput) renderCollections();
  if (input === dom.activeSearchInput) renderActiveTabs();
}

export function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if (e.defaultPrevented) return;

    const inInput = isEditableTarget(e.target);
    const modKey = e.ctrlKey || e.metaKey;

    if (modKey && e.key.toLowerCase() === 'z' && !e.shiftKey) {
      if (!inInput && executeUndo()) {
        e.preventDefault();
      }
      return;
    }

    if (e.key === 'Escape') {
      if (isBookmarkToolsModalOpen()) {
        e.preventDefault();
        closeOpenBookmarkModal();
        return;
      }

      if (isModalOpen()) {
        e.preventDefault();
        closeCustomTabModal();
        return;
      }

      if (inInput) {
        e.preventDefault();
        if (e.target === dom.workspaceSearchInput || e.target === dom.activeSearchInput) {
          clearSearchInput(e.target);
        } else {
          e.target.blur();
        }
      }
      return;
    }

    if (inInput) return;

    if (e.key === '/') {
      e.preventDefault();
      focusWorkspaceSearch();
      return;
    }

    if (e.key.toLowerCase() === 'n' && !modKey && !e.altKey) {
      e.preventDefault();
      createNewCollection();
    }
  });
}
