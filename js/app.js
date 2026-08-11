import { bindDomElements } from './state.js';
import { initClock, initTheme } from './widgets.js?v=1.5.3';
import { loadData, setupEventListeners } from './events.js?v=1.5.3';
import { initWeather } from './weather.js';
import { initOnboarding } from './onboarding.js';

document.addEventListener('DOMContentLoaded', async () => {
  bindDomElements();
  initClock();
  initTheme();
  await loadData();
  initWeather();
  setupEventListeners();
  initOnboarding();
});
