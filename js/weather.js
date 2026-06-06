import { WEATHER_CACHE_TTL_MS } from './constants.js';
import { storageGet, storageSet } from './storage.js';
import { showToast } from './toast.js';

function mapWmoWeather(code, isDay) {
  let description = 'Clear Skies';
  let themeClass = 'sunny';
  let iconSvg = '';

  const sunIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
  const moonIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
  const cloudyIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>`;
  const fogIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path><line x1="4" y1="22" x2="20" y2="22"></line><line x1="6" y1="18" x2="18" y2="18"></line></svg>`;
  const rainyIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path><line x1="8" y1="22" x2="8" y2="24"></line><line x1="12" y1="22" x2="12" y2="24"></line><line x1="16" y1="22" x2="16" y2="24"></line></svg>`;
  const snowyIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="#f8fafc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path><circle cx="9" cy="22" r="1" fill="currentColor"></circle><circle cx="12" cy="22" r="1" fill="currentColor"></circle><circle cx="15" cy="22" r="1" fill="currentColor"></circle></svg>`;
  const stormIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path><polyline points="13 18 10 22 14 22 11 26"></polyline></svg>`;

  switch (code) {
    case 0:
      description = isDay ? 'Sunny' : 'Clear Sky';
      themeClass = 'sunny';
      iconSvg = isDay ? sunIcon : moonIcon;
      break;
    case 1:
    case 2:
    case 3:
      description = code === 1 ? 'Mainly Clear' : code === 2 ? 'Partly Cloudy' : 'Overcast';
      themeClass = 'cloudy';
      iconSvg = cloudyIcon;
      break;
    case 45:
    case 48:
      description = 'Foggy';
      themeClass = 'cloudy';
      iconSvg = fogIcon;
      break;
    case 51:
    case 53:
    case 55:
      description = 'Drizzle';
      themeClass = 'rainy';
      iconSvg = rainyIcon;
      break;
    case 61:
    case 63:
    case 65:
      description = 'Rainy';
      themeClass = 'rainy';
      iconSvg = rainyIcon;
      break;
    case 71:
    case 73:
    case 75:
    case 77:
      description = 'Snowy';
      themeClass = 'snowy';
      iconSvg = snowyIcon;
      break;
    case 80:
    case 81:
    case 82:
      description = 'Rain Showers';
      themeClass = 'rainy';
      iconSvg = rainyIcon;
      break;
    case 85:
    case 86:
      description = 'Snow Showers';
      themeClass = 'snowy';
      iconSvg = snowyIcon;
      break;
    case 95:
    case 96:
    case 99:
      description = 'Thunderstorm';
      themeClass = 'thunderstorm';
      iconSvg = stormIcon;
      break;
    default:
      description = 'Clear Skies';
      themeClass = 'sunny';
      iconSvg = isDay ? sunIcon : moonIcon;
  }

  return { description, themeClass, iconSvg };
}

export async function initWeather() {
  const widget = document.getElementById('weather-widget');
  const setupView = document.getElementById('weather-setup');
  const loadingView = document.getElementById('weather-loading');
  const displayView = document.getElementById('weather-display');
  const searchContainer = document.getElementById('weather-search-container');
  const gpsBtn = document.getElementById('weather-gps-btn');
  const cityBtn = document.getElementById('weather-city-btn');
  const locationLabel = document.getElementById('weather-location');
  const searchInput = document.getElementById('weather-search-input');
  const searchCloseBtn = document.getElementById('weather-search-close');
  const tempLabel = document.getElementById('weather-temp');

  let weatherLocation = null;
  let weatherUnit = 'C';
  let weatherCache = null;

  const stored = await storageGet(['weatherLocation', 'weatherUnit', 'weatherCache']);
  weatherLocation = stored.weatherLocation || null;
  weatherUnit = stored.weatherUnit || 'C';
  weatherCache = stored.weatherCache || null;

  function showView(view) {
    setupView.classList.add('hidden');
    loadingView.classList.add('hidden');
    displayView.classList.add('hidden');
    searchContainer.classList.add('hidden');

    if (view === 'setup') setupView.classList.remove('hidden');
    else if (view === 'loading') loadingView.classList.remove('hidden');
    else if (view === 'display') displayView.classList.remove('hidden');
    else if (view === 'search') {
      searchContainer.classList.remove('hidden');
      searchInput.focus();
    }
  }

  function renderWeather(data, locationName) {
    const current = data.current;
    const daily = data.daily;
    const weatherInfo = mapWmoWeather(current.weather_code, current.is_day);

    widget.className = `weather-widget ${weatherInfo.themeClass}`;
    locationLabel.textContent = locationName;
    locationLabel.title = `Click to change location (${data.latitude.toFixed(2)}, ${data.longitude.toFixed(2)})`;
    document.getElementById('weather-desc').textContent = weatherInfo.description;

    let curTemp = current.temperature_2m;
    let minTemp = daily.temperature_2m_min[0];
    let maxTemp = daily.temperature_2m_max[0];

    if (weatherUnit === 'F') {
      curTemp = (curTemp * 9) / 5 + 32;
      minTemp = (minTemp * 9) / 5 + 32;
      maxTemp = (maxTemp * 9) / 5 + 32;
    }

    tempLabel.textContent = `${Math.round(curTemp)}°${weatherUnit}`;
    document.getElementById('weather-range').textContent = `${Math.round(minTemp)}° / ${Math.round(maxTemp)}°`;
    document.getElementById('weather-icon').innerHTML = weatherInfo.iconSvg;
    showView('display');
  }

  function isCacheValid(lat, lon) {
    if (!weatherCache) return false;
    if (weatherCache.lat !== lat || weatherCache.lon !== lon) return false;
    return Date.now() - weatherCache.timestamp < WEATHER_CACHE_TTL_MS;
  }

  async function saveLocationState(lat, lon, name) {
    weatherLocation = { lat, lon, name, timestamp: Date.now() };
    await storageSet({ weatherLocation });
  }

  async function saveWeatherCache(lat, lon, data) {
    weatherCache = { lat, lon, data, timestamp: Date.now() };
    await storageSet({ weatherCache });
  }

  async function fetchWeatherData(lat, lon, name, { force = false } = {}) {
    if (!force && isCacheValid(lat, lon)) {
      renderWeather(weatherCache.data, name);
      return;
    }

    showView('loading');

    try {
      const api = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
      const res = await fetch(api);
      const data = await res.json();
      await saveWeatherCache(lat, lon, data);
      renderWeather(data, name);
    } catch {
      if (weatherCache && weatherCache.lat === lat && weatherCache.lon === lon) {
        renderWeather(weatherCache.data, name);
        showToast('Using cached weather (network unavailable)', 'error');
        return;
      }
      showToast('Failed to fetch weather data.', 'error');
      showView('setup');
    }
  }

  function startWeatherFlow() {
    if (weatherLocation) {
      fetchWeatherData(weatherLocation.lat, weatherLocation.lon, weatherLocation.name);
    } else {
      showView('setup');
    }
  }

  gpsBtn.addEventListener('click', () => {
    showView('loading');
    if (!navigator.geolocation) {
      showToast('Geolocation not supported by your browser.', 'error');
      showView('setup');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`)
          .then((res) => res.json())
          .then(async (data) => {
            const cityName = data.city || data.locality || data.principalSubdivision || 'My Location';
            await saveLocationState(lat, lon, cityName);
            fetchWeatherData(lat, lon, cityName, { force: true });
          })
          .catch(async () => {
            await saveLocationState(lat, lon, 'Current Location');
            fetchWeatherData(lat, lon, 'Current Location', { force: true });
          });
      },
      () => {
        showToast('Geolocation denied or unavailable. Please search manually.', 'error');
        showView('setup');
      },
      { enableHighAccuracy: true, timeout: 5000 },
    );
  });

  cityBtn.addEventListener('click', () => showView('search'));

  locationLabel.addEventListener('click', () => {
    showView('search');
    searchInput.value = locationLabel.textContent;
    searchInput.select();
  });

  searchCloseBtn.addEventListener('click', () => startWeatherFlow());

  searchInput.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const query = searchInput.value.trim();
    if (!query) return;

    showView('loading');
    fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`)
      .then((res) => res.json())
      .then(async (data) => {
        if (!data.results?.length) {
          showToast('City not found. Try another search.', 'error');
          showView('search');
          return;
        }
        const result = data.results[0];
        const name = `${result.name}, ${result.country_code.toUpperCase()}`;
        await saveLocationState(result.latitude, result.longitude, name);
        fetchWeatherData(result.latitude, result.longitude, name, { force: true });
      })
      .catch(() => {
        showToast('Geocoding service unavailable.', 'error');
        showView('setup');
      });
  });

  tempLabel.addEventListener('click', async () => {
    weatherUnit = weatherUnit === 'C' ? 'F' : 'C';
    await storageSet({ weatherUnit });
    startWeatherFlow();
  });

  startWeatherFlow();
}
