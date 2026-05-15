export type WeatherDetails = {
  label: string;
  summary: string;
  icon: string;
};

const WEATHER_LOOKUP: Record<number, WeatherDetails> = {
  0: { label: 'Clear sky', summary: 'Bright and calm conditions.', icon: 'sun' },
  1: { label: 'Mostly clear', summary: 'A few clouds drifting through.', icon: 'cloud-sun' },
  2: { label: 'Partly cloudy', summary: 'Balanced sky cover and sunshine.', icon: 'cloud-sun' },
  3: { label: 'Overcast', summary: 'Cloud cover is locked in for now.', icon: 'cloud' },
  45: { label: 'Fog', summary: 'Visibility is reduced by fog or mist.', icon: 'cloud-fog' },
  48: { label: 'Rime fog', summary: 'A dense fog layer is sitting close to the ground.', icon: 'cloud-fog' },
  51: { label: 'Light drizzle', summary: 'Light rain is possible through the hour.', icon: 'cloud-rain' },
  53: { label: 'Drizzle', summary: 'Steady drizzle and wet surfaces.', icon: 'cloud-rain' },
  55: { label: 'Dense drizzle', summary: 'Persistent drizzle may last through the afternoon.', icon: 'cloud-rain' },
  61: { label: 'Light rain', summary: 'Intermittent rain showers are moving through.', icon: 'cloud-rain' },
  63: { label: 'Rain', summary: 'Rain is likely for part of the day.', icon: 'cloud-rain' },
  65: { label: 'Heavy rain', summary: 'Heavy rainfall could slow travel and plans.', icon: 'cloud-rain' },
  66: { label: 'Freezing rain', summary: 'Cold rain may create icy surfaces.', icon: 'cloud-rain' },
  67: { label: 'Heavy freezing rain', summary: 'Icy rain needs extra caution outdoors.', icon: 'cloud-rain' },
  71: { label: 'Light snow', summary: 'A light snow event is possible.', icon: 'snowflake' },
  73: { label: 'Snow', summary: 'Snow may build up through the day.', icon: 'snowflake' },
  75: { label: 'Heavy snow', summary: 'Heavy snow can reduce visibility.', icon: 'snowflake' },
  77: { label: 'Snow grains', summary: 'Small flakes and granular snow are possible.', icon: 'snowflake' },
  80: { label: 'Rain showers', summary: 'Brief showers move in and out quickly.', icon: 'cloud-rain' },
  81: { label: 'Moderate showers', summary: 'Showers will be noticeable this hour.', icon: 'cloud-rain' },
  82: { label: 'Violent showers', summary: 'Strong showers may hit in bursts.', icon: 'cloud-rain' },
  85: { label: 'Snow showers', summary: 'Light snow bursts may come and go.', icon: 'snowflake' },
  86: { label: 'Heavy snow showers', summary: 'Snow bursts may be intense and short-lived.', icon: 'snowflake' },
  95: { label: 'Thunderstorm', summary: 'Storm cells may bring lightning and rain.', icon: 'cloud-lightning' },
  96: { label: 'Thunderstorm with hail', summary: 'Severe storm conditions with hail are possible.', icon: 'cloud-lightning' },
  99: { label: 'Thunderstorm with hail', summary: 'Severe storm conditions with hail are possible.', icon: 'cloud-lightning' },
};

export function describeWeatherCode(code: number) {
  return WEATHER_LOOKUP[code] ?? {
    label: 'Unknown conditions',
    summary: 'The weather service returned an unclassified forecast.',
    icon: 'cloud',
  };
}

export function createInsights(params: {
  temperature: number;
  rainChance: number;
  windSpeed: number;
  humidity: number;
  condition: string;
}) {
  const { temperature, rainChance, windSpeed, humidity, condition } = params;
  const insights: string[] = [];

  if (temperature >= 30) {
    insights.push('Heat is high enough to keep hydration and shade in the plan.');
  } else if (temperature <= 5) {
    insights.push('Cold weather is in play, so layers will matter today.');
  } else {
    insights.push('Temperatures are comfortable enough for most outdoor plans.');
  }

  if (rainChance >= 60) {
    insights.push('Rain is likely, so a backup indoor option is smart.');
  } else if (rainChance >= 30) {
    insights.push('There is a meaningful shower risk, especially later in the day.');
  } else {
    insights.push('Rain risk is low, which makes the day easier to plan around.');
  }

  if (windSpeed >= 30) {
    insights.push('Wind is strong enough to make open areas feel less comfortable.');
  }

  if (humidity >= 75) {
    insights.push('High humidity will make the air feel heavier than the thermometer suggests.');
  }

  insights.push(`Current conditions are trending toward ${condition.toLowerCase()}.`);
  return insights.slice(0, 4);
}

export function createAlerts(params: {
  temperature: number;
  rainChance: number;
  windSpeed: number;
  uvIndex: number;
}) {
  const { temperature, rainChance, windSpeed, uvIndex } = params;
  const alerts: string[] = [];

  if (rainChance >= 70) {
    alerts.push('High rain chance: carry an umbrella or waterproof layer.');
  }

  if (windSpeed >= 35) {
    alerts.push('Strong wind: secure loose items before heading out.');
  }

  if (uvIndex >= 7) {
    alerts.push('UV is elevated: sunscreen and shade are recommended.');
  }

  if (temperature >= 32) {
    alerts.push('Very warm conditions: schedule breaks and hydrate often.');
  }

  return alerts;
}

export function createTips(params: {
  rainChance: number;
  windSpeed: number;
  temperature: number;
}) {
  const { rainChance, windSpeed, temperature } = params;
  const tips: string[] = [];

  if (rainChance < 25) {
    tips.push('This looks like a good window for a walk, commute, or outdoor workout.');
  }

  if (windSpeed < 20) {
    tips.push('Wind is light, so it should feel calmer than the raw forecast suggests.');
  }

  if (temperature >= 24) {
    tips.push('It is warm enough that you may want to plan a shaded break.');
  }

  if (tips.length === 0) {
    tips.push('Use the hourly forecast to time your next move before the weather shifts.');
  }

  return tips.slice(0, 3);
}
