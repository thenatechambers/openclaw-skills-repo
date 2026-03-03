---
name: agent-coordinator
description: Keep multiple AI agents synchronized with shared state. Prevents context drift when running parallel Claude Code instances or OpenClaw agents by maintaining a single source of truth in Supabase or local JSON.
---

# Agent Coordinator Skill

Solve the "parallel agents lying to each other" problem. When you run multiple Claude Code instances or OpenClaw agents in parallel (different terminals, tmux panes, or even different machines), each develops its own version of reality within hours. This skill keeps them synchronized.

## The Problem

From HN user CloakHQ:
> "Each tmux pane has its own session state, so you end up with agents that 'know' different versions of reality by the second hour."

**Common symptoms:**
- Agent A refactors a function while Agent B is still calling the old version
- Two agents create conflicting database migrations
- One agent deletes a file another agent is editing
- Agents duplicate work because they don't see each other's progress

## The Solution

A lightweight coordination layer that provides:
1. **Shared state** — What has been done, what's being worked on, what's next
2. **Agent registry** — Who's working on what right now
3. **Ground truth** — The canonical spec that all agents check before acting

## Quick Start

### Option 1: Local JSON (Single Machine)

```bash
# 1. Copy the skill to your workspace
cp -r skills/agent-coordinator ~/workspace/skills/

# 2. Initialize the coordinator
cd ~/workspace/skills/agent-coordinator
node scripts/init.js --backend json --path ./shared-state.json

# 3. In each agent session, activate the coordinator
source scripts/activate.sh

# 4. Your agent can now use these commands:
agent-coordinator check-in "Working on user auth module"
agent-coordinator update-state "auth/login.js" "refactoring"
agent-coordinator claim-task "Fix password validation"
agent-coordinator release-task
agent-coordinator read-ground-truth
```

### Option 2: Supabase (Multi-Machine)

```bash
# 1. Set your Supabase credentials
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_ANON_KEY="your-anon-key"

# 2. Initialize with Supabase backend
node scripts/init.js --backend supabase

# 3. The coordination commands work the same way
agent-coordinator claim-task "Update API docs"
```

## How It Works

### State Structure

```json
{
  "project": "my-app",
  "version": 47,
  "last_updated": "2026-03-03T14:32:00Z",
  "agents": {
    "agent-1": {
      "status": "active",
      "current_task": "Refactor login flow",
      "started_at": "2026-03-03T13:00:00Z",
      "last_ping": "2026-03-03T14:30:00Z"
    },
    "agent-2": {
      "status": "idle",
      "current_task": null
    }
  },
  "tasks": {
    "auth-refactor": {
      "status": "in_progress",
      "claimed_by": "agent-1",
      "claimed_at": "2026-03-03T13:00:00Z"
    },
    "api-docs": {
      "status": "available"
    }
  },
  "ground_truth": {
    "architecture": "The app uses Next.js with Supabase auth...",
    "invariants": [
      "Never modify the database schema without a migration",
      "Always run tests before committing"
    ],
    "recent_changes": [
      "2026-03-03: Extracted auth logic to lib/auth.ts",
      "2026-03-02: Added password strength validation"
    ]
  }
}
```

### Coordination Commands

| Command | Purpose |
|---------|---------|
| `check-in "message"` | Announce what you're working on |
| `claim-task "task-name"` | Lock a task so other agents don't duplicate it |
| `release-task` | Mark current task as done |
| `update-state "key" "value"` | Update shared state |
| `read-ground-truth` | Get the canonical spec before acting |
| `list-agents` | See who's active and what they're doing |
| `ping` | Update your last-seen timestamp |

## Integration with Claude Code

Add this to your Claude Code config (`~/.claude/config.json`):

```json
{
  "tools": [{
    "name": "agent_coordinator",
    "description": "Check shared state before making changes",
    "command": "node ~/workspace/skills/agent-coordinator/scripts/query.js"
  }]
}
```

Then in any Claude Code session:

```
> Check the coordinator before I refactor the database
[Claude queries shared state and sees Agent B is already editing schema]
> It looks like another agent is currently modifying the database schema. 
> Let me wait for them to finish, or I can work on the API layer instead.
```

## Integration with OpenClaw

Add to your agent's SKILL.md:

```yaml
# In your skill's SKILL.md
tools:
  - agent-coordinator:
      before_file_write: "check_for_conflicts"
      before_command: "read_ground_truth"
```

## Advanced: Conflict Detection

The coordinator can detect potential conflicts:

```bash
# Before editing a file, check if another agent has it locked
agent-coordinator check-file lib/database.ts
# Output: WARNING: Agent agent-2 has been editing lib/database.ts in the last 5 minutes

# Get a summary of recent changes before you start
agent-coordinator recent-changes --minutes 30
# Output: 
# - agent-1: Modified src/auth/login.ts (20 min ago)
# - agent-2: Created migration/003_add_user_profile.sql (5 min ago)
```

## Why This Beats Other Approaches

| Approach | Problem | This Solution |
|----------|---------|---------------|
| tmux + parallel agents | Context drift, no shared state | Central state + coordination commands |
| Kubernetes (Axon) | Heavy, ops-intensive | Lightweight, works locally |
| Shared Markdown Specs | Static, agents don't update them | Dynamic, agents write updates |
| Git-based coordination | Too slow for rapid iteration | Real-time state sync |

## Real-World Example

**Scenario:** Three agents working on a feature:

```bash
# Terminal 1 - Agent Alpha
$ agent-coordinator claim-task "Backend API"
$ # ... works on API ...

# Terminal 2 - Agent Beta  
$ agent-coordinator list-tasks
# Available: Frontend components, Tests
# In progress: Backend API (Agent Alpha)
$ agent-coordinator claim-task "Frontend components"

# Terminal 3 - Agent Gamma
$ agent-coordinator read-ground-truth
# Sees: "API being built by Alpha, frontend by Beta"
$ agent-coordinator claim-task "Tests"
$ # Can write tests against API schema that Alpha published to ground truth
```

## Files

```
agent-coordinator/
├── SKILL.md              # This file
└── scripts/
    ├── init.js           # Initialize coordinator
    ├── activate.sh       # Shell helpers
    ├── coordinator.js    # Core coordination logic
    └── query.js          # Query tool for Claude Code
```

## Requirements

- Node.js 18+
- For Supabase backend: Supabase project (free tier works)
- For JSON backend: Local filesystem access

## License

MIT — Free to use, modify, distribute.

---

*Built for the Cortex community. Want managed agent coordination at scale? [Check out Cortex →](https://cortex-pearl.vercel.app)*
