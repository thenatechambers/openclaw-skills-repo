---
name: multi-user-memory-isolation
description: Lightweight user isolation for shared OpenClaw agents. Prevents memory cross-contamination between team members without requiring Kubernetes or containers.
---

# Multi-User Memory Isolation

Provides per-user memory isolation for OpenClaw agents running in shared environments. Perfect for teams where multiple people use the same agent instance but need separate contexts.

## What It Does

- Tags all memories with a `user_id` prefix automatically
- Filters memory retrieval to only show current user's context
- Supports Slack, Discord, Telegram, and custom user identification
- Includes admin tools for cross-user visibility when needed

## Installation

1. Copy this folder to your `skills/` directory
2. Add to your agent's `config.yaml`:

```yaml
skills:
  - multi-user-memory-isolation
```

## Configuration

The skill auto-detects the user from your channel:

| Channel | User ID Source |
|---------|----------------|
| Slack | `event.user` from message |
| Discord | `author.id` from message |
| Telegram | `from.id` from update |
| Custom | `USER_ID` environment variable |

### Optional Config

```yaml
# In your agent config
multi_user_isolation:
  # Tag format (default: "user:{user_id}")
  tag_template: "team:{workspace_id}/user:{user_id}"
  
  # Admin users who can see all contexts
  admin_users:
    - "admin@company.com"
    - "U12345678"  # Slack user ID
  
  # Shared context tags (all users see these)
  shared_tags:
    - "type:company_policy"
    - "type:shared_knowledge"
```

## Usage

### Automatic Isolation

Once enabled, the skill works automatically:

```javascript
// User A asks about "the project"
user_message: "What's the status of the project?"
// → Memory stored: "[user:alice] Q: project status"

// User B asks about "the project"
user_message: "What's the status of the project?"
// → Memory stored: "[user:bob] Q: project status"  
// → Retrieved context only from [user:bob] memories
```

### Admin Commands

```bash
# List all users with stored memories
node scripts/admin.js --list-users

# View a specific user's context
node scripts/admin.js --user alice --view

# Search across all users (admin only)
node scripts/admin.js --search "deadline" --all-users

# Export user context for migration
node scripts/admin.js --user alice --export > alice_memory.json
```

## How It Works

1. **Incoming Message**: Skill extracts `user_id` from channel metadata
2. **Memory Write**: Automatically prefixes memory with `[user:{id}]` tag
3. **Memory Read**: Injects filter to only retrieve matching user tags
4. **Response**: Agent responds based on isolated context

## Files

```
multi-user-memory-isolation/
├── SKILL.md              # This file
├── isolation.js          # Main skill logic
└── scripts/
    └── admin.js          # Admin CLI tools
```

## Requirements

- OpenClaw 2026.2.0 or later
- Node.js 18+
- Compatible with all OpenClaw channels (Slack, Discord, Telegram, etc.)

## License

MIT - Free for personal and commercial use
