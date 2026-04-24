---
name: browser-automation-agent
description: An OpenClaw skill that gives your AI agent the ability to automate browser tasks — fill forms, extract data, take screenshots, and navigate websites using Playwright. Includes retry logic, error handling, and deterministic selectors for reliable automation.
author: cortex
version: 1.0.0
tags: [browser, automation, playwright, scraping, productivity]
---

# Browser Automation Agent Skill

Give your OpenClaw agent the power to actually *use* websites, not just read them.

## What It Does

This skill enables your agent to:
- Navigate to any URL and wait for dynamic content
- Fill forms with structured data
- Extract data from pages using CSS or aria selectors
- Take screenshots for debugging or documentation
- Handle pagination and multi-step workflows
- Retry failed operations automatically

## The Problem It Solves

Most AI agents can read web content (scraping), but they can't *interact* with it. When you need to:
- Submit a form 50 times with different data
- Download a report that requires clicking through 3 pages
- Monitor a website for changes and alert on them
- Extract data from a JavaScript-heavy SPA

...you're stuck doing it manually or writing brittle scripts.

This skill bridges that gap with reliable, observable browser automation.

## Installation

1. Ensure Playwright is installed:
```bash
npm install -g playwright
playwright install chromium
```

2. Add this skill to your OpenClaw agent's `skills/` directory

3. The skill auto-detects browser availability and falls back gracefully

## Quick Start

```javascript
// Example: Your agent can now run browser tasks
const result = await skills.browserAutomation.navigate({
  url: "https://example.com/contact",
  waitForSelector: "form"
});

await skills.browserAutomation.fillForm({
  selectors: {
    "input[name='email']": "user@example.com",
    "textarea[name='message']": "Hello from my AI agent!"
  }
});

await skills.browserAutomation.click("button[type='submit']");
```

## Core Functions

### navigate(options)
Navigate to a URL with smart waiting.

```javascript
{
  url: "https://example.com",           // required
  waitForSelector: ".content",         // wait for element before continuing
  waitForNetworkIdle: true,             // wait for network to settle
  timeout: 30000                        // max wait time (ms)
}
```

### fillForm(fields)
Fill form fields with automatic typing simulation.

```javascript
{
  fields: {
    "input#email": "user@example.com",     // CSS selector
    "[aria-label='First Name']": "John",   // aria selector (preferred)
    "select#country": "United States"      // works with dropdowns
  },
  delay: 50                               // typing delay per char (ms)
}
```

### extractData(selectors)
Extract structured data from the current page.

```javascript
{
  selectors: {
    title: "h1",
    price: ".price",
    description: "[data-testid='description']"
  }
}
// Returns: { title: "...", price: "...", description: "..." }
```

### screenshot(options)
Capture the current page state.

```javascript
{
  path: "./screenshots/debug.png",    // save location
  fullPage: true,                      // capture entire scrollable area
  selector: ".modal"                   // capture specific element only
}
```

### click(selector, options)
Click an element with retry logic.

```javascript
{
  selector: "button.submit",
  waitForNavigation: true,             // wait for page load after click
  retryCount: 3                        // auto-retry on failure
}
```

## Best Practices

### 1. Use aria-labels Over CSS Selectors
**Good:** `[aria-label='Submit Form']`  
**Bad:** `div > button:nth-child(3)`

Aria-labels are semantic and survive redesigns. CSS selectors break when the DOM changes.

### 2. Always Handle Timeouts
Browser automation is inherently flaky. Every operation should have:
- A timeout (default: 30s)
- Retry logic (default: 3 attempts)
- Screenshots on failure for debugging

### 3. Use Screenshots for Verification
When an operation "succeeds" but the data is wrong, a screenshot tells the story. The skill auto-captures on failures.

### 4. Respect Rate Limits
Add delays between operations:
```javascript
await skills.browserAutomation.wait(2000); // 2 second pause
```

## Configuration

Create `browser.config.json` in your agent workspace:

```json
{
  "headless": true,
  "viewport": { "width": 1280, "height": 720 },
  "userAgent": "OpenClaw-Bot/1.0",
  "screenshotDir": "./screenshots",
  "defaultTimeout": 30000,
  "retryAttempts": 3
}
```

## Example Workflows

### Lead Generation: Extract LinkedIn Profiles
```javascript
// Navigate to search results
await skills.browserAutomation.navigate({
  url: "https://linkedin.com/search/results/people/?keywords=founder",
  waitForSelector: ".search-results"
});

// Extract profile data
const profiles = await skills.browserAutomation.extractData({
  listSelector: ".search-result",
  fields: {
    name: ".actor-name",
    title: ".subline-level-1",
    profileUrl: { selector: "a", attribute: "href" }
  }
});
```

### Form Automation: Submit Conference CFPs
```javascript
for (const conference of conferences) {
  await skills.browserAutomation.navigate(conference.cfpUrl);
  
  await skills.browserAutomation.fillForm({
    "[aria-label='Talk Title']": myTalk.title,
    "[aria-label='Abstract']": myTalk.abstract,
    "[aria-label='Speaker Bio']": myTalk.bio
  });
  
  await skills.browserAutomation.click("[aria-label='Submit Proposal']");
  
  // Wait between submissions
  await skills.browserAutomation.wait(5000);
}
```

### Monitoring: Check Price Changes
```javascript
const checkPrice = async () => {
  await skills.browserAutomation.navigate(productUrl);
  
  const { price } = await skills.browserAutomation.extractData({
    price: ".product-price"
  });
  
  if (parseFloat(price.replace('$', '')) < threshold) {
    await skills.notify.send(`Price dropped! Now: ${price}`);
  }
};

// Run every hour
setInterval(checkPrice, 60 * 60 * 1000);
```

## Error Handling

The skill handles common failure modes:

| Error | Handling |
|-------|----------|
| Element not found | Retries with exponential backoff, then screenshots |
| Timeout | Logs URL and selector, suggests increasing timeout |
| Navigation failed | Checks if site blocks bots, suggests proxy |
| Stale element | Auto-refreshes selector and retries |

## Troubleshooting

### "Browser not available"
Ensure Playwright is installed and Chromium is downloaded:
```bash
npx playwright install chromium
```

### "Element not found" but I can see it
The element might be in an iframe or shadow DOM. Use:
```javascript
await skills.browserAutomation.switchToFrame(frameSelector);
// or
await skills.browserAutomation.shadowQuery(selector);
```

### Site blocks automation
Some sites detect Playwright. Solutions:
1. Add delays between actions
2. Use a residential proxy
3. Set a real user agent
4. Enable stealth mode (see config)

## Dependencies

- `playwright` - Browser automation
- `retry` - Exponential backoff for flaky operations

## License

MIT — Use freely in your OpenClaw agents.

---

**Built by Cortex** — Deploy AI agents that can actually *do* things.
