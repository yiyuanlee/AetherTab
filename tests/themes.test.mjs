import assert from 'node:assert/strict';
import test from 'node:test';

import { COLOR_THEMES, applyColorSchemeTokens } from '../js/themes.js';

test('provides four cohesive page color themes', () => {
  assert.deepEqual(Object.keys(COLOR_THEMES), ['default', 'sage', 'lilac', 'sand']);
  assert.equal(COLOR_THEMES.default.primary, '#0071e3');
  assert.equal(COLOR_THEMES.default.light.page, '#f5f5f7');
});

test('applies surfaces, borders, inputs, and accents as one light theme', () => {
  const applied = new Map();
  globalThis.document = {
    documentElement: {
      style: {
        setProperty(name, value, priority) {
          applied.set(name, { value, priority });
        },
      },
    },
  };

  try {
    applyColorSchemeTokens('sage', 'light');
    assert.deepEqual(applied.get('--accent-primary'), {
      value: '#40845a',
      priority: 'important',
    });
    assert.equal(applied.get('--page-bg').value, '#eff4f0');
    assert.equal(applied.get('--surface').value, '#fbfdfb');
    assert.equal(applied.get('--sidebar-bg').value, 'rgba(245, 249, 246, .97)');
    assert.equal(applied.get('--input-bg').value, '#e4ece6');
    assert.equal(applied.get('--card-border').value, 'rgba(42, 77, 53, .12)');
  } finally {
    delete globalThis.document;
  }
});

test('applies a coordinated dark appearance for the same theme', () => {
  const applied = new Map();
  globalThis.document = {
    documentElement: {
      style: {
        setProperty(name, value) {
          applied.set(name, value);
        },
      },
    },
  };

  try {
    applyColorSchemeTokens('sand', 'dark');
    assert.equal(applied.get('--accent-primary'), '#a9674b');
    assert.equal(applied.get('--page-bg'), '#15100d');
    assert.equal(applied.get('--surface'), '#231c18');
    assert.equal(applied.get('--input-bg'), '#312720');
    assert.equal(applied.get('--text-primary'), '#fbf5f1');
  } finally {
    delete globalThis.document;
  }
});

test('falls back to the complete default theme for a retired palette', () => {
  const applied = new Map();
  globalThis.document = {
    documentElement: {
      style: {
        setProperty(name, value) {
          applied.set(name, value);
        },
      },
    },
  };

  try {
    applyColorSchemeTokens('retired-palette', 'light');
    assert.equal(applied.get('--accent-primary'), '#0071e3');
    assert.equal(applied.get('--page-bg'), '#f5f5f7');
    assert.equal(applied.get('--surface'), '#ffffff');
  } finally {
    delete globalThis.document;
  }
});
