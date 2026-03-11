---
name: git-sync-agent
description: Version control your OpenClaw agent configuration with git. Exports agent state, skills, and memory to a git-compatible format for backup, rollback, and collaboration.
---

# Git Sync Agent Skill

> Version control for AI agents — because "it worked yesterday" isn't a strategy.

## What This Skill Does

Git Sync Agent treats your OpenClaw agent configuration like source code. It exports your complete agent state to a structured directory that can be:

- **Tracked in git** — See exactly what changed, when, and why
- **Rolled back** — Revert to a working configuration when things break
- **Shared** — Team members can fork, branch, and merge agent configs
- **Audited** — Compliance-friendly history of all agent changes

## The Problem

AI agents are fragile. One bad skill update, one changed prompt, one corrupted memory file — and your agent that worked perfectly yesterday is now hallucinating or failing. Without version control, you're flying blind.

**Real pain points:**
- "My agent was working fine last week, what changed?"
- "I need to undo that skill update but don't remember what it was"
- "My teammate broke the agent and I can't fix it"
- "Compliance requires audit trails for AI decisions"

## The Solution

This skill creates a git-native export of your OpenClaw agent:

```
agent-export/
├── agent.yaml              # Core configuration
├── AGENTS.md               # Agent identity and purpose
├── SOUL.md                 # Personality and behavioral rules
├── MEMORY.md               # Long-term memory snapshot
├── memory/
│   └── runtime/            # Session logs, daily decisions
├── skills/                 # All installed skills
│   ├── skill-name/
│   │   └── SKILL.md
│   └── ...
├── tools/                  # Tool configurations
└── .gitignore              # Secrets excluded automatically
```

## Installation

1. Copy this skill to `~/.openclaw/workspace/skills/git-sync-agent/`
2. Create an export directory: `mkdir -p ~/agent-git-backups`
3. Run the skill: "Export my agent to git"

## Usage

### One-Time Export

```bash
# From within OpenClaw
Run the git-sync-agent skill to export my agent configuration
```

The skill will:
1. Read your current agent configuration
2. Export all skills from `workspace/skills/`
3. Snapshot memory files
4. Generate `agent.yaml` with metadata
5. Write everything to `~/agent-git-backups/[agent-name]/`

### Daily Automated Sync

Add to your agent's crontab or heartbeat:

```markdown
# In your HEARTBEAT.md or cron config
Every 24 hours:
- Run git-sync-agent
- If changes detected, commit with timestamp
- Push to remote if configured
```

### First-Time Git Setup

```bash
cd ~/agent-git-backups/[agent-name]
git init
git add .
git commit -m "Initial agent export: $(date -u +%Y-%m-%d)"

# Optional: push to GitHub
git remote add origin git@github.com:yourusername/my-agent.git
git push -u origin main
```

### Rolling Back

When your agent breaks:

```bash
# See what changed
git diff HEAD~1

# Revert to last known good state
git checkout HEAD~1 -- .

# Or reset entirely
git reset --hard HEAD~3  # Go back 3 versions
```

Then restart your OpenClaw gateway to load the restored configuration.

## The Export Format

### agent.yaml

```yaml
spec_version: "1.0.0"
name: my-agent
version: 1.0.0
description: Personal productivity agent
author: your-name
export_date: 2026-03-11T23:00:00Z
agent_config:
  model: claude-sonnet-4-5-20250929
  thinking: off
  permissions:
    - read
    - edit
    - bash
    - browser
skills:
  - git-sync-agent
  - daily-briefing
  - email-security-filter
memory:
  type: file
  location: workspace/memory/
  last_backup: 2026-03-11T23:00:00Z
```

### Skills Export

Each skill is exported as a subdirectory with:
- `SKILL.md` — the skill definition
- Any referenced files from `references/`
- Scripts from `scripts/` (if present)

### Memory Export

Memory files are exported but secrets are excluded:

- ✅ Exported: `MEMORY.md`, daily logs, decision history
- ❌ Excluded: `.env`, API keys, tokens, credentials (via `.gitignore`)

## Integration with Cortex

If you're running this agent via [Cortex](https://cortex-pearl.vercel.app):

1. The export includes your Cortex workspace configuration
2. Skill versions are tracked separately from the agent
3. Multi-tenant deployments get isolated exports per workspace

## Best Practices

**Commit Messages**
Use descriptive messages:
```bash
git commit -m "Add competitor-research skill, update daily-brief prompt"
```

**Branching Strategy**
- `main` — Production agent config
- `develop` — Testing new skills
- `feature/skill-name` — Individual skill work

**Tagging Releases**
```bash
git tag -a v1.2.0 -m "Stable version with email filter skill"
git push origin v1.2.0
```

**Backup Frequency**
- Daily automated exports for active agents
- Before/after every skill installation
- Before major configuration changes

## Why This Matters

The [GitAgent](https://gitagent.sh) project is pioneering git-native AI agents — treating repositories as the source of truth for agent configuration. This skill brings that philosophy to OpenClaw:

- **Reproducibility** — Same config, same behavior
- **Collaboration** — Team members can review changes
- **Safety** — Rollback when things break
- **Compliance** — Audit trails for regulated industries

## Troubleshooting

**"Permission denied when writing export"**
→ Check that `~/agent-git-backups` exists and is writable

**"Skills not found in export"**
→ Verify `workspace/skills/` path is correct for your setup

**"Memory files too large"**
→ Add large files to `.gitignore` or use `git lfs`

**"Changes not detected"**
→ Ensure file timestamps are updating; some memory systems use append-only logs

## License

MIT — Use, modify, and distribute freely. Attribution appreciated.

---

*Built for OpenClaw and Cortex. Part of the [openclaw-skills-repo](https://github.com/thenatechambers/openclaw-skills-repo).*
