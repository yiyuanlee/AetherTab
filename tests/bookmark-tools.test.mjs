import test from 'node:test';
import assert from 'node:assert/strict';

import {
  classifyBookmark,
  createShareLink,
  decodeShareCode,
  dedupeBookmarks,
  encodeShareCode,
  flattenChromeBookmarkTree,
  normalizeBookmarkUrl,
  organizeBookmarks,
  parseBookmarkImport,
  parseNetscapeBookmarks,
} from '../js/bookmark-tools.js';

test('normalizes URLs and removes common tracking parameters', () => {
  assert.equal(
    normalizeBookmarkUrl('https://Example.com/docs/?utm_source=newsletter&b=2&a=1#intro'),
    'https://example.com/docs?a=1&b=2',
  );
  assert.equal(normalizeBookmarkUrl('javascript:alert(1)'), null);
});

test('deduplicates imported links against both the batch and existing collections', () => {
  const result = dedupeBookmarks(
    [
      { title: 'Tracked', url: 'https://example.com/?utm_campaign=test' },
      { title: 'Repeated', url: 'https://example.com' },
      { title: 'Existing', url: 'https://openai.com/' },
      { title: 'Unsafe', url: 'javascript:alert(1)' },
    ],
    [{ title: 'Already saved', url: 'https://openai.com' }],
  );

  assert.equal(result.bookmarks.length, 1);
  assert.equal(result.bookmarks[0].url, 'https://example.com/');
  assert.equal(result.duplicateCount, 2);
  assert.equal(result.invalidCount, 1);
});

test('flattens the Chrome bookmarks tree while preserving useful folder context', () => {
  const bookmarks = flattenChromeBookmarkTree([
    {
      title: '',
      children: [
        {
          title: 'Bookmarks bar',
          children: [
            {
              title: 'Research',
              children: [{ title: 'Paper', url: 'https://arxiv.org/abs/1234' }],
            },
          ],
        },
      ],
    },
  ]);

  assert.deepEqual(bookmarks[0].folderPath, ['Research']);
  assert.equal(bookmarks[0].title, 'Paper');
});

test('parses Netscape/Chrome bookmark HTML with nested folders', () => {
  const html = `
    <!DOCTYPE NETSCAPE-Bookmark-file-1>
    <DL><p>
      <DT><H3>Bookmarks bar</H3>
      <DL><p>
        <DT><H3>Design</H3>
        <DL><p><DT><A HREF="https://dribbble.com">Inspiration &amp; UI</A></DL><p>
      </DL><p>
    </DL><p>`;
  const bookmarks = parseNetscapeBookmarks(html);

  assert.equal(bookmarks.length, 1);
  assert.equal(bookmarks[0].title, 'Inspiration & UI');
  assert.deepEqual(bookmarks[0].folderPath, ['Design']);
});

test('classifies by domain and builds smart or folder-based collections', () => {
  const links = [
    { title: 'Repository', url: 'https://github.com/openai/example', folderPath: [] },
    { title: 'Moodboard', url: 'https://dribbble.com/shots/1', folderPath: ['Ideas'] },
  ];

  assert.equal(classifyBookmark(links[0]), 'Development');
  assert.deepEqual(
    organizeBookmarks(links, 'smart').map((collection) => collection.name),
    ['Development', 'Design & Creativity'],
  );
  assert.deepEqual(
    organizeBookmarks(links, 'folders').map((collection) => collection.name),
    ['Ideas', 'Imported Bookmarks'],
  );
});

test('imports legacy and current-style Toby JSON while preserving collection context', () => {
  const legacy = parseBookmarkImport(JSON.stringify({
    app: 'Toby',
    lists: [
      {
        title: 'Project Atlas',
        cards: [
          { title: 'Roadmap', url: 'https://linear.app/atlas' },
          { customTitle: 'Repository', link: 'https://github.com/example/atlas' },
          { title: 'Planning note', note: 'No URL, so this is intentionally ignored.' },
        ],
      },
    ],
  }), 'toby-backup.json');

  assert.equal(legacy.kind, 'toby');
  assert.equal(legacy.bookmarks.length, 2);
  assert.deepEqual(legacy.bookmarks[0].folderPath, ['Project Atlas']);

  const current = parseBookmarkImport(JSON.stringify({
    product: 'Toby',
    data: {
      spaces: [
        {
          name: 'Work',
          collections: [
            {
              name: 'Research',
              resources: [
                { name: 'Paper', resourceUrl: 'https://arxiv.org/abs/1234' },
              ],
            },
          ],
        },
      ],
    },
  }), 'toby-export.json');

  assert.equal(current.bookmarks.length, 1);
  assert.deepEqual(current.bookmarks[0].folderPath, ['Work', 'Research']);
});

test('imports Toby TXT and common titled URL lists', () => {
  const imported = parseBookmarkImport(`
    # Toby export
    Design system\thttps://developer.apple.com/design/
    [Research paper](https://arxiv.org/abs/1234)
    https://example.com/plain
  `, 'toby-links.txt');

  assert.equal(imported.kind, 'text');
  assert.equal(imported.bookmarks.length, 3);
  assert.equal(imported.bookmarks[0].title, 'Design system');
  assert.equal(imported.bookmarks[1].title, 'Research paper');
});

test('round-trips Unicode collection share codes and share files', () => {
  const collection = {
    name: '阅读清单',
    tabs: [
      { title: '示例文章', url: 'https://example.com/article?utm_source=test' },
      { title: 'Unsafe', url: 'chrome://settings' },
    ],
  };
  const code = encodeShareCode(collection);
  const decoded = decodeShareCode(code);

  assert.equal(decoded.name, '阅读清单');
  assert.equal(decoded.bookmarks.length, 1);
  assert.equal(decoded.bookmarks[0].title, '示例文章');
  assert.equal(decoded.bookmarks[0].url, 'https://example.com/article');

  const shareLink = createShareLink(collection, 'chrome-extension://example/newtab.html');
  assert.equal(decodeShareCode(shareLink).name, '阅读清单');

  const fileImport = parseBookmarkImport(JSON.stringify({
    format: 'aethertab-collection',
    version: 1,
    collection: { name: decoded.name, tabs: decoded.bookmarks },
  }), 'reading.aethertab.json');
  assert.equal(fileImport.kind, 'share');
  assert.equal(fileImport.suggestedCollectionName, '阅读清单');
});
