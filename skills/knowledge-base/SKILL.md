---
name: knowledge-base
description: Intelligent documentation management for OpenClaw. Index, search, and query your Markdown notes, documentation, and knowledge files using semantic search. Auto-indexes files on schedule, supports natural language queries, and surfaces relevant context when you need it.
---

# Knowledge Base Skill

## Purpose

Turn your scattered documentation into an intelligent, queryable knowledge base. This skill:
- Automatically indexes your Markdown files and documentation
- Enables semantic search across your entire knowledge corpus  
- Surfaces relevant context based on natural language queries
- Maintains your knowledge base with automatic re-indexing

Perfect for teams and individuals who need to organize documentation, notes, wikis, and reference materials.

## Requirements

- OpenClaw with file system access
- Node.js 18+ (for indexing scripts)
- Storage for index (local SQLite or Supabase)

## Installation

1. Copy this skill to your OpenClaw skills directory:
   ```bash
   cp -r skills/knowledge-base ~/.openclaw/skills/
   ```

2. Configure your knowledge base in `config.json`:
   ```json
   {
     "docsPath": "~/Documents/knowledge",
     "indexSchedule": "0 2 * * *",
     "storage": "sqlite"
   }
   ```

3. Run initial index:
   ```bash
   node ~/.openclaw/skills/knowledge-base/scripts/index.mjs
   ```

## Usage

### Natural Language Queries

Ask your knowledge base questions directly:

```
"What was our Q1 revenue target?"
"Find the deployment procedure for the API"
"Summarize our customer onboarding process"
"What did we decide about the pricing model?"
```

### Programmatic Search

Use the search API in your skills:

```javascript
import { searchKnowledgeBase } from './lib/search.mjs';

const results = await searchKnowledgeBase({
  query: "deployment checklist",
  limit: 5,
  threshold: 0.7
});
```

### Auto-Index Scheduling

The skill automatically re-indexes your docs on the schedule you set. This keeps the search current without manual work.

## How It Works

1. **Indexing**: Reads all `.md` files in your docs path
2. **Chunking**: Splits documents into semantic chunks
3. **Embedding**: Generates vector embeddings for each chunk
4. **Storage**: Saves to SQLite (local) or Supabase (shared)
5. **Query**: Converts questions to embeddings, finds nearest neighbors

## Configuration Options

| Option | Default | Description |
|--------|---------|-------------|
| `docsPath` | `~/Documents` | Path to your Markdown files |
| `indexSchedule` | `"0 2 * * *"` | Cron schedule for re-indexing |
| `storage` | `"sqlite"` | `sqlite` or `supabase` |
| `chunkSize` | `500` | Characters per chunk |
| `chunkOverlap` | `50` | Overlap between chunks |

## Example Queries

**Finding Information:**
- "What are our brand colors?"
- "Find the API authentication docs"
- "What's the procedure for incident response?"

**Synthesis:**
- "Summarize all meeting notes from March"
- "What decisions did we make about the migration?"
- "List all action items assigned to me"

**Discovery:**
- "What documentation exists about the checkout flow?"
- "Find anything related to GDPR compliance"
- "Show me notes about customer feedback"

## Files

```
knowledge-base/
├── SKILL.md              # This file
├── config.json           # Your configuration
├── scripts/
│   ├── index.mjs        # Manual indexing script
│   └── query.mjs        # CLI query tool
└── lib/
    ├── search.mjs       # Search API
    ├── embed.mjs        # Embedding generation
    └── store.mjs        # Storage abstraction
```

## Troubleshooting

**No results for common queries:**
- Check that your docsPath is correct
- Run manual index: `node scripts/index.mjs`
- Verify files are `.md` format

**Slow queries:**
- Reduce chunk size in config
- Use SQLite for local-only setups
- Add filters to narrow search scope

**Outdated results:**
- Index schedule may need adjustment
- Run manual re-index to refresh
- Check file permissions on docsPath

## Credits

Built for the OpenClaw community by Cortex. Inspired by the need to make documentation actually searchable.
