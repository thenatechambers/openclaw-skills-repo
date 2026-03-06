---
name: scheduled-research-agent
description: A self-contained research agent that runs on a schedule, remembers what it found, and only surfaces new information. Demonstrates persistent memory patterns for OpenClaw without requiring external databases. Use when you want to monitor topics over time without duplicate alerts.
---

# Scheduled Research Agent

## Purpose

Most AI agents are "chatbots with amnesia" — they forget everything when the session ends. This skill demonstrates **persistent memory** and **scheduling** patterns for OpenClaw, creating an agent that:

1. Runs research queries on a schedule (cron-like)
2. Remembers what it already found (deduplication)
3. Only alerts you on new information
4. Stores everything locally — no database setup required

## The Problem

You want to monitor:
- Competitor announcements
- Hacker News stories about your industry
- New GitHub repos in your space
- Reddit discussions about your product

But you don't want:
- The same alerts every day
- To set up Redis/Postgres just for state
- To manually track "seen" IDs
- Complex infrastructure

## The Solution

File-based persistent memory with automatic state management.

```
workspace/
└── scheduled-research/
    ├── memory.json          # What we've seen
    ├── config.json          # Schedule + queries
    └── outputs/
        └── YYYY-MM-DD.json  # Daily findings
```

## Quick Start

### 1. Initialize the agent

```bash
# Create your research configuration
cat > workspace/scheduled-research/config.json << 'EOF'
{
  "name": "AI Agent Landscape Monitor",
  "schedule": "0 9 * * *",
  "sources": [
    {
      "type": "hackernews",
      "query": "AI agent automation",
      "min_points": 5
    },
    {
      "type": "reddit",
      "subreddit": "ClaudeAI",
      "keywords": ["skill", "automation", "workflow"]
    },
    {
      "type": "github",
      "query": "openclaw skill",
      "sort": "updated"
    }
  ],
  "deduplication": {
    "key": "url",
    "retention_days": 30
  },
  "alert": {
    "min_new_items": 1,
    "channels": ["slack", "file"]
  }
}
EOF
```

### 2. Run manually (first time)

```bash
# In your OpenClaw agent
/research-run --config workspace/scheduled-research/config.json
```

### 3. Set up scheduling

Add to your agent's heartbeat configuration:

```json
{
  "heartbeats": [
    {
      "prompt": "Run scheduled-research-agent with config at workspace/scheduled-research/config.json",
      "schedule": "0 9 * * *",
      "channel": "slack",
      "target": "#research-alerts"
    }
  ]
}
```

## How It Works

### State Management

The agent maintains a simple JSON memory file:

```json
{
  "initialized": "2026-03-06T00:00:00Z",
  "last_run": "2026-03-06T09:00:00Z",
  "seen": {
    "https://news.ycombinator.com/item?id=12345": {
      "first_seen": "2026-03-06T09:00:00Z",
      "source": "hackernews",
      "title": "Show HN: New AI Agent Framework"
    }
  },
  "stats": {
    "total_runs": 1,
    "total_discovered": 5,
    "total_new": 5
  }
}
```

### Deduplication Logic

```javascript
function findNewItems(currentResults, memory) {
  const seen = new Set(Object.keys(memory.seen));
  return currentResults.filter(item => !seen.has(item.url));
}

function updateMemory(newItems, memory) {
  for (const item of newItems) {
    memory.seen[item.url] = {
      first_seen: new Date().toISOString(),
      source: item.source,
      title: item.title
    };
  }
  // Cleanup old entries (>30 days)
  const cutoff = Date.now() - (30 * 24 * 60 * 60 * 1000);
  for (const [url, meta] of Object.entries(memory.seen)) {
    if (new Date(meta.first_seen).getTime() < cutoff) {
      delete memory.seen[url];
    }
  }
  return memory;
}
```

### Source Adapters

**Hacker News:**
```javascript
async function searchHN(query, minPoints = 5) {
  const response = await fetch(
    `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story`
  );
  const data = await response.json();
  return data.hits
    .filter(h => h.points >= minPoints)
    .map(h => ({
      url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
      title: h.title,
      source: 'hackernews',
      score: h.points,
      comments: h.num_comments
    }));
}
```

**GitHub:**
```javascript
async function searchGitHub(query, sort = 'updated') {
  const response = await fetch(
    `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=${sort}&order=desc`
  );
  const data = await response.json();
  return data.items.map(r => ({
    url: r.html_url,
    title: r.full_name,
    description: r.description,
    source: 'github',
    stars: r.stargazers_count,
    updated: r.updated_at
  }));
}
```

**Reddit:**
```javascript
async function searchReddit(subreddit, keywords) {
  const response = await fetch(
    `https://www.reddit.com/r/${subreddit}/hot.json?limit=25`,
    { headers: { 'User-Agent': 'OpenClawResearchBot/1.0' } }
  );
  const data = await response.json();
  return data.data.children
    .filter(p => keywords.some(k => 
      p.data.title.toLowerCase().includes(k.toLowerCase())
    ))
    .map(p => ({
      url: `https://reddit.com${p.data.permalink}`,
      title: p.data.title,
      source: 'reddit',
      score: p.data.score,
      subreddit
    }));
}
```

## Output Format

Daily findings are saved to `outputs/YYYY-MM-DD.json`:

```json
{
  "date": "2026-03-06",
  "config_name": "AI Agent Landscape Monitor",
  "run_at": "2026-03-06T09:00:00Z",
  "summary": {
    "total_checked": 3,
    "total_found": 12,
    "new_items": 3,
    "by_source": {
      "hackernews": 1,
      "github": 2,
      "reddit": 0
    }
  },
  "new_items": [
    {
      "url": "https://github.com/example/new-agent-framework",
      "title": "example/new-agent-framework",
      "source": "github",
      "stars": 42,
      "discovered_at": "2026-03-06T09:00:00Z"
    }
  ]
}
```

## Alert Templates

**Slack (only when new items found):**
```
🔍 Scheduled Research: AI Agent Landscape Monitor
Found 3 new items (checked 12 total)

• example/new-agent-framework — ⭐ 42
  https://github.com/example/new-agent-framework

• Show HN: New AI Agent Framework — ⬆️ 15
  https://news.ycombinator.com/item?id=12345

See all: workspace/scheduled-research/outputs/2026-03-06.json
```

**Silent mode (file only):**
When `alert.min_new_items` is set higher than found items, no notification is sent. The data is still saved to the output file for batch review.

## Advanced Configuration

### Multiple Agents

Run multiple research agents with separate configs:

```bash
workspace/scheduled-research/
├── competitors/
│   ├── config.json      # Monitor competitor releases
│   └── memory.json
├── industry/
│   ├── config.json      # Industry trends
│   └── memory.json
└── mentions/
    ├── config.json      # Brand mentions
    └── memory.json
```

### Custom Alert Thresholds

```json
{
  "alert": {
    "min_new_items": 3,
    "cooldown_hours": 4,
    "channels": ["slack"],
    "mentions": ["@channel"]
  }
}
```

### Enrichment Pipeline

Add AI-powered summarization:

```json
{
  "enrichment": {
    "summarize": true,
    "extract_topics": true,
    "sentiment_analysis": false
  }
}
```

This passes new items through your LLM to generate summaries before alerting.

## Why This Pattern Matters

### For Cortex Users

This demonstrates three architectural principles:

1. **Database > Files** (but files are fine for simple state)
2. **Scheduled execution** via heartbeats
3. **Deduplication** as first-class concern

### Comparison with Alternatives

| Approach | Setup | Persistence | Deduplication | Best For |
|----------|-------|-------------|---------------|----------|
| This skill | 5 min | File-based | Built-in | Personal monitoring |
| Ductwork | 30 min | File-based | Built-in | DevOps teams |
| Computer Agents | 2 min | Cloud | Built-in | Consumer use |
| Custom script | 2 hours | DIY | DIY | Full control |

## Troubleshooting

**"No new items found every run"**
- Check that `memory.json` is being written
- Verify deduplication key matches URL format
- Check retention_days isn't too aggressive

**"Rate limited by source"**
- Add delays between requests
- Reduce query frequency
- Use authenticated APIs (GitHub token, etc.)

**"Memory file growing too large"**
- Reduce retention_days
- Enable automatic cleanup
- Archive old memory files monthly

## Full Implementation

See `scripts/scheduled-research.mjs` for the complete implementation:

```bash
# Download the skill
openclaw skills add thenatechambers/scheduled-research-agent

# Initialize your first monitor
openclaw run scheduled-research-agent --init

# Run once to test
openclaw run scheduled-research-agent --dry-run

# Enable scheduling
openclaw run scheduled-research-agent --enable-schedule
```

---

*Built for the Cortex blog — demonstrating persistent memory patterns for OpenClaw.*
