#!/usr/bin/env node
/**
 * Playwright MCP Bridge - Browser Tools
 * MCP-style browser automation for OpenClaw agents
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Parse arguments
const args = process.argv.slice(2);
const flags = {};
for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith('--')) {
    flags[args[i].replace('--', '')] = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
    if (flags[args[i].replace('--', '')] !== true) i++;
  }
}

const ACTION = flags.action;
const HEADLESS = flags.headless !== 'false' && process.env.BROWSER_HEADLESS !== 'false';
const USER_AGENT = flags.userAgent || process.env.BROWSER_USER_AGENT || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.0';

// Tool definitions for MCP discovery
const TOOLS = {
  tools: [
    {
      name: 'browser_navigate',
      description: 'Navigate to a URL and wait for page load',
      parameters: {
        url: { type: 'string', required: true, description: 'URL to navigate to' },
        waitUntil: { type: 'string', default: 'networkidle', description: 'When to consider load complete' }
      }
    },
    {
      name: 'browser_screenshot',
      description: 'Capture screenshot of page or element',
      parameters: {
        path: { type: 'string', required: true, description: 'Where to save the screenshot' },
        selector: { type: 'string', description: 'Optional: specific element to capture' },
        fullPage: { type: 'boolean', default: false, description: 'Capture full scrollable page' }
      }
    },
    {
      name: 'browser_click',
      description: 'Click an element by selector or text content',
      parameters: {
        selector: { type: 'string', description: 'CSS selector for the element' },
        text: { type: 'string', description: 'Text content to match if selector not provided' },
        timeout: { type: 'number', default: 5000, description: 'Maximum wait time in ms' }
      }
    },
    {
      name: 'browser_type',
      description: 'Type text into an input field',
      parameters: {
        selector: { type: 'string', required: true, description: 'CSS selector for input' },
        text: { type: 'string', required: true, description: 'Text to type' },
        clear: { type: 'boolean', default: true, description: 'Clear field before typing' }
      }
    },
    {
      name: 'browser_extract',
      description: 'Extract text or attributes from page elements',
      parameters: {
        selector: { type: 'string', required: true, description: 'CSS selector for elements' },
        attribute: { type: 'string', description: 'Attribute to extract (default: textContent)' },
        output: { type: 'string', default: 'json', description: 'Output format: json or text' }
      }
    },
    {
      name: 'browser_scroll',
      description: 'Scroll the page',
      parameters: {
        direction: { type: 'string', default: 'down', description: 'Direction: up, down, left, right' },
        amount: { type: 'number', default: 3, description: 'Number of viewport heights to scroll' },
        wait: { type: 'number', default: 1000, description: 'Wait time after scroll in ms' }
      }
    },
    {
      name: 'browser_wait',
      description: 'Wait for an element or timeout',
      parameters: {
        selector: { type: 'string', description: 'Element to wait for' },
        timeout: { type: 'number', default: 5000, description: 'Maximum wait time in ms' }
      }
    }
  ]
};

async function getBrowser() {
  return chromium.launch({ 
    headless: HEADLESS,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
}

async function getContext(browser) {
  const options = {
    userAgent: USER_AGENT,
    viewport: { width: 1280, height: 720 }
  };
  
  if (process.env.BROWSER_COOKIES_PATH && fs.existsSync(process.env.BROWSER_COOKIES_PATH)) {
    const cookies = JSON.parse(fs.readFileSync(process.env.BROWSER_COOKIES_PATH, 'utf8'));
    options.cookies = cookies;
  }
  
  return browser.newContext(options);
}

async function actionNavigate(page) {
  const url = flags.url;
  if (!url) {
    console.error('Error: --url required for navigate action');
    process.exit(1);
  }
  
  const waitUntil = flags.waitUntil || 'networkidle';
  await page.goto(url, { waitUntil });
  
  console.log(JSON.stringify({
    success: true,
    action: 'navigate',
    url: page.url(),
    title: await page.title()
  }, null, 2));
}

async function actionScreenshot(page) {
  const screenshotPath = flags.path || flags.output;
  if (!screenshotPath) {
    console.error('Error: --path required for screenshot action');
    process.exit(1);
  }
  
  const options = { path: screenshotPath };
  if (flags.fullPage === 'true') options.fullPage = true;
  
  if (flags.selector) {
    const element = await page.locator(flags.selector).first();
    await element.screenshot(options);
  } else {
    await page.screenshot(options);
  }
  
  console.log(JSON.stringify({
    success: true,
    action: 'screenshot',
    path: screenshotPath,
    fullPage: options.fullPage || false
  }, null, 2));
}

async function actionClick(page) {
  const timeout = parseInt(flags.timeout) || 5000;
  
  if (flags.selector) {
    await page.locator(flags.selector).first().click({ timeout });
  } else if (flags.text) {
    await page.getByText(flags.text).first().click({ timeout });
  } else {
    console.error('Error: --selector or --text required for click action');
    process.exit(1);
  }
  
  console.log(JSON.stringify({
    success: true,
    action: 'click',
    selector: flags.selector,
    text: flags.text
  }, null, 2));
}

async function actionType(page) {
  const selector = flags.selector;
  const text = flags.text;
  
  if (!selector || !text) {
    console.error('Error: --selector and --text required for type action');
    process.exit(1);
  }
  
  const locator = page.locator(selector).first();
  if (flags.clear !== 'false') {
    await locator.fill(text);
  } else {
    await locator.type(text);
  }
  
  console.log(JSON.stringify({
    success: true,
    action: 'type',
    selector,
    text: text.substring(0, 20) + (text.length > 20 ? '...' : '')
  }, null, 2));
}

async function actionExtract(page) {
  const selector = flags.selector;
  if (!selector) {
    console.error('Error: --selector required for extract action');
    process.exit(1);
  }
  
  const attribute = flags.attribute;
  const output = flags.output || 'json';
  
  const elements = await page.locator(selector).all();
  const results = [];
  
  for (const element of elements.slice(0, 20)) { // Limit to 20 elements
    if (attribute) {
      const value = await element.getAttribute(attribute);
      results.push({ [attribute]: value });
    } else {
      const text = await element.textContent();
      results.push({ text: text?.trim() });
    }
  }
  
  if (output === 'json') {
    console.log(JSON.stringify({
      success: true,
      action: 'extract',
      selector,
      count: results.length,
      data: results
    }, null, 2));
  } else {
    results.forEach(r => console.log(r.text || r[attribute]));
  }
}

async function actionScroll(page) {
  const direction = flags.direction || 'down';
  const amount = parseInt(flags.amount) || 3;
  const wait = parseInt(flags.wait) || 1000;
  
  const viewportHeight = await page.evaluate(() => window.innerHeight);
  const scrollAmount = direction === 'down' ? viewportHeight * amount : 
                       direction === 'up' ? -viewportHeight * amount : 0;
  
  await page.evaluate((y) => window.scrollBy(0, y), scrollAmount);
  await page.waitForTimeout(wait);
  
  console.log(JSON.stringify({
    success: true,
    action: 'scroll',
    direction,
    amount,
    position: await page.evaluate(() => window.scrollY)
  }, null, 2));
}

async function actionWait(page) {
  const timeout = parseInt(flags.timeout) || 5000;
  
  if (flags.selector) {
    await page.locator(flags.selector).first().waitFor({ timeout });
  } else {
    await page.waitForTimeout(timeout);
  }
  
  console.log(JSON.stringify({
    success: true,
    action: 'wait',
    selector: flags.selector,
    timeout
  }, null, 2));
}

async function main() {
  // Handle discovery mode
  if (flags.discover) {
    console.log(JSON.stringify(TOOLS, null, 2));
    return;
  }
  
  if (!ACTION) {
    console.error('Usage: browser-tools.js --action <navigate|screenshot|click|type|extract|scroll|wait>');
    console.error('       browser-tools.js --discover  # Output MCP tool definitions');
    process.exit(1);
  }
  
  const browser = await getBrowser();
  const context = await getContext(browser);
  const page = await context.newPage();
  
  try {
    // Pre-navigate if URL provided for non-navigate actions
    if (flags.url && ACTION !== 'navigate') {
      await page.goto(flags.url, { waitUntil: 'networkidle' });
    }
    
    switch (ACTION) {
      case 'navigate':
        await actionNavigate(page);
        break;
      case 'screenshot':
        await actionScreenshot(page);
        break;
      case 'click':
        await actionClick(page);
        break;
      case 'type':
        await actionType(page);
        break;
      case 'extract':
        await actionExtract(page);
        break;
      case 'scroll':
        await actionScroll(page);
        break;
      case 'wait':
        await actionWait(page);
        break;
      default:
        console.error(`Unknown action: ${ACTION}`);
        process.exit(1);
    }
  } catch (error) {
    console.error(JSON.stringify({
      success: false,
      action: ACTION,
      error: error.message
    }, null, 2));
    process.exit(1);
  } finally {
    await context.close();
    await browser.close();
  }
}

main();
