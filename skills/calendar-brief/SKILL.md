---
name: calendar-brief
description: An OpenClaw skill that reads your calendar, researches meeting attendees, and delivers a pre-meeting intelligence brief. Acts as your AI Chief of Staff by surfacing context you need before every call.
author: cortex
tags: [calendar, productivity, research, meetings, automation]
---

# Calendar Brief Skill

Your personal AI Chief of Staff. This skill reads your calendar for the day, identifies important meetings, researches attendees and their companies, and delivers a concise pre-meeting brief with everything you need to know.

## What It Does

1. **Calendar Scan** — Pulls today's events from your calendar (Google Calendar, Outlook, or any ICS feed)
2. **Attendee Intelligence** — Identifies external attendees and researches their background
3. **Company Context** — Gathers recent news, funding status, and key facts about attendee companies
4. **Brief Generation** — Creates a scannable brief with meeting purpose, attendee backgrounds, and suggested talking points
5. **Multi-Channel Delivery** — Sends via Slack, Discord, email, or stores in your notes system

## Use Cases

- **Founders preparing for investor calls** — Know the fund's recent investments and the partner's background
- **Sales teams** — Research prospects before demos to personalize your pitch
- **Consultants** — Brief yourself on client stakeholders and their business context
- **Executives** — Never walk into a meeting blind again

## Prerequisites

- OpenClaw with calendar access (Google Calendar API or Outlook)
- Web search tool enabled (for attendee research)
- One output channel configured (Slack, Discord, email, or file output)

## Installation

### 1. Clone this skill into your OpenClaw skills directory

```bash
cd ~/.openclaw/skills
git clone https://github.com/thenatechambers/openclaw-skills-repo.git cortex-skills
cp -r cortex-skills/skills/calendar-brief ./calendar-brief
```

### 2. Configure your calendar source

Copy the example config and fill in your details:

```bash
cp calendar-brief/config.example.json calendar-brief/config.json
```

**Google Calendar setup:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Google Calendar API
3. Create OAuth2 credentials
4. Download credentials.json to the skill directory

**ICS feed setup (any calendar):**
Simply paste your secret ICS URL in config.json:
```json
{
  "calendar_type": "ics",
  "ics_url": "https://calendar.google.com/calendar/ical/.../basic.ics"
}
```

### 3. Configure output channels

Edit `config.json` to set where briefs are delivered:

```json
{
  "output": {
    "slack": {
      "enabled": true,
      "channel": "#meeting-prep"
    },
    "discord": {
      "enabled": false,
      "channel": "DM"
    },
    "email": {
      "enabled": true,
      "to": "you@example.com"
    },
    "file": {
      "enabled": true,
      "path": "~/meeting-briefs/"
    }
  }
}
```

### 4. Set up the cron job

Add to your OpenClaw crontab to run at 8 AM daily:

```bash
# Run calendar brief every weekday at 8:00 AM
0 8 * * 1-5 cortex skill calendar-brief --today

# Or run 15 minutes before each meeting (requires agent with persistent state)
*/15 8-18 * * 1-5 cortex skill calendar-brief --next-meeting
```

## Usage

### Manual run for today's brief

```bash
cortex skill calendar-brief --today
```

### Brief for specific meeting

```bash
cortex skill calendar-brief --meeting "Q1 Review with Acme Corp"
```

### Brief for next meeting only

```bash
cortex skill calendar-brief --next
```

### Research depth control

```bash
# Quick brief (basic attendee list + company names only)
cortex skill calendar-brief --today --depth=minimal

# Standard brief (attendee backgrounds + recent company news)
cortex skill calendar-brief --today --depth=standard

# Deep brief (full research + talking points + competitor context)
cortex skill calendar-brief --today --depth=deep
```

## Output Format

Your brief will look like this:

```
📅 MEETING BRIEF: Q1 Review with Acme Corp
⏰ Today, 2:00 PM - 3:00 PM (Zoom)

🎯 PURPOSE
Quarterly business review — expect questions about usage metrics and renewal timeline.

👥 ATTENDEES
• Sarah Chen (CEO, Acme Corp)
  - Previously VP Product at TechCorp (2018-2022)
  - Harvard MBA, Stanford CS
  - Recent: Acme raised $12M Series B in Jan 2026 (TechCrunch)
  - Speaking at SaaStr next month

• Mike Rodriguez (CTO)
  - Joined Acme 2024 from Google Cloud
  - Focus areas: AI integration, platform scalability
  - GitHub: active contributor to kubernetes ecosystem

🏢 ACME CORP CONTEXT
- Founded: 2021
- Funding: $28M total ($12M Series B, Jan 2026)
- Employees: ~45 (hiring for 12 roles)
- Recent news: Launched AI feature suite last week
- Competitors: CompetitorX, CompetitorY

💡 TALKING POINTS
• Congratulate on recent funding
• Reference their new AI features — tie to our roadmap
• Ask about their scaling challenges (Mike's background suggests this matters)
• Renewal discussion likely — have ROI numbers ready

📎 RELEVANT LINKS
• Acme's AI launch announcement: [url]
• Sarah's SaaStr talk: [url]
• Previous meeting notes: [internal link]
```

## Research Sources

The skill automatically queries:
- LinkedIn profiles (public data)
- Company websites
- Recent news via web search
- Crunchbase funding data
- Twitter/X recent posts
- Previous meeting notes (if you store them)

## Customization

### Add your own research sources

Edit `research_modules.py` to add custom data sources:

```python
# Example: Add your CRM data
from my_crm import get_customer_history

def research_attendee(email, name):
    # ... default research ...
    
    # Add custom CRM context
    crm_data = get_customer_history(email)
    if crm_data:
        context['last_purchase'] = crm_data.last_order
        context['support_tickets'] = crm_data.open_tickets
    
    return context
```

### Customize the brief template

Edit `templates/brief.md` to change output format:

```markdown
# {{ meeting_title }}

**When:** {{ start_time }} - {{ end_time }}
**Where:** {{ location }}

## Attendees
{% for attendee in attendees %}
### {{ attendee.name }} ({{ attendee.title }})
{{ attendee.background }}
{% endfor %}

## My Prep
{{ custom_notes }}
```

### Filter out internal meetings

Add patterns to `config.json`:

```json
{
  "filters": {
    "skip_patterns": ["1:1 with", "Standup", "Lunch", "Personal"],
    "min_duration_minutes": 15,
    "only_with_external_domains": ["@customer.com", "@vcfirm.com"]
  }
}
```

## Advanced: Multi-Calendar Support

For executives with multiple calendars:

```json
{
  "calendars": [
    {
      "name": "work",
      "type": "google",
      "credentials": "work-credentials.json"
    },
    {
      "name": "personal",
      "type": "ics",
      "url": "https://..."
    },
    {
      "name": "team",
      "type": "outlook",
      "credentials": "outlook-credentials.json"
    }
  ]
}
```

## Privacy & Security Notes

- Attendee research uses only publicly available data
- No credentials are logged or stored in plain text
- Research results are cached for 24 hours to reduce API calls
- You control which calendars are scanned and which meetings trigger research

## Troubleshooting

**"No calendar events found"**
- Check your calendar API credentials
- Verify calendar sharing permissions
- Try running with `--debug` to see raw API response

**"Research timeout"**
- Some attendees may have limited public presence (this is normal)
- Use `--depth=minimal` for faster briefs
- Add specific research sources in config to speed up queries

**"Duplicate attendees"**
- The skill deduplicates by email, but variations (sarah@ vs sarah.chen@) may slip through
- Add email aliases to your contact database

## Roadmap

- [ ] Notion/Confluence integration for automatic meeting note creation
- [ ] Slack bot mode (respond to "brief me on my 2pm")
- [ ] Calendar conflict detection with pre-meeting prep time blocking
- [ ] CRM integration (Salesforce, HubSpot, Pipedrive)
- [ ] AI-generated agenda suggestions based on attendee research

## Credits

Built by the [Cortex](https://cortex-pearl.vercel.app) team for the OpenClaw community. Inspired by executive assistant workflows at high-growth startups.

---

**License:** MIT  
**Contributions:** PRs welcome at https://github.com/thenatechambers/openclaw-skills-repo
