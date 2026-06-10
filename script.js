// --- LIVE ROUTE ACCESS CREDS ---
const API_KEY = "f400d12c089a4750817180949250304";
const BASE_URL = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&days=7&q=`;

// --- DOM ELEMENT TARGET LAYERS ---
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const tabToday = document.getElementById('tab-today');
const tabWeek = document.getElementById('tab-week');
const todayPanel = document.getElementById('today-forecast-panel');
const weeklyPanel = document.getElementById('weekly-forecast-panel');
const liveBadge = document.getElementById('live-badge');
const themeToggle = document.getElementById('theme-toggle');
const sidebarCard = document.getElementById('sidebar-weather-card');

// --- TEXT NODE TARGET SELECTION ELEMENTS ---
const currentTemp = document.getElementById('current-temp');
const weatherCondition = document.getElementById('weather-condition');
const weatherIconDisplay = document.getElementById('weather-icon-display');
const feelsLikeTemp = document.getElementById('feels-like-temp');
const locationText = document.getElementById('location-text');
const localTimeText = document.getElementById('local-time-text');
const sunriseTime = document.getElementById('sunrise-time');
const sunsetTime = document.getElementById('sunset-time');

const windSpeed = document.getElementById('wind-speed');
const humidityValue = document.getElementById('humidity-value');
const humidityBar = document.getElementById('humidity-bar');
const uvIndex = document.getElementById('uv-index');
const pressureValue = document.getElementById('pressure-value');
const visibilityValue = document.getElementById('visibility-value');
const cloudValue = document.getElementById('cloud-value');

const hourlyCardsContainer = document.getElementById('hourly-cards-container');
const weeklyCardsContainer = document.getElementById('weekly-cards-container');

// --- 1. LIVE DATA CONNECTOR REQUEST ---
async function fetchWeatherData(city) {
  if (!city) return;
  
  try {
    const response = await fetch(`${BASE_URL}${encodeURIComponent(city)}`);
    if (!response.ok) throw new Error('Data endpoint error');
    
    const data = await response.json();
    populateDashboard(data);
  } catch (error) {
    console.error("Critical API Fault:", error);
    alert("Lookup failed. Please verify target destination search terms.");
  }
}

// --- 2. MAP DYNAMIC INCOMING FIELDS INTO DOM NODES ---
function populateDashboard(data) {
  // Process Primary Weather Elements
  currentTemp.textContent = Math.round(data.current.temp_c);
  weatherCondition.textContent = data.current.condition.text;
  weatherIconDisplay.innerHTML = `<img src="https:${data.current.condition.icon}" alt="condition thumbnail" width="64">`;
  feelsLikeTemp.textContent = `${Math.round(data.current.feelslike_c)}°C`;
  locationText.textContent = `📍 ${data.location.name}, ${data.location.country}`;
  localTimeText.textContent = data.location.localtime;
  
  // Astro Calculations
  const astro = data.forecast.forecastday[0].astro;
  sunriseTime.textContent = astro.sunrise;
  sunsetTime.textContent = astro.sunset;

  // Highlights Elements Rendering
  windSpeed.textContent = data.current.wind_kph;
  humidityValue.textContent = data.current.humidity;
  humidityBar.style.width = `${data.current.humidity}%`;
  uvIndex.textContent = data.current.uv;
  pressureValue.textContent = data.current.pressure_mb;
  visibilityValue.textContent = data.current.vis_km;
  cloudValue.textContent = data.current.cloud;

  // Process 24h Scrolling Row Data
  hourlyCardsContainer.innerHTML = '';
  const currentHoursArray = data.forecast.forecastday[0].hour;
  currentHoursArray.forEach(item => {
    const timeOnly = item.time.split(' ')[1]; 
    const card = document.createElement('div');
    card.className = 'hour-card';
    card.innerHTML = `
      <div style="font-size: 13px; color: var(--text-muted);">${timeOnly}</div>
      <div><img src="https:${item.condition.icon}" width="36"></div>
      <div style="font-weight: 600; font-size: 16px;">${Math.round(item.temp_c)}°</div>
      <div style="font-size: 11px; color: var(--accent-color); font-weight: bold;">💧${item.chance_of_rain}%</div>
    `;
    hourlyCardsContainer.appendChild(card);
  });

  // Process 7-Day Extended Weather Rows
  weeklyCardsContainer.innerHTML = '';
  const daysArray = data.forecast.forecastday;
  daysArray.forEach(dayItem => {
    const parsedDate = new Date(dayItem.date);
    const dayOptions = { weekday: 'long', day: 'numeric', month: 'short' };
    const formattedDay = parsedDate.toLocaleDateString('en-US', dayOptions);

    const row = document.createElement('div');
    row.className = 'week-row-card';
    row.innerHTML = `
      <div style="font-weight: 600; min-width: 180px;">${formattedDay}</div>
      <div style="display: flex; align-items: center; gap: 12px; color: var(--text-muted); flex: 1;">
        <img src="https:${dayItem.day.condition.icon}" width="40">
        <span style="font-weight: 500;">${dayItem.day.condition.text}</span>
      </div>
      <div style="font-weight: 600; font-size: 15px;">
        <span>${Math.round(dayItem.day.maxtemp_c)}°C</span> 
        <span style="color: var(--text-muted); font-weight: 400; margin-left: 8px;">${Math.round(dayItem.day.mintemp_c)}°C</span>
      </div>
    `;
    weeklyCardsContainer.appendChild(row);
  });

  // Fire ambient shift calculation instantly on incoming site time metrics
  const localHourStr = data.location.localtime.split(' ')[1]; 
  evalDayNightBackground(localHourStr, astro.sunrise, astro.sunset);
}

// --- 3. THEME VARIATION SWITCH ---
themeToggle.addEventListener('click', () => {
  const htmlElement = document.documentElement;
  if (htmlElement.classList.contains('light')) {
    htmlElement.classList.remove('light');
    htmlElement.classList.add('dark');
    themeToggle.textContent = '☀️'; 
  } else {
    htmlElement.classList.remove('dark');
    htmlElement.classList.add('light');
    themeToggle.textContent = '🌙'; 
  }
});

// --- 4. RUN GRADIENT SIDEBAR CHECKS ---
function evalDayNightBackground(currentTimeStr, sunriseStr, sunsetStr) {
  const parseToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const upper = timeStr.toUpperCase();
    const hasPM = upper.includes('PM');
    const hasAM = upper.includes('AM');
    
    const numericTokens = upper.replace(/AM|PM/g, '').trim();
    let [hours, minutes] = numericTokens.split(':').map(Number);
    
    if (hasPM && hours < 12) hours += 12;
    if (hasAM && hours === 12) hours = 0;
    
    return hours * 60 + minutes;
  };

  const current = parseToMinutes(currentTimeStr);
  const sunrise = parseToMinutes(sunriseStr);
  const sunset = parseToMinutes(sunsetStr);

  if (current >= sunrise && current < sunset) {
    sidebarCard.classList.add('day-bg');
    sidebarCard.classList.remove('night-bg');
  } else {
    sidebarCard.classList.add('night-bg');
    sidebarCard.classList.remove('day-bg');
  }
}

// --- 5. PANEL SWAP INTERACTIVITIES (Tabs Toggle) ---
function switchView(targetMode) {
  if (targetMode === 'today') {
    tabToday.classList.add('active');
    tabWeek.classList.remove('active');
    todayPanel.classList.remove('hidden');   
    weeklyPanel.classList.add('hidden');       
    liveBadge.classList.remove('hidden');
  } else {
    tabWeek.classList.add('active');
    tabToday.classList.remove('active');
    weeklyPanel.classList.remove('hidden');    
    todayPanel.classList.add('hidden');      
    liveBadge.classList.add('hidden');
  }
}

tabToday.addEventListener('click', () => switchView('today'));
tabWeek.addEventListener('click', () => switchView('week'));

// --- 6. TRIGGER LOOKUP PORTS ---
searchBtn.addEventListener('click', () => fetchWeatherData(searchInput.value));
searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') fetchWeatherData(searchInput.value);
});

// --- ENTRY COMPONENT INITS ---
document.addEventListener('DOMContentLoaded', () => {
  fetchWeatherData(searchInput.value);
});
