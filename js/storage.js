export const isChromeExtension =
  typeof chrome !== 'undefined' && chrome.tabs && chrome.storage;

export function storageGet(keys) {
  return new Promise((resolve) => {
    if (isChromeExtension) {
      chrome.storage.local.get(keys, resolve);
    } else {
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
      resolve(result);
    }
  });
}

export function storageSet(data) {
  return new Promise((resolve) => {
    if (isChromeExtension) {
      chrome.storage.local.set(data, resolve);
    } else {
      Object.entries(data).forEach(([key, value]) => {
        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
      });
      resolve();
    }
  });
}
