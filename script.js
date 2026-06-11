// --- LIVE ROUTE ACCESS CREDS ---
const API_KEY = "f400d12c089a4750817180949250304";
const BASE_URL = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&days=7&q=`;

// --- DOM REGISTRATION ELEMENTS ---
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const themeToggle = document.getElementById('theme-toggle');
const errorMessage = document.getElementById('error-message');

// Global Chart Pointer Instance Management
let hourlyTempChartInstance = null;

// --- INITIALIZER ROUTINE ENGINE ---
document.addEventListener('DOMContentLoaded', () => {
  fetchWeatherData("Lucknow");
  setupEventListeners();
});

function setupEventListeners() {
  searchBtn.addEventListener('click', () => {
    fetchWeatherData(searchInput.value);
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') fetchWeatherData(searchInput.value);
  });

  themeToggle.addEventListener('click', toggleSystemTheme);
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
    
    // Save target hours matrix locally to window context to eliminate memory drift bugs during theme changes
    window.lastLoadedDataNode = weatherJSON.forecast.forecastday[0].hour;
    
    populateDashboard(weatherJSON);
    renderHourlyForecastGraph(window.lastLoadedDataNode);

  } catch (error) {
    console.error("Critical System Catch Engine Event:", error);
    errorMessage.textContent = "Lookup failed. Verify city name spelling and network status.";
    clearDashboardMetrics();
  }
}

// --- INTERFACE POPULATION HOOKS ---
function populateDashboard(data) {
  const current = data.current;
  const location = data.location;
  const astro = data.forecast.forecastday[0].astro;

  // Primary Info Panel
  document.getElementById('current-temp').textContent = `${Math.round(current.temp_c)}°C`;
  document.getElementById('weather-condition').textContent = current.condition.text;
  document.getElementById('feels-like').textContent = `Feels like ${Math.round(current.feelslike_c)}°C`;
  document.getElementById('weather-icon').src = `https:${current.condition.icon}`;
  document.getElementById('location-text').textContent = `${location.name}, ${location.country}`;
  document.getElementById('local-time').textContent = location.localtime;

  // Astronomy Metrics
  document.getElementById('sunrise-time').textContent = astro.sunrise;
  document.getElementById('sunset-time').textContent = astro.sunset;

  // Highlight Elements Calculations
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

  // Dynamically update context backdrop parameters if layout is running light theme presets
  evaluateAmbientWeatherEffects(current.condition.text.toLowerCase());
}

// --- DYNAMIC CHART GENERATION HOOKS (CHART.JS) ---
function renderHourlyForecastGraph(hourlyArray) {
  if (!hourlyArray) return;
  
  const canvasElement = document.getElementById('hourlyTempChart').getContext('2d');
  
  // Scannability layout processing: Extract data arrays at 2-hour pacing offsets
  const parsedIntervals = hourlyArray.filter((_, index) => index % 2 === 0);
  
  const labels = parsedIntervals.map(h => h.time.split(' ')[1]);
  const datasets = parsedIntervals.map(h => Math.round(h.temp_c));

  // Destroy stale pointers to explicitly block frame layer overlay artifacts during canvas mutations
  if (hourlyTempChartInstance) {
    hourlyTempChartInstance.destroy();
  }

  const isDarkModeActive = document.body.classList.contains('dark-mode');
  const contextColorLine = isDarkModeActive ? '#3f8cff' : '#0284c7';
  const contextColorText = isDarkModeActive ? '#7f8f9f' : '#64748b';
  const contextGridColor = isDarkModeActive ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';

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
      plugins: {
        legend: { display: false }
      },
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
  document.body.classList.remove('sunny', 'cloudy', 'snowy');
  
  if (!document.body.classList.contains('light-mode')) return;

  if (conditionString.includes('sunny') || conditionString.includes('clear')) {
    document.body.classList.add('sunny');
  } else if (conditionString.includes('snow') || conditionString.includes('sleet') || conditionString.includes('blizzard')) {
    document.body.classList.add('snowy');
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
    body.classList.remove('light-mode', 'sunny', 'cloudy', 'snowy');
    body.classList.add('dark-mode');
    iconNode.className = "fa-solid fa-sun";
  }

  // Instantly re-render graph theme colors using local window cache node strings to bypass remote calls
  if (window.lastLoadedDataNode) {
    renderHourlyForecastGraph(window.lastLoadedDataNode);
  }
}

function clearDashboardMetrics() {
  document.getElementById('current-temp').textContent = "--°C";
  document.getElementById('weather-condition').textContent = "Failed";
  if (hourlyTempChartInstance) hourlyTempChartInstance.destroy();
}
