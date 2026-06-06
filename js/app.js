import { bindDomElements } from './state.js';
import { initClock, initTheme } from './widgets.js';
import { loadData, setupEventListeners } from './events.js';
import { initWeather } from './weather.js';

document.addEventListener('DOMContentLoaded', () => {
  bindDomElements();
  initClock();
  initTheme();
  loadData();
  initWeather();
  setupEventListeners();
});
