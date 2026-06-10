// --- LIVE ROUTE ACCESS CREDS ---
const API_KEY = "f400d12c089a4750817180949250304";
const BASE_URL = `[api.weatherapi.com](https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&days=7&q=)`;

// --- DOM ELEMENTS ---
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const tabToday = document.getElementById("tab-today");
const tabWeek = document.getElementById("tab-week");
const todayPanel = document.getElementById("today-forecast-panel");
const weeklyPanel = document.getElementById("weekly-forecast-panel");
const themeToggle = document.getElementById("theme-toggle");
const sidebarCard = document.getElementById("sidebar-weather-card");
const statusMessage = document.getElementById("status-message");

// Primary data nodes
const currentTemp = document.getElementById("current-temp");
const weatherCondition = document.getElementById("weather-condition");
const weatherIconDisplay = document.getElementById("weather-icon-display");
const feelsLikeTemp = document.getElementById("feels-like-temp");
const locationText = document.getElementById("location-text");
const localTimeText = document.getElementById("local-time-text");
const sunriseTime = document.getElementById("sunrise-time");
const sunsetTime = document.getElementById("sunset-time");

const windSpeed = document.getElementById("wind-speed");
const humidityValue = document.getElementById("humidity-value");
const humidityBar = document.getElementById("humidity-bar");
const uvIndex = document.getElementById("uv-index");
const pressureValue = document.getElementById("pressure-value");
const visibilityValue = document.getElementById("visibility-value");
const cloudValue = document.getElementById("cloud-value");

const hourlyCardsContainer = document.getElementById("hourly-cards-container");
const weeklyCardsContainer = document.getElementById("weekly-cards-container");

// --- 1. DATA FETCHER ---
async function fetchWeatherData(city) {
  const trimmedCity = city.trim();
  if (!trimmedCity) {
    setStatus("Type a city name and press Enter or click search.");
    return;
  }

  setStatus(`Loading weather for "${trimmedCity}"...`);
  toggleLoading(true);

  try {
    const response = await fetch(`${BASE_URL}${encodeURIComponent(trimmedCity)}`);
    if (!response.ok) {
      throw new Error("Endpoint error");
    }

    const data = await response.json();
    populateDashboard(data);
    setStatus(`Showing latest data for ${data.location.name}, ${data.location.country}`);
  } catch (error) {
    console.error("Critical API Fault:", error);
    setStatus("Lookup failed. Please check the city name or try again later.");
  } finally {
    toggleLoading(false);
  }
}

// --- 2. POPULATE UI ---
function populateDashboard(data) {
  currentTemp.textContent = Math.round(data.current.temp_c);
  weatherCondition.textContent = data.current.condition.text;
  weatherIconDisplay.innerHTML = `<img src="https:${data.current.condition.icon}" alt="condition thumbnail" width="64">`;
  feelsLikeTemp.textContent = `${Math.round(data.current.feelslike_c)}°C`;
  locationText.textContent = `📍 ${data.location.name}, ${data.location.country}`;
  localTimeText.textContent = data.location.localtime;

  const astro = data.forecast.forecastday[0].astro;
  sunriseTime.textContent = astro.sunrise;
  sunsetTime.textContent = astro.sunset;

  windSpeed.textContent = data.current.wind_kph;
  humidityValue.textContent = data.current.humidity;
  humidityBar.style.width = `${data.current.humidity}%`;
  uvIndex.textContent = data.current.uv;
  pressureValue.textContent = data.current.pressure_mb;
  visibilityValue.textContent = data.current.vis_km;
  cloudValue.textContent = data.current.cloud;

  // Hourly
  hourlyCardsContainer.innerHTML = "";
  const currentHoursArray = data.forecast.forecastday[0].hour;
  currentHoursArray.forEach((item) => {
    const timeOnly = item.time.split(" ")[1];
    const card = document.createElement("div");
    card.className = "hour-card";
    card.innerHTML = `
      <div style="font-size: 13px; color: var(--text-muted);">${timeOnly}</div>
      <div><img src="https:${item.condition.icon}" width="36" alt=""></div>
      <div style="font-weight: 600; font-size: 16px;">${Math.round(item.temp_c)}°</div>
      <div style="font-size: 11px; color: var(--accent-color); font-weight: bold;">💧${item.chance_of_rain}%</div>
    `;
    hourlyCardsContainer.appendChild(card);
  });

  // Weekly
  weeklyCardsContainer.innerHTML = "";
  const daysArray = data.forecast.forecastday;
  daysArray.forEach((dayItem) => {
    const parsedDate = new Date(dayItem.date);
    const dayOptions = { weekday: "long", day: "numeric", month: "short" };
    const formattedDay = parsedDate.toLocaleDateString("en-US", dayOptions);

    const row = document.createElement("div");
    row.className = "week-row-card";
    row.innerHTML = `
      <div style="font-weight: 600; min-width: 180px;">${formattedDay}</div>
      <div style="display: flex; align-items: center; gap: 12px; color: var(--text-muted); flex: 1;">
        <img src="https:${dayItem.day.condition.icon}" width="40" alt="">
        <span style="font-weight: 500;">${dayItem.day.condition.text}</span>
      </div>
      <div style="font-weight: 600; font-size: 15px;">
        <span>${Math.round(dayItem.day.maxtemp_c)}°C</span>
        <span style="color: var(--text-muted); font-weight: 400; margin-left: 8px;">${Math.round(dayItem.day.mintemp_c)}°C</span>
      </div>
    `;
    weeklyCardsContainer.appendChild(row);
  });

  // Day/night sidebar gradient
  const localHourStr = data.location.localtime.split(" ")[1];
  evalDayNightBackground(localHourStr, astro.sunrise, astro.sunset);
}

// --- 3. THEME SWITCH ---
function applyTheme(theme) {
  const htmlElement = document.documentElement;
  htmlElement.classList.remove("light", "dark");
  htmlElement.classList.add(theme);
  themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
}

themeToggle.addEventListener("click", () => {
  const htmlElement = document.documentElement;
  const nextTheme = htmlElement.classList.contains("light") ? "dark" : "light";
  applyTheme(nextTheme);
  localStorage.setItem("skye-theme", nextTheme);
});

// --- 4. DAY/NIGHT BACKGROUND ---
function evalDayNightBackground(currentTimeStr, sunriseStr, sunsetStr) {
  const parseToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const upper = timeStr.toUpperCase();
    const hasPM = upper.includes("PM");
    const hasAM = upper.includes("AM");

    const numericTokens = upper.replace(/AM|PM/g, "").trim();
    let [hours, minutes] = numericTokens.split(":").map(Number);

    if (hasPM && hours < 12) hours += 12;
    if (hasAM && hours === 12) hours = 0;

    return hours * 60 + minutes;
  };

  const current = parseToMinutes(currentTimeStr);
  const sunrise = parseToMinutes(sunriseStr);
  const sunset = parseToMinutes(sunsetStr);

  if (current >= sunrise && current < sunset) {
    sidebarCard.classList.add("day-bg");
    sidebarCard.classList.remove("night-bg");
  } else {
    sidebarCard.classList.add("night-bg");
    sidebarCard.classList.remove("day-bg");
  }
}

// --- 5. TABS (TODAY / WEEK) ---
function switchView(targetMode) {
  if (targetMode === "today") {
    tabToday.classList.add("active");
    tabWeek.classList.remove("active");
    todayPanel.classList.remove("hidden");
    weeklyPanel.classList.add("hidden");
  } else {
    tabWeek.classList.add("active");
    tabToday.classList.remove("active");
    weeklyPanel.classList.remove("hidden");
    todayPanel.classList.add("hidden");
  }
}

tabToday.addEventListener("click", () => switchView("today"));
tabWeek.addEventListener("click", () => switchView("week"));

// --- 6. SEARCH HANDLERS ---
searchBtn.addEventListener("click", () => fetchWeatherData(searchInput.value));

searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    if (!searchInput.value.trim()) {
      setStatus("Example: London, New York, Tokyo...");
      return;
    }
    fetchWeatherData(searchInput.value);
  }
});

// --- UTILITIES ---
function setStatus(message) {
  statusMessage.textContent = message;
}

function toggleLoading(isLoading) {
  if (isLoading) {
    searchBtn.textContent = "⏳";
    searchBtn.disabled = true;
  } else {
    searchBtn.textContent = "🔍";
    searchBtn.disabled = false;
  }
}

// --- ENTRY ---
document.addEventListener("DOMContentLoaded", () => {
  const storedTheme = localStorage.getItem("skye-theme") || "dark";
  applyTheme(storedTheme);

  // initial fetch using default value in the input
  if (searchInput.value.trim()) {
    fetchWeatherData(searchInput.value);
  } else {
    setStatus("Search for any city to see the forecast.");
  }
});
