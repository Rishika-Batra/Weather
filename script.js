const API_KEY = "f400d12c089a4750817180949250304";
const BASE_URL = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&days=7&q=`;

// State tracking
let currentWeatherData = null;
let currentUnit = "C"; // Default context configuration

// Core Elements Map
const cityInput = document.getElementById("cityInput");
const searchTrigger = document.getElementById("searchTrigger");
const searchOverlay = document.getElementById("searchOverlay");
const searchClose = document.getElementById("searchClose");

const temperature = document.getElementById("temperature");
const conditionText = document.getElementById("conditionText");
const feelsLike = document.getElementById("feelsLike");
const cityName = document.getElementById("cityName");
const localTime = document.getElementById("localTime");
const sunrise = document.getElementById("sunrise");
const sunset = document.getElementById("sunset");
const weatherIconWrap = document.getElementById("weatherIconWrap");

const windSpeed = document.getElementById("windSpeed");
const windDir = document.getElementById("windDir");
const compassNeedle = document.getElementById("compassNeedle");
const humidity = document.getElementById("humidity");
const uvIndex = document.getElementById("uvIndex");
const pressure = document.getElementById("pressure");
const visibility = document.getElementById("visibility");
const clouds = document.getElementById("clouds");

const humGauge = document.getElementById("humGauge");
const humHint = document.getElementById("humHint");
const cloudGauge = document.getElementById("cloudGauge");
const uvBar = document.getElementById("uvBar");
const uvLabel = document.getElementById("uvLabel");
const visHint = document.getElementById("visHint");

const forecastList = document.getElementById("forecastList");
const hourlyStrip = document.getElementById("hourlyStrip");
const loadingScreen = document.getElementById("loadingScreen");
const toast = document.getElementById("toast");

// Navigation Controller Setup
const tabs = document.querySelectorAll(".topbar-tabs .tab");
const panels = document.querySelectorAll(".panel");

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    panels.forEach(p => p.classList.remove("active"));

    tab.classList.add("active");
    const targetPanel = document.getElementById(`panel-${tab.dataset.tab}`);
    if (targetPanel) targetPanel.classList.add("active");
  });
});

// Metric Conversion Helpers
function cToF(c) { return Math.round((c * 9) / 5 + 32); }

function getWindDirectionDegrees(dir) {
  const mapping = { 'N': 0, 'NNE': 22.5, 'NE': 45, 'ENE': 67.5, 'E': 90, 'ESE': 112.5, 'SE': 135, 'SSE': 157.5, 'S': 180, 'SSW': 202.5, 'SW': 225, 'WSW': 247.5, 'W': 270, 'WNW': 292.5, 'NW': 315, 'NNW': 337.5 };
  return mapping[dir.toUpperCase()] || 0;
}

function getUVStatus(uv) {
  if (uv <= 2) return "Low risk";
  if (uv <= 5) return "Moderate risk";
  if (uv <= 7) return "High risk";
  return "Very high risk";
}

function getHumidityStatus(h) {
  if (h < 30) return "Dry air";
  if (h <= 60) return "Comfortable environment";
  return "Sticky air / High humidity";
}

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

function hideLoader() { loadingScreen.classList.add("hidden"); }
function showLoader() { loadingScreen.classList.remove("hidden"); }

async function getWeather(city) {
  try {
    showLoader();
    const res = await fetch(BASE_URL + encodeURIComponent(city));
    const data = await res.json();

    if (data.error) throw new Error(data.error.message);

    currentWeatherData = data;
    renderWeather();
    hideLoader();
    searchOverlay.classList.remove("open");
  } catch (err) {
    hideLoader();
    showToast(err.message);
    console.error(err);
  }
}

function renderWeather() {
  if (!currentWeatherData) return;

  const current = currentWeatherData.current;
  const location = currentWeatherData.location;
  const astro = currentWeatherData.forecast.forecastday[0].astro;

  // Geographic Meta Fields
  cityName.textContent = `${location.name}, ${location.country}`;
  localTime.textContent = location.localtime;

  // Main Temperature display calculation
  if (currentUnit === "C") {
    temperature.textContent = Math.round(current.temp_c);
    feelsLike.textContent = `Feels like ${Math.round(current.feelslike_c)}°C`;
  } else {
    temperature.textContent = Math.round(current.temp_f);
    feelsLike.textContent = `Feels like ${Math.round(current.feelslike_f)}°F`;
  }

  conditionText.textContent = current.condition.text;
  weatherIconWrap.innerHTML = `<img src="https:${current.condition.icon}" alt="${current.condition.text}">`;

  // Update Highlight metrics
  windSpeed.textContent = Math.round(current.wind_kph);
  windDir.textContent = current.wind_dir;
  compassNeedle.style.transform = `rotate(${getWindDirectionDegrees(current.wind_dir)}deg)`;

  humidity.textContent = current.humidity;
  humGauge.style.width = `${current.humidity}%`;
  humHint.textContent = getHumidityStatus(current.humidity);

  pressure.textContent = current.pressure_mb;
  visibility.textContent = current.vis_km;
  visHint.textContent = current.vis_km >= 10 ? "Perfect clear view" : "Reduced visibility conditions";
  
  clouds.textContent = current.cloud;
  cloudGauge.style.width = `${current.cloud}%`;

  uvIndex.textContent = current.uv;
  uvBar.style.left = `${Math.min(current.uv * 10, 100)}%`;
  uvLabel.textContent = getUVStatus(current.uv);

  // Directly parse native string strings returned cleanly by current API limits
  sunrise.textContent = astro.sunrise || "--";
  sunset.textContent = astro.sunset || "--";

  // Sub-renderers
  renderForecast(currentWeatherData.forecast.forecastday);
  renderHourly(currentWeatherData.forecast.forecastday[0].hour);
}

function renderForecast(days) {
  forecastList.innerHTML = "";

  days.forEach((day, index) => {
    const date = new Date(day.date);
    const row = document.createElement("div");
    row.className = "forecast-row";

    const displayDay = index === 0 ? "Today" : date.toLocaleDateString("en-US", { weekday: "long" });
    
    const hiTemp = currentUnit === "C" ? `${Math.round(day.day.maxtemp_c)}°` : `${Math.round(day.day.maxtemp_f)}°`;
    const loTemp = currentUnit === "C" ? `${Math.round(day.day.mintemp_c)}°` : `${Math.round(day.day.mintemp_f)}°`;

    row.innerHTML = `
      <div class="forecast-day">${displayDay}</div>
      <img class="forecast-icon" src="https:${day.day.condition.icon}" alt="icon" />
      <div class="forecast-desc">${day.day.condition.text}</div>
      <div class="forecast-temps">
        <span class="temp-hi">${hiTemp}</span>
        <span class="temp-lo">${loTemp}</span>
      </div>
    `;
    forecastList.appendChild(row);
  });
}

function renderHourly(hours) {
  hourlyStrip.innerHTML = "";
  const currentHour = new Date().getHours();

  hours.forEach((hour) => {
    const hourDate = new Date(hour.time);
    const hourNum = hourDate.getHours();

    // Show only future or current hours for better interface usability dashboard view
    if (hourNum < currentHour && new Date(currentWeatherData.location.localtime).getDate() === hourDate.getDate()) {
       return;
    }

    const card = document.createElement("div");
    card.className = hourNum === currentHour ? "hourly-card now" : "hourly-card";

    const displayTime = hourNum === 0 ? "12 AM" : hourNum === 12 ? "12 PM" : hourNum > 12 ? `${hourNum - 12} PM` : `${hourNum} AM`;
    const displayTemp = currentUnit === "C" ? `${Math.round(hour.temp_c)}°` : `${Math.round(hour.temp_f)}°`;

    card.innerHTML = `
      <div class="hourly-time">${displayTime}</div>
      <img class="hourly-icon" src="https:${hour.condition.icon}" alt="icon">
      <div class="hourly-temp">${displayTemp}</div>
      <div class="hourly-rain">${hour.chance_of_rain || 0}% Rain</div>
    `;
    hourlyStrip.appendChild(card);
  });
}

// Global Core Unit Toggles listeners
document.getElementById("btnC").addEventListener("click", (e) => {
  currentUnit = "C";
  document.getElementById("btnF").classList.remove("active");
  e.target.classList.add("active");
  renderWeather();
});

document.getElementById("btnF").addEventListener("click", (e) => {
  currentUnit = "F";
  document.getElementById("btnC").classList.remove("active");
  e.target.classList.add("active");
  renderWeather();
});

// Structural Window Event mapping actions
searchTrigger.addEventListener("click", () => {
  searchOverlay.classList.add("open");
  cityInput.focus();
});

searchClose.addEventListener("click", () => {
  searchOverlay.classList.remove("open");
});

cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const city = cityInput.value.trim();
    if (city) getWeather(city);
  }
  if (e.key === "Escape") searchOverlay.classList.remove("open");
});

document.addEventListener("DOMContentLoaded", () => {
  getWeather("Lucknow");
});
