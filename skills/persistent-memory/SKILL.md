---
name: persistent-memory
description: Give your OpenClaw agent persistent memory across conversations using Supabase. Stores facts, preferences, and context that survives session restarts.
---

# Persistent Memory Skill

Stop losing context every time your AI agent restarts. This skill gives your OpenClaw agent a memory layer that persists across sessions using Supabase.

## What It Does

- **Remembers facts** you tell it ("My database password is...")
- **Recalls preferences** ("I prefer TypeScript over Python")
- **Maintains project context** across conversations
- **Tags memories** by category for easy retrieval
- **Auto-expires** stale memories based on relevance

## Why This Matters

Default AI agents start fresh every conversation. They don't remember:
- Your coding style preferences
- Project architecture decisions
- API keys or connection strings you shared
- That bug you spent 20 minutes explaining yesterday

This skill fixes that.

## Requirements

- OpenClaw agent with tool access
- Supabase account (free tier works)
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in environment

## Quick Setup

### 1. Create Supabase Table

```sql
create table agent_memory (
  id uuid default gen_random_uuid() primary key,
  agent_key text not null,
  content text not null,
  category text default 'general',
  tags text[] default '{}',
  source text,
  importance int default 3 check (importance between 1 and 5),
  created_at timestamp with time zone default now(),
  last_accessed timestamp with time zone default now(),
  access_count int default 0,
  expires_at timestamp with time zone
);

-- Indexes for fast retrieval
create index idx_agent_memory_agent_key on agent_memory(agent_key);
create index idx_agent_memory_category on agent_memory(category);
create index idx_agent_memory_tags on agent_memory using gin(tags);

-- Enable RLS (configure policies for your setup)
alter table agent_memory enable row level security;
```

### 2. Configure Your Agent

Add to your agent's environment:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
AGENT_MEMORY_KEY=my-agent-001  # Unique per agent instance
```

### 3. Install the Skill

Copy this skill to your OpenClaw agent's skills directory.

## Usage

### Store a Memory

```
You: Remember that I prefer async/await over callbacks in Node.js
Agent: [Stores: "Prefers async/await over callbacks in Node.js" | category: coding-style]
```

### Recall Memories

```
You: What's my preferred coding style?
Agent: [Searches memory, finds stored preference]
You prefer async/await over callbacks in Node.js.
```

### Auto-Recall on Context

The skill automatically searches relevant memories when you mention:
- Project names
- Technologies (React, Docker, etc.)
- Categories you've used before

## Memory Categories

| Category | Use For | Example |
|----------|---------|---------|
| `coding-style` | Preferences, conventions | "Use semicolons" |
| `project-context` | Architecture decisions | "This uses microservices" |
| `credentials` | API keys, URLs (encrypted) | "Prod DB: postgres://..." |
| `preferences` | Personal settings | "Dark mode preferred" |
| `facts` | Domain knowledge | "Customer uses AWS" |

## How It Works

```
User Input
    ↓
Agent processes request
    ↓
[Memory Search] → Relevant memories found?
    ↓ Yes                           ↓ No
Inject into context            Continue normally
    ↓
Agent responds
    ↓
[Memory Store] → Worth remembering?
    ↓ Yes
Store for future sessions
```

## Advanced: Memory Scoring

Memories are ranked by relevance score:

```
score = (importance × 10) + 
        (access_count × 2) + 
        (recency_boost if accessed < 24h)
```

High-scoring memories auto-inject into context. Low-scoring memories expire.

## Integration Example

```javascript
// In your agent's message handler
const { searchMemory, storeMemory } = require('./skills/persistent-memory');

async function handleMessage(userInput) {
  // 1. Search for relevant memories
  const memories = await searchMemory(userInput);
  
  // 2. Inject into system prompt
  const context = memories.map(m => m.content).join('\n');
  
  // 3. Get response from LLM
  const response = await llm.complete(userInput, { context });
  
  // 4. Store anything worth remembering
  await storeMemory({
    content: extractFacts(response),
    category: 'auto-detected'
  });
  
  return response;
}
```

## Files

- `SKILL.md` — This documentation
- `scripts/memory-client.js` — Supabase client wrapper
- `scripts/search.js` — Semantic + keyword search
- `scripts/store.js` — Memory storage with deduplication

## Tips

1. **Start with high-importance memories** (importance: 5) for critical facts
2. **Use tags** for cross-cutting concerns (`tags: ['urgent', 'production']`)
3. **Review memories monthly** — delete stale ones
4. **Don't store PII** in plain text — encrypt or use secrets manager

## Related

- [Cortex Memory Framework](https://cortex.go) — Enterprise memory management
- [Supabase Vector](https://supabase.com/vector) — For semantic memory search

## License

MIT — Free for personal and commercial use.
