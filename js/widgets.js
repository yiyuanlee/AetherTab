import { storageGet, storageSet } from './storage.js';
import { dom } from './state.js';

export async function initTheme() {
  const result = await storageGet(['theme']);
  setTheme(result.theme || 'dark');
}

export function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const themeLabel = dom.themeToggleBtn?.querySelector('.theme-label');
  if (themeLabel) {
    themeLabel.textContent = theme === 'dark' ? 'Dark Mode' : 'Light Mode';
  }
}

export async function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
  await storageSet({ theme: newTheme });
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
