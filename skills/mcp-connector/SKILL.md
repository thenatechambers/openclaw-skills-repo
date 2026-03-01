---
name: mcp-connector
description: Discover, configure, and connect to MCP (Model Context Protocol) servers from OpenClaw. Queries the MCP registry, validates server capabilities, and generates connection configs. Essential for extending your agent with external tools like GitHub, PostgreSQL, Slack, and more.
---

# MCP Connector Skill

## What It Does

The MCP Connector skill helps you find and connect to MCP (Model Context Protocol) servers—standardized interfaces that let AI agents use external tools and data sources.

Instead of manually searching GitHub for MCP servers and figuring out configuration, this skill:
1. **Discovers** available MCP servers from the public registry
2. **Validates** server capabilities and requirements
3. **Generates** ready-to-use configuration for your OpenClaw setup

## Why MCP Matters

MCP is quickly becoming the standard way to connect AI agents to external tools. Think of it as USB-C for AI—one protocol, endless peripherals.

Popular MCP servers include:
- **GitHub** — Read repos, create issues, manage PRs
- **PostgreSQL** — Query databases directly
- **Slack** — Send messages, read channels
- **Puppeteer** — Browser automation
- **Filesystem** — Safe file operations

## Quick Start

### Step 1: Search for MCP Servers

```bash
# List all available MCP servers
node /path/to/openclaw-skills-repo/skills/mcp-connector/scripts/discover.js

# Search for specific capability
node /path/to/openclaw-skills-repo/skills/mcp-connector/scripts/discover.js --search github
```

### Step 2: Generate Config

```bash
# Generate config for a specific server
node /path/to/openclaw-skills-repo/skills/mcp-connector/scripts/configure.js --server github
```

This outputs a JSON block you can add to your OpenClaw `claw.json`:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your-token-here"
      }
    }
  }
}
```

### Step 3: Restart OpenClaw

After adding the config, restart OpenClaw. Your agent now has access to the MCP server's tools.

## Available Scripts

### `discover.js`

Queries the MCP server registry and returns available servers.

```bash
node discover.js [options]

Options:
  --search <term>    Filter by keyword (e.g., "github", "database")
  --category <cat>   Filter by category (tools, data, comms)
  --json             Output as JSON
```

### `configure.js`

Generates configuration for a specific MCP server.

```bash
node configure.js --server <name> [options]

Options:
  --server <name>    Required. Server name from registry
  --output <format>  json|yaml|env (default: json)
  --env-prefix       Prefix environment variables
```

### `validate.js`

Tests if an MCP server is properly configured and reachable.

```bash
node validate.js --server <name>

Outputs: ✓ Server responding | Tools available: list, of, tools
```

## Example Workflows

### Connect to GitHub

```bash
node discover.js --search github
# → Found: @modelcontextprotocol/server-github

node configure.js --server github
# → Paste this into your claw.json mcpServers section

# Add your GitHub token to env, restart OpenClaw
# Now your agent can: search repos, read code, create issues
```

### Connect to PostgreSQL

```bash
node discover.js --search postgres
node configure.js --server postgres --output env
# → Outputs: POSTGRES_HOST=, POSTGRES_PORT=5432, etc.
```

### Bulk Configure Multiple Servers

```bash
node discover.js --json | jq -r '.[].name' | while read server; do
  node configure.js --server "$server" --output json
  echo "---"
done > all-mcp-configs.json
```

## Requirements

- Node.js 18+
- OpenClaw with MCP support (v0.8+)
- For each MCP server: its specific environment variables (tokens, URLs, etc.)

## Security Notes

- MCP servers run as separate processes—inspect code before installing
- Store tokens in environment variables, never in version control
- Use read-only tokens when possible (especially for GitHub)
- The `filesystem` server respects `.gitignore` by default

## Troubleshooting

**"MCP server not found"**
→ Run `discover.js` to see available servers. The registry updates frequently.

**"Connection refused"**
→ Check the server is running: `node validate.js --server <name>`

**"Authentication failed"**
→ Verify environment variables are set in your shell before starting OpenClaw

**"Tool not available"**
→ Some MCP servers require specific permissions. Check the server's README.

## Resources

- [MCP Specification](https://modelcontextprotocol.io)
- [Official MCP Servers](https://github.com/modelcontextprotocol/servers)
- [OpenClaw MCP Docs](https://openclaw.ai/docs/mcp)

---

*This skill is part of the Cortex OpenClaw Skills Collection. For more skills, visit [github.com/thenatechambers/openclaw-skills-repo](https://github.com/thenatechambers/openclaw-skills-repo)*
