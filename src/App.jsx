import { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Forecast from "./Forecast";
import WindLoader from "./WindLoader";

const defaultCities = [
  { name: "Mumbai", latitude: 19.076, longitude: 72.8777 },
  { name: "Delhi", latitude: 28.7041, longitude: 77.1025 },
  { name: "Pune", latitude: 18.5204, longitude: 73.8567 },
  { name: "London", latitude: 51.5072, longitude: -0.1276 },
  { name: "New York", latitude: 40.7128, longitude: -74.006 },
];

function Home() {
  const [city, setCity] = useState("");
  const [weatherList, setWeatherList] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchWeather = async (latitude, longitude, name, isNewCity = false) => {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation`
  );

  const data = await res.json();

  return {
    name,
    latitude,
    longitude,
    temperature: data.current.temperature_2m,
    humidity: data.current.relative_humidity_2m,
    wind: data.current.wind_speed_10m,
    rain: data.current.precipitation,
    isNew: isNewCity, 
  };
};
  useEffect(() => {
    const loadDefaultCities = async () => {
      setLoading(true);
      const results = await Promise.all(
        defaultCities.map((c) =>
  fetchWeather(c.latitude, c.longitude, c.name, false)
),
      );
      setWeatherList(results);
      setLoading(false);
    };

    loadDefaultCities();
  }, []);

  const handleSearch = async () => {
  if (!city) return;

  setLoading(true);

  const geoRes = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`
  );
  const geoData = await geoRes.json();

  if (!geoData.results) {
    setLoading(false);
    return;
  }

  const { latitude, longitude, name } = geoData.results[0];

  const result = await fetchWeather(latitude, longitude, name, true);

  // Remove old NEW tag from others
  const updatedList = weatherList.map((item) => ({
    ...item,
    isNew: false,
  }));

  setWeatherList([result, ...updatedList]);
  setCity("");
  setLoading(false);
};

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-500 via-purple-500 to-pink-500 p-6 text-white">
      <h1 className="text-4xl font-bold text-center mb-8">Weather Dashboard</h1>

      {/* Search */}
      <div className="flex justify-center mb-8 animate-pulse">
        <input
          className="px-4 py-2 rounded-l-full text-white w-96 border-2 border-white cursor-pointer outline-none"
          placeholder="Search City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-white text-black rounded-r-full font-semibold cursor-pointer hover:scale-110 transition-transform duration-500"
        >
          Search
        </button>
      </div>

      {loading && <WindLoader />}

      {/* Weather Cards */}

      <div className="grid md:grid-cols-3 gap-6">
        {weatherList.map((weather, index) => (
          <div
            key={index}
            onClick={() => navigate("/forecast", { state: weather })}
            className="relative cursor-pointer bg-white/20 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/30 hover:scale-105 transition"
          >
            {weather.isNew && (
              <span className="absolute top-4 right-4 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                NEW
              </span>
            )}
            <h2 className="text-2xl font-semibold mb-4">
              {weather.name}
             
            </h2>

            <p className="text-4xl font-bold mb-4">{weather.temperature}°C</p>

            <div className="space-y-2 text-lg">
              <p>💨 Wind: {weather.wind} km/h</p>
              <p>💧 Humidity: {weather.humidity}%</p>
              <p>🌧 Rain: {weather.rain} mm</p>
            </div>

            <p className="mt-4 text-sm opacity-80 animate-bounce">
              Click for 5-Day Forecast →
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/forecast" element={<Forecast />} />
    </Routes>
  );
}

export default App;
