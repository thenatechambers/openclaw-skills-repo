---
name: morning-briefing-agent
description: A scheduled OpenClaw skill that delivers a personalized morning briefing to your preferred channel. Fetches calendar events, weather, and daily priorities automatically using cron scheduling. Perfect for starting your day informed without manual effort.
---

# Morning Briefing Agent

Start every day with exactly what you need to know—delivered automatically to your Discord, Slack, WhatsApp, or Telegram.

## What It Does

This skill runs on a schedule (typically weekday mornings) and compiles:
- 📅 **Today's calendar events** — meetings, calls, deadlines
- 🌤️ **Local weather** — current conditions + today's forecast
- 🎯 **Daily priorities** — pulled from your task manager or notes
- 📰 **Key news** (optional) — industry-specific or general headlines

All formatted into a clean, scannable brief and delivered to your configured channel.

## Why This Matters

Most AI agents are reactive—they wait for you to ask. This agent is **proactive**. It runs without prompting, respects your time, and surfaces what matters before you even think to ask.

This demonstrates the OpenClaw cron system: agents that work on *your* schedule, not just when you're online.

## Prerequisites

- OpenClaw with cron support enabled
- One messaging channel configured (Discord/Slack/WhatsApp/Telegram)
- Google Calendar access (for calendar features)
- OpenWeatherMap API key (free tier works)

## Installation

1. **Copy this skill** to your OpenClaw workspace:
   ```bash
   cp -r skills/morning-briefing-agent ~/openclaw-workspace/skills/
   ```

2. **Install dependencies**:
   ```bash
   cd ~/openclaw-workspace/skills/morning-briefing-agent
   npm install  # if using the helper scripts
   ```

3. **Configure environment variables**:
   ```bash
   # Required
   export OPENWEATHER_API_KEY="your_openweather_key"
   export BRIEFING_CHANNEL="discord"  # or slack, whatsapp, telegram
   export BRIEFING_CHANNEL_ID="your-channel-id"
   
   # Optional - for calendar
   export GOOGLE_CALENDAR_ID="primary"
   
   # Optional - location for weather
   export BRIEFING_CITY="San Francisco"
   export BRIEFING_UNITS="imperial"  # or metric
   ```

4. **Set up the cron schedule**:
   ```bash
   # Run at 7:00 AM on weekdays
   openclaw cron add "morning-brief" "0 7 * * 1-5" --skill morning-briefing-agent
   ```

## How to Use

### Manual Run (Testing)
```bash
openclaw skill run morning-briefing-agent --now
```

### The Briefing Output

Your morning brief looks like:

```
🌅 Good morning! Here's your briefing for Thursday, April 30:

📅 TODAY'S SCHEDULE
   9:00 AM — Team standup (Zoom)
   11:30 AM — Product review with Sarah
   2:00 PM — 1:1 with Alex
   4:30 PM — Deadline: Q2 planning doc

🌤️ SAN FRANCISCO WEATHER
   Currently: 58°F, partly cloudy
   High: 67°F | Low: 54°F
   Rain: 10% chance

🎯 TODAY'S PRIORITIES
   1. Finalize API documentation
   2. Review open PRs
   3. Send invoice to client

💡 TIP: You have 3 hours of focused time before your first meeting.
```

## Customization

### Adding News Headlines

Edit the skill to include industry news:

```javascript
// In briefing.js
const news = await fetchTechNews();  // or your preferred source
briefingSections.push(formatNews(news));
```

### Personalizing the Format

Modify `formatBriefing()` to match your style:
- Add emojis or remove them
- Change section order
- Include different data sources (GitHub notifications, Linear tickets, etc.)

### Multiple Briefings

Create variations for different schedules:
- `morning-briefing-agent` — weekdays, work focus
- `sunday-briefing-agent` — weekly planning, broader scope
- `evening-briefing-agent` — tomorrow preview + daily wrap-up

## The Pattern: Proactive Agents

This skill demonstrates a key OpenClaw pattern:

> **Agents should work on human schedules, not require humans to work on agent schedules.**

Instead of:
- "Hey Claude, what's on my calendar?"
- "Hey Claude, what's the weather?"
- "Hey Claude, what should I work on today?"

You get one message with everything. The agent respects your time by being proactive.

## Extending This Skill

Ideas for customization:

1. **Add traffic/commute time** — check Google Maps for your route
2. **Include stock portfolio** — brief market update for tracked symbols
3. **GitHub summary** — PRs awaiting review, assigned issues
4. **Health reminders** — "You've been sitting for 4 hours" or step count
5. **Team activity** — Slack summaries from overnight

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Briefing not sending | Check channel ID and permissions |
| Weather missing | Verify OpenWeather API key |
| Calendar empty | Check Google Calendar sharing settings |
| Wrong timezone | Set `TZ` environment variable |

## Credits

Built for the Cortex content engine by Keiko Atlas. Free for the OpenClaw community.

Want a fully-managed version with more integrations? [Check out Cortex →](https://cortex-pearl.vercel.app)
