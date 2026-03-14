---
name: personal-automation-digest
description: Generates a weekly digest report of your OpenClaw cron jobs and automations. Tracks success rates, execution times, and estimates time saved. Perfect for understanding what's actually working in your personal automation stack.
author: cortex-team
tags: [cron, automation, productivity, analytics]
---

# Personal Automation Digest

Get visibility into your OpenClaw automations. This skill generates a weekly report showing what's running, what's failing, and what's saving you time.

## The Problem

You set up cron jobs and automations. Some run daily. Some fail silently. You have no idea which ones are actually worth the infrastructure cost. Your Make.com bill grows but you can't tell which zaps matter.

## What This Skill Does

1. **Aggregates execution logs** from your OpenClaw cron jobs
2. **Calculates success rates** over the past week
3. **Estimates time saved** based on manual task duration you configure
4. **Identifies failing jobs** that need attention
5. **Surfaces unused automations** that might be deprecated

## Requirements

- OpenClaw with cron jobs enabled
- Supabase connection for log storage (optional but recommended)
- 5 minutes to configure

## Setup

### Step 1: Configure Job Metadata

Create a `jobs.yaml` in your OpenClaw workspace:

```yaml
# workspace/automation-jobs.yaml
jobs:
  - id: morning-brief
    name: "Morning Brief Generator"
    schedule: "0 8 * * 1-5"
    estimated_minutes_saved: 10
    description: "Compiles daily agenda from calendar and tasks"
    
  - id: github-sync
    name: "GitHub Issue Triage"
    schedule: "0 */4 * * *"
    estimated_minutes_saved: 15
    description: "Syncs and labels new GitHub issues"
    
  - id: weekly-report
    name: "Weekly Client Report"
    schedule: "0 17 * * 5"
    estimated_minutes_saved: 45
    description: "Generates and emails weekly analytics report"
```

### Step 2: Add Logging Hooks

Add this snippet to each cron job's skill to capture execution data:

```javascript
// At the start of your skill
const runId = await logRunStart({
  jobId: 'morning-brief',
  timestamp: new Date().toISOString()
});

try {
  // ... your skill logic ...
  
  await logRunComplete({
    runId,
    status: 'success',
    durationMs: Date.now() - startTime
  });
} catch (error) {
  await logRunComplete({
    runId,
    status: 'failed',
    error: error.message
  });
}
```

### Step 3: Schedule the Digest

Add to your OpenClaw crontab:

```yaml
# Run every Monday at 9 AM
cron:
  - name: weekly-automation-digest
    schedule: "0 9 * * 1"
    skill: personal-automation-digest
    prompt: "Generate my weekly automation digest"
```

## How to Use

Once configured, the skill runs automatically and produces output like:

```
📊 Weekly Automation Digest (Mar 8-14)

🟢 SUCCESS RATE: 94% (47/50 runs)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 ESTIMATED TIME SAVED: 4 hours 35 min
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 TOP PERFORMERS:
   • Morning Brief Generator — 5/5 runs, 50 min saved
   • GitHub Issue Triage — 42/42 runs, 10h 30m saved

⚠️  NEEDS ATTENTION:
   • Weekly Client Report — 2 failures this week
     Last error: API rate limit exceeded

💤 LOW ACTIVITY:
   • Twitter Digest — 0 runs (job disabled?)
```

## Customization

### Change Digest Schedule

Edit the cron expression in your OpenClaw config:

```yaml
# Daily digest at 6 PM
schedule: "0 18 * * *"

# Monthly on the 1st
schedule: "0 9 1 * *"
```

### Add Custom Metrics

Extend `jobs.yaml` with custom fields:

```yaml
jobs:
  - id: invoice-generator
    name: "Monthly Invoices"
    estimated_minutes_saved: 120
    dollar_value_per_run: 50  # what you'd pay a VA
    notify_on_failure: true
    slack_channel: "#finance-alerts"
```

### Filter Which Jobs to Report

Use tags to include/exclude:

```yaml
cron:
  - name: weekly-automation-digest
    schedule: "0 9 * * 1"
    skill: personal-automation-digest
    prompt: "Generate digest for jobs tagged 'production'"
```

And in `jobs.yaml`:

```yaml
jobs:
  - id: critical-task
    tags: [production, billing]
```

## The Recommendation

**Track one metric: estimated hours saved per week.**

Everything else is secondary. If your automations aren't saving you at least 2x the time you spend maintaining them, simplify or delete.

This skill helps you identify:
- **Winners:** High-save, low-failure jobs to invest in
- **Losers:** Low-save, high-maintenance jobs to kill
- **Sleepers:** Jobs you forgot about that might be obsolete

## Why This Matters

Personal automation debt is real. You build a Zapier workflow for a temporary problem. Six months later it's still running, costing money, and you've forgotten what it does.

Visibility is the first step toward intentional automation.

## Next Steps

1. Copy `jobs.yaml` and customize for your automations
2. Add logging hooks to your top 3 most important jobs
3. Schedule the digest skill
4. Review your first report and kill one low-value automation

---

*Part of the [Cortex OpenClaw Skills collection](https://github.com/thenatechambers/openclaw-skills-repo)*
