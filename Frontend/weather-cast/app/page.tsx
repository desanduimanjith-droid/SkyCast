"use client";

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BookmarkPlus,
  CloudSun,
  Compass,
  Droplets,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  Star,
  SunMedium,
  Trash2,
  Wind,
} from 'lucide-react';

type LocationInfo = {
  name: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  localTime: string;
};

type CurrentWeather = {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  pressure: number;
  precipitation: number;
  condition: string;
  icon: string;
  summary: string;
  sunrise: string;
  sunset: string;
  updatedAt: string;
};

type HourlyWeather = {
  time: string;
  label: string;
  temperature: number;
  chanceOfRain: number;
  condition: string;
  icon: string;
};

type DailyWeather = {
  day: string;
  label: string;
  high: number;
  low: number;
  chanceOfRain: number;
  condition: string;
  icon: string;
};

type FavoriteCity = {
  id: number;
  name: string;
  country: string;
  condition: string;
  temperature: number;
  note: string;
  starred: boolean;
  updatedAt: string;
};

type WeatherResponse = {
  location: LocationInfo;
  current: CurrentWeather;
  hourly: HourlyWeather[];
  daily: DailyWeather[];
  insights: string[];
  alerts: string[];
  tips: string[];
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4001';
const CITY_SUGGESTIONS = ['Seattle', 'Tokyo', 'Reykjavik', 'Cape Town'];
const DEFAULT_CITY = 'Austin';

function formatTime(value: string) {
  return new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatDay(value: string) {
  return new Intl.DateTimeFormat('en', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}

function formatHour(value: string) {
  return new Intl.DateTimeFormat('en', {
    hour: 'numeric',
  }).format(new Date(value));
}

function safeNumber(value: number | undefined, fallback = 0) {
  return Number.isFinite(value ?? Number.NaN) ? Math.round(value as number) : fallback;
}

function LoadingBanner() {
  return <p className="loading-banner">Fetching the latest sky conditions and city forecast...</p>;
}

export default function Page() {
  const [cityInput, setCityInput] = useState(DEFAULT_CITY);
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [favorites, setFavorites] = useState<FavoriteCity[]>([]);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [savingFavorite, setSavingFavorite] = useState(false);
  const [error, setError] = useState('');

  const fetchFavorites = async () => {
    try {
      setLoadingFavorites(true);
      const response = await fetch(`${API_BASE}/api/favorites`);
      if (!response.ok) {
        throw new Error('Unable to load saved cities.');
      }
      const data = (await response.json()) as FavoriteCity[];
      setFavorites(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to load saved cities.');
    } finally {
      setLoadingFavorites(false);
    }
  };

  const fetchWeather = async (city: string) => {
    try {
      setError('');
      setLoadingWeather(true);
      const response = await fetch(`${API_BASE}/api/weather?city=${encodeURIComponent(city)}`);
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? 'Unable to load forecast.');
      }
      const data = (await response.json()) as WeatherResponse;
      setWeather(data);
      setCityInput(data.location.name);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to load forecast.');
    } finally {
      setLoadingWeather(false);
    }
  };

  useEffect(() => {
    void fetchFavorites();
    void fetchWeather(DEFAULT_CITY);
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextCity = cityInput.trim();
    if (nextCity.length === 0) {
      return;
    }
    await fetchWeather(nextCity);
  };

  const handleSaveFavorite = async () => {
    if (!weather) {
      return;
    }

    try {
      setSavingFavorite(true);
      const response = await fetch(`${API_BASE}/api/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: weather.location.name,
          country: weather.location.country,
          temperature: weather.current.temperature,
          condition: weather.current.condition,
          note: weather.current.summary,
        }),
      });

      if (!response.ok) {
        throw new Error('Could not save this city.');
      }

      await fetchFavorites();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not save this city.');
    } finally {
      setSavingFavorite(false);
    }
  };

  const handleRemoveFavorite = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE}/api/favorites/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Could not remove this city.');
      }
      await fetchFavorites();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not remove this city.');
    }
  };

  const currentStats = useMemo(() => {
    if (!weather) {
      return [];
    }

    return [
      {
        label: 'Humidity',
        value: `${safeNumber(weather.current.humidity)}%`,
        note: 'Comfort levels for your day outside.',
      },
      {
        label: 'Wind',
        value: `${safeNumber(weather.current.windSpeed)} km/h`,
        note: 'Breezes, gusts, and movement through the afternoon.',
      },
      {
        label: 'UV Index',
        value: `${safeNumber(weather.current.uvIndex)}`,
        note: weather.current.uvIndex >= 7 ? 'Use sunscreen and shade.' : 'Moderate exposure levels right now.',
      },
      {
        label: 'Pressure',
        value: `${safeNumber(weather.current.pressure)} hPa`,
        note: 'A stable pressure reading suggests steady weather.',
      },
    ];
  }, [weather]);

  const topInsights = weather?.insights ?? [];
  const topAlerts = weather?.alerts ?? [];
  const topTips = weather?.tips ?? [];

  return (
    <main className="site-shell">
      <header className="site-header">
        <a className="brand" href="#top">
          <div className="brand-mark" />
          <div>
            <h1 className="brand-title">SkyCast</h1>
            <p className="brand-subtitle">weather command center</p>
          </div>
        </a>

        <nav className="header-links" aria-label="Primary">
          <a href="#forecast">Forecast</a>
          <a href="#cities">Cities</a>
          <a href="#insights">Insights</a>
        </nav>

        <div className="header-actions">
          <a className="button-secondary" href="#forecast">
            <Compass size={16} />
            Explore
          </a>
          <button className="button-primary" type="button" onClick={handleSaveFavorite} disabled={!weather || savingFavorite}>
            <BookmarkPlus size={16} />
            {savingFavorite ? 'Saving...' : 'Save city'}
          </button>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <div className="eyebrow">
            <Sparkles size={15} />
            Live conditions, daily forecast, and saved places
          </div>

          <h1>
            Know the <span>sky</span> before you step outside.
          </h1>

          <p>
            SkyCast is a responsive weather dashboard with live city search, hourly and daily forecasts,
            weather insights, and a separate backend that powers the data and saved locations.
          </p>

          <form className="search-panel" onSubmit={handleSubmit}>
            <div className="search-row">
              <input
                className="search-input"
                value={cityInput}
                onChange={(event) => setCityInput(event.target.value)}
                placeholder="Search a city, e.g. Lisbon, Seoul, Chicago"
                aria-label="Search a city"
              />
              <button className="button-primary" type="submit">
                <Search size={16} />
                Search weather
              </button>
            </div>

            <div className="search-hints">
              {CITY_SUGGESTIONS.map((city) => (
                <button key={city} className="search-hint" type="button" onClick={() => setCityInput(city)}>
                  {city}
                </button>
              ))}
            </div>
          </form>

          {loadingWeather ? <LoadingBanner /> : null}
          {error ? <div className="error-banner">{error}</div> : null}

          <div className="stat-row">
            <article className="stat-card">
              <p className="stat-label">Location</p>
              <p className="stat-value">{weather?.location.name ?? 'Loading'}</p>
              <p className="stat-note">
                {weather ? `${weather.location.region ? `${weather.location.region}, ` : ''}${weather.location.country}` : 'Finding the closest match.'}
              </p>
            </article>
            <article className="stat-card">
              <p className="stat-label">Local time</p>
              <p className="stat-value">{weather ? formatTime(weather.location.localTime) : '--:--'}</p>
              <p className="stat-note">Synced to the selected location.</p>
            </article>
            <article className="stat-card">
              <p className="stat-label">Forecast depth</p>
              <p className="stat-value">7 days</p>
              <p className="stat-note">Hour-by-hour and daily views built into the UI.</p>
            </article>
            <article className="stat-card">
              <p className="stat-label">Saved cities</p>
              <p className="stat-value">{loadingFavorites ? '...' : favorites.length}</p>
              <p className="stat-note">Keep the places you check most often.</p>
            </article>
          </div>
        </div>

        <aside className="panel">
          <div className="panel-head">
            <div>
              <p className="section-label">Now</p>
              <h2 className="panel-title">Current conditions</h2>
              <p className="panel-subtitle">
                A clear snapshot of today with a summary, sunrise and sunset, and weather pressure points.
              </p>
            </div>
            <button className="button-ghost" type="button" onClick={() => fetchWeather(cityInput)}>
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          <div className="weather-summary">
            <div className="temperature-block">
              <div>
                <p className="temperature">
                  {weather ? (
                    <>
                      {safeNumber(weather.current.temperature)}<span>deg</span>
                    </>
                  ) : (
                    '...'
                  )}
                </p>
                <p className="forecast-note">Feels like {weather ? `${safeNumber(weather.current.feelsLike)} deg` : '-- deg'}</p>
              </div>

              <div className="condition-stack">
                <strong>{weather?.current.condition ?? 'Loading forecast'}</strong>
                <span>{weather?.current.summary ?? 'Pulling the latest data from the backend.'}</span>
              </div>
            </div>

            <div className="metrics-grid">
              {currentStats.map((stat) => (
                <article key={stat.label} className="metric-card">
                  <h3>{stat.label}</h3>
                  <strong>{stat.value}</strong>
                  <p>{stat.note}</p>
                </article>
              ))}
            </div>

            <div className="inline-actions">
              <button className="button-soft" type="button" onClick={handleSaveFavorite} disabled={!weather || savingFavorite}>
                <Star size={16} />
                {savingFavorite ? 'Saving city...' : 'Save current city'}
              </button>
              <a className="button-secondary" href="#cities">
                <CloudSun size={16} />
                View saved cities
              </a>
            </div>
          </div>
        </aside>
      </section>

      <section className="section" id="forecast">
        <div className="section-head">
          <div>
            <p className="section-label">Today</p>
            <h2>Hourly forecast</h2>
            <p>Track the next few hours to know when the temperature climbs, when rain moves in, and when to head out.</p>
          </div>
        </div>

        <div className="hourly-strip">
          {weather?.hourly.map((hour) => (
            <article key={hour.time} className="forecast-card">
              <div className="forecast-time">{formatHour(hour.time)}</div>
              <p className="forecast-temp">{safeNumber(hour.temperature)} deg</p>
              <div className="forecast-badge">
                <SunMedium size={14} />
                {hour.condition}
              </div>
              <p className="forecast-note">Rain chance {safeNumber(hour.chanceOfRain)}%</p>
            </article>
          )) ?? null}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <p className="section-label">Week</p>
            <h2>Daily forecast</h2>
            <p>Seven days of highs, lows, and conditions, designed for fast scanning on desktop and mobile.</p>
          </div>
        </div>

        <div className="daily-grid">
          {weather?.daily.map((day) => (
            <article key={day.day} className="daily-card">
              <div>
                <div className="daily-day">{formatDay(day.day)}</div>
                <strong>{day.label}</strong>
                <p className="daily-note">{day.condition}</p>
              </div>
              <div>
                <p className="forecast-note">High</p>
                <p className="daily-temp">{safeNumber(day.high)} deg</p>
              </div>
              <div>
                <p className="forecast-note">Low / Rain</p>
                <p className="daily-temp">{safeNumber(day.low)} deg</p>
                <div className="daily-badge">
                  <Droplets size={14} />
                  {safeNumber(day.chanceOfRain)}%
                </div>
              </div>
            </article>
          )) ?? null}
        </div>
      </section>

      <section className="section" id="insights">
        <div className="section-head">
          <div>
            <p className="section-label">Read the sky</p>
            <h2>Insights and weather notes</h2>
            <p>Practical guidance for the day, generated from the forecast values returned by the backend.</p>
          </div>
        </div>

        <div className="insight-grid">
          <article className="insight-card">
            <h3>
              <ShieldAlert size={16} />
              Alerts
            </h3>
            {topAlerts.length > 0 ? topAlerts.map((alert) => <p key={alert}>{alert}</p>) : <p>No alerts right now. Conditions look manageable.</p>}
          </article>
          <article className="insight-card">
            <h3>
              <ArrowRight size={16} />
              Tips
            </h3>
            {topTips.length > 0 ? topTips.map((tip) => <p key={tip}>{tip}</p>) : <p>Open the search bar and compare a second city to see how quickly the forecast changes.</p>}
          </article>
        </div>

        <div className="section" style={{ marginTop: '14px' }}>
          <p className="section-label">Why this works</p>
          <div className="daily-grid" style={{ marginTop: '10px' }}>
            {topInsights.length > 0 ? (
              topInsights.map((insight) => (
                <article key={insight} className="forecast-card">
                  <div className="forecast-badge">
                    <Sparkles size={14} />
                    Smart note
                  </div>
                  <p className="forecast-note">{insight}</p>
                </article>
              ))
            ) : (
              <article className="forecast-card">
                <p className="forecast-note">Weather insights will appear here after the first forecast loads.</p>
              </article>
            )}
          </div>
        </div>
      </section>

      <section className="section" id="cities">
        <div className="section-head">
          <div>
            <p className="section-label">Saved places</p>
            <h2>Favorite cities</h2>
            <p>These cities are stored by the backend in a separate folder so the frontend stays focused on the interface.</p>
          </div>
        </div>

        {loadingFavorites ? <LoadingBanner /> : null}

        <div className="favorite-grid">
          {favorites.map((city) => (
            <article key={city.id} className="favorite-card">
              <div className="favorite-card-top">
                <div>
                  <p className="favorite-name">{city.name}</p>
                  <p className="favorite-note">{city.country}</p>
                </div>
                <div className="favorite-actions">
                  {city.starred ? <span className="forecast-badge">Top pick</span> : null}
                  <button className="button-ghost" type="button" onClick={() => handleRemoveFavorite(city.id)}>
                    <Trash2 size={16} />
                    Remove
                  </button>
                </div>
              </div>

              <div className="forecast-badge">
                <CloudSun size={14} />
                {city.temperature} deg - {city.condition}
              </div>
              <p className="favorite-note">{city.note}</p>
              <p className="forecast-note">Updated {formatTime(city.updatedAt)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="cta-card">
        <div>
          <h3>Built for a cleaner handoff</h3>
          <p>
            Frontend and backend are split into separate folders so the UI can scale independently from the data layer.
          </p>
        </div>
        <a className="button-primary" href="#top">
          Back to top
        </a>
      </section>

      <footer className="footer">
        <strong>SkyCast</strong> makes the weather feel immediate, readable, and easy to act on.
      </footer>
    </main>
  );
}
