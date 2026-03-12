---
name: daily-standup-agent
description: Generates daily standup reports by collecting work artifacts from GitHub, Slack, and Calendar. Stores learnings to persistent memory for continuity across sessions.
---

# Daily Standup Agent Skill

A practical AI agent skill that demonstrates real work — addressing the common skepticism that "AI agents don't actually do anything useful."

## What It Does

This skill automates the tedious daily task of writing standup updates by:

1. **Collecting work artifacts** from GitHub (commits, PRs, issues), Slack mentions, and Calendar events
2. **Generating a formatted standup report** with accomplishments, blockers, and plans
3. **Storing learnings** to persistent memory for context across days
4. **Delivering the report** via Slack DM or email

## Problem It Solves

Engineers and PMs spend 10-15 minutes daily writing standup updates. This skill:
- Saves that time completely
- Ensures nothing is forgotten (comprehensive artifact scanning)
- Maintains continuity (yesterday's blockers become today's priorities)
- Provides evidence of real work (addresses "are agents actually useful?" skepticism)

## Quick Start

```bash
# 1. Clone this skill to your agent's skills directory
cp -r skills/daily-standup-agent ~/.openclaw/skills/

# 2. Set required environment variables
export GITHUB_TOKEN="your_token"
export SLACK_BOT_TOKEN="your_token"
export OPENAI_API_KEY="your_key"  # For report generation

# 3. Configure your sources in config.json
{
  "github_repos": ["myorg/myrepo", "myorg/otherrepo"],
  "slack_channels": ["#engineering", "#general"],
  "calendar_id": "primary"
}

# 4. Run the skill
claw run daily-standup-agent
```

## How It Works

### Phase 1: Artifact Collection

The skill queries multiple sources in parallel:

| Source | What It Gets | Why |
|--------|-------------|-----|
| GitHub | Commits, PRs opened/merged, issues closed | Code activity |
| Slack | Messages you sent, threads you participated in | Communication |
| Calendar | Meetings attended, events created | Time allocation |

### Phase 2: Memory Integration

Before generating the report, the skill loads yesterday's standup from `memory/standup-history.json`:

```json
{
  "last_standup": "2026-03-11",
  "blockers": ["Waiting for API keys from DevOps"],
  "priorities": ["Deploy payment integration"],
  "learnings": ["Stripe webhooks need idempotency keys"]
}
```

This enables continuity: yesterday's blockers are automatically checked for resolution.

### Phase 3: Report Generation

Uses a structured prompt to generate the standup:

```
Based on the following artifacts from 2026-03-12:

[GitHub activity]
[Slack messages]
[Calendar events]

And yesterday's blockers:
- Waiting for API keys from DevOps

Generate a standup report with:
1. Yesterday's accomplishments
2. Today's priorities
3. Blockers (check if yesterday's are resolved)
4. Learnings or notes
```

### Phase 4: Memory Update

Stores the new standup to memory for tomorrow's context:

```bash
node scripts/update-memory.mjs \
  --accomplishments "..." \
  --blockers "..." \
  --learnings "..."
```

## File Structure

```
daily-standup-agent/
├── SKILL.md                 # This file
├── config.json              # User configuration
└── scripts/
    ├── collect-github.mjs   # GitHub artifact collection
    ├── collect-slack.mjs    # Slack message retrieval
    ├── collect-calendar.mjs # Calendar event fetching
    ├── generate-report.mjs  # Standup report generation
    └── update-memory.mjs    # Memory persistence
```

## Why This Approach Works

### 1. Simple File-Based Memory

Instead of complex Redis or database setups, this skill uses a simple JSON file. For personal agents, this is:
- **Faster to set up** (no infra)
- **Easier to debug** (just cat the file)
- **Portable** (works on any machine)
- **Good enough** for daily standup context

### 2. Real Work, Not Demos

This skill solves a boring but real problem. It's not flashy — it just saves you 10 minutes every day. That's 40+ hours per year.

### 3. Extensible

Add new sources easily:
- Linear issues
- Jira tickets
- Notion page edits
- Email sent

Just create a new `collect-{source}.mjs` script.

## The Recommendation

**Use file-based memory with structured JSON for simple persistence, not Redis.**

Most agent memory needs don't require Redis or a database. A well-structured JSON file in `~/.openclaw/memory/` is:
- Faster (no network round-trip)
- Simpler (no connection management)
- Perfect for personal agent state

Only reach for Redis when you need:
- Multi-agent shared state
- Real-time synchronization
- High-frequency updates (>1/sec)

## Configuration

Edit `config.json` to customize:

```json
{
  "github": {
    "repos": ["myorg/repo1", "myorg/repo2"],
    "username": "myusername"
  },
  "slack": {
    "channels": ["#general", "#engineering"],
    "lookback_hours": 24
  },
  "calendar": {
    "id": "primary",
    "include_description": false
  },
  "output": {
    "format": "slack",  // or "markdown", "email"
    "destination": "#standups"
  },
  "memory": {
    "path": "~/.openclaw/memory/standup-history.json",
    "retention_days": 30
  }
}
```

## Troubleshooting

**GitHub API rate limits:** Use a personal access token with elevated rate limits

**Slack permissions:** Ensure bot has `channels:history` and `chat:write` scopes

**Missing data:** Check that your GitHub username matches your actual commits (email matching)

## Contributing

This is an open skill — PRs welcome! Ideas:
- Add Linear/Jira integration
- Support multiple output formats (Notion, email, Discord)
- Weekly summary mode
- Team aggregate standups

## License

MIT — use it, fork it, make it yours.
