---
name: mcp-security-audit
description: "Audit your OpenClaw agent's MCP server connections for security vulnerabilities. Scopes permissions, detects high-risk tools, and generates security recommendations."
version: 1.0.0
author: Cortex Team
tags: ["security", "mcp", "audit", "safety", "openclaw"]
tier: standard
dependencies: []
---

# MCP Security Audit Skill

A security assessment tool for OpenClaw agents using Model Context Protocol (MCP) servers. Analyzes tool permissions, detects risky configurations, and provides actionable security recommendations.

## Why This Matters

AI agents using MCP can execute database queries, push code, send Slack messages, and run shell commands — often with no security boundary. This skill audits your setup and flags vulnerabilities before they become incidents.

## What It Does

- **Permission Analysis**: Maps which MCP tools have write access, network access, or system-level permissions
- **Risk Detection**: Identifies high-risk patterns (DROP TABLE, rm -rf, sudo, curl|bash)
- **Policy Generation**: Creates YAML security policies compatible with Kvlar-style firewalls
- **Audit Report**: Generates a comprehensive security scorecard

## Installation

```bash
# Copy to your OpenClaw skills directory
cp -r skills/mcp-security-audit ~/.openclaw/skills/

# Or use with Cortex (recommended)
# This skill runs automatically on agent bootstrap
```

## Usage

### Quick Audit

```bash
# Run full security audit
openclaw run skill mcp-security-audit

# Check specific MCP server
openclaw run skill mcp-security-audit --server slack-mcp

# Generate policy file only
openclaw run skill mcp-security-audit --output policy.yaml
```

### Manual Inspection

The skill reads your OpenClaw configuration and checks:

1. **MCP Server Scopes**: What permissions each server requests
2. **Tool Risk Levels**: Categorizes tools by potential damage (read vs write vs execute)
3. **Configuration Exposures**: Detects hardcoded tokens, overly broad permissions
4. **Network Exposure**: Flags tools that make external requests

### Example Output

```
╔═══════════════════════════════════════════════════════════╗
║           MCP SECURITY AUDIT REPORT                       ║
║                    2026-03-05                             ║
╠═══════════════════════════════════════════════════════════╣

OVERALL RISK SCORE: 7.2/10 (HIGH)

┌─ HIGH RISK MCP SERVERS ─────────────────────────────────┐
│ ⚠️  database-mcp                                         │
│     └─ Tools: query (can execute raw SQL)               │
│     └─ Risk: DROP TABLE, DELETE without WHERE           │
│     └─ Recommendation: Enable read-only mode            │
│                                                          │
│ ⚠️  shell-mcp                                            │
│     └─ Tools: execute (arbitrary shell commands)        │
│     └─ Risk: rm -rf, sudo escalation                    │
│     └─ Recommendation: Restrict to specific commands    │
└──────────────────────────────────────────────────────────┘

┌─ MEDIUM RISK ────────────────────────────────────────────┐
│ ⚡ slack-mcp                                             │
│     └─ Tools: send_message, update_status               │
│     └─ Risk: Accidental sensitive data exposure         │
│     └─ Recommendation: Add message approval workflow    │
└──────────────────────────────────────────────────────────┘

┌─ SECURITY POLICY RECOMMENDATIONS ────────────────────────┐
│ Save this to .openclaw/mcp-security-policy.yaml:        │
│                                                          │
│ policies:                                                │
│   database-mcp:                                          │
│     query:                                               │
│       block_patterns:                                    │
│         - "DROP TABLE"                                   │
│         - "DELETE.*WHERE"  # Require WHERE clause       │
│       require_approval: true                             │
│                                                          │
│   shell-mcp:                                             │
│     execute:                                             │
│       allowed_commands:                                  │
│         - "git"                                          │
│         - "npm"                                          │
│       blocked_patterns:                                  │
│         - "rm -rf /"                                     │
│         - "sudo"                                         │
│       require_approval: true                             │
└──────────────────────────────────────────────────────────┘
```

## Security Best Practices

### 1. Principle of Least Privilege
Only enable MCP tools your agent actually needs. If it doesn't need to delete data, don't give it DELETE permissions.

### 2. Approval Workflows
Configure OpenClaw to require human approval for:
- Database write operations
- Shell command execution
- External API calls with side effects
- File deletion operations

### 3. Pattern Blocking
Add regex patterns to block dangerous operations:
```yaml
blocked_patterns:
  - "DROP TABLE"
  - "DELETE FROM"  # Without WHERE
  - "rm -rf /"
  - "curl.*\\|.*sh"
  - "wget.*\\|.*bash"
```

### 4. Regular Audits
Run this skill weekly or after adding new MCP servers:
```bash
# Add to your crontab
0 9 * * 1 openclaw run skill mcp-security-audit --notify
```

### 5. Network Isolation
Run MCP servers in isolated environments:
```bash
# Use Docker for untrusted MCP servers
docker run --network=none --read-only mcp-untrusted
```

## Integration with Kvlar

This skill generates policies compatible with [Kvlar](https://github.com/kvlar-io/kvlar), the open-source MCP firewall:

```bash
# Generate Kvlar-compatible policy
openclaw run skill mcp-security-audit --format kvlar > kvlar-policy.yaml

# Run Kvlar with generated policy
kvlar --config kvlar-policy.yaml --mcp-server localhost:3000
```

## Risk Categories

| Level | Description | Examples |
|-------|-------------|----------|
| 🔴 Critical | Immediate system compromise | Arbitrary shell execution, sudo access |
| 🟠 High | Data loss or major impact | Raw SQL execution, file deletion |
| 🟡 Medium | Information disclosure | Slack messages, email sending |
| 🟢 Low | Read-only operations | File reading, search queries |

## Troubleshooting

**"No MCP servers detected"**
- Verify OpenClaw is configured with MCP servers
- Check `~/.openclaw/config.yaml` for MCP configuration

**"Permission denied reading config"**
- Run with appropriate permissions: `sudo openclaw run skill mcp-security-audit`
- Or adjust file permissions: `chmod 644 ~/.openclaw/config.yaml`

**"Policy file not generated"**
- Ensure output directory exists: `mkdir -p ~/.openclaw/policies`
- Check disk space and write permissions

## Advanced Configuration

Create `.openclaw/skills/mcp-security-audit/config.yaml`:

```yaml
# Custom risk rules
risk_rules:
  high:
    - pattern: "DROP TABLE"
      severity: critical
    - pattern: "DELETE FROM"
      severity: high
      condition: "missing_where_clause"
  
  medium:
    - pattern: "send_email"
      severity: medium
    - pattern: "post_to_slack"
      severity: medium

# Ignore list
ignore_servers:
  - "test-mcp"
  - "local-dev-mcp"

# Output settings
output:
  format: "json"  # or "yaml", "table"
  destination: "~/.openclaw/audit-reports/"
  notify_on_high_risk: true
```

## About Cortex

This skill is part of the Cortex agent platform — deploy AI agents with built-in security, memory, and workflow orchestration.

**[Deploy your secure AI agent →](https://cortex-pearl.vercel.app)**

---

*Version 1.0.0 | MIT License | Maintained by Cortex Team*
