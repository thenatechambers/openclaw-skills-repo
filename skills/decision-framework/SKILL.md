---
name: decision-framework
description: Apply structured decision-making frameworks (Six Thinking Hats, First Principles, Eisenhower Matrix) to any problem. Logs decisions to persistent memory for learning over time.
author: cortex
version: 1.0.0
tags: [decision-making, productivity, thinking-frameworks, memory]
---

# Decision Framework Skill

Apply structured thinking to complex decisions. This skill guides you through proven decision-making frameworks and logs your decisions for future reference.

## Supported Frameworks

| Framework | Best For | Duration |
|-----------|----------|----------|
| **Six Thinking Hats** | Complex decisions with multiple stakeholders | 15-30 min |
| **First Principles** | Breaking down problems to fundamentals | 10-20 min |
| **Eisenhower Matrix** | Prioritization and time management | 5-10 min |
| **Pros/Cons** | Binary yes/no decisions | 5-10 min |
| **Pre-Mortem** | Risk assessment before committing | 10-15 min |

## Quick Start

```bash
# Run a Six Thinking Hats analysis on your decision
./decision-framework.sh --framework six-hats --decision "Should we pivot to B2B?"

# Log decision to memory (requires memory_write tool)
./decision-framework.sh --framework first-principles --decision "How to reduce infra costs?" --save
```

## Usage

### Six Thinking Hats

The skill guides you through all six perspectives:

1. **White Hat** — Facts and data: What do we know?
2. **Red Hat** — Emotions and intuition: What does your gut say?
3. **Black Hat** — Caution and risks: What could go wrong?
4. **Yellow Hat** — Benefits and optimism: What's the upside?
5. **Green Hat** — Creativity: What alternatives exist?
6. **Blue Hat** — Process control: What's our decision?

### First Principles Analysis

Breaks down the decision:
- What are the fundamental truths?
- What assumptions am I making?
- What's the optimal solution if built from scratch?
- How does this compare to our current approach?

### Eisenhower Matrix

Categorizes tasks/choices into:
- **Urgent + Important:** Do first
- **Important + Not Urgent:** Schedule
- **Urgent + Not Important:** Delegate
- **Neither:** Eliminate

## Memory Integration

When run with `--save`, the skill logs:
- Decision context (framework used, question asked)
- Key insights from each framework step
- Final decision and rationale
- Timestamp and tags

This creates a searchable decision history, allowing your agent to:
- Reference similar past decisions
- Identify patterns in your decision-making
- Suggest frameworks based on decision type

## Example Output

```
=== Decision Framework: Six Thinking Hats ===
Decision: Should we migrate from Postgres to ClickHouse?

🎩 White Hat (Facts):
- Current: 500M rows, query latency ~200ms
- ClickHouse benchmark: 10x faster for analytics queries
- Migration effort: ~2 weeks engineering time

❤️ Red Hat (Emotions):
- Team feels confident about the tech
- Concern about operational complexity
- Excitement about performance gains

⚫ Black Hat (Risks):
- Operational learning curve
- Backup/recovery procedures need updating
- Potential data consistency issues during migration

... (continues through all hats)

✅ Decision: Proceed with phased migration
   Start with read-only analytics tables
   Keep Postgres for transactional data
   Review in 30 days

💾 Saved to memory: decision_log/2026-05-01-migration-decision
```

## Requirements

- OpenClaw agent with bash tool access
- Optional: memory_write tool for persistence

## Files

- `decision-framework.sh` — Main script
- `frameworks/` — Individual framework implementations
- `templates/` — Output templates for each framework

## License

MIT — Free for personal and commercial use.
