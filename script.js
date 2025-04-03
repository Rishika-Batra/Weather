const userLocation = document.getElementById("userLocation");
const converter = document.getElementById("converter");
const weatherIcon = document.querySelector(".weatherIcon");
const temperature = document.querySelector(".temperature");
const feelsLike = document.querySelector(".feelsLike");
const description = document.querySelector(".description");
const date = document.querySelector(".date");
const city = document.querySelector(".city");

const HValue = document.getElementById("HValue");
const WValue = document.getElementById("WValue");
const SRValue = document.getElementById("SRValue");
const SSValue = document.getElementById("SSValue");
const CValue = document.getElementById("CValue");
const UVValue = document.getElementById("UVValue");
const PValue = document.getElementById("PValue");

const Forecast = document.querySelector(".Forecast");

const API_KEY = 'f400d12c089a4750817180949250304';
const WEATHER_API_ENDPOINT = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=`;
const WEATHER_DATA_ENDPOINT = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&days=7&q=`;

function findUserLocation() {
    Forecast.innerHTML = "";
    fetch(WEATHER_API_ENDPOINT + userLocation.value)
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                alert(data.error.message);
                return;
            }
            console.log(data);
            city.innerHTML = `${data.location.name}, ${data.location.country}`;
            weatherIcon.style.background = `url('https://${data.current.condition.icon}')`;
            fetch(WEATHER_DATA_ENDPOINT + userLocation.value)
                .then((response) => response.json())
                .then((data) => {
                    console.log(data);
                    temperature.innerHTML = data.current.temp_c;
                    feelsLike.innerHTML = `Feels like ${data.current.feelslike_c}`;
                    description.innerHTML = `<i class="fa-brands fa-cloudversify"></i> &nbsp;${data.current.condition.text}`;

                    const options = {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                        hour12: true,
                    };

                    date.innerHTML = getLongFormateDateTime(data.location.localtime, options);

                    HValue.innerHTML = `${data.current.humidity}<span>%</span>`;
                    WValue.innerHTML = `${data.current.wind_kph}<span>km/h</span>`;
                    const options1 = {
                        hour: "numeric",
                        minute: "numeric",
                        hour12: true,
                    };
                    SRValue.innerHTML = getLongFormateDateTime(data.forecast.forecastday[0].astro.sunrise, options1);
                    SSValue.innerHTML = getLongFormateDateTime(data.forecast.forecastday[0].astro.sunset, options1);

                    CValue.innerHTML = `${data.current.cloud}<span>%</span>`;
                    UVValue.innerHTML = data.current.uv;
                    PValue.innerHTML = `${data.current.pressure_mb}<span>hPa</span>`;

                    data.forecast.forecastday.forEach((weather) => {
                        let div = document.createElement("div");
                        const options = {
                            weekday: 'long',
                            month: 'long',
                            day: "numeric"
                        };
                        let daily = getLongFormateDateTime(weather.date, options).split(" at ");

                        div.innerHTML = `${daily[0]}
                            <img src="https:${weather.day.condition.icon}" />
                            <p class="forecast-desc">${weather.day.condition.text}</p>
                            <span>${TempConverter(weather.day.mintemp_c)}&nbsp;${TempConverter(weather.day.maxtemp_c)}</span>`;
                        Forecast.append(div);
                    });
                });
        })
        .catch((error) => {
            console.error('Error fetching weather data:', error);
            alert('Error fetching weather data. Please try again.');
        });
}

function getLongFormateDateTime(dtValue, options) {
    const date = new Date(dtValue);
    return date.toLocaleTimeString([], options);
}

function TempConverter(temp) {
    let tempValue = Math.round(temp);
    let message = "";
    if (converter.value == "°C") {
        message = `${tempValue}<span>\u2103</span>`;
    } else {
        let ctof = (tempValue * 9) / 5 + 32;
        message = `${ctof}<span>\u2109</span>`;
    }
    return message;
}

document.getElementById("searchIcon").addEventListener("click", findUserLocation);

document.getElementById("userLocation").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        findUserLocation();
    }
});
