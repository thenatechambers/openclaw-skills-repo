---
name: site-watch
description: Monitor any website for changes and get instant alerts. Track competitor pricing, job postings, product updates, or any content changes. Your personal intelligence network for the web.
author: cortex
tags: [monitoring, automation, web-scraping, competitive-intelligence, alerts]
---

# Site Watch Skill

Your personal intelligence network. This skill monitors websites for changes and alerts you instantly when something updates. Track competitors, monitor job boards, watch for product launches, or keep tabs on any web content that matters to you.

## What It Does

1. **Monitors Web Pages** — Checks any URL on your schedule (every hour, daily, weekly)
2. **Precise Targeting** — Uses CSS selectors to watch specific elements, not entire pages
3. **Smart Diffing** — Shows you exactly what changed, not just "something changed"
4. **Multi-Channel Alerts** — Sends notifications via Slack, Discord, email, or SMS
5. **Change History** — Maintains a log of all detected changes with timestamps

## Use Cases

- **Competitive Intelligence** — Watch competitor pricing pages, feature announcements, or messaging changes
- **Job Market Monitoring** — Track specific companies' careers pages for new openings
- **Product Hunt Alternative** — Monitor product pages for launch announcements or updates
- **Content Tracking** — Watch documentation, changelogs, or blog posts for updates
- **Deal Hunting** — Monitor sale pages for price drops or limited-time offers
- **Regulatory Compliance** — Track government pages, policy documents, or compliance requirements

## Prerequisites

- OpenClaw with browser tool enabled
- One notification channel configured (Slack, Discord, email)
- Basic understanding of CSS selectors (or use the selector helper)

## Installation

### 1. Clone this skill into your OpenClaw skills directory

```bash
cd ~/.openclaw/skills
git clone https://github.com/thenatechambers/openclaw-skills-repo.git cortex-skills
cp -r cortex-skills/skills/site-watch ./site-watch
```

### 2. Configure your watches

Copy the example config:

```bash
cp site-watch/config.example.json site-watch/config.json
```

Edit `config.json` to define what to watch:

```json
{
  "watches": [
    {
      "name": "Competitor Pricing",
      "url": "https://competitor.com/pricing",
      "selector": ".pricing-card .price",
      "schedule": "0 */6 * * *",
      "alert_channels": ["slack"]
    },
    {
      "name": "YC Jobs - Engineering",
      "url": "https://www.ycombinator.com/jobs",
      "selector": ".job-listing",
      "schedule": "0 9 * * *",
      "alert_channels": ["email", "slack"]
    },
    {
      "name": "Product Updates",
      "url": "https://example.com/changelog",
      "selector": ".changelog-entry:first-child",
      "schedule": "0 */12 * * *",
      "alert_channels": ["discord"]
    }
  ],
  "channels": {
    "slack": {
      "webhook_url": "https://hooks.slack.com/services/..."
    },
    "discord": {
      "webhook_url": "https://discord.com/api/webhooks/..."
    },
    "email": {
      "smtp_host": "smtp.gmail.com",
      "smtp_port": 587,
      "username": "alerts@example.com",
      "password": "app-specific-password",
      "to": "you@example.com"
    }
  }
}
```

### 3. Test your configuration

```bash
cortex skill site-watch --test
```

This validates your CSS selectors and tests alert channels without making changes.

### 4. Activate the cron jobs

Add to your OpenClaw crontab:

```bash
# Check all watches every hour
0 * * * * cortex skill site-watch --run

# Or run specific watches
0 */6 * * * cortex skill site-watch --watch "Competitor Pricing"
0 9 * * * cortex skill site-watch --watch "YC Jobs - Engineering"
```

## Usage

### Add a new watch

```bash
cortex skill site-watch --add
```

Interactive mode will prompt you for:
- Name for this watch
- URL to monitor
- CSS selector (or auto-detect)
- Check frequency
- Alert channels

### Run a specific watch manually

```bash
cortex skill site-watch --watch "Competitor Pricing"
```

### Check all watches now

```bash
cortex skill site-watch --run
```

### View change history

```bash
# All changes
cortex skill site-watch --history

# Specific watch
cortex skill site-watch --history --watch "YC Jobs - Engineering"

# Last 7 days
cortex skill site-watch --history --days 7
```

### Test without alerting

```bash
cortex skill site-watch --dry-run
```

Shows what would change without sending alerts or updating state.

## Finding CSS Selectors

### Method 1: Browser DevTools

1. Open the page in Chrome/Firefox
2. Right-click the element you want to monitor
3. Select "Inspect"
4. Right-click the highlighted HTML in DevTools
5. Copy → Copy selector

### Method 2: Use the Selector Helper

```bash
cortex skill site-watch --selector-helper https://example.com/page
```

This loads the page and lists all major content blocks with their selectors:

```
Detected content areas:
[1] .hero-section h1 — "Welcome to Example"
[2] .pricing-card .price — "$29/month"
[3] .feature-list li — "5 items"
[4] .changelog h2 — "Version 2.0 Released"

Enter number to select, or type custom selector:
```

### Method 3: Common Patterns

| What you're tracking | Selector pattern |
|---------------------|------------------|
| Price | `.price`, `[data-testid="price"]`, `.cost` |
| Job listings | `.job-posting`, `.opening`, `[data-job-id]` |
| Blog posts | `.post-title`, `article h2`, `.entry-title` |
| Changelog | `.changelog-item:first-child`, `.release-title` |
| Stock/availability | `.stock-status`, `.availability`, `.in-stock` |

## Alert Format

Your alerts will look like this:

### Slack/Discord

```
🔍 Site Watch Alert: Competitor Pricing

URL: https://competitor.com/pricing
Detected: 2026-03-02 14:32 UTC

📊 CHANGES DETECTED:

--- Previous (2026-03-01 20:32 UTC)
+++ Current (2026-03-02 14:32 UTC)

- $49/month
+ $59/month

📝 CONTEXT:
Selector: .pricing-card .price
Text changed by: +$10.00 (20% increase)
```

### Email

Subject: `[Site Watch] Competitor Pricing - Change Detected`

Body includes:
- Full before/after comparison
- Link to view page
- Historical trend (if available)
- Screenshot diff (optional)

## Advanced Configuration

### Conditional Alerts

Only alert when specific conditions are met:

```json
{
  "name": "Price Drop Monitor",
  "url": "https://store.com/product",
  "selector": ".current-price",
  "condition": {
    "type": "price_drop",
    "threshold": 10
  },
  "schedule": "0 */4 * * *"
}
```

Available conditions:
- `price_drop` — Alert only if price decreases by X%
- `price_increase` — Alert only if price increases by X%
- `contains` — Alert only if content contains specific text
- `count_change` — Alert if number of items (jobs, products) changes
- `regex_match` — Alert if content matches regex pattern

### Screenshot Comparison

Enable visual diffing:

```json
{
  "name": "Landing Page Changes",
  "url": "https://competitor.com",
  "selector": "body",
  "screenshot": {
    "enabled": true,
    "viewport": "1920x1080",
    "full_page": true,
    "diff_threshold": 0.1
  }
}
```

### Multi-Page Monitoring

Monitor multiple related pages:

```json
{
  "name": "Competitor Careers",
  "type": "multi_page",
  "urls": [
    "https://competitor.com/jobs/engineering",
    "https://competitor.com/jobs/product",
    "https://competitor.com/jobs/design"
  ],
  "selector": ".job-listing",
  "aggregate": true
}
```

### Rate Limiting & Politeness

Respect target websites:

```json
{
  "politeness": {
    "delay_between_requests": 2000,
    "respect_robots_txt": true,
    "user_agent": "SiteWatchBot/1.0 (Monitoring; contact@yourdomain.com)"
  }
}
```

## Storage & State

Site Watch stores:
- **Current content hash** — For quick change detection
- **Last 10 snapshots** — For rollback/history
- **Change log** — Timestamped record of all changes

Storage location: `~/.openclaw/skills/site-watch/state/`

### Backup your watches

```bash
# Export all configuration and state
cortex skill site-watch --export > site-watch-backup.json

# Import on another machine
cortex skill site-watch --import site-watch-backup.json
```

## Troubleshooting

**"Selector not found"**
- The element may load dynamically via JavaScript
- Try a more stable parent selector
- Use `--wait-for` to delay checking until JS loads

**"False positives"**
- Use more specific selectors (avoid generic classes like `.container`)
- Exclude dynamic content (timestamps, ads, user-specific content)
- Add `ignore_selectors` to exclude volatile elements

**"Page blocked or requires login"**
- Some sites block automated access
- Try adding a custom User-Agent
- For authenticated pages, use cookie-based auth (advanced)

**"Rate limited"**
- Increase `delay_between_requests`
- Reduce check frequency
- Use proxy rotation (enterprise feature)

## Real-World Examples

### Monitor Competitor Pricing

```json
{
  "name": "Acme Corp Pricing",
  "url": "https://acme.com/pricing",
  "selector": ".pricing-tier.pro .price",
  "schedule": "0 9,17 * * *",
  "condition": { "type": "any_change" }
}
```

### Track Job Openings

```json
{
  "name": "YC Engineering Jobs",
  "url": "https://www.ycombinator.com/jobs/engineer",
  "selector": ".job",
  "schedule": "0 9 * * 1-5",
  "condition": { "type": "count_change" }
}
```

### Product Launch Detection

```json
{
  "name": "Stripe New Products",
  "url": "https://stripe.com/products",
  "selector": ".product-card",
  "schedule": "0 */6 * * *",
  "condition": { "type": "count_increase" }
}
```

### Documentation Updates

```json
{
  "name": "OpenClaw Changelog",
  "url": "https://openclaw.ai/changelog",
  "selector": ".changelog-entry:first-child h2",
  "schedule": "0 10 * * *"
}
```

## Roadmap

- [ ] RSS/Atom feed monitoring
- [ ] API endpoint monitoring (JSON changes)
- [ ] JavaScript execution for SPAs
- [ ] Mobile app store monitoring (App Store, Play Store)
- [ ] Social media profile monitoring
- [ ] PDF/document change detection
- [ ] Integration with n8n/Zapier

## Credits

Built by the [Cortex](https://cortex-pearl.vercel.app) team for the OpenClaw community. Inspired by Hacker News discussions on lightweight monitoring and competitive intelligence needs.

---

**License:** MIT  
**Contributions:** PRs welcome at https://github.com/thenatechambers/openclaw-skills-repo
