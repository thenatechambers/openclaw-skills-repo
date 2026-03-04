---
name: smart-notify
description: Intelligent notification filtering and routing for OpenClaw agents. Batches low-priority alerts, escalates critical items, and learns what matters to you over time. Prevents notification fatigue while ensuring you never miss the important stuff.
author: Keiko Atlas <keiko@goorca.ai>
version: 1.0.0
---

# Smart Notify Skill

Tame your AI agent's notification habits. This skill adds intelligence to agent alerts — batching routine updates, filtering noise, escalating true emergencies, and learning your preferences over time.

## What It Does

- **Priority Routing** — Sends critical alerts immediately via SMS/phone call; batches routine updates for digest delivery
- **Smart Batching** — Groups related notifications into a single, readable summary instead of 20 separate pings
- **Preference Learning** — Tracks which notifications you actually engage with and adjusts future routing
- **Escalation Chains** — If a high-priority alert goes unacknowledged, it escalates through multiple channels
- **Quiet Hours** — Respects your focus time; queues non-urgent notifications for later

## Installation

1. Copy this skill to your OpenClaw workspace's `skills/` directory:
   ```bash
   cp -r skills/smart-notify /home/keiko/.openclaw/workspace/skills/
   ```

2. Set up your notification channels in `.env`:
   ```bash
   # Required: At least one notification channel
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
   
   # Optional: For high-priority escalation
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=+1234567890
   YOUR_PHONE_NUMBER=+1987654321
   
   # Optional: Email notifications
   SENDGRID_API_KEY=your_sendgrid_key
   NOTIFICATION_EMAIL=you@example.com
   ```

3. Configure your notification preferences in `config.json` (see Configuration section)

## Quick Start

```bash
# Send a notification through the smart filter
node skills/smart-notify/notify.mjs \
  --message "Deployment failed on production" \
  --priority high \
  --source "deploy-agent"

# Send a batched notification (will be grouped with others)
node skills/smart-notify/notify.mjs \
  --message "Daily backup completed successfully" \
  --priority low \
  --source "backup-agent"
```

## Configuration

Create `skills/smart-notify/config.json`:

```json
{
  "channels": {
    "slack": {
      "enabled": true,
      "webhook_url": "${SLACK_WEBHOOK_URL}",
      "channel": "#agent-alerts"
    },
    "sms": {
      "enabled": true,
      "provider": "twilio",
      "account_sid": "${TWILIO_ACCOUNT_SID}",
      "auth_token": "${TWILIO_AUTH_TOKEN}",
      "from_number": "${TWILIO_PHONE_NUMBER}",
      "to_number": "${YOUR_PHONE_NUMBER}"
    },
    "email": {
      "enabled": false,
      "provider": "sendgrid",
      "api_key": "${SENDGRID_API_KEY}",
      "to": "${NOTIFICATION_EMAIL}"
    }
  },
  "priority_rules": {
    "critical": {
      "channels": ["sms", "slack", "email"],
      "escalate_after_minutes": 5,
      "bypass_quiet_hours": true
    },
    "high": {
      "channels": ["slack", "email"],
      "escalate_after_minutes": 30,
      "bypass_quiet_hours": true
    },
    "medium": {
      "channels": ["slack"],
      "batch_minutes": 15,
      "quiet_hours_ok": true
    },
    "low": {
      "channels": ["slack"],
      "batch_minutes": 60,
      "quiet_hours_ok": true
    }
  },
  "quiet_hours": {
    "enabled": true,
    "start": "22:00",
    "end": "08:00",
    "timezone": "America/New_York"
  },
  "learning": {
    "enabled": true,
    "track_engagement": true,
    "adapt_after_days": 7
  }
}
```

## Usage in Your Agent

### Basic: Replace Your Existing notify() Calls

**Before (noisy):**
```javascript
// In your agent code
await sendSlackMessage(`Task ${taskId} completed`);
await sendSlackMessage(`Task ${taskId + 1} completed`);
await sendSlackMessage(`Task ${taskId + 2} completed`);
// 3 separate notifications!
```

**After (smart):**
```javascript
// In your agent code
const { notify } = require('./skills/smart-notify/lib/notify');

await notify({
  message: `Task ${taskId} completed`,
  priority: 'low',
  source: 'task-runner',
  metadata: { taskId, status: 'completed' }
});
// Automatically batched with other low-priority notifications
```

### Advanced: Contextual Priority

```javascript
const { notify } = require('./skills/smart-notify/lib/notify');

// Determine priority based on context
const priority = (failedTasks > 5) ? 'critical' : 
                 (failedTasks > 0) ? 'high' : 'low';

await notify({
  message: `${failedTasks} tasks failed in the last hour`,
  priority: priority,
  source: 'monitor-agent',
  context: {
    failedCount: failedTasks,
    totalCount: totalTasks,
    timeframe: '1h'
  }
});
```

### Digest Mode

Get a summary instead of individual notifications:

```javascript
const { startDigest, endDigest } = require('./skills/smart-notify/lib/notify');

// Start a digest window
await startDigest({ windowMinutes: 30, topic: 'deployment' });

// Multiple notifications will be grouped
await notify({ message: "Build started", priority: 'low', source: 'deploy' });
await notify({ message: "Tests passed", priority: 'low', source: 'deploy' });
await notify({ message: "Deploying to staging", priority: 'low', source: 'deploy' });

// Close digest and send summary
await endDigest({ topic: 'deployment' });
// Sends: "Deployment Summary: Build started → Tests passed → Deploying to staging"
```

## Priority Levels

| Level | Use For | Behavior |
|-------|---------|----------|
| **Critical** | Production down, security breach, data loss | Immediate SMS + Slack + Email; escalates if unacknowledged |
| **High** | Failed deployment, significant error, customer impact | Immediate Slack + Email; escalate to SMS after 30 min |
| **Medium** | Warnings, notable events, anomalies | Batched every 15 min; sent during quiet hours |
| **Low** | Success confirmations, routine updates, info | Batched hourly; queued during quiet hours |

## How Learning Works

The skill tracks:
- Which notifications you click/acknowledge
- Response time by priority level
- Time-of-day engagement patterns
- Source preference (which agents send useful alerts)

After 7 days, it automatically adjusts:
- Batching windows for sources you rarely engage with
- Priority upgrades for message types you always open
- Quiet hour exceptions for truly urgent patterns

View your preference profile:
```bash
node skills/smart-notify/analyze.mjs --show-profile
```

## Integration Examples

### For a CI/CD Agent
```javascript
// deployment-agent.js
const { notify } = require('./skills/smart-notify/lib/notify');

async function deploy() {
  try {
    await notify({ message: "Starting production deployment", priority: 'medium', source: 'deploy' });
    await runDeploy();
    await notify({ message: "Production deployment successful", priority: 'low', source: 'deploy' });
  } catch (error) {
    await notify({ 
      message: `Deployment failed: ${error.message}`, 
      priority: 'critical', 
      source: 'deploy',
      context: { error: error.stack, commit: process.env.GIT_COMMIT }
    });
  }
}
```

### For a Monitoring Agent
```javascript
// monitor-agent.js
const { notify } = require('./skills/smart-notify/lib/notify');

async function checkMetrics() {
  const metrics = await fetchMetrics();
  
  if (metrics.errorRate > 0.1) {
    await notify({
      message: `Error rate spike: ${(metrics.errorRate * 100).toFixed(1)}%`,
      priority: 'high',
      source: 'monitor',
      context: { errorRate: metrics.errorRate, threshold: 0.1 }
    });
  }
  
  // Routine check-in (batched)
  await notify({
    message: `Metrics check completed: ${metrics.status}`,
    priority: 'low',
    source: 'monitor'
  });
}
```

## Troubleshooting

**Notifications not sending:**
```bash
# Test your configuration
node skills/smart-notify/test.mjs
```

**Too many notifications still:**
- Check `config.json` — are priorities set correctly?
- Review learning data: `node skills/smart-notify/analyze.mjs --show-sources`
- Some sources might need their default priority lowered

**Critical alerts not escalating:**
- Verify Twilio credentials are set
- Check that `escalate_after_minutes` isn't too high
- Ensure `bypass_quiet_hours: true` for critical priority

## Files in This Skill

| File | Purpose |
|------|---------|
| `SKILL.md` | This documentation |
| `notify.mjs` | CLI entry point for sending notifications |
| `lib/notify.js` | Programmatic API for use in agents |
| `lib/batcher.mjs` | Batching engine and queue management |
| `lib/priority.mjs` | Priority routing and escalation logic |
| `lib/learner.mjs` | Preference learning and adaptation |
| `analyze.mjs` | CLI tool for viewing insights and config |
| `test.mjs` | Configuration and connectivity testing |
| `config.example.json` | Example configuration file |

## Why This Matters

Most agent tutorials show you how to send notifications. Few teach you how to send *useful* notifications. The difference between an agent you trust and one you ignore is often just notification hygiene.

This skill brings product-grade notification logic to your personal agents — the kind of smart routing that usually requires a SaaS platform, now running in your OpenClaw instance.

---

**Built for Cortex** — Deploy AI agents that respect your attention.
