const TRACKING_PARAM_PATTERN = /^(utm_|fbclid$|gclid$|dclid$|mc_cid$|mc_eid$|igshid$|ref_src$)/i;

const ROOT_FOLDER_NAMES = new Set([
  'root',
  'bookmarks',
  'bookmarks bar',
  'bookmarks toolbar',
  'other bookmarks',
  'mobile bookmarks',
  'favorites bar',
  '收藏夹',
  '书签',
  '书签栏',
  '其他书签',
  '移动设备书签',
]);

export const SHARE_PREFIX = 'AETHERTAB1.';
export const SHARE_FORMAT = 'aethertab-collection';

export const SMART_CATEGORIES = [
  {
    name: 'Development',
    domains: [
      'github.com', 'gitlab.com', 'bitbucket.org', 'stackoverflow.com', 'npmjs.com',
      'developer.mozilla.org', 'dev.to', 'vercel.com', 'netlify.com', 'codepen.io',
      'codesandbox.io', 'replit.com', 'docker.com', 'kubernetes.io',
    ],
    keywords: [
      'developer', 'development', 'programming', 'coding', 'source code', 'api reference',
      'documentation', 'javascript', 'typescript', 'python', 'react', 'database', 'devops',
    ],
  },
  {
    name: 'Design & Creativity',
    domains: [
      'figma.com', 'dribbble.com', 'behance.net', 'awwwards.com', 'canva.com',
      'adobe.com', 'unsplash.com', 'pexels.com', 'fonts.google.com', 'pinterest.com',
    ],
    keywords: [
      'design', 'typography', 'inspiration', 'illustration', 'creative', 'color palette',
      'ui kit', 'ux', 'wireframe', 'prototype',
    ],
  },
  {
    name: 'Learning & Research',
    domains: [
      'wikipedia.org', 'coursera.org', 'edx.org', 'udemy.com', 'khanacademy.org',
      'arxiv.org', 'scholar.google.com', 'researchgate.net', 'quizlet.com', 'duolingo.com',
    ],
    keywords: [
      'course', 'tutorial', 'learn', 'learning', 'research', 'paper', 'study', 'university',
      'lecture', 'education', 'guide',
    ],
  },
  {
    name: 'Work & Productivity',
    domains: [
      'notion.so', 'notion.site', 'docs.google.com', 'drive.google.com', 'slack.com',
      'asana.com', 'linear.app', 'trello.com', 'monday.com', 'airtable.com',
      'clickup.com', 'office.com', 'outlook.com', 'calendar.google.com',
    ],
    keywords: [
      'workspace', 'project', 'productivity', 'meeting', 'calendar', 'task', 'dashboard',
      'roadmap', 'planning', 'document', 'spreadsheet',
    ],
  },
  {
    name: 'News & Reading',
    domains: [
      'medium.com', 'substack.com', 'nytimes.com', 'bbc.com', 'theguardian.com',
      'reuters.com', 'bloomberg.com', 'news.ycombinator.com', 'feedly.com', 'pocket.com',
    ],
    keywords: ['news', 'article', 'newsletter', 'blog', 'read later', 'magazine', 'journal'],
  },
  {
    name: 'Video & Music',
    domains: [
      'youtube.com', 'youtu.be', 'netflix.com', 'spotify.com', 'soundcloud.com',
      'twitch.tv', 'vimeo.com', 'bilibili.com', 'music.apple.com', 'podcasts.google.com',
    ],
    keywords: ['video', 'music', 'playlist', 'podcast', 'movie', 'stream', 'watch'],
  },
  {
    name: 'Social & Community',
    domains: [
      'reddit.com', 'x.com', 'twitter.com', 'linkedin.com', 'facebook.com',
      'instagram.com', 'discord.com', 'threads.net', 'mastodon.social', 'weibo.com',
    ],
    keywords: ['community', 'social', 'forum', 'discussion', 'network'],
  },
  {
    name: 'Shopping & Finance',
    domains: [
      'amazon.com', 'ebay.com', 'etsy.com', 'aliexpress.com', 'shopify.com',
      'paypal.com', 'stripe.com', 'wise.com', 'coinbase.com', 'binance.com',
    ],
    keywords: ['shop', 'shopping', 'price', 'deal', 'finance', 'bank', 'invest', 'market'],
  },
  {
    name: 'Travel & Lifestyle',
    domains: [
      'airbnb.com', 'booking.com', 'tripadvisor.com', 'maps.google.com', 'uber.com',
      'skyscanner.com', 'expedia.com', 'alltrails.com', 'yelp.com',
    ],
    keywords: ['travel', 'trip', 'hotel', 'flight', 'restaurant', 'recipe', 'fitness', 'health'],
  },
  {
    name: 'Tools & Utilities',
    domains: [
      'speedtest.net', 'archive.org', 'translate.google.com', 'tinyurl.com',
      'bitly.com', 'remove.bg', 'cloudconvert.com', 'caniuse.com',
    ],
    keywords: ['tool', 'utility', 'converter', 'calculator', 'generator', 'download', 'translate'],
  },
];

export function createCollectionId() {
  if (globalThis.crypto?.randomUUID) return `col-${globalThis.crypto.randomUUID()}`;
  return `col-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function normalizeBookmarkUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return null;

  try {
    const url = new URL(value.trim());
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;

    url.hostname = url.hostname.toLowerCase();
    url.hash = '';

    [...url.searchParams.keys()].forEach((key) => {
      if (TRACKING_PARAM_PATTERN.test(key)) url.searchParams.delete(key);
    });
    url.searchParams.sort();

    if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
      url.pathname = url.pathname.replace(/\/+$/, '');
    }

    return url.toString();
  } catch {
    return null;
  }
}

function bookmarkTitle(bookmark, normalizedUrl) {
  const title = String(bookmark?.title || '').trim();
  if (title) return title;

  try {
    return new URL(normalizedUrl).hostname.replace(/^www\./, '');
  } catch {
    return 'Untitled link';
  }
}

function cleanFolderPath(folderPath) {
  const folders = Array.isArray(folderPath) ? folderPath : [];
  return folders
    .map((folder) => String(folder || '').trim())
    .filter((folder) => folder && !ROOT_FOLDER_NAMES.has(folder.toLowerCase()));
}

export function dedupeBookmarks(bookmarks, existingBookmarks = []) {
  const seen = new Set();
  existingBookmarks.forEach((bookmark) => {
    const normalized = normalizeBookmarkUrl(bookmark?.url);
    if (normalized) seen.add(normalized);
  });

  const unique = [];
  let duplicateCount = 0;
  let invalidCount = 0;

  bookmarks.forEach((bookmark) => {
    const normalized = normalizeBookmarkUrl(bookmark?.url);
    if (!normalized) {
      invalidCount += 1;
      return;
    }

    if (seen.has(normalized)) {
      duplicateCount += 1;
      return;
    }

    seen.add(normalized);
    unique.push({
      title: bookmarkTitle(bookmark, normalized),
      url: normalized,
      favicon: typeof bookmark?.favicon === 'string' ? bookmark.favicon : '',
      folderPath: cleanFolderPath(bookmark?.folderPath),
    });
  });

  return { bookmarks: unique, duplicateCount, invalidCount };
}

export function flattenChromeBookmarkTree(nodes, parentPath = []) {
  const bookmarks = [];

  (Array.isArray(nodes) ? nodes : []).forEach((node) => {
    if (!node || typeof node !== 'object') return;

    if (node.url) {
      bookmarks.push({
        title: node.title || '',
        url: node.url,
        folderPath: cleanFolderPath(parentPath),
      });
      return;
    }

    const title = String(node.title || '').trim();
    const nextPath = title ? [...parentPath, title] : parentPath;
    bookmarks.push(...flattenChromeBookmarkTree(node.children, nextPath));
  });

  return bookmarks;
}

function decodeHtml(value) {
  const named = {
    amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  };

  return String(value || '')
    .replace(/<[^>]*>/g, '')
    .replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (_match, entity) => {
      if (entity[0] === '#') {
        const isHex = entity[1]?.toLowerCase() === 'x';
        const code = Number.parseInt(entity.slice(isHex ? 2 : 1), isHex ? 16 : 10);
        return Number.isFinite(code) ? String.fromCodePoint(code) : '';
      }
      return named[entity.toLowerCase()] ?? `&${entity};`;
    })
    .replace(/\s+/g, ' ')
    .trim();
}

function readAttribute(attributes, name) {
  const match = String(attributes || '').match(
    new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'),
  );
  return match ? decodeHtml(match[1] ?? match[2] ?? match[3] ?? '') : '';
}

export function parseNetscapeBookmarks(html) {
  const bookmarks = [];
  const folderPath = [];
  let pendingFolder = null;
  const tokens = String(html || '').matchAll(
    /<\/?DL\b[^>]*>|<H3\b[^>]*>([\s\S]*?)<\/H3>|<A\b([^>]*)>([\s\S]*?)<\/A>/gi,
  );

  for (const token of tokens) {
    const raw = token[0];
    if (/^<H3/i.test(raw)) {
      pendingFolder = decodeHtml(token[1]);
      continue;
    }

    if (/^<DL/i.test(raw)) {
      if (pendingFolder) folderPath.push(pendingFolder);
      pendingFolder = null;
      continue;
    }

    if (/^<\/DL/i.test(raw)) {
      if (folderPath.length > 0) folderPath.pop();
      pendingFolder = null;
      continue;
    }

    if (/^<A/i.test(raw)) {
      bookmarks.push({
        title: decodeHtml(token[3]),
        url: readAttribute(token[2], 'href'),
        folderPath: cleanFolderPath(folderPath),
      });
    }
  }

  return bookmarks;
}

const JSON_LINK_KEYS = ['url', 'href', 'link', 'uri', 'resourceUrl', 'resource_url'];
const JSON_TITLE_KEYS = ['title', 'name', 'label', 'customTitle', 'displayTitle'];
const JSON_CONTAINER_KEYS = new Set([
  'data', 'payload', 'export', 'organization', 'organizations', 'workspace', 'workspaces',
  'space', 'spaces', 'collections', 'lists', 'groups', 'sections', 'folders', 'children',
  'cards', 'resources', 'items', 'bookmarks', 'tabs', 'links', 'content', 'roots',
]);
const JSON_NESTED_FOLDER_KEYS = new Set([
  'workspace', 'workspaces', 'space', 'spaces', 'collections', 'lists', 'groups',
  'sections', 'folders', 'children', 'cards', 'resources', 'bookmarks', 'tabs',
]);

function firstStringValue(value, keys) {
  for (const key of keys) {
    if (typeof value?.[key] === 'string' && value[key].trim()) return value[key].trim();
  }
  return '';
}

function collectJsonBookmarks(value, folderPath = [], output = [], contextKey = '') {
  if (!value) return output;

  if (Array.isArray(value)) {
    value.forEach((item) => collectJsonBookmarks(item, folderPath, output, contextKey));
    return output;
  }

  if (typeof value !== 'object') return output;

  const rawUrl = firstStringValue(value, JSON_LINK_KEYS);
  if (rawUrl) {
    output.push({
      title: firstStringValue(value, JSON_TITLE_KEYS),
      url: rawUrl,
      favicon: value.favicon || value.favIconUrl || value.iconUrl || '',
      folderPath: cleanFolderPath(value.folderPath || folderPath),
    });
    return output;
  }

  const childEntries = Object.entries(value).filter(
    ([key, child]) => JSON_CONTAINER_KEYS.has(key) && child && typeof child === 'object',
  );
  if (childEntries.length === 0) return output;

  const nodeName = firstStringValue(value, JSON_TITLE_KEYS);
  const carriesFolderName = nodeName && (
    JSON_NESTED_FOLDER_KEYS.has(contextKey)
    || childEntries.some(([key]) => JSON_NESTED_FOLDER_KEYS.has(key))
  );
  const nextPath = carriesFolderName ? [...folderPath, nodeName] : folderPath;

  childEntries.forEach(([key, child]) => {
    if (key === 'roots' && !Array.isArray(child)) {
      Object.values(child).forEach((root) => collectJsonBookmarks(root, nextPath, output, key));
      return;
    }
    collectJsonBookmarks(child, nextPath, output, key);
  });

  return output;
}

export function parsePlainTextBookmarks(text) {
  const bookmarks = [];

  String(text || '').split(/\r?\n/).forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) return;

    const markdown = line.match(/^\[([^\]]+)]\((https?:\/\/[^\s)]+)\)$/i);
    if (markdown) {
      bookmarks.push({ title: markdown[1].trim(), url: markdown[2], folderPath: [] });
      return;
    }

    const urlMatch = line.match(/https?:\/\/[^\s\t]+/i);
    if (!urlMatch) return;

    const prefix = line.slice(0, urlMatch.index).replace(/[\t,|—–-]+$/g, '').trim();
    bookmarks.push({ title: prefix, url: urlMatch[0], folderPath: [] });
  });

  return bookmarks;
}

function looksLikeTobyExport(parsed, fileName) {
  if (/toby/i.test(fileName)) return true;
  const product = [parsed?.app, parsed?.product, parsed?.source, parsed?.exportedFrom]
    .filter((value) => typeof value === 'string')
    .join(' ');
  return /\btoby\b/i.test(product);
}

function bytesToBase64(bytes) {
  let binary = '';
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return btoa(binary);
}

function base64ToBytes(base64) {
  const binary = atob(base64);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function toBase64Url(value) {
  return bytesToBase64(new TextEncoder().encode(value))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function fromBase64Url(value) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
  return new TextDecoder().decode(base64ToBytes(padded));
}

export function buildSharePayload(collection) {
  if (!collection || typeof collection !== 'object') throw new Error('Collection not found');

  const { bookmarks } = dedupeBookmarks(collection.tabs || []);
  if (bookmarks.length === 0) throw new Error('This collection has no shareable web links');

  return {
    format: SHARE_FORMAT,
    version: 1,
    exportedAt: new Date().toISOString(),
    collection: {
      name: String(collection.name || 'Shared Collection').trim() || 'Shared Collection',
      tabs: bookmarks.map(({ title, url }) => ({ title, url })),
    },
  };
}

export function encodeShareCode(collection) {
  return `${SHARE_PREFIX}${toBase64Url(JSON.stringify(buildSharePayload(collection)))}`;
}

function extractShareCode(value) {
  const trimmed = String(value || '').trim();
  if (trimmed.startsWith(SHARE_PREFIX)) return trimmed;

  try {
    const url = new URL(trimmed);
    const hashParams = new URLSearchParams(url.hash.replace(/^#/, ''));
    const code = hashParams.get('share');
    if (code) return decodeURIComponent(code);
  } catch {
    // The pasted value is a share code or JSON rather than a URL.
  }

  return trimmed;
}

export function decodeShareCode(value) {
  const code = extractShareCode(value);
  let payload;

  try {
    if (code.startsWith(SHARE_PREFIX)) {
      payload = JSON.parse(fromBase64Url(code.slice(SHARE_PREFIX.length)));
    } else {
      payload = JSON.parse(code);
    }
  } catch {
    throw new Error('This share code or file is not valid');
  }

  if (payload?.format !== SHARE_FORMAT || payload?.version !== 1 || !payload.collection) {
    throw new Error('This is not a supported AetherTab collection');
  }

  const { bookmarks } = dedupeBookmarks(payload.collection.tabs || []);
  if (bookmarks.length === 0) throw new Error('The shared collection has no valid web links');

  return {
    name: String(payload.collection.name || 'Shared Collection').trim() || 'Shared Collection',
    bookmarks: bookmarks.map((bookmark) => ({
      ...bookmark,
      folderPath: [String(payload.collection.name || 'Shared Collection')],
    })),
  };
}

export function createShareLink(collection, baseHref) {
  const url = new URL(baseHref);
  url.hash = new URLSearchParams({ share: encodeShareCode(collection) }).toString();
  return url.toString();
}

export function parseBookmarkImport(text, fileName = '') {
  const value = String(text || '').trim();
  if (!value) throw new Error('The selected file is empty');

  if (value.startsWith(SHARE_PREFIX)) {
    const shared = decodeShareCode(value);
    return { bookmarks: shared.bookmarks, suggestedCollectionName: shared.name, kind: 'share' };
  }

  const looksLikeHtml = /<!DOCTYPE NETSCAPE-Bookmark-file/i.test(value)
    || /<DL\b/i.test(value)
    || /\.html?$/i.test(fileName);
  if (looksLikeHtml) {
    return { bookmarks: parseNetscapeBookmarks(value), kind: 'html' };
  }

  if (/\.txt$/i.test(fileName)) {
    return { bookmarks: parsePlainTextBookmarks(value), kind: 'text' };
  }

  let parsed;
  try {
    parsed = JSON.parse(value);
  } catch {
    const textBookmarks = parsePlainTextBookmarks(value);
    if (textBookmarks.length > 0) return { bookmarks: textBookmarks, kind: 'text' };
    throw new Error('Choose a bookmark HTML, Toby JSON/TXT, or AetherTab share file');
  }

  if (parsed?.format === SHARE_FORMAT) {
    const shared = decodeShareCode(JSON.stringify(parsed));
    return { bookmarks: shared.bookmarks, suggestedCollectionName: shared.name, kind: 'share' };
  }

  return {
    bookmarks: collectJsonBookmarks(parsed),
    kind: looksLikeTobyExport(parsed, fileName) ? 'toby' : 'json',
  };
}

function matchesDomain(hostname, domain) {
  return hostname === domain || hostname.endsWith(`.${domain}`);
}

export function classifyBookmark(bookmark) {
  let hostname = '';
  try {
    hostname = new URL(bookmark.url).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return 'Other';
  }

  const searchableText = [
    bookmark.title,
    bookmark.url,
    ...(Array.isArray(bookmark.folderPath) ? bookmark.folderPath : []),
  ].join(' ').toLowerCase();

  let bestCategory = 'Other';
  let bestScore = 0;

  SMART_CATEGORIES.forEach((category) => {
    let score = 0;
    category.domains.forEach((domain) => {
      if (matchesDomain(hostname, domain)) score += 12;
    });
    category.keywords.forEach((keyword) => {
      if (searchableText.includes(keyword)) score += 2;
    });

    if (score > bestScore) {
      bestScore = score;
      bestCategory = category.name;
    }
  });

  return bestCategory;
}

function getFolderCollectionName(bookmark) {
  const folders = cleanFolderPath(bookmark.folderPath);
  return folders.length > 0 ? folders.at(-1) : 'Imported Bookmarks';
}

export function organizeBookmarks(bookmarks, mode = 'smart', options = {}) {
  const groups = new Map();
  const singleName = String(options.singleName || 'Imported Bookmarks').trim() || 'Imported Bookmarks';

  bookmarks.forEach((bookmark) => {
    let name = singleName;
    if (mode === 'smart') name = classifyBookmark(bookmark);
    if (mode === 'folders') name = getFolderCollectionName(bookmark);

    if (!groups.has(name)) groups.set(name, []);
    groups.get(name).push({
      title: bookmark.title,
      url: bookmark.url,
      favicon: bookmark.favicon || '',
    });
  });

  return [...groups.entries()]
    .map(([name, tabs]) => ({
      id: createCollectionId(),
      name,
      isGrouped: false,
      tabs: tabs.sort((left, right) => left.title.localeCompare(right.title)),
    }))
    .sort((left, right) => {
      if (mode !== 'smart') return left.name.localeCompare(right.name);
      const order = [...SMART_CATEGORIES.map((category) => category.name), 'Other'];
      return order.indexOf(left.name) - order.indexOf(right.name);
    });
}
