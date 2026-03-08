---
name: memory-aware-daily-briefing
description: A daily briefing skill that uses external memory to remember user preferences, past topics, and personalization patterns. Demonstrates how to solve AI agent amnesia with database-backed persistent memory.
author: Cortex
version: 1.0.0
tags: [memory, daily-briefing, personalization, productivity]
---

# Memory-Aware Daily Briefing

## Purpose

Most AI agents start every conversation fresh—as if they've never met you. This skill demonstrates **external memory architecture**: the agent remembers your preferences, past briefings, and interests across sessions.

**What this skill does:**
- Retrieves your stated interests and priorities from persistent memory
- Checks what was covered in recent briefings (avoids repetition)
- Generates a personalized briefing based on your actual context
- Stores a summary of today's briefing for tomorrow's recall

**Why this matters:** Context windows forget. Databases don't.

---

## When to Use

- **Morning briefings** that actually remember what you care about
- **Weekly reviews** that build on previous insights
- **Research tracking** that accumulates findings over time
- **Any workflow** where "remembering" creates value

---

## Required Tools

- `memory_search` — Query persistent memory for user context
- `memory_get` — Retrieve specific memory documents
- `sessions_list` / `sessions_history` — Review past briefings
- `exec` — Run system commands for data gathering
- `message` — Deliver the briefing (Slack, Discord, email)

---

## Workflow

### Step 1: Load User Memory Context

Query the memory system for:
- User interests and priorities
- Preferred briefing format/time
- Recent topics to avoid repetition
- Stakeholders and projects to track

```
memory_search query="user preferences daily briefing interests priorities"
memory_search query="recent briefings topics covered last 7 days"
```

### Step 2: Gather Fresh Intelligence

Based on loaded context, gather relevant updates:
- Calendar events for today
- Slack mentions and DMs
- GitHub activity on tracked repos
- News on topics of interest

### Step 3: Filter for Novelty

Compare gathered intelligence against `recent_topics` from memory:
- Skip stories already covered in last 5 briefings
- Flag genuinely new developments
- Surface "still relevant" updates with new context

### Step 4: Generate Personalized Briefing

Structure based on user preferences from memory:

```markdown
## Your Morning Brief — [Date]

### 🔥 Priority Items (based on your focus: [topic])
[Items matching stated priorities]

### 📊 Project Updates
[GitHub/repo activity on tracked projects]

### 💬 Conversations Requiring Attention
[Slack mentions/threads]

### 🎯 New Opportunities
[Fresh intel not covered before]

---
*This briefing remembered you prefer [format preference] and care about [interests].*
```

### Step 5: Store for Tomorrow's Recall

Write back to memory:
- Topics covered today
- User reactions/feedback (if any)
- Any new preferences learned

```
node scripts/memory-write.mjs \
  --content "Briefing 2026-03-08: Covered [topics]. User clicked on [item]." \
  --tier daily --scope agent --tags "briefing,2026-03-08"
```

---

## Configuration

Create `~/.openclaw/briefing-config.json`:

```json
{
  "interests": ["AI agents", "OpenClaw", " startups"],
  "tracked_repos": ["openclaw/openclaw", "thenatechambers/openclaw-skills-repo"],
  "slack_channels": ["#general", "#engineering"],
  "briefing_time": "08:00",
  "format": "detailed",
  "avoid_topics": ["sports", "entertainment"]
}
```

The skill automatically loads this into memory on first run.

---

## The Memory Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   User Input    │────▶│  Memory Search   │────▶│ Context Loaded  │
│  (preferences)  │     │ (past briefings) │     │ (personalized)  │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                          │
┌─────────────────┐     ┌──────────────────┐              ▼
│  Briefing Gen   │◀────│   Intelligence   │◀────┌─────────────────┐
│   (personal)    │     │    Gathering     │     │  Fresh Data     │
└─────────────────┘     └──────────────────┘     │ (cal/Slack/Git) │
       │                                         └─────────────────┘
       ▼
┌─────────────────┐
│  Memory Store   │◀──── Write briefing summary for tomorrow's recall
│ (persistence)   │
└─────────────────┘
```

---

## Why This Beats Context-Window "Memory"

| Context Window | External Memory |
|----------------|-----------------|
| Forgets after ~100K tokens | Remembers indefinitely |
| Can't survive restarts | Persisted to database |
| No structured querying | Semantic + exact search |
| One-size-fits-all | Per-user, per-project customization |
| Expensive to fill repeatedly | Cheap to query selectively |

---

## Example Output

```markdown
## Your Morning Brief — March 8, 2026

*Remembered: You focus on AI infrastructure and prefer technical depth.*

### 🔥 Priority: OpenClaw Memory Discussion
The "AI agent amnesia" thread on HN hit 847 points. Key insight: 
"Forgetting isn't just a context-window problem—it's an architecture problem."
This aligns with your Cortex framework work on Database > Files.

### 📊 Repo Activity
- openclaw/openclaw: 3 new issues on MCP server stability
- thenatechambers/openclaw-skills-repo: Your memory-aware skill starred 12×

### 💬 Slack
#engineering: Jordan asked about agent provisioning for the ACME deal
(no prior briefing context → flag for your attention)

### 🎯 Fresh Intel
New blog post: "Agent Memory: Why Your AI Has Amnesia" (Oracle)
High-authority validation of the problem you're solving.

---
*Yesterday you clicked: GitHub issue #40334. Following up: Still open.*
```

---

## Next Steps

1. **Install this skill** in your OpenClaw instance
2. **Run the setup** to store your preferences
3. **Schedule via cron** for daily automation
4. **Watch it learn** — each briefing gets more relevant

---

## The Recommendation

**Use database-backed memory for any agent that runs more than once.**

Context windows are working memory—fast but volatile. Databases are long-term memory—slower to access but persistent and structured. The QMD pattern (Query → Memory → Decision) should be your default architecture for multi-session agents.

The future of AI agents isn't bigger context windows. It's better memory systems.
