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
    errorMessage.textContent = "Please provide a structural city parameter search target.";
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
    populateDashboard(weatherJSON);
    renderHourlyForecastGraph(weatherJSON.forecast.forecastday[0].hour);

  } catch (error) {
    console.error("Critical System Catch Engine Event:", error);
    errorMessage.textContent = "Lookup failed. Verify input string spelling and network states.";
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
  // Chart calculation metrics base range limit max value: 11
  const uvPercent = Math.min((current.uv / 11) * 100, 100);
  document.getElementById('uv-indicator').style.left = `${uvPercent}%`;

  document.getElementById('pressure-val').textContent = current.pressure_mb;
  document.getElementById('visibility-val').textContent = current.vis_km;
  document.getElementById('visibility-status').textContent = current.vis_km >= 10 ? 'Excellent visibility range' : 'Reduced clear spatial visibility';
  
  document.getElementById('cloud-val').textContent = current.cloud;
  document.getElementById('cloud-progress').style.width = `${current.cloud}%`;

  // Dynamically update theme effects configuration if system currently stands in light theme
  evaluateAmbientWeatherEffects(current.condition.text.toLowerCase());
}

// --- DYNAMIC CHART GENERATION HOOKS (CHART.JS) ---
function renderHourlyForecastGraph(hourlyArray) {
  const canvasElement = document.getElementById('hourlyTempChart').getContext('2d');
  
  // Step intervals parser to read values every 2 hours for presentation scannability
  const parsedIntervals = hourlyArray.filter((_, index) => index % 2 === 0);
  
  const labels = parsedIntervals.map(h => {
    const timeValue = h.time.split(' ')[1];
    return timeValue; 
  });
  const datasets = parsedIntervals.map(h => Math.round(h.temp_c));

  // Destroy old instance pointer node tracking to avoid rendering collision loops
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
        tension: 0.4, // Smooth curve parsing calculations
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
  // Reset existing backdrop conditions tokens
  document.body.classList.remove('sunny', 'cloudy', 'snowy');
  
  if (!document.body.classList.contains('light-mode')) return; // Target structural effects only active during daytime palettes

  if (conditionString.includes('sunny') || conditionString.includes('clear')) {
    document.body.classList.add('sunny');
  } else if (conditionString.includes('snow') || conditionString.includes('sleet') || conditionString.includes('blizzard')) {
    document.body.classList.add('snowy');
  } else {
    // Treat other instances (Mist, Cloud, Overcast, Rain, Drizzle) under ambient cloud coverage layouts
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
    
    // Retrigger state checks to update backdrops instantly
    const currentConditionText = document.getElementById('weather-condition').textContent.toLowerCase();
    evaluateAmbientWeatherEffects(currentConditionText);
  } else {
    body.classList.remove('light-mode', 'sunny', 'cloudy', 'snowy');
    body.classList.add('dark-mode');
    iconNode.className = "fa-solid fa-sun";
  }

  // Redraw the chart data streams to visually calibrate grid system colors to new theme values
  if (hourlyTempChartInstance && window.lastLoadedDataNode) {
    renderHourlyForecastGraph(window.lastLoadedDataNode);
  } else {
    // Fallback refresh search using current visible data targets
    fetchWeatherData(document.getElementById('location-text').textContent.split(',')[0]);
  }
}

function clearDashboardMetrics() {
  document.getElementById('current-temp').textContent = "--°C";
  document.getElementById('weather-condition').textContent = "Failed";
  if (hourlyTempChartInstance) hourlyTempChartInstance.destroy();
}
