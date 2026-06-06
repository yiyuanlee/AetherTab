import { GLOBE_FAVICON_DATA_URL } from './constants.js';
import { isChromeExtension } from './storage.js';

export function debounce(fn, delay) {
  let timer = null;
  const debounced = (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
  debounced.flush = (...args) => {
    clearTimeout(timer);
    fn(...args);
  };
  return debounced;
}

export function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function cleanUrl(url) {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    return parsed.hostname + (parsed.pathname === '/' ? '' : parsed.pathname);
  } catch {
    return url;
  }
}

export function getFaviconUrl(url) {
  if (!url) return '';
  if (url.startsWith('chrome://') || url.startsWith('chrome-extension://') || url.startsWith('edge://')) {
    return GLOBE_FAVICON_DATA_URL;
  }
  if (isChromeExtension) {
    return `chrome-extension://${chrome.runtime.id}/_favicon/?pageUrl=${encodeURIComponent(url)}&size=32`;
  }
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return '';
  }
}

export function getDomainBadgeName(url, domain) {
  if (!url) return 'Link';
  const lowercaseUrl = url.toLowerCase();

  if (lowercaseUrl.includes('google.com/search')) return 'Google Search';
  if (domain.includes('docs.google.com')) {
    if (lowercaseUrl.includes('/document/')) return 'Google Docs';
    if (lowercaseUrl.includes('/presentation/')) return 'Google Slides';
    if (lowercaseUrl.includes('/spreadsheets/')) return 'Google Sheets';
    return 'Google Workspace';
  }
  if (domain.includes('drive.google.com')) return 'Google Drive';
  if (domain.includes('github.com')) return 'GitHub';
  if (domain.includes('youtube.com')) return 'YouTube';
  if (domain.includes('stackoverflow.com')) return 'Stack Overflow';
  if (domain.includes('chatgpt.com') || domain.includes('chat.openai.com')) return 'ChatGPT';
  if (domain.includes('gemini.google.com')) return 'Gemini';
  if (domain.includes('grok.com')) return 'Grok';
  if (domain.includes('deepseek.com')) return 'DeepSeek';
  if (domain.includes('claude.ai')) return 'Claude';
  if (domain.includes('doubao.com')) return 'Doubao';
  if (domain.includes('notion.so') || domain.includes('notion.site')) return 'Notion';
  if (domain.includes('bilibili.com')) return 'Bilibili';
  if (domain.includes('twitter.com') || domain.includes('x.com')) return 'Twitter/X';

  let name = domain.replace(/^www\./, '');
  const dotIndex = name.lastIndexOf('.');
  if (dotIndex > 0) name = name.substring(0, dotIndex);
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function getDomainColor(domain) {
  let hash = 0;
  for (let i = 0; i < domain.length; i++) {
    hash = domain.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';

  if (currentTheme === 'dark') {
    return {
      bg: `hsla(${hue}, 70%, 45%, 0.15)`,
      color: `hsla(${hue}, 90%, 75%, 1)`,
      border: `hsla(${hue}, 70%, 50%, 0.2)`,
    };
  }
  return {
    bg: `hsla(${hue}, 70%, 45%, 0.08)`,
    color: `hsla(${hue}, 90%, 35%, 1)`,
    border: `hsla(${hue}, 70%, 40%, 0.15)`,
  };
}

export function bindFaviconFallback(img) {
  img.addEventListener('error', () => {
    img.onerror = null;
    img.src = img.dataset.fallback || '';
  }, { once: true });
}
