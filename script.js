const API_KEY = "10f694dfefe0af69936fbc672b47d6f2"; // Replace with your OpenWeatherMap API key

// 1. CURRENT LOCATION WEATHER
function getCurrentLocationWeather() {
  navigator.geolocation.getCurrentPosition(success, () => {
    document.getElementById("location").textContent = "❌ Location access denied.";
  });

  function success(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    getWeatherData(lat, lon);
  }
}

// 2. SEARCH BY CITY
function searchCity() {
  const city = document.getElementById("cityInput").value;
  if (!city) {
    alert("Please enter a city name.");
    return;
  }

  const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`;
  fetch(geoUrl)
    .then(res => res.json())
    .then(data => {
      if (data.length === 0) {
        throw new Error("City not found.");
      }
      const { lat, lon, name, country } = data[0];
      getWeatherData(lat, lon, `${name}, ${country}`);
    })
    .catch(err => {
      document.getElementById("location").textContent = `❌ Error: ${err.message}`;
    });
}

// 3. GET WEATHER DATA (shared)
function getWeatherData(lat, lon, customLocation = null) {
  const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;

  // CURRENT WEATHER
  fetch(currentUrl)
    .then(res => {
      if (!res.ok) throw new Error("Current weather fetch failed");
      return res.json();
    })
    .then(data => {
      const { name, main, weather } = data;
      document.getElementById("location").textContent = `📍 ${customLocation || name}`;
      document.getElementById("current-weather").innerHTML = `
        <h3>${weather[0].main}</h3>
        <p>${weather[0].description}</p>
        <p>🌡 Temp: ${main.temp} °C</p>
        <p>💧 Humidity: ${main.humidity}%</p>
      `;
    })
    .catch(err => {
      document.getElementById("current-weather").innerHTML = `<p>❌ ${err.message}</p>`;
    });

  // 5-DAY FORECAST
  fetch(forecastUrl)
    .then(res => {
      if (!res.ok) throw new Error("Forecast fetch failed");
      return res.json();
    })
    .then(data => {
      const forecastDiv = document.getElementById("forecast");
      forecastDiv.innerHTML = "";

      const filtered = data.list.filter(item => item.dt_txt.includes("12:00:00"));

      filtered.forEach(day => {
        const date = new Date(day.dt_txt).toLocaleDateString("en-IN", {
          weekday: "short",
          month: "short",
          day: "numeric"
        });

        forecastDiv.innerHTML += `
          <div class="card">
            <h4>${date}</h4>
            <p>${day.weather[0].main}</p>
            <p>🌡 ${day.main.temp} °C</p>
          </div>
        `;
      });
    })
    .catch(err => {
      document.getElementById("forecast").innerHTML = `<p>❌ ${err.message}</p>`;
    });
}
