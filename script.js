// --- DOM CORE STRUCTURAL SELECTORS ---
const tabToday = document.getElementById('tab-today');
const tabWeek = document.getElementById('tab-week');
const hourlyView = document.getElementById('hourly-forecast-view');
const weeklyView = document.getElementById('weekly-forecast-view');
const liveBadge = document.getElementById('live-badge');
const themeToggle = document.getElementById('theme-toggle');
const sidebarCard = document.getElementById('sidebar-weather-card');

const hourlyCardsContainer = document.getElementById('hourly-cards-container');
const weeklyCardsContainer = document.getElementById('weekly-cards-container');

// --- SIMULATED WEATHER RAW MOCK DATA STRUCT ---
const mockHourlyData = [
  { time: "13:00", temp: 47, icon: "☁️", pop: 0 },
  { time: "14:00", temp: 45, icon: "☁️", pop: 0 },
  { time: "15:00", temp: 45, icon: "☁️", pop: 0 },
  { time: "16:00", temp: 44, icon: "☁️", pop: 0 },
  { time: "17:00", temp: 44, icon: "⛈️", pop: 7 },
  { time: "18:00", temp: 43, icon: "☁️", pop: 0 },
  { time: "19:00", temp: 41, icon: "☁️", pop: 0 },
  { time: "20:00", temp: 40, icon: "🌙", pop: 17 },
  { time: "21:00", temp: 36, icon: "🌙", pop: 17 },
  { time: "22:00", temp: 39, icon: "🌙", pop: 3 },
  { time: "23:00", temp: 39, icon: "🌙", pop: 20 }
];

const mockWeeklyData = [
  { day: "Wednesday 10 June", tempMax: 47, tempMin: 34, condition: "Patchy rain nearby", icon: "🌦️" },
  { day: "Thursday 11 June", tempMax: 45, tempMin: 32, condition: "Patchy rain nearby", icon: "🌦️" },
  { day: "Friday 12 June", tempMax: 43, tempMin: 30, condition: "Sunny skies", icon: "☀️" },
  { day: "Saturday 13 June", tempMax: 42, tempMin: 29, condition: "Clear Sky", icon: "☀️" },
  { day: "Sunday 14 June", tempMax: 44, tempMin: 31, condition: "Partly Cloudy", icon: "⛅" }
];

// --- 1. TAB RENDERING & TRANSITION LOGIC ---
function renderHourlyForecast() {
  hourlyCardsContainer.innerHTML = '';
  mockHourlyData.forEach(item => {
    const card = document.createElement('div');
    card.className = 'hour-card';
    card.innerHTML = `
      <div style="font-size: 14px; color: var(--text-muted);">${item.time}</div>
      <div style="font-size: 24px; margin: 4px 0;">${item.icon}</div>
      <div style="font-weight: 600;">${item.temp}°</div>
      <div style="font-size: 11px; color: #3b82f6;">${item.pop}%</div>
    `;
    hourlyCardsContainer.appendChild(card);
  });
}

function renderWeeklyForecast() {
  weeklyCardsContainer.innerHTML = '';
  mockWeeklyData.forEach(item => {
    const row = document.createElement('div');
    row.className = 'week-row-card';
    row.innerHTML = `
      <div style="font-weight: 500; min-width: 160px;">${item.day}</div>
      <div style="display: flex; align-items: center; gap: 8px; color: var(--text-muted);">
        <span style="font-size: 20px;">${item.icon}</span>
        <span>${item.condition}</span>
      </div>
      <div style="font-weight: 600;">
        <span>${item.tempMax}°C</span> / <span style="color: var(--text-muted); font-weight: 400;">${item.tempMin}°C</span>
      </div>
    `;
    weeklyCardsContainer.appendChild(row);
  });
}

function setForecastView(view) {
  if (view === 'today') {
    tabToday.classList.add('active');
    tabWeek.classList.remove('active');
    hourlyView.classList.remove('hidden');
    weeklyView.classList.add('hidden');
    liveBadge.classList.remove('hidden'); 
  } else {
    tabWeek.classList.add('active');
    tabToday.classList.remove('active');
    weeklyView.classList.remove('hidden');
    hourlyView.classList.add('hidden');
    liveBadge.classList.add('hidden'); 
  }
}

tabToday.addEventListener('click', () => setForecastView('today'));
tabWeek.addEventListener('click', () => setForecastView('week'));

// --- 2. THEME CONTROLLER ENGINE (Light/Dark Switch) ---
themeToggle.addEventListener('click', () => {
  const htmlElement = document.documentElement;
  const themeIcon = themeToggle.querySelector('.theme-icon');

  if (htmlElement.classList.contains('light')) {
    htmlElement.classList.remove('light');
    htmlElement.classList.add('dark');
    themeIcon.textContent = '☀️';
  } else {
    htmlElement.classList.remove('dark');
    htmlElement.classList.add('light');
    themeIcon.textContent = '🌙';
  }
});

// --- 3. DYNAMIC DAY/NIGHT BACKGROUND SWITCHER ---
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

// --- INIT APP RUN ---
document.addEventListener('DOMContentLoaded', () => {
  renderHourlyForecast();
  renderWeeklyForecast();
  
  // Running dynamic check against layout settings
  const curTime = document.getElementById('local-time-text').textContent.split(' ')[1]; // extracts "21:51"
  const sunrise = document.getElementById('sunrise-time').textContent;
  const sunset = document.getElementById('sunset-time').textContent;
  
  evalDayNightBackground(curTime, sunrise, sunset);
});
