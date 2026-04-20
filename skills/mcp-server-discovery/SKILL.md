---
name: mcp-server-discovery
description: Discover, evaluate, and manage MCP (Model Context Protocol) servers for your AI agents. Reduces context token consumption by up to 98% by selecting the right tools for your use case.
---

# MCP Server Discovery Skill

Find the right MCP servers to supercharge your AI agents while minimizing token costs.

## What is MCP?

MCP (Model Context Protocol) is the emerging standard for AI agent tool integration. Think of it as "USB-C for AI agents" — a universal way to connect your agent to external tools, databases, and services.

**Why it matters:** A well-designed MCP server can reduce your AI agent's context consumption by up to 98%, directly lowering API costs.

## This Skill Helps You

1. **Discover** — Search curated MCP server directories
2. **Evaluate** — Compare servers by cost impact, reliability, and use case fit
3. **Integrate** — Get installation and configuration instructions
4. **Optimize** — Monitor and manage your MCP server portfolio

## Quick Start

```bash
# Search for MCP servers by use case
python3 scripts/discover.py --query "database" --format table

# Get detailed info on a specific server
python3 scripts/discover.py --name "sqlite-mcp" --details

# Evaluate cost impact
python3 scripts/discover.py --compare sqlite-mcp,postgres-mcp --metric context-efficiency
```

## Top MCP Servers by Category

### 🗄️ Database & Storage
| Server | Use Case | Cost Impact | Popularity |
|--------|----------|-------------|------------|
| sqlite-mcp | Local SQLite operations | -95% context | High |
| postgres-mcp | PostgreSQL queries | -90% context | High |
| redis-mcp | Caching & sessions | -85% context | Medium |

### 🌐 Web & Browser
| Server | Use Case | Cost Impact | Popularity |
|--------|----------|-------------|------------|
| browserwing | Browser automation → MCP | -80% context | High |
| hyperbrowser | Scalable browser infra | -75% context | Medium |
| playwright-mcp | E2E testing automation | -70% context | Medium |

### 💬 Communication
| Server | Use Case | Cost Impact | Popularity |
|--------|----------|-------------|------------|
| whatsapp-mcp | WhatsApp integration | -60% context | High |
| slack-mcp | Slack bot operations | -65% context | Medium |
| email-mcp | Email sending/receiving | -55% context | Medium |

### 🔧 Development Tools
| Server | Use Case | Cost Impact | Popularity |
|--------|----------|-------------|------------|
| github-mcp | Repo operations | -70% context | High |
| ghidra-mcp | Reverse engineering | -88% context | Niche |
| docker-mcp | Container management | -60% context | Medium |

## Why MCP Reduces Costs

Traditional AI agent tool calling:
```
Agent → API documentation (1000s tokens) → API call → Parse response
```

With MCP:
```
Agent → MCP server (structured schema, 10s of tokens) → MCP call → Structured response
```

The MCP server handles the heavy lifting — documentation parsing, error handling, response formatting — so your agent only sees clean, structured data.

## Installation

### Step 1: Install the MCP server
```bash
# Most MCP servers are available via npm or pip
npm install -g @modelcontextprotocol/server-sqlite
# or
pip install mcp-server-postgres
```

### Step 2: Configure in your OpenClaw deployment
Add to your `openclaw.toml`:
```toml
[[mcp.servers]]
name = "sqlite"
command = "npx -y @modelcontextprotocol/server-sqlite /path/to/db.sqlite"
env = { "MCP_SQLITE_READONLY" = "true" }
```

### Step 3: Verify connection
```bash
openclaw mcp test --server sqlite
```

## Cost Reduction Calculator

Estimate your savings:

```python
# Without MCP (typical API-heavy workflow)
monthly_tokens_without_mcp = 50_000_000  # 50M tokens
avg_cost_per_1m_tokens = 3.00  # $3 per 1M tokens
monthly_cost_without = (monthly_tokens_without_mcp / 1_000_000) * avg_cost_per_1m_tokens
# = $150/month

# With MCP (90% context reduction)
reduction_factor = 0.90
monthly_tokens_with_mcp = monthly_tokens_without_mcp * (1 - reduction_factor)
monthly_cost_with = (monthly_tokens_with_mcp / 1_000_000) * avg_cost_per_1m_tokens
# = $15/month

savings = monthly_cost_without - monthly_cost_with
# = $135/month (90% reduction!)
```

## Recommended MCP Stack for Common Use Cases

### 💼 Business Automation Agent
- `slack-mcp` — team notifications
- `gmail-mcp` — email handling
- `calendar-mcp` — scheduling
- `sheets-mcp` — data logging

**Expected cost reduction:** 75-80%

### 🛠️ Developer Tooling Agent
- `github-mcp` — repo operations
- `docker-mcp` — container management
- `aws-mcp` — cloud operations
- `linear-mcp` — issue tracking

**Expected cost reduction:** 70-85%

### 📊 Data Analysis Agent
- `postgres-mcp` — database queries
- `bigquery-mcp` — analytics warehouse
- `sheets-mcp` — spreadsheet export
- `slack-mcp` — report distribution

**Expected cost reduction:** 80-95%

## Monitoring Your MCP Servers

Track efficiency over time:

```bash
# Generate weekly MCP efficiency report
python3 scripts/discover.py --report weekly --output markdown

# Sample output:
# ┌─────────────────┬──────────┬──────────────┬─────────────┐
# │ Server          │ Requests │ Avg Tokens   │ Cost Saved  │
# ├─────────────────┼──────────┼──────────────┼─────────────┤
# │ sqlite-mcp      │ 1,245    │ 45           │ $89.40      │
# │ github-mcp      │ 892      │ 120          │ $142.30     │
# │ slack-mcp       │ 456      │ 80           │ $45.60      │
# └─────────────────┴──────────┴──────────────┴─────────────┘
```

## Troubleshooting

### MCP server won't start
```bash
# Check server logs
openclaw mcp logs --server <name> --follow

# Verify configuration
openclaw mcp validate --config openclaw.toml
```

### High token usage despite MCP
- Ensure you're using `mcp://` protocol in tool calls
- Check that MCP server is actually being invoked (not falling back to direct API)
- Verify MCP server version is up to date

### Security considerations
- Run MCP servers with minimal permissions
- Use read-only database connections where possible
- Isolate MCP servers in containers for untrusted sources

## Resources

- **Official MCP Docs:** https://modelcontextprotocol.io
- **MCP Server Registry:** https://github.com/modelcontextprotocol/servers
- **Community Registry:** https://www.mcpoogle.com
- **Cost Analysis:** https://mksg.lu/blog/context-mode (the 98% reduction case study)

---

*Built for Cortex — AI agents that anyone can deploy.*
