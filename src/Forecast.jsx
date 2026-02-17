import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import WindLoader from "./WindLoader";

function Forecast() {
  const location = useLocation();
  const navigate = useNavigate();
  const city = location.state;

  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!city) return;

    const fetchForecast = async () => {
      setLoading(true); 

      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&forecast_days=5&timezone=auto`,
        );

        const data = await res.json();
        const daily = data.daily;

        const formatted = daily.time.map((date, index) => ({
          date,
          max: daily.temperature_2m_max[index],
          min: daily.temperature_2m_min[index],
          rain: daily.precipitation_sum[index],
        }));

        setForecast(formatted);
      } catch (error) {
        console.error("Error fetching forecast:", error);
      }

      setLoading(false); 
    };

    fetchForecast();
  }, [city]);

  if (!city) {
    return <div className="p-10 text-center">No city selected.</div>;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-600 via-black to-blue-600 p-6 text-white">
      <button
        onClick={() => navigate("/")}
        className="mb-6 px-4 pb-1 bg-white text-black text-3xl rounded-full cursor-pointer"
      >
        ←
      </button>

      <h1 className="text-4xl font-bold text-center mb-10">
        5-Day Forecast for {city.name}
      </h1>
      {loading && <WindLoader />}
      <div className="grid md:grid-cols-5 gap-6 ">
        {forecast.map((day, index) => (
          <div
            key={index}
            className="bg-white/20 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/30"
          >
            <p className="font-semibold mb-2">
              {new Date(day.date).toDateString()}
            </p>
            <p>🌡 Max: {day.max}°C</p>
            <p>❄ Min: {day.min}°C</p>
            <p>🌧 Rain: {day.rain} mm</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Forecast;
