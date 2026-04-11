---
name: knowledge-base
description: Intelligent documentation skill that organizes, indexes, and retrieves knowledge from your workspace. Automatically catalogs files, extracts key insights, and provides semantic search across your personal knowledge base. Perfect for researchers, writers, and anyone drowning in disorganized notes.
---

# Knowledge Base Skill

Turn your chaotic workspace into an intelligent, searchable knowledge system. This skill automatically indexes your files, extracts key insights, and lets you query your knowledge base using natural language.

## What It Does

- **Auto-Indexes Files**: Scans markdown, text, and code files in your workspace
- **Extracts Key Insights**: Pulls out important facts, decisions, and action items
- **Semantic Search**: Find information even when you don't remember exact filenames
- **Knowledge Graph**: Tracks relationships between topics, projects, and ideas
- **Daily Summaries**: Get briefings on what you worked on and what's pending

## Why You Need This

If you're like most knowledge workers, you have:
- Hundreds of notes scattered across folders
- No idea where you saved that brilliant idea from last month
- Duplicate research because you forgot you already looked something up
- A "read later" pile that never gets read

This skill fixes that by making your knowledge base work for you, not against you.

## Quick Start

1. Install the skill to your OpenClaw agent
2. Run `kb:init` to index your workspace
3. Use `kb:search "your query"` to find anything
4. Run `kb:daily` for a morning briefing on your knowledge

## Usage Examples

```bash
# Index your workspace
kb:init

# Search across all your notes
kb:search "Q4 marketing strategy"

# Find all decisions you made last week
kb:search "decided" --since 7d

# Get a summary of a specific project
kb:summarize --project "cortex-migration"

# Daily knowledge briefing
kb:daily
```

## Configuration

Add to your `config.yml`:

```yaml
knowledge_base:
  index_paths:
    - ./notes
    - ./research
    - ./projects
  exclude_patterns:
    - "*.tmp"
    - "node_modules/"
    - ".git/"
  auto_index: true
  index_frequency: "daily"
```

## How It Works

1. **File Discovery**: Recursively scans configured paths for indexable files
2. **Content Parsing**: Extracts text from markdown, code, and plain text files
3. **Insight Extraction**: Uses LLM to identify key facts, decisions, and TODOs
4. **Vector Indexing**: Creates embeddings for semantic search capability
5. **Relationship Mapping**: Links related topics and cross-references

## Integration with Other Skills

- **Calendar Brief**: Includes relevant knowledge in your daily brief
- **Meeting Assistant**: Links meeting notes to related project docs
- **Smart Notify**: Alerts you when you haven't reviewed important topics

## Requirements

- OpenClaw agent with file system access
- Vector database (Supabase pgvector recommended)
- Optional: Tavily API for web research linking

## License

MIT - Free for personal and commercial use.
