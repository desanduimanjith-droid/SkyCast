import cors from 'cors';
import express from 'express';
import { createAlerts, createInsights, createTips, describeWeatherCode } from './weather.js';

type FavoriteCity = {
  id: number;
  name: string;
  country: string;
  temperature: number;
  condition: string;
  note: string;
  starred: boolean;
  updatedAt: string;
};

type GeocodeResult = {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
  timezone?: string;
};

type OpenMeteoResponse = {
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    precipitation: number;
    weather_code: number;
    wind_speed_10m: number;
    uv_index: number;
    surface_pressure: number;
    is_day: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    precipitation_probability: number[];
    weather_code: number[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    sunrise: string[];
    sunset: string[];
  };
  timezone: string;
};

const app = express();
const port = Number(process.env.PORT ?? 4001);

app.use(cors({ origin: true }));
app.use(express.json());

let favorites: FavoriteCity[] = [
  {
    id: 1,
    name: 'Seattle',
    country: 'United States',
    temperature: 14,
    condition: 'Overcast',
    note: 'Usually a reliable reference point for cool and cloudy weather.',
    starred: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Tokyo',
    country: 'Japan',
    temperature: 21,
    condition: 'Mostly clear',
    note: 'A strong fallback if you want warmer, brighter conditions.',
    starred: false,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    name: 'Reykjavik',
    country: 'Iceland',
    temperature: 8,
    condition: 'Windy',
    note: 'Useful for checking low-temperature and high-wind patterns.',
    starred: false,
    updatedAt: new Date().toISOString(),
  },
];

async function geocodeCity(city: string): Promise<GeocodeResult> {
  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
  );

  if (!response.ok) {
    throw new Error('Weather lookup failed during location search.');
  }

  const payload = (await response.json()) as { results?: GeocodeResult[] };
  const result = payload.results?.[0];

  if (!result) {
    throw new Error(`No weather location found for "${city}".`);
  }

  return result;
}

async function loadForecast(city: string) {
  const location = await geocodeCity(city);
  const weatherResponse = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,uv_index,surface_pressure&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset&forecast_days=7&timezone=auto`
  );

  if (!weatherResponse.ok) {
    throw new Error('Weather lookup failed while loading the forecast.');
  }

  const payload = (await weatherResponse.json()) as OpenMeteoResponse;
  const currentMeta = describeWeatherCode(payload.current.weather_code);

  const hourly = payload.hourly.time.slice(0, 8).map((time, index) => {
    const code = payload.hourly.weather_code[index] ?? payload.current.weather_code;
    const details = describeWeatherCode(code);
    return {
      time,
      label: new Date(time).toLocaleTimeString([], { hour: 'numeric' }),
      temperature: payload.hourly.temperature_2m[index],
      chanceOfRain: payload.hourly.precipitation_probability[index] ?? 0,
      condition: details.label,
      icon: details.icon,
    };
  });

  const daily = payload.daily.time.map((time, index) => {
    const details = describeWeatherCode(payload.daily.weather_code[index] ?? payload.current.weather_code);
    return {
      day: time,
      label: new Date(time).toLocaleDateString([], { weekday: 'long' }),
      high: payload.daily.temperature_2m_max[index],
      low: payload.daily.temperature_2m_min[index],
      chanceOfRain: payload.daily.precipitation_probability_max[index] ?? 0,
      condition: details.label,
      icon: details.icon,
    };
  });

  const insights = createInsights({
    temperature: payload.current.temperature_2m,
    rainChance: payload.daily.precipitation_probability_max[0] ?? 0,
    windSpeed: payload.current.wind_speed_10m,
    humidity: payload.current.relative_humidity_2m,
    condition: currentMeta.label,
  });

  const alerts = createAlerts({
    temperature: payload.current.temperature_2m,
    rainChance: payload.daily.precipitation_probability_max[0] ?? 0,
    windSpeed: payload.current.wind_speed_10m,
    uvIndex: payload.current.uv_index,
  });

  const tips = createTips({
    rainChance: payload.daily.precipitation_probability_max[0] ?? 0,
    windSpeed: payload.current.wind_speed_10m,
    temperature: payload.current.temperature_2m,
  });

  return {
    location: {
      name: location.name,
      region: location.admin1 ?? '',
      country: location.country ?? 'Unknown',
      latitude: location.latitude,
      longitude: location.longitude,
      timezone: location.timezone ?? payload.timezone,
      localTime: payload.current.time,
    },
    current: {
      temperature: payload.current.temperature_2m,
      feelsLike: payload.current.apparent_temperature,
      humidity: payload.current.relative_humidity_2m,
      windSpeed: payload.current.wind_speed_10m,
      uvIndex: payload.current.uv_index,
      pressure: payload.current.surface_pressure,
      precipitation: payload.current.precipitation,
      condition: currentMeta.label,
      icon: currentMeta.icon,
      summary: currentMeta.summary,
      sunrise: payload.daily.sunrise[0],
      sunset: payload.daily.sunset[0],
      updatedAt: payload.current.time,
    },
    hourly,
    daily,
    insights,
    alerts,
    tips,
  };
}

app.get('/api/health', (_request, response) => {
  response.json({ ok: true });
});

app.get('/api/status', (_request, response) => {
  response.json({
    ok: true,
    uptimeSeconds: Math.round(process.uptime()),
    savedCities: favorites.length,
    activeFavorites: favorites.filter((city) => city.starred).length,
  });
});

app.get('/api/favorites', (_request, response) => {
  response.json(favorites);
});

app.post('/api/favorites', async (request, response) => {
  const name = String(request.body?.name ?? '').trim();
  const country = String(request.body?.country ?? '').trim();
  const temperature = Number(request.body?.temperature ?? 0);
  const condition = String(request.body?.condition ?? '').trim();
  const note = String(request.body?.note ?? '').trim() || 'Saved from the SkyCast dashboard.';

  if (!name || !country) {
    response.status(400).json({ error: 'Name and country are required.' });
    return;
  }

  const existing = favorites.find((city) => city.name.toLowerCase() === name.toLowerCase());
  if (existing) {
    existing.country = country;
    existing.temperature = temperature;
    existing.condition = condition;
    existing.note = note;
    existing.updatedAt = new Date().toISOString();
    response.status(200).json(existing);
    return;
  }

  const favorite: FavoriteCity = {
    id: Date.now(),
    name,
    country,
    temperature,
    condition,
    note,
    starred: favorites.length === 0,
    updatedAt: new Date().toISOString(),
  };

  favorites = [favorite, ...favorites];
  response.status(201).json(favorite);
});

app.delete('/api/favorites/:id', (request, response) => {
  const id = Number(request.params.id);
  favorites = favorites.filter((city) => city.id !== id);
  response.status(204).send();
});

app.get('/api/weather', async (request, response) => {
  const city = String(request.query.city ?? 'Austin').trim() || 'Austin';

  try {
    const forecast = await loadForecast(city);
    response.json(forecast);
  } catch (error) {
    response.status(404).json({
      error: error instanceof Error ? error.message : 'Unable to load weather data.',
    });
  }
});

app.listen(port, () => {
  console.log(`SkyCast backend running at http://localhost:${port}`);
});
