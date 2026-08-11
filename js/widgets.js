import { storageGet, storageSet } from './storage.js';
import { dom } from './state.js';
import { applyColorSchemeTokens } from './themes.js';

export const COLOR_SCHEMES = ['default', 'argentina', 'portugal', 'brazil'];

function getThemeMode() {
  return document.documentElement.getAttribute('data-theme') || 'dark';
}

function getColorScheme() {
  return document.documentElement.getAttribute('data-color-scheme') || 'default';
}

function refreshThemeTokens() {
  applyColorSchemeTokens(getColorScheme(), getThemeMode());
}

function triggerThemeTransition() {
  document.documentElement.classList.add('theme-switching');
  clearTimeout(triggerThemeTransition._timer);
  triggerThemeTransition._timer = setTimeout(() => {
    document.documentElement.classList.remove('theme-switching');
  }, 500);
}

export async function initTheme() {
  const result = await storageGet(['theme', 'colorScheme']);
  const theme = result.theme || 'dark';
  const scheme = COLOR_SCHEMES.includes(result.colorScheme) ? result.colorScheme : 'default';

  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.setAttribute('data-color-scheme', scheme);

  const themeLabel = dom.themeToggleBtn?.querySelector('.theme-label');
  if (themeLabel) {
    themeLabel.textContent = theme === 'dark' ? 'Dark Mode' : 'Light Mode';
  }

  dom.colorSchemePicker?.querySelectorAll('.color-scheme-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.scheme === scheme);
    btn.setAttribute('aria-checked', btn.dataset.scheme === scheme ? 'true' : 'false');
  });

  refreshThemeTokens();
}

export function setTheme(theme, options = {}) {
  document.documentElement.setAttribute('data-theme', theme);
  const themeLabel = dom.themeToggleBtn?.querySelector('.theme-label');
  if (themeLabel) {
    themeLabel.textContent = theme === 'dark' ? 'Dark Mode' : 'Light Mode';
  }
  refreshThemeTokens();
  if (options.animate !== false) triggerThemeTransition();
}

export async function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
  await storageSet({ theme: newTheme });
}

export function setColorScheme(scheme, options = {}) {
  const valid = COLOR_SCHEMES.includes(scheme) ? scheme : 'default';
  document.documentElement.setAttribute('data-color-scheme', valid);

  dom.colorSchemePicker?.querySelectorAll('.color-scheme-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.scheme === valid);
    btn.setAttribute('aria-checked', btn.dataset.scheme === valid ? 'true' : 'false');
  });

  refreshThemeTokens();
  if (options.animate !== false) triggerThemeTransition();
}

export async function selectColorScheme(scheme) {
  setColorScheme(scheme);
  await storageSet({ colorScheme: scheme });
}

export function initClock() {
  const clockEl = document.getElementById('digital-clock');
  const greetingEl = document.getElementById('greeting');
  const dateEl = document.getElementById('date-string');

  function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    clockEl.textContent = `${hours}:${minutes}:${seconds}`;

    const hour = now.getHours();
    let greeting = 'Hello';
    if (hour >= 5 && hour < 12) greeting = 'Good morning';
    else if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
    else if (hour >= 17 && hour < 22) greeting = 'Good evening';
    else greeting = 'Hello, night owl';
    greetingEl.textContent = greeting;

    dateEl.textContent = now.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  updateClock();
  setInterval(updateClock, 1000);
}
