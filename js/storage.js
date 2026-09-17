export const isChromeExtension =
  typeof chrome !== 'undefined' && chrome.tabs && chrome.storage;

export const SYNC_CHUNK_PREFIX = 'collections_c';
export const SYNC_META_KEY = 'collectionsMeta';
export const SYNC_ENABLED_KEY = 'syncEnabled';

/** Keys synced across Chrome profiles when sync is enabled. */
export const SYNCABLE_KEYS = new Set([
  SYNC_ENABLED_KEY,
  SYNC_META_KEY,
  'theme',
  'colorScheme',
  'weatherLocation',
  'weatherUnit',
]);

/** Keys that stay on the current device only. */
export const LOCAL_ONLY_KEYS = new Set(['weatherCache']);

const CHUNK_BYTE_LIMIT = 6000;

function areaGet(area, keys) {
  return new Promise((resolve) => {
    area.get(keys, resolve);
  });
}

function areaSet(area, data) {
  return new Promise((resolve, reject) => {
    area.set(data, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve();
    });
  });
}

function areaRemove(area, keys) {
  return new Promise((resolve) => {
    area.remove(keys, resolve);
  });
}

function localStorageGet(keys) {
  const result = {};
  const keyList = Array.isArray(keys) ? keys : [keys];
  keyList.forEach((key) => {
    const raw = localStorage.getItem(key);
    if (raw !== null) {
      try {
        result[key] = JSON.parse(raw);
      } catch {
        result[key] = raw;
      }
    }
  });
  return result;
}

function localStorageSet(data) {
  Object.entries(data).forEach(([key, value]) => {
    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  });
}

export function getByteLength(value) {
  return new TextEncoder().encode(JSON.stringify(value)).length;
}

export function chunkString(str, maxBytes = CHUNK_BYTE_LIMIT) {
  const chunks = [];
  let current = '';

  for (const char of str) {
    const next = current + char;
    if (getByteLength(next) > maxBytes && current.length > 0) {
      chunks.push(current);
      current = char;
    } else {
      current = next;
    }
  }

  if (current.length > 0) {
    chunks.push(current);
  }

  return chunks.length > 0 ? chunks : [''];
}

export function unchunkStrings(chunks) {
  return chunks.join('');
}

export async function isSyncEnabled() {
  if (!isChromeExtension) {
    return localStorage.getItem(SYNC_ENABLED_KEY) === 'true';
  }

  const result = await areaGet(chrome.storage.sync, [SYNC_ENABLED_KEY]);
  return Boolean(result[SYNC_ENABLED_KEY]);
}

export async function setSyncEnabled(enabled) {
  if (!isChromeExtension) {
    localStorage.setItem(SYNC_ENABLED_KEY, enabled ? 'true' : 'false');
    return;
  }

  await areaSet(chrome.storage.sync, { [SYNC_ENABLED_KEY]: enabled });
}

export function storageGet(keys) {
  return new Promise(async (resolve) => {
    if (!isChromeExtension) {
      resolve(localStorageGet(keys));
      return;
    }

    const keyList = Array.isArray(keys) ? keys : [keys];
    const syncEnabled = await isSyncEnabled();
    const result = {};

    const syncKeys = keyList.filter((key) => SYNCABLE_KEYS.has(key) && syncEnabled);
    const localKeys = keyList.filter(
      (key) => LOCAL_ONLY_KEYS.has(key) || !SYNCABLE_KEYS.has(key) || !syncEnabled,
    );

    if (syncKeys.length > 0) {
      Object.assign(result, await areaGet(chrome.storage.sync, syncKeys));
    }

    if (localKeys.length > 0) {
      Object.assign(result, await areaGet(chrome.storage.local, localKeys));
    }

    resolve(result);
  });
}

export function storageSet(data) {
  return new Promise(async (resolve, reject) => {
    if (!isChromeExtension) {
      localStorageSet(data);
      resolve();
      return;
    }

    const syncEnabled = await isSyncEnabled();
    const syncPayload = {};
    const localPayload = {};

    for (const [key, value] of Object.entries(data)) {
      if (LOCAL_ONLY_KEYS.has(key)) {
        localPayload[key] = value;
      } else if (SYNCABLE_KEYS.has(key) && syncEnabled) {
        syncPayload[key] = value;
      } else {
        localPayload[key] = value;
      }
    }

    try {
      if (Object.keys(syncPayload).length > 0) {
        await areaSet(chrome.storage.sync, syncPayload);
      }
      if (Object.keys(localPayload).length > 0) {
        await areaSet(chrome.storage.local, localPayload);
      }
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

export async function loadCollectionsFromArea(area) {
  const metaResult = await areaGet(area, [SYNC_META_KEY, 'collections']);
  const meta = metaResult[SYNC_META_KEY];

  if (meta?.chunkCount) {
    const chunkKeys = Array.from({ length: meta.chunkCount }, (_, i) => `${SYNC_CHUNK_PREFIX}${i}`);
    const chunkResult = await areaGet(area, chunkKeys);
    const payload = unchunkStrings(chunkKeys.map((key) => chunkResult[key] || ''));
    return JSON.parse(payload);
  }

  return metaResult.collections || [];
}

export async function saveCollectionsToArea(area, collections, meta = {}) {
  const payload = JSON.stringify(collections);
  const singleItemBytes = getByteLength(payload);

  if (singleItemBytes <= CHUNK_BYTE_LIMIT) {
    const oldMeta = (await areaGet(area, [SYNC_META_KEY]))[SYNC_META_KEY];
    const keysToRemove = [];
    if (oldMeta?.chunkCount) {
      for (let i = 0; i < oldMeta.chunkCount; i += 1) {
        keysToRemove.push(`${SYNC_CHUNK_PREFIX}${i}`);
      }
    }

    await areaSet(area, {
      collections,
      [SYNC_META_KEY]: {
        ...meta,
        chunkCount: 0,
        updatedAt: meta.updatedAt || Date.now(),
      },
    });

    if (keysToRemove.length > 0) {
      await areaRemove(area, keysToRemove);
    }
    return;
  }

  const chunks = chunkString(payload);
  const chunkPayload = {};
  chunks.forEach((chunk, index) => {
    chunkPayload[`${SYNC_CHUNK_PREFIX}${index}`] = chunk;
  });

  const oldMeta = (await areaGet(area, [SYNC_META_KEY]))[SYNC_META_KEY];
  if (oldMeta?.chunkCount && oldMeta.chunkCount > chunks.length) {
    const staleKeys = Array.from(
      { length: oldMeta.chunkCount - chunks.length },
      (_, i) => `${SYNC_CHUNK_PREFIX}${chunks.length + i}`,
    );
    await areaRemove(area, staleKeys);
  }

  await areaSet(area, {
    ...chunkPayload,
    collections: undefined,
    [SYNC_META_KEY]: {
      ...meta,
      chunkCount: chunks.length,
      updatedAt: meta.updatedAt || Date.now(),
    },
  });
  await areaRemove(area, ['collections']);
}

export async function loadCollections() {
  if (!isChromeExtension) {
    const raw = localStorage.getItem('collections');
    return raw ? JSON.parse(raw) : [];
  }

  const syncEnabled = await isSyncEnabled();
  if (syncEnabled) {
    return loadCollectionsFromArea(chrome.storage.sync);
  }

  return loadCollectionsFromArea(chrome.storage.local);
}

export async function saveCollections(collections, meta = {}, options = {}) {
  const { skipSync = false } = options;

  if (!isChromeExtension) {
    localStorage.setItem('collections', JSON.stringify(collections));
    return;
  }

  const syncEnabled = await isSyncEnabled();
  const timestamp = meta.updatedAt || Date.now();
  const nextMeta = { ...meta, updatedAt: timestamp };

  if (syncEnabled && !skipSync) {
    await saveCollectionsToArea(chrome.storage.sync, collections, nextMeta);
  }

  await saveCollectionsToArea(chrome.storage.local, collections, nextMeta);
}

export function onStorageChanged(callback) {
  if (!isChromeExtension) {
    return () => {};
  }

  const listener = (changes, areaName) => {
    callback(changes, areaName);
  };

  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
}
