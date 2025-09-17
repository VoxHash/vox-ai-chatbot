// backend/src/lib/realtime.js

import fetch from 'node-fetch';

/**
 * Get current time for a specific location
 * @param {string} location - Location name (e.g., "Madrid, Spain", "Montreal, Canada")
 * @returns {Promise<Object>} Time information
 */
export async function getCurrentTime(location) {
  try {
    // Use a timezone API to get timezone information
    const timezoneResponse = await fetch(`https://api.timezonedb.com/v2.1/get-time-zone?key=${process.env.TIMEZONE_API_KEY}&format=json&by=zone&zone=${encodeURIComponent(location)}`);
    
    if (!timezoneResponse.ok) {
      // Fallback to a free timezone API
      const fallbackResponse = await fetch(`http://worldtimeapi.org/api/timezone/${encodeURIComponent(location)}`);
      if (fallbackResponse.ok) {
        const data = await fallbackResponse.json();
        return {
          location: location,
          time: new Date(data.datetime).toLocaleString('en-US', {
            timeZone: data.timezone,
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
          }),
          timezone: data.timezone,
          utc_offset: data.utc_offset
        };
      }
    } else {
      const data = await timezoneResponse.json();
      return {
        location: location,
        time: new Date(data.formatted).toLocaleString('en-US', {
          timeZone: data.zoneName,
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        }),
        timezone: data.zoneName,
        utc_offset: data.gmtOffset
      };
    }
    
    // If all APIs fail, return server time
    const serverTime = new Date();
    return {
      location: location,
      time: serverTime.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }),
      timezone: 'Server Time',
      utc_offset: serverTime.getTimezoneOffset() / -60
    };
  } catch (error) {
    console.error('Error getting current time:', error);
    // Return server time as fallback
    const serverTime = new Date();
    return {
      location: location,
      time: serverTime.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }),
      timezone: 'Server Time (Fallback)',
      utc_offset: serverTime.getTimezoneOffset() / -60
    };
  }
}

/**
 * Get current weather for a specific location using Open-Meteo API
 * @param {string} location - Location name (e.g., "Madrid, Spain", "Montreal, Canada")
 * @returns {Promise<Object>} Weather information
 */
export async function getCurrentWeather(location) {
  try {
    // First, get coordinates for the location using geocoding
    const geocodeResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`);
    
    if (!geocodeResponse.ok) {
      throw new Error('Geocoding API failed');
    }
    
    const geocodeData = await geocodeResponse.json();
    
    if (!geocodeData.results || geocodeData.results.length === 0) {
      throw new Error('Location not found');
    }
    
    const { latitude, longitude, name, country } = geocodeData.results[0];
    
    // Get weather data using Open-Meteo
    const weatherResponse = await fetch(`https://api.open-meteo.com/v1/current?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`);
    
    if (!weatherResponse.ok) {
      throw new Error('Weather API failed');
    }
    
    const weatherData = await weatherResponse.json();
    const current = weatherData.current_weather;
    
    return {
      location: `${name}, ${country}`,
      temperature: Math.round(current.temperature),
      temperature_unit: '°C',
      temperature_fahrenheit: Math.round(current.temperature * 9/5 + 32),
      weather_description: getWeatherDescription(current.weathercode),
      wind_speed: Math.round(current.windspeed),
      wind_direction: current.winddirection,
      time: new Date(current.time).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    };
  } catch (error) {
    console.error('Error getting current weather:', error);
    return {
      location: location,
      temperature: 'N/A',
      temperature_unit: '°C',
      temperature_fahrenheit: 'N/A',
      weather_description: 'Weather data unavailable',
      wind_speed: 'N/A',
      wind_direction: 'N/A',
      time: 'N/A',
      error: 'Unable to fetch weather data'
    };
  }
}

/**
 * Get weather description from weather code
 * @param {number} code - Weather code from Open-Meteo
 * @returns {string} Weather description
 */
function getWeatherDescription(code) {
  const weatherCodes = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail'
  };
  
  return weatherCodes[code] || 'Unknown weather condition';
}

/**
 * Get both time and weather for a location
 * @param {string} location - Location name
 * @returns {Promise<Object>} Combined time and weather information
 */
export async function getLocationInfo(location) {
  try {
    const [timeInfo, weatherInfo] = await Promise.all([
      getCurrentTime(location),
      getCurrentWeather(location)
    ]);
    
    return {
      location: location,
      time: timeInfo,
      weather: weatherInfo
    };
  } catch (error) {
    console.error('Error getting location info:', error);
    return {
      location: location,
      time: null,
      weather: null,
      error: 'Unable to fetch location information'
    };
  }
}

/**
 * Format time information for display
 * @param {Object} timeInfo - Time information object
 * @param {string} language - Language code
 * @returns {string} Formatted time string
 */
export function formatTimeInfo(timeInfo, language = 'en') {
  if (!timeInfo) return 'Time information unavailable';
  
  const timeFormats = {
    en: `🕐 Current time in ${timeInfo.location}: ${timeInfo.time} (${timeInfo.timezone})`,
    es: `🕐 Hora actual en ${timeInfo.location}: ${timeInfo.time} (${timeInfo.timezone})`,
    fr: `🕐 Heure actuelle à ${timeInfo.location}: ${timeInfo.time} (${timeInfo.timezone})`,
    de: `🕐 Aktuelle Zeit in ${timeInfo.location}: ${timeInfo.time} (${timeInfo.timezone})`,
    it: `🕐 Ora attuale a ${timeInfo.location}: ${timeInfo.time} (${timeInfo.timezone})`,
    pt: `🕐 Hora atual em ${timeInfo.location}: ${timeInfo.time} (${timeInfo.timezone})`
  };
  
  return timeFormats[language] || timeFormats.en;
}

/**
 * Format weather information for display
 * @param {Object} weatherInfo - Weather information object
 * @param {string} language - Language code
 * @returns {string} Formatted weather string
 */
export function formatWeatherInfo(weatherInfo, language = 'en') {
  if (!weatherInfo || weatherInfo.error) {
    return 'Weather information unavailable';
  }
  
  const weatherFormats = {
    en: `🌤️ Weather in ${weatherInfo.location}: ${weatherInfo.temperature}°C (${weatherInfo.temperature_fahrenheit}°F) - ${weatherInfo.weather_description} | Wind: ${weatherInfo.wind_speed} km/h`,
    es: `🌤️ Clima en ${weatherInfo.location}: ${weatherInfo.temperature}°C (${weatherInfo.temperature_fahrenheit}°F) - ${weatherInfo.weather_description} | Viento: ${weatherInfo.wind_speed} km/h`,
    fr: `🌤️ Météo à ${weatherInfo.location}: ${weatherInfo.temperature}°C (${weatherInfo.temperature_fahrenheit}°F) - ${weatherInfo.weather_description} | Vent: ${weatherInfo.wind_speed} km/h`,
    de: `🌤️ Wetter in ${weatherInfo.location}: ${weatherInfo.temperature}°C (${weatherInfo.temperature_fahrenheit}°F) - ${weatherInfo.weather_description} | Wind: ${weatherInfo.wind_speed} km/h`,
    it: `🌤️ Tempo a ${weatherInfo.location}: ${weatherInfo.temperature}°C (${weatherInfo.temperature_fahrenheit}°F) - ${weatherInfo.weather_description} | Vento: ${weatherInfo.wind_speed} km/h`,
    pt: `🌤️ Clima em ${weatherInfo.location}: ${weatherInfo.temperature}°C (${weatherInfo.temperature_fahrenheit}°F) - ${weatherInfo.weather_description} | Vento: ${weatherInfo.wind_speed} km/h`
  };
  
  return weatherFormats[language] || weatherFormats.en;
}

/**
 * Format combined location information for display
 * @param {Object} locationInfo - Combined location information
 * @param {string} language - Language code
 * @returns {string} Formatted location string
 */
export function formatLocationInfo(locationInfo, language = 'en') {
  if (!locationInfo) return 'Location information unavailable';
  
  let result = `📍 **${locationInfo.location}**\n\n`;
  
  if (locationInfo.time) {
    result += formatTimeInfo(locationInfo.time, language) + '\n\n';
  }
  
  if (locationInfo.weather) {
    result += formatWeatherInfo(locationInfo.weather, language);
  }
  
  return result;
}
