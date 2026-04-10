---
name: mcp-github-issues
description: Query GitHub issues using MCP (Model Context Protocol). Enables OpenClaw agents to search, filter, and analyze GitHub issues from any repository via MCP server integration. Perfect for developer workflows, project management, and automated issue triage.
author: Keiko Atlas <keiko@goorca.ai>
tags: [mcp, github, issues, developer-tools, automation, project-management]
requirements:
  - mcp-server-github configured and running
  - GitHub token with repo/issue access
  - OpenClaw 0.4.0+ with MCP support
---

# MCP GitHub Issues Skill

Query and analyze GitHub issues using the Model Context Protocol (MCP). This skill demonstrates how to connect OpenClaw agents to external tools through MCP servers.

## What It Does

- Search issues across repositories
- Filter by labels, assignees, and status
- Analyze issue patterns and trends
- Generate daily/weekly issue summaries
- Create automated triage workflows

## Prerequisites

### 1. Install MCP GitHub Server

```bash
npm install -g @modelcontextprotocol/server-github
# or
npx @modelcontextprotocol/server-github
```

### 2. Configure Environment

```bash
export GITHUB_PERSONAL_ACCESS_TOKEN="ghp_your_token_here"
```

Create a GitHub Personal Access Token at: https://github.com/settings/tokens

Required scopes: `repo`, `read:org`

### 3. Add to OpenClaw Config

In your OpenClaw `config.yaml`:

```yaml
mcp_servers:
  github:
    command: npx
    args: ["-y", "@modelcontextprotocol/server-github"]
    env:
      GITHUB_PERSONAL_ACCESS_TOKEN: "${GITHUB_PERSONAL_ACCESS_TOKEN}"
```

## Usage

### Basic Issue Search

```yaml
# In your OpenClaw agent config
skills:
  - mcp-github-issues

triggers:
  - pattern: "find issues in (?P<repo>[\\w/-]+)"
    action: search_issues
    params:
      repo: "{{repo}}"
      state: "open"
```

### Advanced Filtering

```yaml
triggers:
  - pattern: "bug triage for (?P<repo>[\\w/-]+)"
    action: filter_issues
    params:
      repo: "{{repo}}"
      labels: ["bug", "needs-triage"]
      state: "open"
      sort: "created"
      direction: "desc"
```

### Weekly Summary Report

```yaml
triggers:
  - schedule: "0 9 * * MON"
    action: weekly_summary
    params:
      repos:
        - "myorg/project-a"
        - "myorg/project-b"
      include_labels: ["bug", "feature", "enhancement"]
```

## Available Actions

### search_issues

Search for issues across repositories.

**Parameters:**
- `repo` (string): Repository in `owner/repo` format
- `query` (string, optional): Search query string
- `state` (string, optional): "open", "closed", or "all" (default: "open")
- `labels` (array, optional): Filter by labels
- `assignee` (string, optional): Filter by assignee username
- `sort` (string, optional): "created", "updated", "comments"
- `direction` (string, optional): "asc" or "desc"
- `limit` (number, optional): Max results (default: 30)

**Example:**
```json
{
  "repo": "openclaw/openclaw",
  "state": "open",
  "labels": ["bug", "regression"],
  "sort": "updated",
  "limit": 10
}
```

### get_issue

Get detailed information about a specific issue.

**Parameters:**
- `repo` (string): Repository in `owner/repo` format
- `issue_number` (number): Issue number

### create_issue_summary

Generate a summary report of issues for a repository.

**Parameters:**
- `repo` (string): Repository in `owner/repo` format
- `state` (string, optional): Filter by state
- `since` (string, optional): ISO 8601 date (e.g., "2025-01-01")
- `group_by` (string, optional): "label", "assignee", or "status"

### triage_issues

Automated triage workflow that categorizes issues.

**Parameters:**
- `repo` (string): Repository in `owner/repo` format
- `rules` (array): Array of triage rules
  - `condition`: Condition to match (e.g., "no_labels")
  - `action`: Action to take (e.g., "add_label:triage")

## Example Workflows

### Daily Standup Prep

Automatically gather issues updated in the last 24 hours:

```yaml
# schedule: 0 8 * * *
action: search_issues
params:
  repo: "myteam/our-project"
  state: "open"
  since: "{{now - 24h}}"
  sort: "updated"
```

### Bug Report Analysis

Find all bugs reported this week and analyze patterns:

```yaml
action: create_issue_summary
params:
  repo: "myteam/our-project"
  labels: ["bug"]
  since: "{{start_of_week}}"
  group_by: "label"
```

### Stale Issue Cleanup

Identify issues that haven't been updated in 30 days:

```yaml
action: search_issues
params:
  repo: "myteam/our-project"
  state: "open"
  sort: "updated"
  direction: "asc"
  limit: 50
# Then filter by last update date in your agent logic
```

## MCP Integration Details

This skill uses the MCP `tools/list` and `tools/call` methods to communicate with the GitHub MCP server.

### Tools Available from MCP Server

- `search_issues`: Search GitHub issues
- `get_issue`: Get issue details
- `list_issues`: List issues in a repository
- `create_issue`: Create a new issue
- `update_issue`: Update issue title/body/labels
- `add_issue_comment`: Add a comment to an issue

## Troubleshooting

### "MCP server not found"

Ensure the MCP server is installed and in your PATH:
```bash
which npx
npx @modelcontextprotocol/server-github --help
```

### "Bad credentials"

Check your GitHub token:
```bash
curl -H "Authorization: token $GITHUB_PERSONAL_ACCESS_TOKEN" \
  https://api.github.com/user
```

### Rate Limiting

GitHub API has rate limits (5000 requests/hour for authenticated users). For high-volume usage, implement caching in your agent.

## Security Notes

- Store `GITHUB_PERSONAL_ACCESS_TOKEN` securely (use environment variables, never commit to git)
- Use fine-grained tokens with minimal required permissions
- Consider using GitHub App tokens for organization-wide deployments
- The MCP server runs locally — your GitHub token never leaves your machine

## Related Skills

- `mcp-security-audit`: Security scanning for MCP servers
- `mcp-connector`: Generic MCP server connection manager
- `git-sync-agent`: Repository synchronization workflows

## Contributing

Found a bug or want to add features? Open an issue at:
https://github.com/thenatechambers/openclaw-skills-repo

## License

MIT License — See LICENSE file in repository root
