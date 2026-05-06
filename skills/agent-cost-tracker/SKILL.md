---
name: agent-cost-tracker
description: Track OpenClaw agent costs, token usage, tool calls, and subagent runs. Generates automated daily/weekly reports with cost breakdowns and usage analytics. No external SaaS required — data stored locally.
---

# Agent Cost Tracker

Track your OpenClaw agent costs before they surprise you. This skill logs every agent run with token counts, tool invocations, and subagent spawns — then generates automated reports you can review daily or weekly.

## What It Does

- **Cost Tracking**: Logs token usage per model with cost calculations
- **Tool Analytics**: Tracks which skills/tools are being invoked and how often
- **Subagent Monitoring**: Captures subagent spawn counts and completion rates
- **Report Generation**: Creates daily/weekly markdown reports or posts to Slack/Discord
- **Local Storage**: All data stays in your workspace (no external SaaS required)

## Why Use This

Most teams deploying AI agents have no visibility into costs until the bill arrives. By the time you notice a runaway agent or expensive tool loop, you've already spent the money.

This skill gives you:
- **Proactive cost awareness** — see usage patterns before they become bills
- **Debugging visibility** — trace which agents/tools are consuming the most tokens
- **Team accountability** — share usage reports with your team
- **Zero lock-in** — your data stays local, export anytime

## Installation

1. Copy this skill to your OpenClaw skills directory:
   ```bash
   cp -r agent-cost-tracker ~/.openclaw/skills/
   ```

2. Set your model pricing in `config/pricing.json` (examples provided for common models)

3. Run the setup command:
   ```bash
   openclaw run agent-cost-tracker/setup
   ```

## Usage

### Log an Agent Run

The tracker automatically hooks into OpenClaw's execution flow. To manually log a run:

```bash
openclaw run agent-cost-tracker/log \
  --model "moonshot/kimi-k2.5" \
  --input-tokens 1500 \
  --output-tokens 800 \
  --tools "browser,sessions_spawn" \
  --subagents 2
```

### Generate Daily Report

```bash
openclaw run agent-cost-tracker/report --period daily
```

Output: `workspace/cost-reports/daily-YYYY-MM-DD.md`

### Generate Weekly Report

```bash
openclaw run agent-cost-tracker/report --period weekly
```

Output: `workspace/cost-reports/weekly-YYYY-Www.md`

### Post to Slack

```bash
openclaw run agent-cost-tracker/report \
  --period daily \
  --output slack \
  --slack-webhook "$SLACK_WEBHOOK_URL"
```

## Configuration

### Pricing Config

Edit `config/pricing.json` to match your API provider rates:

```json
{
  "models": {
    "moonshot/kimi-k2.5": {
      "input_cost_per_1k": 0.005,
      "output_cost_per_1k": 0.015
    },
    "openai/gpt-4o": {
      "input_cost_per_1k": 0.005,
      "output_cost_per_1k": 0.015
    },
    "anthropic/claude-3-5-sonnet": {
      "input_cost_per_1k": 0.003,
      "output_cost_per_1k": 0.015
    }
  }
}
```

### Environment Variables

```bash
# Optional: Slack webhook for automated reports
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/..."

# Optional: Discord webhook
export DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/..."

# Optional: Custom report output directory
export COST_REPORT_DIR="$HOME/workspace/cost-reports"
```

## Report Format

### Daily Report Example

```markdown
# Agent Cost Report — 2026-05-06

## Summary
- **Total Runs**: 47
- **Total Cost**: $2.34
- **Total Input Tokens**: 45,230
- **Total Output Tokens**: 18,450

## By Model
| Model | Runs | Input Tokens | Output Tokens | Cost |
|-------|------|--------------|---------------|------|
| moonshot/kimi-k2.5 | 42 | 38,400 | 15,200 | $1.96 |
| openai/gpt-4o | 5 | 6,830 | 3,250 | $0.38 |

## Top Skills by Usage
| Skill | Invocations | Avg Tokens/Call |
|-------|-------------|-----------------|
| browser | 23 | 1,240 |
| sessions_spawn | 8 | 890 |
| cortex-research | 5 | 2,100 |

## Subagent Activity
- **Spawned**: 12
- **Completed**: 11
- **Failed**: 1
- **Avg Duration**: 45s

## Cost Trajectory
- Today: $2.34
- Yesterday: $1.89 (+24%)
- 7-day avg: $2.12
```

## Data Storage

All data is stored locally in SQLite:

```
workspace/
└── cost-reports/
    ├── agent-cost-tracker.db     # SQLite database
    ├── daily-YYYY-MM-DD.md       # Daily reports
    └── weekly-YYYY-Www.md        # Weekly reports
```

### Database Schema

**runs table:**
- `id` (primary key)
- `timestamp`
- `session_key`
- `model`
- `input_tokens`
- `output_tokens`
- `cost` (calculated)
- `skills_used` (JSON array)
- `subagents_spawned`
- `subagents_completed`
- `duration_ms`
- `status` (success/error)

**tool_calls table:**
- `id` (primary key)
- `run_id` (foreign key)
- `tool_name`
- `timestamp`
- `input_tokens`
- `output_tokens`

## Automation

### Cron Setup (Daily Reports)

Add to your crontab:

```bash
# Daily cost report at 9 AM
0 9 * * * cd /your/workspace && openclaw run agent-cost-tracker/report --period daily --output slack

# Weekly cost report every Monday at 9 AM
0 9 * * 1 cd /your/workspace && openclaw run agent-cost-tracker/report --period weekly --output slack
```

### OpenClaw Cron Integration

Add to your `openclaw.json`:

```json
{
  "cron": [
    {
      "id": "daily-cost-report",
      "schedule": "0 9 * * *",
      "skill": "agent-cost-tracker/report",
      "args": ["--period", "daily", "--output", "slack"]
    }
  ]
}
```

## Troubleshooting

### Missing Token Counts

Some API providers don't return token counts in responses. The tracker will estimate based on character count (1 token ≈ 4 characters) when exact counts aren't available.

### Cost Discrepancies

If your calculated costs don't match your API bill:
1. Check that pricing.json matches your provider's rates
2. Some providers charge for prompt caching, function calling overhead, or have minimum charges
3. The tracker captures explicit costs, not provider-specific optimizations

### High Frequency Logging

For high-volume deployments, the tracker automatically batches writes. You can configure batch size:

```bash
export COST_TRACKER_BATCH_SIZE=100  # Default: 10
```

## Roadmap

- [ ] OpenTelemetry export integration
- [ ] Grafana dashboard template
- [ ] Cost alerting (notify when daily spend exceeds threshold)
- [ ] Multi-tenant support for agency deployments
- [ ] Web dashboard (optional hosted version)

## License

MIT — Free for personal and commercial use.

## Contributing

Issues and PRs welcome at: https://github.com/thenatechambers/openclaw-skills-repo

---

**Built for the Cortex community.** Deploy AI agents with confidence.
