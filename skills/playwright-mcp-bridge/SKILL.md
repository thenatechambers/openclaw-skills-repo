---
name: playwright-mcp-bridge
description: Browser automation for OpenClaw agents using MCP-style tool definitions. Exposes Playwright browser control through a standardized tool interface—screenshot, click, type, extract, navigate. The fastest way to give your agent eyes and hands for the web.
---

# Playwright MCP Bridge

## What It Does

This skill gives your OpenClaw agent **browser superpowers** using Playwright automation, exposed through an MCP-style tool interface.

Instead of cobbling together custom scripts for every web task, you get a standardized set of browser tools that any agent can use:

| Tool | What It Does |
|------|--------------|
| `browser_navigate` | Go to a URL and wait for load |
| `browser_screenshot` | Capture full page or element |
| `browser_click` | Click an element by selector or text |
| `browser_type` | Type text into inputs |
| `browser_extract` | Pull text/data from the page |
| `browser_scroll` | Scroll and wait for lazy content |
| `browser_wait` | Wait for element or timeout |

## Why This Matters

**The Problem:** Agents need to interact with the web, but browser automation is messy. Every site is different. Scripts break. Selectors change. Credentials are scattered.

**The MCP Pattern:** Model Context Protocol defines how agents discover and use tools. This skill applies that pattern to browser automation—making it **composable, discoverable, and reliable**.

**The Result:** Your agent can research competitors, fill forms, monitor pages, extract data, and take actions—all through a clean, consistent interface.

## Quick Start

### 1. Install Dependencies

```bash
cd /path/to/openclaw-skills-repo/skills/playwright-mcp-bridge
npm install playwright
npx playwright install chromium
```

### 2. Run a Browser Session

```bash
node scripts/browser-tools.js --action navigate --url "https://news.ycombinator.com"
```

### 3. Use as MCP Tools

Each script can output tool definitions for your agent:

```bash
node scripts/browser-tools.js --discover
```

Outputs MCP-compatible tool definitions:

```json
{
  "tools": [
    {
      "name": "browser_navigate",
      "description": "Navigate to a URL and wait for page load",
      "parameters": {
        "url": { "type": "string", "required": true },
        "waitUntil": { "type": "string", "default": "networkidle" }
      }
    },
    {
      "name": "browser_screenshot", 
      "description": "Capture screenshot of page or element",
      "parameters": {
        "path": { "type": "string", "required": true },
        "selector": { "type": "string" },
        "fullPage": { "type": "boolean", "default": false }
      }
    }
  ]
}
```

## Usage Examples

### Research a Competitor's Pricing

```bash
# Navigate and screenshot pricing page
node scripts/browser-tools.js \
  --action navigate \
  --url "https://competitor.com/pricing"

node scripts/browser-tools.js \
  --action screenshot \
  --path "/tmp/pricing.png" \
  --fullPage true

# Extract pricing text
node scripts/browser-tools.js \
  --action extract \
  --selector ".pricing-card" \
  --output json
```

### Monitor a Page for Changes

```bash
# Save current state
node scripts/browser-tools.js \
  --action extract \
  --url "https://example.com/status" \
  --selector ".status-text" \
  --output "/tmp/status-check.json"

# Compare later (use in a scheduled skill)
```

### Fill and Submit a Form

```bash
# Navigate
node scripts/browser-tools.js --action navigate --url "https://example.com/form"

# Fill fields
node scripts/browser-tools.js --action type --selector "#name" --text "John Doe"
node scripts/browser-tools.js --action type --selector "#email" --text "john@example.com"

# Click submit
node scripts/browser-tools.js --action click --selector "button[type=submit]"

# Screenshot confirmation
node scripts/browser-tools.js --action screenshot --path "/tmp/confirmation.png"
```

## Tool Reference

### browser_navigate
```bash
node scripts/browser-tools.js --action navigate --url "https://example.com" [--waitUntil load|domcontentloaded|networkidle]
```

### browser_screenshot  
```bash
node scripts/browser-tools.js --action screenshot --path "/tmp/capture.png" [--selector "#element"] [--fullPage true]
```

### browser_click
```bash
node scripts/browser-tools.js --action click --selector "button.submit" [--text "Submit"] [--timeout 5000]
```

### browser_type
```bash
node scripts/browser-tools.js --action type --selector "#input" --text "value to type" [--clear true]
```

### browser_extract
```bash
node scripts/browser-tools.js --action extract --selector ".article" [--attribute href] [--output json|text]
```

### browser_scroll
```bash
node scripts/browser-tools.js --action scroll --direction down [--amount 3] [--wait 1000]
```

### browser_wait
```bash
node scripts/browser-tools.js --action wait --selector ".loaded" [--timeout 10000]
```

## Advanced: Custom User Agents & Auth

Set environment variables for persistent sessions:

```bash
export BROWSER_USER_AGENT="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"
export BROWSER_COOKIES_PATH="/path/to/cookies.json"
export BROWSER_HEADLESS="false"  # For debugging
```

## Integration with OpenClaw

Add to your agent's skills:

```json
{
  "skills": [
    {
      "name": "playwright-mcp-bridge",
      "path": "/path/to/openclaw-skills-repo/skills/playwright-mcp-bridge",
      "tools": ["browser_navigate", "browser_screenshot", "browser_click", "browser_type", "browser_extract"]
    }
  ]
}
```

## Why MCP-Style?

The Model Context Protocol isn't just a spec—it's a **design philosophy**:

1. **Discoverability:** Tools describe themselves
2. **Composability:** Tools chain together  
3. **Reliability:** Consistent interfaces reduce errors
4. **Portability:** Same tools work across different agents

This skill brings that philosophy to browser automation. Instead of one-off scripts, you get a **reusable toolkit** that grows with your needs.

## Troubleshooting

**"Browser not found"**
```bash
npx playwright install chromium
```

**"Selector not found"**
- Use `--timeout 10000` to wait longer
- Check if the element is in an iframe
- Try text-based selection: `--text "Click Me"`

**"Page load timeout"**
- Some sites block automation. Try:
  - Custom user agent
  - Different `--waitUntil` value
  - Headful mode for debugging: `--headless false`

## Next Steps

1. Clone this skill into your OpenClaw setup
2. Run the examples above
3. Build your own workflows
4. Share what you create

---

*Part of the OpenClaw Skills Registry. Built for agents, by agents.*
