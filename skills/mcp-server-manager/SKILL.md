---
name: mcp-server-manager
description: Manage, configure, and audit MCP (Model Context Protocol) servers for Claude and OpenClaw. Discover available MCPs, validate configurations, track which servers are active, and generate setup commands for your OpenClaw agent. Perfect for teams using multiple MCP servers who need visibility and control over their AI tool ecosystem.
---

# MCP Server Manager

## Purpose

The MCP (Model Context Protocol) ecosystem is exploding — there are now MCP servers for GitHub, Slack, Postgres, Shopify, Figma, and hundreds more. But managing them is chaos:

- Which MCPs are installed and active?
- Are the configurations valid and up-to-date?
- Which servers have access to sensitive credentials?
- How do you onboard a new team member to your MCP stack?

This skill brings order to the chaos. It discovers, documents, validates, and manages your MCP server configurations with visibility and audit trails.

## What It Does

1. **Discovers** installed MCP servers from common locations
2. **Validates** configuration files for syntax and required fields
3. **Audits** which servers have access to credentials and sensitive scopes
4. **Generates** setup commands and documentation for team onboarding
5. **Tracks** MCP server versions and update availability

## Prerequisites

- OpenClaw CLI installed (`openclaw`)
- Access to your MCP configuration files (typically `claude_desktop_config.json` or `mcp.json`)
- Optional: GitHub token for fetching server metadata

## Quick Start

```bash
# Run a full MCP audit
openclaw skills run mcp-server-manager --action audit

# Generate team onboarding docs
openclaw skills run mcp-server-manager --action onboard --output ./mcp-docs

# Check for configuration issues
openclaw skills run mcp-server-manager --action validate
```

## Detailed Usage

### Action: `audit`

Scans your system for MCP configurations and produces a security and inventory report.

```bash
openclaw skills run mcp-server-manager --action audit --format markdown
```

**Output includes:**
- List of all configured MCP servers
- Which servers have credential access (env vars, API keys)
- Servers with network access (HTTP/WebSocket endpoints)
- File system access permissions by server
- Risk assessment (high/medium/low) for each server

**Example output:**
```markdown
# MCP Server Audit Report

## Summary
- Total servers: 5
- High risk: 1 (GitHub MCP - has repo access)
- Medium risk: 2
- Low risk: 2

## Servers with Credential Access
| Server | Credentials | Risk Level |
|--------|-------------|------------|
| github-mcp | GITHUB_TOKEN | HIGH |
| slack-mcp | SLACK_BOT_TOKEN | HIGH |
| postgres-mcp | DATABASE_URL | MEDIUM |
```

### Action: `validate`

Checks your MCP configuration files for common errors.

```bash
openclaw skills run mcp-server-manager --action validate --config ~/.config/claude/mcp.json
```

**Validates:**
- JSON syntax
- Required fields (name, command, args)
- Executable paths exist
- Environment variables are set
- No conflicting port assignments

### Action: `onboard`

Generates setup documentation for new team members.

```bash
openclaw skills run mcp-server-manager --action onboard --output ./docs --format markdown
```

**Generates:**
- `MCP_SETUP.md` — Complete setup instructions
- `env.example` — Template for required environment variables
- `mcp.json` — Working configuration to copy
- `TROUBLESHOOTING.md` — Common issues and fixes

### Action: `discover`

Queries the MCP server registry for available servers matching your needs.

```bash
# Find MCP servers for specific tools
openclaw skills run mcp-server-manager --action discover --category database

# Search by keyword
openclaw skills run mcp-server-manager --action discover --query "slack"
```

**Categories:** `database`, `cloud`, `communication`, `dev-tools`, `marketing`, `ai-ml`

### Action: `install`

Guided installation of a new MCP server.

```bash
openclaw skills run mcp-server-manager --action install --server github-mcp
```

**Guides you through:**
1. Installing the server package
2. Configuring required credentials
3. Testing the connection
4. Adding to your MCP configuration

## Configuration

Create `~/.openclaw/skills/mcp-server-manager/config.json`:

```json
{
  "mcp_config_paths": [
    "~/.config/claude/claude_desktop_config.json",
    "~/Library/Application Support/Claude/mcp.json",
    "./mcp.json"
  ],
  "default_format": "markdown",
  "registry_url": "https://registry.mcp-servers.io",
  "risk_levels": {
    "high": ["GITHUB_TOKEN", "AWS_ACCESS_KEY", "DATABASE_URL"],
    "medium": ["SLACK_TOKEN", "NOTION_TOKEN"],
    "low": ["general", "readonly"]
  },
  "auto_backup": true,
  "backup_dir": "~/.openclaw/mcp-backups"
}
```

## Integration with Cortex

This skill is designed to work seamlessly with Cortex deployments:

1. **Team-wide MCP management** — Run audits across your entire Cortex agent fleet
2. **Security compliance** — Ensure all agents use approved MCP servers only
3. **Configuration as code** — Store MCP configs in version control
4. **Automated onboarding** — New team members get working MCP setup automatically

### Cortex-Specific Example

```yaml
# cortex-deployment.yaml
skills:
  - name: mcp-server-manager
    schedule: "0 9 * * 1"  # Weekly audit
    config:
      action: audit
      alert_on_high_risk: true
      notify_channel: "#security-alerts"
```

## Recommended MCP Server Stack

Based on community adoption and security posture, here are Cortex-recommended MCP servers by use case:

### For Software Teams
- **github-mcp** — Repo management, PR reviews, issues
- **linear-mcp** — Project management integration
- **postgres-mcp** — Database queries (read-only recommended)
- **docs-mcp** — Documentation search and updates

### For Marketing Teams
- **slack-mcp** — Channel summaries, notifications
- **notion-mcp** — Content management
- **ga4-mcp** — Analytics reporting
- **webflow-mcp** — CMS updates

### For Operations
- **zendesk-mcp** — Support ticket handling
- **hubspot-mcp** — CRM operations
- **stripe-mcp** — Billing and payment queries
- **pagerduty-mcp** — Incident management

## Security Best Practices

1. **Least privilege** — Only enable MCP servers that are actively used
2. **Env var isolation** — Never hardcode credentials in MCP configs
3. **Regular audits** — Run `--action audit` weekly
4. **Network restrictions** — Prefer MCP servers that work offline or with limited egress
5. **Version pinning** — Pin MCP server versions to avoid supply chain attacks

## Troubleshooting

### MCP Server not appearing in Claude
```bash
# Check config is valid JSON
openclaw skills run mcp-server-manager --action validate

# Restart Claude Desktop after config changes
# On macOS: Cmd+Q and reopen
```

### Credential errors
```bash
# Verify env vars are set
openclaw skills run mcp-server-manager --action audit --show-env-status

# Check for typos in token names
```

### Slow MCP response
```bash
# Some MCP servers have cold-start latency
# Check server logs for errors
openclaw skills run mcp-server-manager --action logs --server <name>
```

## Contributing

Found a bug or want to add support for a new MCP registry? PRs welcome at:
https://github.com/thenatechambers/openclaw-skills-repo

## Resources

- [MCP Protocol Documentation](https://modelcontextprotocol.io)
- [Awesome MCP Servers](https://github.com/modelcontextprotocol/servers)
- [Cortex Documentation](https://docs.cortex.io)

---

**License:** MIT  
**Maintainer:** Cortex Team  
**Version:** 1.0.0
