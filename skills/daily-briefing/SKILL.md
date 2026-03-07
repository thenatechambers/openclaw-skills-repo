---
name: daily-briefing
description: A complete day-start and day-close ritual for founders. Morning: scans calendar, surfaces top 3 priorities, and prompts daily intentions. Evening: captures wins, lessons, and preps tomorrow. Designed to reduce decision fatigue and end each day with clarity. Use when starting your work day, closing out, or scheduling daily planning rituals.
author: cortex
tags: [productivity, calendar, planning, founders, daily-ritual, intentions]
---

# Daily Briefing Skill

## Purpose

Replace chaotic mornings and blurry evenings with a structured ritual. This skill runs twice daily:

**☀️ Morning Brief (day-start):**
- Calendar scan with conflict detection
- Top 3 priority extraction
- Intention-setting prompts
- Focus time blocking suggestion

**🌙 Evening Brief (day-close):**
- Win capture (what got done)
- Lesson logging (what to remember)
- Tomorrow preview
- Clean shutdown ritual

Based on the pattern: *"Day start and day close commands that will plan my day using obsidian todoist and my google calendar than day close will help me do a review"* — r/ClaudeAI community

## Why This Works

Most productivity tools tell you what's on your calendar. This skill helps you decide what matters. The intention-setting prompts force a moment of clarity before the day's chaos begins.

## Prerequisites

- Google Calendar access (via `gog` skill or API)
- Optional: Todoist, Notion, or linear for task sources
- Output channel: Slack DM, Telegram, or file to Obsidian

## Configuration

Create `workspace/memory/daily-briefing-config.json`:

```json
{
  "morning": {
    "time": "07:30",
    "timezone": "America/Los_Angeles",
    "prompts": [
      "What's the one thing that would make today a success?",
      "What are you avoiding that you should face?",
      "How do you want to feel at 5pm?"
    ]
  },
  "evening": {
    "time": "17:30",
    "timezone": "America/Los_Angeles"
  },
  "inputs": {
    "calendar": "primary",
    "tasks": "todoist",
    "notes_output": "~/notes/daily/"
  }
}
```

## Usage

### Manual run

```bash
# Morning ritual
cortex skill daily-briefing --morning

# Evening ritual
cortex skill daily-briefing --evening

# Both (for testing)
cortex skill daily-briefing --full-day
```

### Cron setup (recommended)

```bash
# Morning brief at 7:30 AM weekdays
0 7 * * 1-5 cortex skill daily-briefing --morning --notify=slack

# Evening brief at 5:30 PM weekdays
30 17 * * 1-5 cortex skill daily-briefing --evening --notify=slack
```

## Morning Brief Output

```
☀️ DAILY BRIEF — Friday, March 7, 2026
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 CALENDAR TODAY
  9:00 AM  — Team standup (15 min)
  10:30 AM — Product review w/ Sarah ⚠️  [no prep buffer]
  2:00 PM  — Investor call — Series A discussion
  4:00 PM  — Deep work block (2 hrs)

⚠️  Heads up: 10:30 meeting has no buffer after standup

🎯 TOP 3 PRIORITIES  
  1. Finalize Q1 metrics for investor call
  2. Review and reply to Sarah's product proposal
  3. Block 2 hours for deep work on pricing model

💭 INTENTION PROMPT
  → What's the one thing that would make today a success?
    [Reply to log your intention]

📊 FOCUS TIME
  You have 2 contiguous hours (4-6 PM). 
  Suggested: Use this for the pricing model work.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Reply with your intention to save it to today's log.
```

## Evening Brief Output

```
🌙 DAY CLOSE — Friday, March 7, 2026
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ WINS TODAY
  • [ ] Investor call completed — next steps agreed
  • [ ] Product review with Sarah — approved v2 roadmap
  • [ ] Pricing model draft started (40% complete)

📚 LESSONS & NOTES
  • Investor asked about churn metrics — prepare for next time
  • Sarah's feedback: simplify onboarding flow

📅 TOMORROW PREVIEW
  9:00 AM  — All-hands
  11:00 AM — Customer call — Enterprise deal
  1:00 PM  — Lunch w/ advisor
  3:00 PM  — Deep work block

🎯 CARRY-FORWARD
  • Pricing model → needs 2 more hours to complete
  • Churn analysis → add to investor prep deck

💬 SHUTDOWN RITUAL
  Take 2 minutes: What's one thing you're grateful for today?
  
  [Your response gets logged with today's entry]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Good work today. See you tomorrow.
```

## Output to Obsidian

If configured, creates/updates:
- `~/notes/daily/2026-03-07.md` — full day entry
- `~/notes/weekly/2026-W10.md` — weekly summary (auto-updated)

Daily note format:
```markdown
# 2026-03-07 Friday

## Morning Intention
> "Ship the pricing page and get investor materials ready"

## Calendar
- [x] 9:00 AM — Team standup
- [x] 10:30 AM — Product review w/ Sarah
- [x] 2:00 PM — Investor call

## Wins
- Investor call completed — next steps agreed
- Product review approved v2 roadmap
- Pricing model draft started

## Lessons
- Investor asked about churn metrics
- Simplify onboarding per Sarah's feedback

## Evening Reflection
> "Grateful for the team pushing through Q1 crunch"
```

## Advanced: Multi-Source Priority Detection

The skill can aggregate tasks from multiple sources:

```json
{
  "task_sources": [
    {"type": "todoist", "filter": "today | overdue"},
    {"type": "linear", "team": "Engineering"},
    {"type": "github", "repos": ["myorg/main"], "label": "priority"}
  ]
}
```

Priorities are ranked by:
1. Calendar conflicts (meetings without prep time)
2. Overdue tasks
3. Flagged/starred items
4. Deadline proximity

## Advanced: Smart Conflict Detection

The skill detects and warns about:
- Back-to-back meetings without travel/buffer time
- Meetings during your configured "focus blocks"
- External calls without prep materials
- Days with >4 hours of meetings (burnout warning)

## Integration with Other Skills

**Combine with calendar-brief:**
```bash
# Morning: Brief + research for important meetings
cortex skill daily-briefing --morning
cortex skill calendar-brief --for-today --external-only
```

**Combine with persistent-memory:**
Your daily intentions and reflections are automatically stored as facts in Supabase, creating a searchable history of your focus and growth.

## Troubleshooting

**"No calendar events found"**
- Run `gog calendar list --today` to verify calendar access
- Check that your calendar ID is correct in config

**"Too many priorities"**
- The skill limits to top 3 by default
- Adjust in config: `"max_priorities": 5`

**"I want simpler output"**
- Use `--minimal` flag for condensed format
- Or set `"style": "minimal"` in config

## Credits

Built by [Cortex](https://cortex-pearl.vercel.app) based on founder productivity patterns from the OpenClaw community.

**License:** MIT  
**Repo:** https://github.com/thenatechambers/openclaw-skills-repo
