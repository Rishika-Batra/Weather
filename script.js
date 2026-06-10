const API_KEY = "f400d12c089a4750817180949250304";
const BASE_URL = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&days=7&q=`;

// Elements
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
const humidity = document.getElementById("humidity");
const uvIndex = document.getElementById("uvIndex");
const pressure = document.getElementById("pressure");
const visibility = document.getElementById("visibility");
const clouds = document.getElementById("clouds");

const humGauge = document.getElementById("humGauge");
const cloudGauge = document.getElementById("cloudGauge");
const uvBar = document.getElementById("uvBar");

const forecastList = document.getElementById("forecastList");
const hourlyStrip = document.getElementById("hourlyStrip");

const loadingScreen = document.getElementById("loadingScreen");
const toast = document.getElementById("toast");

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

function hideLoader() {
  loadingScreen.classList.add("hidden");
}

function showLoader() {
  loadingScreen.classList.remove("hidden");
}

async function getWeather(city) {
  try {
    showLoader();

    const res = await fetch(
      BASE_URL + encodeURIComponent(city)
    );

    const data = await res.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    renderWeather(data);

    hideLoader();
    searchOverlay.classList.remove("open");
  } catch (err) {
    hideLoader();
    showToast(err.message);
    console.error(err);
  }
}

function renderWeather(data) {
  const current = data.current;
  const location = data.location;

  cityName.textContent =
    `${location.name}, ${location.country}`;

  localTime.textContent = location.localtime;

  temperature.textContent =
    Math.round(current.temp_c);

  conditionText.textContent =
    current.condition.text;

  feelsLike.textContent =
    `Feels like ${Math.round(current.feelslike_c)}°C`;

  weatherIconWrap.innerHTML = `
      <img src="https:${current.condition.icon}"
      alt="${current.condition.text}">
  `;

  windSpeed.textContent =
    Math.round(current.wind_kph);

  windDir.textContent =
    current.wind_dir;

  humidity.textContent =
    current.humidity;

  pressure.textContent =
    current.pressure_mb;

  visibility.textContent =
    current.vis_km;

  clouds.textContent =
    current.cloud;

  uvIndex.textContent =
    current.uv;

  sunrise.textContent =
    data.forecast.forecastday[0].astro.sunrise;

  sunset.textContent =
    data.forecast.forecastday[0].astro.sunset;

  humGauge.style.width =
    current.humidity + "%";

  cloudGauge.style.width =
    current.cloud + "%";

  uvBar.style.left =
    Math.min(current.uv * 10, 100) + "%";

  renderForecast(data.forecast.forecastday);
  renderHourly(data.forecast.forecastday[0].hour);
}

function renderForecast(days) {
  forecastList.innerHTML = "";

  days.forEach((day, index) => {
    const date = new Date(day.date);

    const row = document.createElement("div");
    row.className = "forecast-row";

    row.innerHTML = `
      <div class="forecast-day">
        ${index === 0
          ? "Today"
          : date.toLocaleDateString("en-US", {
              weekday: "long"
            })}
      </div>

      <img class="forecast-icon"
        src="https:${day.day.condition.icon}" />

      <div class="forecast-desc">
        ${day.day.condition.text}
      </div>

      <div class="forecast-temps">
        <span class="temp-hi">
          ${Math.round(day.day.maxtemp_c)}°
        </span>

        <span class="temp-lo">
          ${Math.round(day.day.mintemp_c)}°
        </span>
      </div>
    `;

    forecastList.appendChild(row);
  });
}

function renderHourly(hours) {
  hourlyStrip.innerHTML = "";

  const currentHour = new Date().getHours();

  hours.forEach((hour) => {
    const hourNum = new Date(hour.time).getHours();

    const card = document.createElement("div");

    card.className =
      hourNum === currentHour
        ? "hourly-card now"
        : "hourly-card";

    card.innerHTML = `
      <div class="hourly-time">
        ${hourNum}:00
      </div>

      <img
        class="hourly-icon"
        src="https:${hour.condition.icon}"
      >

      <div class="hourly-temp">
        ${Math.round(hour.temp_c)}°
      </div>

      <div class="hourly-rain">
        ${hour.chance_of_rain || 0}%
      </div>
    `;

    hourlyStrip.appendChild(card);
  });
}

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

    if (city) {
      getWeather(city);
    }
  }

  if (e.key === "Escape") {
    searchOverlay.classList.remove("open");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  getWeather("Bangalore");
});
