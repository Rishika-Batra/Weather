// --- LIVE ROUTE ACCESS CREDS ---
const API_KEY = "f400d12c089a4750817180949250304";
const BASE_URL = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&days=7&q=`;

// --- DOM REGISTRATION ELEMENTS ---
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const themeToggle = document.getElementById('theme-toggle');
const errorMessage = document.getElementById('error-message');

// Navigation Tabs Core Elements
const tabToday = document.getElementById('tab-today');
const tabWeek = document.getElementById('tab-week');
const hourlyViewSection = document.getElementById('hourly-view-section');
const weeklyViewSection = document.getElementById('weekly-view-section');
const weeklyForecastContainer = document.getElementById('weekly-forecast-container');

// Global Chart Pointer Instance Management
let hourlyTempChartInstance = null;

// --- INITIALIZER ROUTINE ENGINE ---
document.addEventListener('DOMContentLoaded', () => {
  fetchWeatherData("Lucknow");
  setupEventListeners();
});

function setupEventListeners() {
  searchBtn.addEventListener('click', () => fetchWeatherData(searchInput.value));

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') fetchWeatherData(searchInput.value);
  });

  themeToggle.addEventListener('click', toggleSystemTheme);

  // Tab Switching Controller Logic Routing
  tabToday.addEventListener('click', () => switchForecastLayoutView('today'));
  tabWeek.addEventListener('click', () => switchForecastLayoutView('week'));
}

// --- SECURE DATA RETRIEVAL LOGIC ---
async function fetchWeatherData(city) {
  if (!city || city.trim() === "") {
    errorMessage.textContent = "Please provide a valid city parameter target.";
    return;
  }

  try {
    errorMessage.textContent = "";
    const secureUrl = `${BASE_URL}${encodeURIComponent(city.trim())}`;
    
    const response = await fetch(secureUrl);
    if (!response.ok) {
      throw new Error(`Execution error. Status code returned: ${response.status}`);
    }

    const weatherJSON = await response.json();
    
    // Cache deep arrays to window object reference frame context to stop theme-toggle layout recalculation memory bugs
    window.cachedHourlyNode = weatherJSON.forecast.forecastday[0].hour;
    window.cachedWeeklyNode = weatherJSON.forecast.forecastday;
    
    populateDashboardMetrics(weatherJSON);
    renderHourlyForecastGraph(window.cachedHourlyNode);
    populateWeeklyForecastGrid(window.cachedWeeklyNode);

  } catch (error) {
    console.error("Critical System Catch Engine Event:", error);
    errorMessage.textContent = "Lookup failed. Verify city name spelling and network status.";
    clearDashboardMetrics();
  }
}

// --- INTERFACE POPULATION HOOKS ---
function populateDashboardMetrics(data) {
  const current = data.current;
  const location = data.location;
  const astro = data.forecast.forecastday[0].astro;

  // Primary Sidebar Info Panel
  document.getElementById('current-temp').textContent = `${Math.round(current.temp_c)}°C`;
  document.getElementById('weather-condition').textContent = current.condition.text;
  document.getElementById('feels-like').textContent = `Feels like ${Math.round(current.feelslike_c)}°C`;
  document.getElementById('weather-icon').src = `https:${current.condition.icon}`;
  document.getElementById('location-text').textContent = `${location.name}, ${location.country}`;
  document.getElementById('local-time').textContent = location.localtime;

  // Astronomy Widgets
  document.getElementById('sunrise-time').textContent = astro.sunrise;
  document.getElementById('sunset-time').textContent = astro.sunset;

  // Highlight Cards
  document.getElementById('wind-speed').textContent = current.wind_kph;
  document.getElementById('wind-direction').textContent = `Heading direction angle: ${current.wind_dir}`;
  
  document.getElementById('humidity-val').textContent = current.humidity;
  document.getElementById('humidity-progress').style.width = `${current.humidity}%`;
  
  document.getElementById('uv-val').textContent = current.uv;
  const uvPercent = Math.min((current.uv / 11) * 100, 100);
  document.getElementById('uv-indicator').style.left = `${uvPercent}%`;

  document.getElementById('pressure-val').textContent = current.pressure_mb;
  document.getElementById('visibility-val').textContent = current.vis_km;
  document.getElementById('visibility-status').textContent = current.vis_km >= 10 ? 'Excellent visibility range' : 'Reduced clear spatial visibility';
  
  document.getElementById('cloud-val').textContent = current.cloud;
  document.getElementById('cloud-progress').style.width = `${current.cloud}%`;

  evaluateAmbientWeatherEffects(current.condition.text.toLowerCase());
}

// --- VIEW CONTROLLER MANAGER SWITCH ---
function switchForecastLayoutView(targetView) {
  if (targetView === 'today') {
    tabToday.classList.add('active');
    tabWeek.classList.remove('active');
    hourlyViewSection.classList.remove('display-hidden');
    weeklyViewSection.classList.add('display-hidden');
  } else if (targetView === 'week') {
    tabWeek.classList.add('active');
    tabToday.classList.remove('active');
    weeklyViewSection.classList.remove('display-hidden');
    hourlyViewSection.classList.add('display-hidden');
  }
}

// --- EXTENDED WEATHER TIMELINE GENERATOR ---
function populateWeeklyForecastGrid(forecastDaysArray) {
  if (!forecastDaysArray || !weeklyForecastContainer) return;

  weeklyForecastContainer.innerHTML = ""; // Wipe past iteration nodes safely

  forecastDaysArray.forEach(dayNode => {
    const epochDate = new Date(dayNode.date);
    
    // Parse structural styling tokens out of standard ISO structures
    const weekdayString = epochDate.toLocaleDateString('en-US', { weekday: 'long' });
    const shortDateString = epochDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const cardHTML = `
      <div class="weekly-forecast-card">
        <p class="weekly-day-title">${weekdayString}</p>
        <p class="weekly-card-date">${shortDateString}</p>
        <div class="weekly-icon-wrapper">
          <img src="https:${dayNode.day.condition.icon}" alt="${dayNode.day.condition.text}">
        </div>
        <p class="weekly-condition-label">${dayNode.day.condition.text}</p>
        <div class="weekly-temp-spread">
          <span class="weekly-temp-max">${Math.round(dayNode.day.maxtemp_c)}°</span>
          <span class="weekly-temp-min">${Math.round(dayNode.day.mintemp_c)}°</span>
        </div>
      </div>
    `;
    weeklyForecastContainer.insertAdjacentHTML('beforeend', cardHTML);
  });
}

// --- GRAPH GENERATION CODES (CHART.JS) ---
function renderHourlyForecastGraph(hourlyArray) {
  if (!hourlyArray) return;
  
  const canvasElement = document.getElementById('hourlyTempChart').getContext('2d');
  const parsedIntervals = hourlyArray.filter((_, index) => index % 2 === 0);
  
  const labels = parsedIntervals.map(h => h.time.split(' ')[1]);
  const datasets = parsedIntervals.map(h => Math.round(h.temp_c));

  if (hourlyTempChartInstance) {
    hourlyTempChartInstance.destroy();
  }

  const isDarkModeActive = document.body.classList.contains('dark-mode');
  const contextColorLine = isDarkModeActive ? '#3f8cff' : '#0284c7';
  const contextColorText = isDarkModeActive ? '#78889b' : '#64748b';
  const contextGridColor = isDarkModeActive ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';

  hourlyTempChartInstance = new Chart(canvasElement, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Temperature (°C)',
        data: datasets,
        borderColor: contextColorLine,
        backgroundColor: 'transparent',
        borderWidth: 3,
        tension: 0.4,
        pointBackgroundColor: contextColorLine,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: {
          grid: { color: contextGridColor },
          ticks: { color: contextColorText, font: { family: 'Plus Jakarta Sans', weight: 500 } }
        },
        y: {
          grid: { color: contextGridColor },
          ticks: { color: contextColorText, font: { family: 'Plus Jakarta Sans' } }
        }
      }
    }
  });
}

// --- ATMOSPHERIC WEATHER THEME PARSER LAYER ---
function evaluateAmbientWeatherEffects(conditionString) {
  document.body.classList.remove('sunny', 'cloudy');
  if (!document.body.classList.contains('light-mode')) return;

  if (conditionString.includes('sunny') || conditionString.includes('clear')) {
    document.body.classList.add('sunny');
  } else {
    document.body.classList.add('cloudy');
  }
}

// --- VISUAL INTERFACE THEME ALTERNATION ---
function toggleSystemTheme() {
  const body = document.body;
  const iconNode = themeToggle.querySelector('i');

  if (body.classList.contains('dark-mode')) {
    body.classList.remove('dark-mode');
    body.classList.add('light-mode');
    iconNode.className = "fa-solid fa-moon";
    
    const currentConditionText = document.getElementById('weather-condition').textContent.toLowerCase();
    evaluateAmbientWeatherEffects(currentConditionText);
  } else {
    body.classList.remove('light-mode', 'sunny', 'cloudy');
    body.classList.add('dark-mode');
    iconNode.className = "fa-solid fa-sun";
  }

  // Hot swap canvas instance attributes without creating unnecessary API execution requests
  if (window.cachedHourlyNode) {
    renderHourlyForecastGraph(window.cachedHourlyNode);
  }
}

function clearDashboardMetrics() {
  document.getElementById('current-temp').textContent = "--°C";
  document.getElementById('weather-condition').textContent = "Failed";
  if (hourlyTempChartInstance) hourlyTempChartInstance.destroy();
  if (weeklyForecastContainer) weeklyForecastContainer.innerHTML = "";
}
