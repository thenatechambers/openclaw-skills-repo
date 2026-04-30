#!/usr/bin/env node
/**
 * Morning Briefing Agent - Helper Script
 * Fetches and formats daily briefing data
 */

const https = require('https');

// Configuration
const CONFIG = {
  city: process.env.BRIEFING_CITY || 'San Francisco',
  units: process.env.BRIEFING_UNITS || 'imperial',
  openWeatherKey: process.env.OPENWEATHER_API_KEY,
  timezone: process.env.TZ || 'America/Los_Angeles'
};

/**
 * Fetch weather from OpenWeatherMap
 */
async function fetchWeather() {
  if (!CONFIG.openWeatherKey) {
    return { error: 'No OpenWeather API key configured' };
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(CONFIG.city)}&units=${CONFIG.units}&appid=${CONFIG.openWeatherKey}`;
  
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const weather = JSON.parse(data);
          if (weather.main) {
            resolve({
              city: weather.name,
              temp: Math.round(weather.main.temp),
              feels_like: Math.round(weather.main.feels_like),
              condition: weather.weather[0]?.description || 'unknown',
              humidity: weather.main.humidity,
              high: Math.round(weather.main.temp_max),
              low: Math.round(weather.main.temp_min)
            });
          } else {
            resolve({ error: weather.message || 'Weather fetch failed' });
          }
        } catch (e) {
          resolve({ error: 'Weather parse error' });
        }
      });
    }).on('error', () => resolve({ error: 'Weather request failed' }));
  });
}

/**
 * Format the complete briefing
 */
function formatBriefing(weather, calendar = [], priorities = []) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const unit = CONFIG.units === 'metric' ? '°C' : '°F';
  
  let briefing = `🌅 **Good morning!** Here's your briefing for ${dateStr}\n\n`;
  
  // Weather section
  if (weather && !weather.error) {
    briefing += `🌤️ **${weather.city.toUpperCase()} WEATHER**\n`;
    briefing += `   Currently: ${weather.temp}${unit}, ${weather.condition}\n`;
    briefing += `   High: ${weather.high}${unit} | Low: ${weather.low}${unit}\n`;
    briefing += `   Humidity: ${weather.humidity}%\n\n`;
  }
  
  // Calendar section (placeholder - implement with Google Calendar API)
  if (calendar.length > 0) {
    briefing += `📅 **TODAY'S SCHEDULE**\n`;
    calendar.forEach(event => {
      briefing += `   ${event.time} — ${event.title}\n`;
    });
    briefing += `\n`;
  } else {
    briefing += `📅 **TODAY'S SCHEDULE**\n   (Connect Google Calendar to see events)\n\n`;
  }
  
  // Priorities section
  if (priorities.length > 0) {
    briefing += `🎯 **TODAY'S PRIORITIES**\n`;
    priorities.forEach((p, i) => {
      briefing += `   ${i + 1}. ${p}\n`;
    });
    briefing += `\n`;
  }
  
  briefing += `💡 *Your Morning Briefing Agent — Running on OpenClaw*\n`;
  
  return briefing;
}

// Main execution
async function main() {
  console.log('🌅 Generating morning briefing...\n');
  
  const weather = await fetchWeather();
  
  // Example priorities - replace with your task source
  const priorities = [
    'Review overnight messages',
    'Check calendar for today',
    'Set 3 main priorities'
  ];
  
  const briefing = formatBriefing(weather, [], priorities);
  console.log(briefing);
  
  // Return for OpenClaw to use in message.send
  return briefing;
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { fetchWeather, formatBriefing, main };
