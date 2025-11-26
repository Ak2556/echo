'use client';

import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
  memo,
} from 'react';
import { useThemeColors } from '@/hooks/useThemeColors';

interface WeatherData {
  id: string;
  city: string;
  temperature: number;
  feelsLike: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  visibility: number;
  uvIndex: number;
  sunrise: string;
  sunset: string;
  timestamp: Date;
  cloudCover: number;
  dewPoint: number;
  precipitation: number;
  weatherCode: number;
}

interface HourlyForecast {
  time: string;
  temperature: number;
  condition: string;
  precipitation: number;
  humidity: number;
  windSpeed: number;
}

interface ForecastDay {
  date: string;
  tempHigh: number;
  tempLow: number;
  condition: string;
  precipitation: number;
  sunrise: string;
  sunset: string;
  uvIndex: number;
  windSpeed: number;
}

interface AirQuality {
  aqi: number;
  pm25: number;
  pm10: number;
  no2: number;
  o3: number;
  so2: number;
  co: number;
  level: string;
  color: string;
}

interface SavedCity {
  name: string;
  isFavorite: boolean;
  lastUpdated: Date;
  lat?: number;
  lon?: number;
}

interface AIResponse {
  text: string;
  suggestions: string[];
}

// Activity types for recommendations
type ActivityType =
  | 'outdoor_sports'
  | 'photography'
  | 'gardening'
  | 'beach'
  | 'hiking'
  | 'cycling'
  | 'running'
  | 'picnic'
  | 'stargazing';

interface WeatherAppProps {
  isVisible: boolean;
  onClose: () => void;
}

// Weather code to condition mapping (WMO codes)
const getConditionFromCode = (code: number): string => {
  const conditions: Record<number, string> = {
    0: 'Clear',
    1: 'Mostly Clear',
    2: 'Partly Cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Freezing Fog',
    51: 'Light Drizzle',
    53: 'Drizzle',
    55: 'Heavy Drizzle',
    56: 'Freezing Drizzle',
    57: 'Heavy Freezing Drizzle',
    61: 'Light Rain',
    63: 'Rain',
    65: 'Heavy Rain',
    66: 'Freezing Rain',
    67: 'Heavy Freezing Rain',
    71: 'Light Snow',
    73: 'Snow',
    75: 'Heavy Snow',
    77: 'Snow Grains',
    80: 'Light Showers',
    81: 'Showers',
    82: 'Heavy Showers',
    85: 'Light Snow Showers',
    86: 'Heavy Snow Showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with Hail',
    99: 'Heavy Thunderstorm',
  };
  return conditions[code] || 'Unknown';
};

// Get AQI level and color
const getAQIInfo = (aqi: number): { level: string; color: string } => {
  if (aqi <= 50) return { level: 'Good', color: 'colors.status.success' };
  if (aqi <= 100) return { level: 'Moderate', color: 'colors.status.warning' };
  if (aqi <= 150)
    return {
      level: 'Unhealthy for Sensitive',
      color: 'colors.brand.secondary',
    };
  if (aqi <= 200) return { level: 'Unhealthy', color: 'colors.status.error' };
  if (aqi <= 300)
    return { level: 'Very Unhealthy', color: 'colors.brand.primary' };
  return { level: 'Hazardous', color: 'colors.chart[6]' };
};

// Calculate moon phase
const getMoonPhase = (
  date: Date = new Date()
): { phase: string; illumination: number; emoji: string } => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  let jd =
    367 * year -
    Math.floor((7 * (year + Math.floor((month + 9) / 12))) / 4) +
    Math.floor((275 * month) / 9) +
    day +
    1721013.5;
  const daysSinceNew = jd - 2451550.1;
  const newMoons = daysSinceNew / 29.530588853;
  const daysInCycle = (newMoons - Math.floor(newMoons)) * 29.530588853;

  if (daysInCycle < 1.85)
    return { phase: 'New Moon', emoji: '🌑', illumination: 0 };
  if (daysInCycle < 5.53)
    return {
      phase: 'Waxing Crescent',
      emoji: '🌒',
      illumination: ((daysInCycle - 1.85) / 3.68) * 25,
    };
  if (daysInCycle < 9.22)
    return {
      phase: 'First Quarter',
      emoji: '🌓',
      illumination: 25 + ((daysInCycle - 5.53) / 3.69) * 25,
    };
  if (daysInCycle < 12.91)
    return {
      phase: 'Waxing Gibbous',
      emoji: '🌔',
      illumination: 50 + ((daysInCycle - 9.22) / 3.69) * 25,
    };
  if (daysInCycle < 16.61)
    return { phase: 'Full Moon', emoji: '🌕', illumination: 100 };
  if (daysInCycle < 20.3)
    return {
      phase: 'Waning Gibbous',
      emoji: '🌖',
      illumination: 100 - ((daysInCycle - 16.61) / 3.69) * 25,
    };
  if (daysInCycle < 23.99)
    return {
      phase: 'Last Quarter',
      emoji: '🌗',
      illumination: 50 - ((daysInCycle - 20.3) / 3.69) * 25,
    };
  return {
    phase: 'Waning Crescent',
    emoji: '🌘',
    illumination: 25 - ((daysInCycle - 23.99) / 5.53) * 25,
  };
};

// Get weather icon based on condition
const getWeatherIcon = (
  condition: string,
  isNight: boolean = false
): string => {
  const lower = condition.toLowerCase();
  if (lower.includes('thunder')) return '⛈️';
  if (lower.includes('heavy rain') || lower.includes('heavy shower'))
    return '🌧️';
  if (
    lower.includes('rain') ||
    lower.includes('drizzle') ||
    lower.includes('shower')
  )
    return '🌦️';
  if (lower.includes('snow') || lower.includes('sleet')) return '🌨️';
  if (lower.includes('fog') || lower.includes('mist')) return '🌫️';
  if (lower.includes('overcast')) return '☁️';
  if (lower.includes('cloudy') || lower.includes('partly'))
    return isNight ? '☁️' : '⛅';
  if (lower.includes('clear') || lower.includes('sunny'))
    return isNight ? '🌙' : '☀️';
  return '🌤️';
};

// Dynamic background gradient based on weather and time
const getWeatherGradient = (condition: string, isNight: boolean): string => {
  const lower = condition.toLowerCase();

  if (isNight) {
    if (lower.includes('clear'))
      return 'linear-gradient(180deg, #0f172a 0%, #1e3a5f 50%, #2d4a6f 100%)';
    if (lower.includes('cloudy'))
      return 'linear-gradient(180deg, #1a1f3a 0%, #2d3550 50%, #3d455f 100%)';
    if (lower.includes('rain') || lower.includes('thunder'))
      return 'linear-gradient(180deg, #0a1628 0%, #1a2540 50%, #2a3555 100%)';
    return 'linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #334155 100%)';
  }

  if (lower.includes('clear') || lower.includes('sunny'))
    return 'linear-gradient(180deg, colors.status.info 0%, #38bdf8 50%, #7dd3fc 100%)';
  if (lower.includes('cloudy') || lower.includes('overcast'))
    return 'linear-gradient(180deg, #94a3b8 0%, #cbd5e1 50%, #e2e8f0 100%)';
  if (lower.includes('rain') || lower.includes('drizzle'))
    return 'linear-gradient(180deg, #475569 0%, #64748b 50%, #94a3b8 100%)';
  if (lower.includes('thunder'))
    return 'linear-gradient(180deg, #1e293b 0%, #334155 50%, #475569 100%)';
  if (lower.includes('snow'))
    return 'linear-gradient(180deg, #e2e8f0 0%, #f1f5f9 50%, #f8fafc 100%)';
  if (lower.includes('fog'))
    return 'linear-gradient(180deg, #cbd5e1 0%, #e2e8f0 50%, #f1f5f9 100%)';

  return 'linear-gradient(180deg, colors.status.info 0%, #38bdf8 50%, #7dd3fc 100%)';
};

// Get activity score based on weather conditions
const getActivityScore = (
  weather: WeatherData,
  activity: ActivityType
): { score: number; reason: string } => {
  let score = 100;
  let reasons: string[] = [];

  const temp = weather.temperature;
  const wind = weather.windSpeed;
  const humidity = weather.humidity;
  const uv = weather.uvIndex;
  const condition = weather.condition.toLowerCase();

  // Base conditions affecting all activities
  if (condition.includes('rain') || condition.includes('thunder')) {
    score -= 60;
    reasons.push('rain expected');
  }
  if (condition.includes('snow')) {
    score -= 40;
    reasons.push('snow expected');
  }

  switch (activity) {
    case 'outdoor_sports':
      if (temp < 5 || temp > 35) score -= 30;
      if (wind > 30) score -= 20;
      if (humidity > 85) score -= 15;
      break;
    case 'photography':
      // Golden hour is ideal
      if (condition.includes('overcast')) score -= 10;
      if (wind > 20) score -= 10; // shaky shots
      break;
    case 'gardening':
      if (temp < 10 || temp > 32) score -= 25;
      if (wind > 25) score -= 15;
      break;
    case 'beach':
      if (temp < 22) score -= 30;
      if (uv > 8) score -= 15;
      if (wind > 25) score -= 20;
      break;
    case 'hiking':
      if (temp < 0 || temp > 30) score -= 25;
      if (wind > 35) score -= 20;
      break;
    case 'cycling':
      if (wind > 30) score -= 30;
      if (temp < 5 || temp > 35) score -= 20;
      break;
    case 'running':
      if (temp > 28) score -= 25;
      if (humidity > 80) score -= 20;
      break;
    case 'picnic':
      if (temp < 15 || temp > 30) score -= 20;
      if (wind > 20) score -= 15;
      break;
    case 'stargazing':
      if (condition.includes('cloud') || condition.includes('overcast'))
        score -= 50;
      // Best at night
      break;
  }

  return {
    score: Math.max(0, score),
    reason: reasons.join(', ') || 'conditions favorable',
  };
};

// Calculate golden hour times
const getGoldenHour = (
  sunrise: string,
  sunset: string
): { morning: string; evening: string } => {
  const parseTime = (timeStr: string): Date => {
    const now = new Date();
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    now.setHours(hours, minutes, 0);
    return now;
  };

  const sunriseDate = parseTime(sunrise);
  const sunsetDate = parseTime(sunset);

  // Golden hour is ~1 hour after sunrise and ~1 hour before sunset
  const morningGolden = new Date(sunriseDate.getTime() + 30 * 60000);
  const eveningGolden = new Date(sunsetDate.getTime() - 60 * 60000);

  return {
    morning: morningGolden.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    }),
    evening: eveningGolden.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    }),
  };
};

// Generate AI weather insights
const generateAIInsights = (
  weather: WeatherData,
  forecast: ForecastDay[],
  airQuality: AirQuality | null
): AIResponse => {
  const insights: string[] = [];
  const suggestions: string[] = [];

  // Temperature insights
  if (weather.temperature > 30) {
    insights.push(
      'High temperatures expected - stay hydrated and avoid prolonged sun exposure.'
    );
    suggestions.push('Carry water', 'Wear sunscreen', 'Take breaks in shade');
  } else if (weather.temperature < 5) {
    insights.push('Cold conditions - dress in warm layers.');
    suggestions.push('Wear layers', 'Cover extremities', 'Limit outdoor time');
  }

  // UV insights
  if (weather.uvIndex > 7) {
    insights.push(
      `UV index is ${weather.uvIndex} (Very High) - sun protection is essential.`
    );
    suggestions.push('Apply SPF 30+', 'Wear hat', 'Seek shade 10AM-4PM');
  }

  // Air quality insights
  if (airQuality && airQuality.aqi > 100) {
    insights.push(
      `Air quality is ${airQuality.level} - sensitive groups should limit outdoor activities.`
    );
    suggestions.push(
      'Use air purifier',
      'Wear N95 mask',
      'Avoid exercise outdoors'
    );
  }

  // Weather pattern insights
  const condition = weather.condition.toLowerCase();
  if (condition.includes('rain')) {
    insights.push('Rain expected - plan for wet conditions.');
    suggestions.push(
      'Carry umbrella',
      'Waterproof shoes',
      'Allow extra travel time'
    );
  } else if (condition.includes('thunder')) {
    insights.push(
      'Thunderstorms possible - avoid open areas and tall objects.'
    );
    suggestions.push('Stay indoors', 'Unplug electronics', 'Avoid windows');
  }

  // Wind insights
  if (weather.windSpeed > 40) {
    insights.push(
      `Strong winds of ${Math.round(weather.windSpeed)} km/h - secure loose objects.`
    );
    suggestions.push(
      'Secure outdoor items',
      'Avoid driving high vehicles',
      'Watch for debris'
    );
  }

  // Multi-day trend insights
  if (forecast.length >= 3) {
    const avgTemp =
      forecast
        .slice(0, 3)
        .reduce((sum, d) => sum + (d.tempHigh + d.tempLow) / 2, 0) / 3;
    if (avgTemp > weather.temperature + 5) {
      insights.push('Warming trend expected over the next few days.');
    } else if (avgTemp < weather.temperature - 5) {
      insights.push(
        'Cooling trend expected - prepare for dropping temperatures.'
      );
    }
  }

  // Default if no specific insights
  if (insights.length === 0) {
    insights.push(
      'Weather conditions are generally favorable for most activities.'
    );
    suggestions.push(
      'Enjoy outdoor activities',
      'Stay weather aware',
      'Check updates periodically'
    );
  }

  return {
    text: insights.join(' '),
    suggestions: suggestions.slice(0, 4),
  };
};

const WeatherApp: React.FC<WeatherAppProps> = memo(({ isVisible, onClose }) => {
  const colors = useThemeColors();
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(
    null
  );
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecast[]>([]);
  const [dailyForecast, setDailyForecast] = useState<ForecastDay[]>([]);
  const [airQuality, setAirQuality] = useState<AirQuality | null>(null);
  const [savedCities, setSavedCities] = useState<SavedCity[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unit, setUnit] = useState<'celsius' | 'fahrenheit'>('celsius');
  const [showCityPicker, setShowCityPicker] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check if it's night time
  const isNight = useMemo(() => {
    if (!currentWeather) return false;
    const now = new Date();
    const sunrise = new Date(`${now.toDateString()} ${currentWeather.sunrise}`);
    const sunset = new Date(`${now.toDateString()} ${currentWeather.sunset}`);
    return now < sunrise || now > sunset;
  }, [currentWeather]);

  // Temperature conversion
  const formatTemp = useCallback(
    (temp: number): string => {
      if (unit === 'fahrenheit') {
        return `${Math.round((temp * 9) / 5 + 32)}°`;
      }
      return `${Math.round(temp)}°`;
    },
    [unit]
  );

  // Fetch weather data
  const fetchWeather = useCallback(async (cityName: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // First, geocode the city
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`
      );
      const geoData = await geoResponse.json();

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error('City not found');
      }

      const { latitude, longitude, name, country } = geoData.results[0];

      // Fetch current weather and forecast
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,precipitation&hourly=temperature_2m,weather_code,precipitation_probability,relativehumidity_2m,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max,wind_speed_10m_max&timezone=auto&forecast_days=10`
      );

      if (!weatherResponse.ok) {
        throw new Error(`Weather API error: ${weatherResponse.status}`);
      }

      const weatherData = await weatherResponse.json();

      // Validate API response
      if (!weatherData.current || !weatherData.daily || !weatherData.hourly) {
        throw new Error('Invalid weather data received');
      }

      // Parse current weather
      const current = weatherData.current;
      const daily = weatherData.daily;

      if (current.temperature_2m === undefined) {
        throw new Error('Temperature data not available');
      }

      setCurrentWeather({
        id: `${latitude}-${longitude}`,
        city: `${name}, ${country}`,
        temperature: current.temperature_2m,
        feelsLike: current.apparent_temperature,
        condition: getConditionFromCode(current.weather_code),
        humidity: current.relative_humidity_2m,
        windSpeed: current.wind_speed_10m,
        windDirection: current.wind_direction_10m,
        pressure: current.pressure_msl,
        visibility: 10,
        uvIndex: daily.uv_index_max[0],
        sunrise: new Date(daily.sunrise[0]).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        }),
        sunset: new Date(daily.sunset[0]).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        }),
        timestamp: new Date(),
        cloudCover: current.cloud_cover,
        dewPoint:
          current.temperature_2m - (100 - current.relative_humidity_2m) / 5,
        precipitation: current.precipitation,
        weatherCode: current.weather_code,
      });

      // Parse hourly forecast
      const hourly: HourlyForecast[] = [];
      for (let i = 0; i < 24; i++) {
        hourly.push({
          time: new Date(weatherData.hourly.time[i]).toLocaleTimeString(
            'en-US',
            { hour: 'numeric' }
          ),
          temperature: weatherData.hourly.temperature_2m[i],
          condition: getConditionFromCode(weatherData.hourly.weather_code[i]),
          precipitation: weatherData.hourly.precipitation_probability[i],
          humidity: weatherData.hourly.relativehumidity_2m[i],
          windSpeed: weatherData.hourly.wind_speed_10m[i],
        });
      }
      setHourlyForecast(hourly);

      // Parse daily forecast
      const dailyForecasts: ForecastDay[] = [];
      for (let i = 0; i < 10; i++) {
        dailyForecasts.push({
          date: new Date(daily.time[i]).toLocaleDateString('en-US', {
            weekday: 'short',
          }),
          tempHigh: daily.temperature_2m_max[i],
          tempLow: daily.temperature_2m_min[i],
          condition: getConditionFromCode(daily.weather_code[i]),
          precipitation: daily.precipitation_probability_max[i],
          sunrise: new Date(daily.sunrise[i]).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
          }),
          sunset: new Date(daily.sunset[i]).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
          }),
          uvIndex: daily.uv_index_max[i],
          windSpeed: daily.wind_speed_10m_max[i],
        });
      }
      setDailyForecast(dailyForecasts);

      // Fetch air quality
      const aqResponse = await fetch(
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=pm10,pm2_5,nitrogen_dioxide,ozone,sulphur_dioxide,carbon_monoxide,us_aqi`
      );
      const aqData = await aqResponse.json();

      if (aqData.current) {
        const aqi = aqData.current.us_aqi;
        const aqiInfo = getAQIInfo(aqi);
        setAirQuality({
          aqi,
          pm25: aqData.current.pm2_5,
          pm10: aqData.current.pm10,
          no2: aqData.current.nitrogen_dioxide,
          o3: aqData.current.ozone,
          so2: aqData.current.sulphur_dioxide,
          co: aqData.current.carbon_monoxide,
          level: aqiInfo.level,
          color: aqiInfo.color,
        });
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch weather data'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load saved cities and default weather
  useEffect(() => {
    const saved = localStorage.getItem('weather_cities');
    if (saved) {
      try {
        setSavedCities(JSON.parse(saved));
      } catch {
        localStorage.removeItem('weather_cities');
      }
    }

    // Get last city or default to London
    let lastCity = localStorage.getItem('weather_last_city');

    // Validate the city name - if it's invalid or empty, use London
    if (
      !lastCity ||
      lastCity.trim() === '' ||
      lastCity === 'undefined' ||
      lastCity === 'null'
    ) {
      lastCity = 'London';
      localStorage.setItem('weather_last_city', 'London');
    }

    fetchWeather(lastCity.trim());
  }, [fetchWeather]);

  // Save city
  const saveCity = useCallback(
    (city: string) => {
      const updated = [...savedCities];
      if (!updated.find((c) => c.name === city)) {
        updated.push({
          name: city,
          isFavorite: false,
          lastUpdated: new Date(),
        });
        setSavedCities(updated);
        localStorage.setItem('weather_cities', JSON.stringify(updated));
      }
      localStorage.setItem('weather_last_city', city);
    },
    [savedCities]
  );

  // Handle city search
  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        fetchWeather(searchQuery.trim());
        saveCity(searchQuery.trim());
        setSearchQuery('');
        setShowCityPicker(false);
      }
    },
    [searchQuery, fetchWeather, saveCity]
  );

  const moonPhase = useMemo(() => getMoonPhase(), []);

  if (!isVisible) return null;

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: currentWeather
          ? getWeatherGradient(currentWeather.condition, isNight)
          : 'linear-gradient(180deg, colors.status.info 0%, #38bdf8 100%)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Compact Controls Bar */}
      <div
        style={{
          padding: '0.5rem 1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(0, 0, 0, 0.15)',
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => setShowCityPicker(true)}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '10px',
            padding: '0.4rem 0.75rem',
            color: 'white',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <span>📍</span>
          {currentWeather?.city.split(',')[0] || 'Select City'}
        </button>

        <button
          onClick={() => setUnit(unit === 'celsius' ? 'fahrenheit' : 'celsius')}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '8px',
            padding: '0.4rem 0.6rem',
            color: 'white',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          °{unit === 'celsius' ? 'C' : 'F'}
        </button>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '0 1rem 1rem',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {isLoading ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4rem 2rem',
              color: 'white',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                border: '3px solid rgba(255, 255, 255, 0.3)',
                borderTopColor: 'white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
            <p style={{ marginTop: '1rem', opacity: 0.8 }}>
              Loading weather...
            </p>
          </div>
        ) : error ? (
          <div
            style={{
              padding: '4rem 2rem',
              textAlign: 'center',
              color: 'white',
            }}
          >
            <p style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</p>
            <p>{error}</p>
            <button
              onClick={() => fetchWeather('London')}
              style={{
                marginTop: '1rem',
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                border: 'none',
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
          </div>
        ) : (
          currentWeather && (
            <>
              {/* Main Temperature Display */}
              <div
                style={{
                  textAlign: 'center',
                  padding: '1rem 0 1rem',
                  color: 'white',
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '0.25rem' }}>
                  {getWeatherIcon(currentWeather.condition, isNight)}
                </div>
                <div
                  style={{
                    fontSize: '4rem',
                    fontWeight: 200,
                    lineHeight: 1,
                    letterSpacing: '-3px',
                  }}
                >
                  {formatTemp(currentWeather.temperature)}
                </div>
                <div
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 500,
                    opacity: 0.9,
                    marginTop: '0.25rem',
                  }}
                >
                  {currentWeather.condition}
                </div>
                <div
                  style={{
                    fontSize: '0.85rem',
                    opacity: 0.7,
                    marginTop: '0.15rem',
                  }}
                >
                  H:{formatTemp(dailyForecast[0]?.tempHigh || 0)} L:
                  {formatTemp(dailyForecast[0]?.tempLow || 0)}
                </div>
              </div>

              {/* Hourly Forecast Card */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '12px',
                  padding: '0.75rem',
                  marginBottom: '0.5rem',
                }}
              >
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'rgba(255, 255, 255, 0.7)',
                    marginBottom: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Hourly Forecast
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: '0.75rem',
                    overflowX: 'auto',
                    paddingBottom: '0.5rem',
                  }}
                >
                  {hourlyForecast.slice(0, 12).map((hour, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.25rem',
                        minWidth: '48px',
                        color: 'white',
                        padding: '0.25rem',
                        background:
                          i === 0 ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                        borderRadius: '8px',
                      }}
                    >
                      <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>
                        {i === 0 ? 'Now' : hour.time}
                      </span>
                      {hour.precipitation > 30 && (
                        <span
                          style={{
                            fontSize: '0.55rem',
                            color: 'colors.status.info',
                          }}
                        >
                          {hour.precipitation}%
                        </span>
                      )}
                      <span style={{ fontSize: '1.1rem' }}>
                        {getWeatherIcon(hour.condition, isNight)}
                      </span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                        {formatTemp(hour.temperature)}
                      </span>
                      <span style={{ fontSize: '0.55rem', opacity: 0.6 }}>
                        {Math.round(hour.windSpeed)}
                      </span>
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    fontSize: '0.6rem',
                    opacity: 0.5,
                    marginTop: '0.25rem',
                    textAlign: 'right',
                  }}
                >
                  Wind speed in km/h
                </div>
              </div>

              {/* 10-Day Forecast Card */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '12px',
                  padding: '0.75rem',
                  marginBottom: '0.5rem',
                }}
              >
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'rgba(255, 255, 255, 0.7)',
                    marginBottom: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  10-Day Forecast
                </div>
                {dailyForecast.map((day, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '0.5rem 0',
                      borderBottom:
                        i < dailyForecast.length - 1
                          ? '1px solid rgba(255, 255, 255, 0.1)'
                          : 'none',
                      color: 'white',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <span
                        style={{
                          width: '50px',
                          fontSize: '0.85rem',
                          fontWeight: 500,
                        }}
                      >
                        {i === 0 ? 'Today' : day.date}
                      </span>
                      <span
                        style={{ fontSize: '1.1rem', marginRight: '0.5rem' }}
                      >
                        {getWeatherIcon(day.condition, false)}
                      </span>
                      <div
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        {day.precipitation > 0 && (
                          <span
                            style={{
                              fontSize: '0.7rem',
                              opacity: 0.7,
                              color: 'colors.status.info',
                            }}
                          >
                            💧{day.precipitation}%
                          </span>
                        )}
                      </div>
                      <span
                        style={{
                          fontSize: '0.8rem',
                          opacity: 0.6,
                          marginRight: '0.5rem',
                        }}
                      >
                        {formatTemp(day.tempLow)}
                      </span>
                      <div
                        style={{
                          width: '50px',
                          height: '4px',
                          background: 'rgba(255, 255, 255, 0.2)',
                          borderRadius: '2px',
                          position: 'relative',
                          marginRight: '0.5rem',
                        }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            height: '100%',
                            background:
                              'linear-gradient(90deg, colors.status.info, #f97316)',
                            borderRadius: '2px',
                            left: `${((day.tempLow + 10) / 50) * 100}%`,
                            right: `${100 - ((day.tempHigh + 10) / 50) * 100}%`,
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                        {formatTemp(day.tempHigh)}
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        gap: '0.75rem',
                        marginTop: '0.25rem',
                        marginLeft: '50px',
                        fontSize: '0.6rem',
                        opacity: 0.6,
                      }}
                    >
                      <span>UV: {day.uvIndex}</span>
                      <span>Wind: {Math.round(day.windSpeed)} km/h</span>
                      <span>☀️ {day.sunrise.split(' ')[0]}</span>
                      <span>🌙 {day.sunset.split(' ')[0]}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Details Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                }}
              >
                {/* UV Index */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '12px',
                    padding: '0.75rem',
                    color: 'white',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      opacity: 0.7,
                      marginBottom: '0.5rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    ☀️ UV Index
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 600 }}>
                    {currentWeather.uvIndex}
                  </div>
                  <div
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      marginTop: '0.25rem',
                    }}
                  >
                    {currentWeather.uvIndex <= 2
                      ? 'Low'
                      : currentWeather.uvIndex <= 5
                        ? 'Moderate'
                        : currentWeather.uvIndex <= 7
                          ? 'High'
                          : currentWeather.uvIndex <= 10
                            ? 'Very High'
                            : 'Extreme'}
                  </div>
                  <div
                    style={{
                      height: '4px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: '2px',
                      marginTop: '0.5rem',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min(currentWeather.uvIndex * 10, 100)}%`,
                        background:
                          currentWeather.uvIndex <= 2
                            ? 'colors.status.success'
                            : currentWeather.uvIndex <= 5
                              ? 'colors.status.warning'
                              : currentWeather.uvIndex <= 7
                                ? 'colors.brand.secondary'
                                : 'colors.status.error',
                        borderRadius: '2px',
                      }}
                    />
                  </div>
                  <div
                    style={{
                      fontSize: '0.7rem',
                      opacity: 0.7,
                      marginTop: '0.5rem',
                    }}
                  >
                    {currentWeather.uvIndex <= 2
                      ? 'No protection needed'
                      : currentWeather.uvIndex <= 5
                        ? 'SPF 15+ recommended'
                        : currentWeather.uvIndex <= 7
                          ? 'SPF 30+ & hat required'
                          : currentWeather.uvIndex <= 10
                            ? 'Avoid midday sun, SPF 50+'
                            : 'Stay indoors 10AM-4PM'}
                  </div>
                  <div
                    style={{
                      fontSize: '0.65rem',
                      opacity: 0.6,
                      marginTop: '0.25rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>
                      Burn time:{' '}
                      {currentWeather.uvIndex <= 2
                        ? '60+ min'
                        : currentWeather.uvIndex <= 5
                          ? '30-45 min'
                          : currentWeather.uvIndex <= 7
                            ? '15-25 min'
                            : '< 15 min'}
                    </span>
                  </div>
                </div>

                {/* Feels Like */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '12px',
                    padding: '0.75rem',
                    color: 'white',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      opacity: 0.7,
                      marginBottom: '0.5rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    🌡️ Feels Like
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 600 }}>
                    {formatTemp(currentWeather.feelsLike)}
                  </div>
                  <div
                    style={{
                      fontSize: '0.8rem',
                      opacity: 0.7,
                      marginTop: '0.25rem',
                    }}
                  >
                    {Math.abs(
                      currentWeather.feelsLike - currentWeather.temperature
                    ) < 2
                      ? 'Similar to actual'
                      : currentWeather.feelsLike > currentWeather.temperature
                        ? 'Humidity makes it feel warmer'
                        : 'Wind makes it feel cooler'}
                  </div>
                </div>

                {/* Humidity */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '12px',
                    padding: '0.75rem',
                    color: 'white',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      opacity: 0.7,
                      marginBottom: '0.5rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    💧 Humidity
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 600 }}>
                    {currentWeather.humidity}%
                  </div>
                  <div
                    style={{
                      fontSize: '0.8rem',
                      opacity: 0.8,
                      marginTop: '0.25rem',
                    }}
                  >
                    {currentWeather.humidity < 30
                      ? 'Very dry'
                      : currentWeather.humidity < 50
                        ? 'Comfortable'
                        : currentWeather.humidity < 70
                          ? 'Moderate'
                          : currentWeather.humidity < 85
                            ? 'Humid'
                            : 'Very humid'}
                  </div>
                  <div
                    style={{
                      fontSize: '0.7rem',
                      opacity: 0.7,
                      marginTop: '0.5rem',
                    }}
                  >
                    Dew point: {formatTemp(currentWeather.dewPoint)}
                  </div>
                  <div
                    style={{
                      height: '4px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: '2px',
                      marginTop: '0.5rem',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${currentWeather.humidity}%`,
                        background:
                          currentWeather.humidity < 30
                            ? 'colors.brand.secondary'
                            : currentWeather.humidity < 70
                              ? 'colors.status.success'
                              : 'colors.status.info',
                        borderRadius: '2px',
                      }}
                    />
                  </div>
                  <div
                    style={{
                      fontSize: '0.65rem',
                      opacity: 0.6,
                      marginTop: '0.25rem',
                    }}
                  >
                    {currentWeather.humidity < 30
                      ? 'Use moisturizer, drink water'
                      : currentWeather.humidity > 70
                        ? 'May feel sticky'
                        : 'Ideal comfort range'}
                  </div>
                </div>

                {/* Wind */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '12px',
                    padding: '0.75rem',
                    color: 'white',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      opacity: 0.7,
                      marginBottom: '0.5rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    💨 Wind
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <div style={{ fontSize: '1.75rem', fontWeight: 600 }}>
                      {Math.round(currentWeather.windSpeed)}
                    </div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>km/h</div>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginTop: '0.25rem',
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-block',
                        transform: `rotate(${currentWeather.windDirection}deg)`,
                        fontSize: '1rem',
                      }}
                    >
                      ↓
                    </span>
                    <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                      {
                        [
                          'North',
                          'Northeast',
                          'East',
                          'Southeast',
                          'South',
                          'Southwest',
                          'West',
                          'Northwest',
                        ][Math.round(currentWeather.windDirection / 45) % 8]
                      }
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: '0.7rem',
                      opacity: 0.7,
                      marginTop: '0.5rem',
                    }}
                  >
                    {currentWeather.windSpeed < 12
                      ? 'Light breeze - Calm conditions'
                      : currentWeather.windSpeed < 20
                        ? 'Gentle breeze - Leaves rustle'
                        : currentWeather.windSpeed < 30
                          ? 'Moderate - Small branches move'
                          : currentWeather.windSpeed < 40
                            ? 'Fresh - Trees sway'
                            : currentWeather.windSpeed < 50
                              ? 'Strong - Difficult to walk'
                              : 'Very strong - Dangerous'}
                  </div>
                  <div
                    style={{
                      fontSize: '0.65rem',
                      opacity: 0.6,
                      marginTop: '0.25rem',
                    }}
                  >
                    Beaufort:{' '}
                    {currentWeather.windSpeed < 2
                      ? '0'
                      : currentWeather.windSpeed < 6
                        ? '1'
                        : currentWeather.windSpeed < 12
                          ? '2'
                          : currentWeather.windSpeed < 20
                            ? '3'
                            : currentWeather.windSpeed < 29
                              ? '4'
                              : currentWeather.windSpeed < 39
                                ? '5'
                                : currentWeather.windSpeed < 50
                                  ? '6'
                                  : '7+'}
                  </div>
                </div>

                {/* Pressure */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '12px',
                    padding: '0.75rem',
                    color: 'white',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      opacity: 0.7,
                      marginBottom: '0.5rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    📊 Pressure
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '0.25rem',
                    }}
                  >
                    <div style={{ fontSize: '1.75rem', fontWeight: 600 }}>
                      {Math.round(currentWeather.pressure)}
                    </div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>hPa</div>
                  </div>
                  <div
                    style={{
                      fontSize: '0.8rem',
                      opacity: 0.8,
                      marginTop: '0.25rem',
                    }}
                  >
                    {currentWeather.pressure > 1020
                      ? '↑ High pressure'
                      : currentWeather.pressure < 1000
                        ? '↓ Low pressure'
                        : '→ Normal'}
                  </div>
                  <div
                    style={{
                      fontSize: '0.7rem',
                      opacity: 0.7,
                      marginTop: '0.5rem',
                    }}
                  >
                    {currentWeather.pressure > 1020
                      ? 'Fair weather expected'
                      : currentWeather.pressure < 1000
                        ? 'Unsettled conditions likely'
                        : 'Stable conditions'}
                  </div>
                  <div
                    style={{
                      fontSize: '0.65rem',
                      opacity: 0.6,
                      marginTop: '0.25rem',
                    }}
                  >
                    {Math.round(currentWeather.pressure * 0.02953)} inHg
                  </div>
                </div>

                {/* Visibility */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '12px',
                    padding: '0.75rem',
                    color: 'white',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      opacity: 0.7,
                      marginBottom: '0.5rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    👁️ Visibility
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 600 }}>
                    {currentWeather.visibility} km
                  </div>
                  <div
                    style={{
                      fontSize: '0.8rem',
                      opacity: 0.7,
                      marginTop: '0.25rem',
                    }}
                  >
                    {currentWeather.visibility >= 10
                      ? 'Clear'
                      : currentWeather.visibility >= 5
                        ? 'Moderate'
                        : 'Poor'}
                  </div>
                </div>
              </div>

              {/* Sun & Moon Card */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '12px',
                  padding: '0.75rem',
                  marginBottom: '0.5rem',
                  color: 'white',
                }}
              >
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    opacity: 0.7,
                    marginBottom: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  🌅 Sun & Moon
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '1rem',
                  }}
                >
                  {/* Sunrise/Sunset */}
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.5rem',
                      }}
                    >
                      <span style={{ fontSize: '1.25rem' }}>🌅</span>
                      <div>
                        <div style={{ fontSize: '0.65rem', opacity: 0.7 }}>
                          Sunrise
                        </div>
                        <div style={{ fontSize: '1rem', fontWeight: 600 }}>
                          {currentWeather.sunrise}
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <span style={{ fontSize: '1.25rem' }}>🌇</span>
                      <div>
                        <div style={{ fontSize: '0.65rem', opacity: 0.7 }}>
                          Sunset
                        </div>
                        <div style={{ fontSize: '1rem', fontWeight: 600 }}>
                          {currentWeather.sunset}
                        </div>
                      </div>
                    </div>
                    {(() => {
                      // Calculate daylight hours
                      const parseTime = (timeStr: string): number => {
                        const [time, period] = timeStr.split(' ');
                        let [hours, minutes] = time.split(':').map(Number);
                        if (period === 'PM' && hours !== 12) hours += 12;
                        if (period === 'AM' && hours === 12) hours = 0;
                        return hours * 60 + minutes;
                      };
                      const sunrise = parseTime(currentWeather.sunrise);
                      const sunset = parseTime(currentWeather.sunset);
                      const daylight = sunset - sunrise;
                      const hours = Math.floor(daylight / 60);
                      const mins = daylight % 60;
                      return (
                        <div
                          style={{
                            fontSize: '0.7rem',
                            opacity: 0.7,
                            marginTop: '0.5rem',
                            padding: '0.4rem',
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '6px',
                            textAlign: 'center',
                          }}
                        >
                          Daylight: {hours}h {mins}m
                        </div>
                      );
                    })()}
                  </div>

                  {/* Moon Phase */}
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.5rem',
                      }}
                    >
                      <span style={{ fontSize: '2rem' }}>
                        {moonPhase.emoji}
                      </span>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                          {moonPhase.phase}
                        </div>
                        <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>
                          {Math.round(moonPhase.illumination)}% illuminated
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        height: '4px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '2px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${moonPhase.illumination}%`,
                          background: 'colors.status.warning',
                          borderRadius: '2px',
                        }}
                      />
                    </div>
                    <div
                      style={{
                        fontSize: '0.65rem',
                        opacity: 0.6,
                        marginTop: '0.5rem',
                      }}
                    >
                      {moonPhase.phase === 'Full Moon'
                        ? 'Best for night visibility'
                        : moonPhase.phase === 'New Moon'
                          ? 'Best for stargazing'
                          : moonPhase.illumination > 50
                            ? 'Good night visibility'
                            : 'Limited night visibility'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Air Quality Card */}
              {airQuality && (
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '12px',
                    padding: '0.75rem',
                    marginBottom: '0.5rem',
                    color: 'white',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      opacity: 0.7,
                      marginBottom: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    🌬️ Air Quality
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      marginBottom: '0.75rem',
                    }}
                  >
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        background: airQuality.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem',
                        fontWeight: 700,
                      }}
                    >
                      {airQuality.aqi}
                    </div>
                    <div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                        {airQuality.level}
                      </div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                        {airQuality.aqi <= 50
                          ? 'Air quality is satisfactory'
                          : airQuality.aqi <= 100
                            ? 'Acceptable for most people'
                            : airQuality.aqi <= 150
                              ? 'Sensitive groups may be affected'
                              : 'Everyone may experience effects'}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '0.5rem',
                      fontSize: '0.7rem',
                    }}
                  >
                    <div
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '6px',
                        padding: '0.4rem',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ opacity: 0.7 }}>PM2.5</div>
                      <div style={{ fontWeight: 600 }}>
                        {airQuality.pm25?.toFixed(1)}
                      </div>
                    </div>
                    <div
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '6px',
                        padding: '0.4rem',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ opacity: 0.7 }}>PM10</div>
                      <div style={{ fontWeight: 600 }}>
                        {airQuality.pm10?.toFixed(1)}
                      </div>
                    </div>
                    <div
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '6px',
                        padding: '0.4rem',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ opacity: 0.7 }}>O₃</div>
                      <div style={{ fontWeight: 600 }}>
                        {airQuality.o3?.toFixed(0)}
                      </div>
                    </div>
                    <div
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '6px',
                        padding: '0.4rem',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ opacity: 0.7 }}>NO₂</div>
                      <div style={{ fontWeight: 600 }}>
                        {airQuality.no2?.toFixed(0)}
                      </div>
                    </div>
                    <div
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '6px',
                        padding: '0.4rem',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ opacity: 0.7 }}>SO₂</div>
                      <div style={{ fontWeight: 600 }}>
                        {airQuality.so2?.toFixed(0)}
                      </div>
                    </div>
                    <div
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '6px',
                        padding: '0.4rem',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ opacity: 0.7 }}>CO</div>
                      <div style={{ fontWeight: 600 }}>
                        {(airQuality.co / 1000)?.toFixed(1)}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: '0.65rem',
                      opacity: 0.6,
                      marginTop: '0.5rem',
                      textAlign: 'center',
                    }}
                  >
                    Values in µg/m³ (CO in mg/m³)
                  </div>
                </div>
              )}

              {/* Precipitation Chart */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '12px',
                  padding: '0.75rem',
                  marginBottom: '0.5rem',
                  color: 'white',
                }}
              >
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    opacity: 0.7,
                    marginBottom: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  🌧️ Precipitation Chance
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '4px',
                    height: '60px',
                  }}
                >
                  {hourlyForecast.slice(0, 12).map((hour, i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <div
                        style={{
                          width: '100%',
                          height: `${Math.max(hour.precipitation, 5)}%`,
                          background:
                            hour.precipitation > 50
                              ? 'linear-gradient(180deg, colors.status.info, #3b82f6)'
                              : 'rgba(255, 255, 255, 0.3)',
                          borderRadius: '2px',
                          transition: 'height 0.3s',
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '0.5rem',
                    fontSize: '0.65rem',
                    opacity: 0.6,
                  }}
                >
                  <span>Now</span>
                  <span>+6h</span>
                  <span>+12h</span>
                </div>
              </div>

              {/* Clothing Recommendations */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '12px',
                  padding: '0.75rem',
                  marginBottom: '0.5rem',
                  color: 'white',
                }}
              >
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    opacity: 0.7,
                    marginBottom: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  👔 What to Wear
                </div>
                <div
                  style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}
                >
                  {(() => {
                    const temp = currentWeather.temperature;
                    const isRaining =
                      currentWeather.condition.toLowerCase().includes('rain') ||
                      currentWeather.condition
                        .toLowerCase()
                        .includes('drizzle');
                    const items: { icon: string; label: string }[] = [];

                    if (temp < 5) {
                      items.push({ icon: '🧥', label: 'Heavy coat' });
                      items.push({ icon: '🧣', label: 'Scarf' });
                      items.push({ icon: '🧤', label: 'Gloves' });
                    } else if (temp < 15) {
                      items.push({ icon: '🧥', label: 'Jacket' });
                      items.push({ icon: '👖', label: 'Long pants' });
                    } else if (temp < 25) {
                      items.push({ icon: '👕', label: 'Light layers' });
                      items.push({ icon: '👖', label: 'Pants' });
                    } else {
                      items.push({ icon: '👕', label: 'T-shirt' });
                      items.push({ icon: '🩳', label: 'Shorts' });
                    }

                    if (isRaining) {
                      items.push({ icon: '☂️', label: 'Umbrella' });
                    }

                    if (currentWeather.uvIndex > 5) {
                      items.push({ icon: '🧴', label: 'Sunscreen' });
                      items.push({ icon: '🕶️', label: 'Sunglasses' });
                    }

                    return items.map((item, i) => (
                      <div
                        key={i}
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px',
                          padding: '0.5rem 0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '0.8rem',
                        }}
                      >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Weather Summary */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '12px',
                  padding: '0.75rem',
                  marginBottom: '0.5rem',
                  color: 'white',
                }}
              >
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    opacity: 0.7,
                    marginBottom: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  📝 Today's Summary
                </div>
                <p
                  style={{
                    fontSize: '0.85rem',
                    lineHeight: 1.5,
                    margin: 0,
                    opacity: 0.9,
                  }}
                >
                  {(() => {
                    const temp = currentWeather.temperature;
                    const condition = currentWeather.condition.toLowerCase();
                    const high = dailyForecast[0]?.tempHigh || temp;
                    const low = dailyForecast[0]?.tempLow || temp;

                    let summary = `Currently ${Math.round(temp)}° and ${currentWeather.condition.toLowerCase()}. `;

                    if (high - low > 10) {
                      summary += `Expect a wide temperature range today from ${Math.round(low)}° to ${Math.round(high)}°. `;
                    }

                    if (
                      condition.includes('rain') ||
                      condition.includes('drizzle')
                    ) {
                      summary += 'Bring an umbrella! ';
                    } else if (
                      condition.includes('clear') ||
                      condition.includes('sunny')
                    ) {
                      summary += 'Great day to be outside. ';
                    }

                    if (currentWeather.windSpeed > 30) {
                      summary += 'It will be quite windy. ';
                    }

                    if (currentWeather.uvIndex > 7) {
                      summary += 'UV is very high - wear sunscreen!';
                    } else if (currentWeather.humidity > 80) {
                      summary += 'High humidity expected.';
                    }

                    return summary;
                  })()}
                </p>
              </div>

              {/* Comfort Level */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '12px',
                  padding: '0.75rem',
                  color: 'white',
                }}
              >
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    opacity: 0.7,
                    marginBottom: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  😊 Comfort Level
                </div>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
                >
                  {(() => {
                    const temp = currentWeather.feelsLike;
                    const humidity = currentWeather.humidity;
                    let level = 'Comfortable';
                    let emoji = '😊';
                    let color = 'colors.status.success';

                    if (temp < 0 || temp > 35) {
                      level = 'Extreme';
                      emoji = '🥶';
                      color = 'colors.status.error';
                    } else if (temp < 10 || temp > 30) {
                      level = 'Uncomfortable';
                      emoji = '😐';
                      color = 'colors.brand.secondary';
                    } else if (humidity > 80 || humidity < 30) {
                      level = 'Moderate';
                      emoji = '🙂';
                      color = 'colors.status.warning';
                    }

                    return (
                      <>
                        <div
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                          }}
                        >
                          {emoji}
                        </div>
                        <div>
                          <div style={{ fontSize: '1rem', fontWeight: 600 }}>
                            {level}
                          </div>
                          <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                            Based on temperature & humidity
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* AI Weather Assistant */}
              <div
                style={{
                  background:
                    'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(59, 130, 246, 0.3) 100%)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '12px',
                  padding: '0.75rem',
                  marginTop: '0.5rem',
                  color: 'white',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                }}
              >
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    opacity: 0.9,
                    marginBottom: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <span style={{ fontSize: '1rem' }}>🤖</span>
                  AI Weather Assistant
                </div>
                {(() => {
                  const aiResponse = generateAIInsights(
                    currentWeather,
                    dailyForecast,
                    airQuality
                  );
                  return (
                    <>
                      <p
                        style={{
                          fontSize: '0.85rem',
                          lineHeight: 1.5,
                          margin: '0 0 0.75rem 0',
                          opacity: 0.95,
                        }}
                      >
                        {aiResponse.text}
                      </p>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          opacity: 0.8,
                          marginBottom: '0.5rem',
                        }}
                      >
                        Recommended Actions:
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          gap: '0.5rem',
                          flexWrap: 'wrap',
                        }}
                      >
                        {aiResponse.suggestions.map((suggestion, i) => (
                          <span
                            key={i}
                            style={{
                              background: 'rgba(255, 255, 255, 0.15)',
                              borderRadius: '6px',
                              padding: '0.35rem 0.6rem',
                              fontSize: '0.7rem',
                              fontWeight: 500,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                          >
                            <span style={{ opacity: 0.7 }}>•</span>
                            {suggestion}
                          </span>
                        ))}
                      </div>
                      <div
                        style={{
                          marginTop: '0.75rem',
                          padding: '0.5rem',
                          background: 'rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            marginBottom: '0.25rem',
                            opacity: 0.8,
                          }}
                        >
                          Best times today:
                        </div>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '0.5rem',
                            fontSize: '0.65rem',
                          }}
                        >
                          <div>
                            <div style={{ opacity: 0.7 }}>Outdoor</div>
                            <div style={{ fontWeight: 600 }}>
                              {currentWeather.temperature > 25
                                ? '6-9 AM'
                                : currentWeather.temperature < 10
                                  ? '11AM-2PM'
                                  : '9AM-5PM'}
                            </div>
                          </div>
                          <div>
                            <div style={{ opacity: 0.7 }}>Exercise</div>
                            <div style={{ fontWeight: 600 }}>
                              {currentWeather.temperature > 25
                                ? 'Early AM'
                                : 'Anytime'}
                            </div>
                          </div>
                          <div>
                            <div style={{ opacity: 0.7 }}>Shopping</div>
                            <div style={{ fontWeight: 600 }}>
                              {currentWeather.uvIndex > 7
                                ? '4-8 PM'
                                : 'Anytime'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Activity Planner */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '12px',
                  padding: '0.75rem',
                  marginTop: '0.5rem',
                  color: 'white',
                }}
              >
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    opacity: 0.7,
                    marginBottom: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  🎯 Activity Planner
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '0.5rem',
                  }}
                >
                  {[
                    {
                      type: 'running' as ActivityType,
                      icon: '🏃',
                      name: 'Running',
                      bestTime: 'Morning',
                    },
                    {
                      type: 'cycling' as ActivityType,
                      icon: '🚴',
                      name: 'Cycling',
                      bestTime: 'AM/PM',
                    },
                    {
                      type: 'hiking' as ActivityType,
                      icon: '🥾',
                      name: 'Hiking',
                      bestTime: 'Early AM',
                    },
                    {
                      type: 'photography' as ActivityType,
                      icon: '📸',
                      name: 'Photography',
                      bestTime: 'Golden Hr',
                    },
                    {
                      type: 'picnic' as ActivityType,
                      icon: '🧺',
                      name: 'Picnic',
                      bestTime: 'Midday',
                    },
                    {
                      type: 'gardening' as ActivityType,
                      icon: '🌱',
                      name: 'Gardening',
                      bestTime: 'Morning',
                    },
                    {
                      type: 'beach' as ActivityType,
                      icon: '🏖️',
                      name: 'Beach',
                      bestTime: 'Afternoon',
                    },
                    {
                      type: 'stargazing' as ActivityType,
                      icon: '🌟',
                      name: 'Stargazing',
                      bestTime: 'Night',
                    },
                  ].map((activity) => {
                    const result = getActivityScore(
                      currentWeather,
                      activity.type
                    );
                    const color =
                      result.score >= 70
                        ? 'colors.status.success'
                        : result.score >= 40
                          ? 'colors.status.warning'
                          : 'colors.status.error';
                    const rating =
                      result.score >= 80
                        ? 'Excellent'
                        : result.score >= 60
                          ? 'Good'
                          : result.score >= 40
                            ? 'Fair'
                            : 'Poor';
                    return (
                      <div
                        key={activity.type}
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px',
                          padding: '0.5rem',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginBottom: '0.25rem',
                          }}
                        >
                          <span style={{ fontSize: '1rem' }}>
                            {activity.icon}
                          </span>
                          <div style={{ flex: 1 }}>
                            <div
                              style={{ fontSize: '0.7rem', fontWeight: 500 }}
                            >
                              {activity.name}
                            </div>
                          </div>
                          <span
                            style={{
                              fontSize: '0.6rem',
                              fontWeight: 600,
                              color,
                              padding: '0.15rem 0.35rem',
                              background: `${color}20`,
                              borderRadius: '4px',
                            }}
                          >
                            {rating}
                          </span>
                        </div>
                        <div
                          style={{
                            height: '3px',
                            background: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: '2px',
                            overflow: 'hidden',
                            marginBottom: '0.25rem',
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              width: `${result.score}%`,
                              background: color,
                              borderRadius: '2px',
                            }}
                          />
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '0.55rem',
                            opacity: 0.7,
                          }}
                        >
                          <span>Best: {activity.bestTime}</span>
                          <span>{result.score}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div
                  style={{
                    marginTop: '0.75rem',
                    padding: '0.5rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    fontSize: '0.65rem',
                    opacity: 0.8,
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                    Today's Best Activity:
                  </div>
                  {(() => {
                    const activities = [
                      { type: 'running' as ActivityType, name: 'Running' },
                      { type: 'cycling' as ActivityType, name: 'Cycling' },
                      { type: 'hiking' as ActivityType, name: 'Hiking' },
                      {
                        type: 'photography' as ActivityType,
                        name: 'Photography',
                      },
                    ];
                    const best = activities.reduce((prev, curr) => {
                      const prevScore = getActivityScore(
                        currentWeather,
                        prev.type
                      ).score;
                      const currScore = getActivityScore(
                        currentWeather,
                        curr.type
                      ).score;
                      return currScore > prevScore ? curr : prev;
                    });
                    return `${best.name} with ${getActivityScore(currentWeather, best.type).score}% suitability`;
                  })()}
                </div>
              </div>

              {/* Photography Golden Hour */}
              <div
                style={{
                  background:
                    'linear-gradient(135deg, rgba(251, 191, 36, 0.3) 0%, rgba(245, 158, 11, 0.3) 100%)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '12px',
                  padding: '0.75rem',
                  marginTop: '0.5rem',
                  color: 'white',
                }}
              >
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    opacity: 0.9,
                    marginBottom: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  📸 Photography Conditions
                </div>
                {(() => {
                  const goldenHour = getGoldenHour(
                    currentWeather.sunrise,
                    currentWeather.sunset
                  );
                  const condition = currentWeather.condition.toLowerCase();
                  const photoScore =
                    condition.includes('clear') || condition.includes('partly')
                      ? 90
                      : condition.includes('overcast')
                        ? 70
                        : condition.includes('rain')
                          ? 30
                          : 60;

                  return (
                    <>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(2, 1fr)',
                          gap: '0.75rem',
                          marginBottom: '0.75rem',
                        }}
                      >
                        <div
                          style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                            padding: '0.5rem',
                            textAlign: 'center',
                          }}
                        >
                          <div style={{ fontSize: '0.65rem', opacity: 0.7 }}>
                            Morning Golden
                          </div>
                          <div style={{ fontSize: '1rem', fontWeight: 600 }}>
                            {goldenHour.morning}
                          </div>
                          <div style={{ fontSize: '0.6rem', opacity: 0.6 }}>
                            ~1 hour window
                          </div>
                        </div>
                        <div
                          style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                            padding: '0.5rem',
                            textAlign: 'center',
                          }}
                        >
                          <div style={{ fontSize: '0.65rem', opacity: 0.7 }}>
                            Evening Golden
                          </div>
                          <div style={{ fontSize: '1rem', fontWeight: 600 }}>
                            {goldenHour.evening}
                          </div>
                          <div style={{ fontSize: '0.6rem', opacity: 0.6 }}>
                            ~1 hour window
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.5rem',
                          background: 'rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px',
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: '0.7rem',
                              opacity: 0.7,
                              marginBottom: '0.25rem',
                            }}
                          >
                            Photo conditions today
                          </div>
                          <div
                            style={{
                              height: '4px',
                              background: 'rgba(255, 255, 255, 0.2)',
                              borderRadius: '2px',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                height: '100%',
                                width: `${photoScore}%`,
                                background:
                                  photoScore >= 70
                                    ? 'colors.status.success'
                                    : photoScore >= 40
                                      ? 'colors.status.warning'
                                      : 'colors.status.error',
                                borderRadius: '2px',
                              }}
                            />
                          </div>
                        </div>
                        <div
                          style={{
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            color:
                              photoScore >= 70
                                ? 'colors.status.success'
                                : photoScore >= 40
                                  ? 'colors.status.warning'
                                  : 'colors.status.error',
                          }}
                        >
                          {photoScore}%
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: '0.65rem',
                          opacity: 0.7,
                          marginTop: '0.5rem',
                          textAlign: 'center',
                        }}
                      >
                        {condition.includes('clear')
                          ? 'Perfect for landscapes & portraits'
                          : condition.includes('overcast')
                            ? 'Great soft light for portraits'
                            : condition.includes('rain')
                              ? 'Dramatic mood shots possible'
                              : 'Good conditions for most subjects'}
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Weather Alerts */}
              {(() => {
                const alerts: {
                  type: string;
                  message: string;
                  severity: 'warning' | 'danger' | 'info';
                }[] = [];

                if (currentWeather.uvIndex > 7) {
                  alerts.push({
                    type: 'UV',
                    message: `Extreme UV Index: ${currentWeather.uvIndex}`,
                    severity: 'danger',
                  });
                }
                if (currentWeather.windSpeed > 40) {
                  alerts.push({
                    type: 'Wind',
                    message: `High winds: ${Math.round(currentWeather.windSpeed)} km/h`,
                    severity: 'warning',
                  });
                }
                if (
                  currentWeather.condition.toLowerCase().includes('thunder')
                ) {
                  alerts.push({
                    type: 'Storm',
                    message: 'Thunderstorm warning',
                    severity: 'danger',
                  });
                }
                if (airQuality && airQuality.aqi > 150) {
                  alerts.push({
                    type: 'Air',
                    message: `Poor air quality: ${airQuality.level}`,
                    severity: 'warning',
                  });
                }
                if (currentWeather.temperature > 35) {
                  alerts.push({
                    type: 'Heat',
                    message: `Extreme heat: ${formatTemp(currentWeather.temperature)}`,
                    severity: 'danger',
                  });
                }
                if (currentWeather.temperature < 0) {
                  alerts.push({
                    type: 'Cold',
                    message: `Freezing conditions: ${formatTemp(currentWeather.temperature)}`,
                    severity: 'warning',
                  });
                }

                if (alerts.length === 0) return null;

                return (
                  <div
                    style={{
                      background: 'rgba(255, 59, 48, 0.2)',
                      backdropFilter: 'blur(20px)',
                      borderRadius: '12px',
                      padding: '0.75rem',
                      marginTop: '0.5rem',
                      color: 'white',
                      border: '1px solid rgba(255, 59, 48, 0.3)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <span>⚠️</span>
                      Weather Alerts
                    </div>
                    {alerts.map((alert, i) => (
                      <div
                        key={i}
                        style={{
                          padding: '0.4rem 0',
                          borderBottom:
                            i < alerts.length - 1
                              ? '1px solid rgba(255, 255, 255, 0.1)'
                              : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background:
                              alert.severity === 'danger'
                                ? 'colors.status.error'
                                : alert.severity === 'warning'
                                  ? 'colors.brand.secondary'
                                  : 'colors.status.info',
                          }}
                        />
                        <span style={{ fontSize: '0.8rem' }}>
                          {alert.message}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Week Overview */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '12px',
                  padding: '0.75rem',
                  marginTop: '0.5rem',
                  color: 'white',
                }}
              >
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    opacity: 0.7,
                    marginBottom: '0.5rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  📊 Week At A Glance
                </div>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between' }}
                >
                  {dailyForecast.slice(0, 7).map((day, i) => (
                    <div
                      key={i}
                      style={{
                        textAlign: 'center',
                        flex: 1,
                      }}
                    >
                      <div style={{ fontSize: '0.65rem', opacity: 0.7 }}>
                        {i === 0 ? 'Today' : day.date.slice(0, 2)}
                      </div>
                      <div style={{ fontSize: '1rem', margin: '0.25rem 0' }}>
                        {getWeatherIcon(day.condition, false)}
                      </div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 500 }}>
                        {formatTemp(day.tempHigh)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )
        )}
      </div>

      {/* City Picker Modal */}
      {showCityPicker && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column',
            padding: '1.5rem',
            zIndex: 100,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
            }}
          >
            <h3
              style={{
                color: 'white',
                fontSize: '1.25rem',
                fontWeight: 600,
                margin: 0,
              }}
            >
              Select Location
            </h3>
            <button
              onClick={() => setShowCityPicker(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem 0.75rem',
                color: 'white',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSearch} style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search city..."
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                border: 'none',
                background: 'rgba(255, 255, 255, 0.15)',
                color: 'white',
                fontSize: '1rem',
                outline: 'none',
              }}
              autoFocus
            />
          </form>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {savedCities.length > 0 && (
              <>
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'rgba(255, 255, 255, 0.6)',
                    marginBottom: '0.5rem',
                    textTransform: 'uppercase',
                  }}
                >
                  Saved Locations
                </div>
                {savedCities.map((city, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      fetchWeather(city.name);
                      setShowCityPicker(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      border: 'none',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      fontSize: '0.95rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      marginBottom: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                    }}
                  >
                    <span>📍</span>
                    {city.name}
                  </button>
                ))}
              </>
            )}

            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'rgba(255, 255, 255, 0.6)',
                margin: '1rem 0 0.5rem',
                textTransform: 'uppercase',
              }}
            >
              Popular Cities
            </div>
            {['New York', 'London', 'Tokyo', 'Paris', 'Sydney', 'Dubai'].map(
              (city) => (
                <button
                  key={city}
                  onClick={() => {
                    fetchWeather(city);
                    saveCity(city);
                    setShowCityPicker(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontSize: '0.95rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    marginBottom: '0.5rem',
                  }}
                >
                  {city}
                </button>
              )
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
});

WeatherApp.displayName = 'WeatherApp';

export default WeatherApp;
