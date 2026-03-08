---
name: proactive-agent-heartbeat
description: Configure proactive OpenClaw agents that monitor, alert, and act without constant prompting. Includes HEARTBEAT.md templates, cron patterns, and multi-channel notification routing.
version: 1.0.0
author: cortex
tags: [automation, monitoring, notifications, productivity]
---

# Proactive Agent Heartbeat Skill

Turn your OpenClaw agent from a reactive chatbot into a background intelligence system that monitors, alerts, and acts on your behalf.

## What This Skill Does

This skill provides:
1. **HEARTBEAT.md templates** for common monitoring tasks
2. **Cron job configurations** for exact-timing automation
3. **Multi-channel routing rules** (Discord casual, WhatsApp urgent, phone calls critical)
4. **Working examples** you can copy and customize

## The Problem: Reactive Agents Are Manual Labor

Most OpenClaw users start here:
- You remember to check something → open chat → ask agent
- Agent responds → you read it → maybe take action
- Repeat 20 times a day

**The proactive shift:**
- Agent wakes up on schedule → checks what you care about → alerts only when needed
- You get notified where you actually look (WhatsApp for urgent, Discord for casual)
- For critical items, your phone actually rings

## Quick Start

### Step 1: Create Your HEARTBEAT.md

In your OpenClaw workspace, create `HEARTBEAT.md`:

```markdown
# Daily Heartbeat Checklist

Run these checks every 30 minutes:

## Morning Priority (8:00 AM)
- [ ] Check calendar for today's meetings → send WhatsApp summary
- [ ] Review Gmail for urgent items (from:boss, from:client) → WhatsApp if found
- [ ] Check GitHub mentions → Discord summary

## Continuous Monitoring
- [ ] Track Hacker News for "OpenClaw" mentions → Discord digest
- [ ] Monitor weather for rain → WhatsApp if umbrella needed
- [ ] Check Notion for overdue tasks → Discord reminder

## Evening Wrap-up (6:00 PM)
- [ ] Summarize day's completed tasks → Discord
- [ ] Check tomorrow's calendar → WhatsApp if early meeting
```

### Step 2: Configure Your Crontab

Edit your OpenClaw crontab (`crontab -e` in OpenClaw):

```bash
# Morning briefing at 8 AM (injected into main session)
0 8 * * * /usr/local/bin/openclaw heartbeat morning-brief

# Mid-day check at 1 PM
0 13 * * * /usr/local/bin/openclaw heartbeat midday-check

# Evening wrap-up at 6 PM
0 18 * * * /usr/local/bin/openclaw heartbeat evening-wrap

# Continuous heartbeat every 30 minutes (isolated, clean context)
*/30 * * * * /usr/local/bin/openclaw heartbeat --isolated continuous
```

### Step 3: Set Up Channel Routing

Create `workspace/config/notifications.json`:

```json
{
  "routing": {
    "critical": ["phone_call", "whatsapp"],
    "urgent": ["whatsapp"],
    "normal": ["discord"],
    "background": ["discord"]
  },
  "rules": [
    {
      "pattern": "from:ceo OR from:founder",
      "channel": "critical",
      "template": "URGENT: {summary}"
    },
    {
      "pattern": "meeting within 15 min",
      "channel": "urgent",
      "template": "Upcoming: {event}"
    },
    {
      "pattern": "daily summary",
      "channel": "normal"
    }
  ]
}
```

## Working Examples

### Example 1: Email Priority Inbox

**HEARTBEAT.md entry:**
```markdown
## Email Check
Check Gmail for:
1. Emails from:boss or from:urgent-list → WhatsApp immediately
2. GitHub notifications mentioning me → Discord batch at 9am, 1pm, 5pm
3. Newsletters → Skip unless explicitly asked
4. Everything else → Ignore (I'll batch process)

Action: Send appropriate notification based on sender priority.
```

### Example 2: Competitor & Industry Monitoring

**HEARTBEAT.md entry:**
```markdown
## Market Intelligence
- Search Hacker News for: "OpenClaw competitor" OR "AI agent framework"
- Check Reddit r/LocalLLaMA for new model releases
- Scan Product Hunt for "AI agent" launches

If significant news found:
→ Create brief summary
→ Discord with link
→ Flag if competitor feature launch
```

### Example 3: System Health Monitoring

**HEARTBEAT.md entry:**
```markdown
## System Health Check (every 30 min)
- Check server CPU/memory via API
- Verify backup jobs completed
- Review error logs for spikes

If issues detected:
→ WhatsApp for warnings
→ Phone call for critical (CPU >90%, site down)
```

### Example 4: Personal Life Assistant

**HEARTBEAT.md entry:**
```markdown
## Daily Life Check
- Weather check at 7 AM → WhatsApp if rain/cold
- Calendar check 15 min before each meeting → WhatsApp reminder
- Package tracking updates → Discord when delivered
- Grocery list: Suggest additions based on past patterns
```

## Advanced Patterns

### Self-Updating Heartbeat

Your agent can modify its own HEARTBEAT.md:

```markdown
## Dynamic Items
<!-- Agent can add items here during conversations -->
- [ ] Monitor for AWS outage updates (added 2026-03-08)
- [ ] Watch for product launch on Product Hunt (added 2026-03-08)
```

Just tell your agent: *"Keep an eye on X for me"* — it will add it to the checklist.

### Context Injection vs Isolated Runs

**Injected (main session):**
- Use for: Daily briefings, contextual alerts
- Why: Agent has your conversation history, knows your preferences

**Isolated:**
- Use for: System checks, monitoring, background tasks
- Why: Clean slate, no conversation context pollution

Configure in crontab:
```bash
# Injected (has context)
0 8 * * * /usr/local/bin/openclaw heartbeat morning --inject

# Isolated (clean slate)
*/30 * * * * /usr/local/bin/openclaw heartbeat monitor --isolated
```

### Keyword Alerts with F5Bot

Set up free monitoring at https://f5bot.com:

1. Add keywords: your name, your product, competitors
2. Point alerts to an email your agent monitors
3. Add to HEARTBEAT.md:

```markdown
## F5Bot Alerts
Check f5bot@ email for:
- Mentions of "Cortex" or "OpenClaw" → Discord summary
- Competitor mentions → Flag for review
- My name → WhatsApp (might be important)
```

## Channel Selection Guide

| Channel | Best For | Response Time |
|---------|----------|---------------|
| **Discord** | Summaries, low-urgency, batch updates | Hours |
| **WhatsApp** | Time-sensitive, action required | Minutes |
| **Phone Call** | Critical, immediate action needed | Seconds |
| **Email** | Formal records, non-urgent | Days |

**Pro tip:** Match the channel to the urgency. A calendar reminder 15 min before a meeting should be WhatsApp. A daily summary can be Discord.

## Common Mistakes to Avoid

1. **Too many notifications** → Start with 2-3 checks, add gradually
2. **Wrong channel urgency** → Everything urgent = nothing urgent
3. **No dismissal mechanism** → Tell agent to remove items when complete
4. **Missing timezone** → Use explicit times in your local zone

## Files Included

- `SKILL.md` — This documentation
- `examples/heartbeat-basic.md` — Starter template
- `examples/heartbeat-advanced.md` — Full-featured example
- `examples/crontab.txt` — Sample crontab configuration
- `examples/notifications.json` — Routing configuration

## Next Steps

1. Copy `examples/heartbeat-basic.md` to your workspace as `HEARTBEAT.md`
2. Customize the checks for your workflow
3. Add one cron job to start
4. Iterate based on what actually matters

---

*Want a fully managed proactive agent? [Cortex](https://cortex-pearl.vercel.app) hosts pre-configured agents with heartbeat patterns built in.*
