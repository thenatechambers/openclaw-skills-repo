---
name: morning-brief
description: Delivers a personalized daily morning brief for founders and solopreneurs. Checks email (unread + flagged), calendar events for the day and tomorrow, Slack mentions, and one configurable key metric (GitHub stars, Stripe MRR, etc.). Outputs a scannable Slack/Telegram message with action items. Use when the user asks for a morning brief, daily summary, what's on today, or schedules a morning cron.
---

# Morning Brief Skill

## Purpose

Give yourself a 60-second start to the day. Pulls:
- 📧 Top unread emails (flagged / important)
- 📅 Calendar events for today + tomorrow
- 💬 Unread Slack/Signal mentions
- 📊 One key metric (configurable)

## Configuration

At first run, ask the user:
1. Which email account? (default: primary)
2. Which key metric to track? Options:
   - GitHub repo stars/PRs (`GITHUB_REPO`)
   - Stripe MRR (needs `STRIPE_SECRET_KEY`)
   - PostHog DAU (needs `POSTHOG_API_KEY`)
   - Custom URL to scrape (advanced)
3. Preferred delivery time? (for cron setup)

Store answers in `workspace/memory/morning-brief-config.json`.

## Workflow

### 1. Email Check
Use `gog` skill (Google Workspace CLI) if Gmail configured:
```bash
gog gmail list --unread --limit 10 --account YOUR_ACCOUNT
gog gmail list --label IMPORTANT --unread --limit 5 --account YOUR_ACCOUNT
```

Summarize: sender, subject, one-line gist. Flag anything that looks urgent (payment, legal, customer complaint).

### 2. Calendar Check
```bash
gog calendar list --today --account YOUR_ACCOUNT
gog calendar list --tomorrow --limit 3 --account YOUR_ACCOUNT
```

Output: time + event name + any location/link. Note if a meeting has no prep time before it.

### 3. Slack Check (if configured)
Use `message` tool to read recent DMs and @mentions in key channels. Summarize threads that need a reply.

### 4. Key Metric (optional)
**GitHub stars:**
```bash
curl -s "https://api.github.com/repos/OWNER/REPO" | python3 -c "import sys,json; d=json.load(sys.stdin); print(f\"{d['stargazers_count']} stars, {d['open_issues_count']} open issues\")"
```

**Stripe MRR:**
```bash
curl -s "https://api.stripe.com/v1/charges?limit=1" \
  -u "$STRIPE_SECRET_KEY:" | python3 -c "..."
```

### 5. Format and Deliver

```
☀️ Morning Brief — [Day, Date]

📧 EMAIL (3 unread)
• [Sender] — [Subject] → [action needed?]
• [Sender] — [Subject]

📅 TODAY
• 10:00 AM — Team standup (30 min)
• 2:00 PM — Demo call with Acme Corp ⚠️ (prep?)

📅 TOMORROW
• 9:00 AM — Investor meeting

💬 SLACK
• @you in #general: "[message preview]" — reply needed

📊 METRIC
• GitHub: 142 stars (+3 today) · 4 open PRs

🎯 TOP PRIORITY
[AI-generated one sentence: the single most important thing to tackle today based on the above]
```

Deliver via `message` tool to the user's preferred channel (Slack DM, Telegram, Signal).

## Setting Up as a Daily Cron

After first use, offer to schedule:
```bash
openclaw cron add \
  --name "morning-brief" \
  --cron "0 7 * * 1-5" \
  --tz "America/Los_Angeles" \
  --session isolated \
  --announce \
  --message "Run the morning-brief skill and deliver to [channel]."
```

Adjust timezone and time to user's preference.

## Tips

- If email is unavailable, skip gracefully and note it.
- Keep the brief scannable — bullets, no paragraphs.
- The "TOP PRIORITY" line is the most valuable part: force-rank everything into one action.
- For teams: run per person with individual configs.
