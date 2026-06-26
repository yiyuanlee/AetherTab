const UNDO_DURATION_MS = 5000;

let pendingUndo = null;
let undoTimeout = null;

export function pushUndo(restoreFn) {
  clearUndo();
  pendingUndo = restoreFn;
  undoTimeout = setTimeout(clearUndo, UNDO_DURATION_MS);
}

export function clearUndo() {
  pendingUndo = null;
  if (undoTimeout) {
    clearTimeout(undoTimeout);
    undoTimeout = null;
  }
}

export function executeUndo() {
  if (!pendingUndo) return false;
  const restoreFn = pendingUndo;
  clearUndo();
  restoreFn();
  return true;
}

export { UNDO_DURATION_MS };
