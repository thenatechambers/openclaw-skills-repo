---
name: veteran-dev-onboarding
description: Onboarding skill for experienced developers returning to coding after years away. Helps veterans skip modern framework complexity and start building immediately using AI agents. Designed for developers who remember simpler times and want to focus on shipping projects, not learning build tools.
---

# Veteran Developer Onboarding Skill

## Purpose

You are an experienced developer who stepped away from coding—maybe for a few years, maybe for decades. The industry changed. Frameworks multiplied. Build tools got complicated. You felt left behind.

**You're not behind. The industry made simple things unnecessarily hard.**

This skill helps you:
- Skip the framework treadmill
- Build projects using plain, simple technologies
- Leverage AI agents to handle modern complexity
- Ship projects without DevOps PhDs

## Who This Is For

- Developers who started in the 80s, 90s, or early 2000s
- People who remember when web development was HTML + CSS + JavaScript
- Those who walked away because of "framework fatigue"
- Anyone who thinks: "I have good ideas, but I don't want to learn React"

## Core Philosophy

**Modern isn't always better. Simple ships.**

You don't need to:
- Learn React, Vue, or Angular
- Master TypeScript
- Configure Webpack, Vite, or Rollup
- Understand Docker or Kubernetes
- Keep up with the framework-of-the-month

Your existing knowledge—jQuery, vanilla JS, procedural PHP, shell scripts—is still valid.

## Quick Start: Your First Project in 10 Minutes

### Step 1: Install Claude Code

```bash
npm install -g @anthropic-ai/claude-code
claude
```

### Step 2: Describe What You Want to Build

Forget frameworks. Just tell Claude in plain English:

> "I want a simple web page that takes a list of names and lets me randomize them into teams. Use vanilla JavaScript—no frameworks. I want it to work in a single HTML file."

Claude will:
- Create a complete HTML file
- Write the JavaScript to handle the randomization
- Make it look decent with simple CSS
- Start a local server so you can test it

### Step 3: Deploy It

```bash
# Install Vercel CLI once
npm install -g vercel

# Deploy your project
cd my-project
vercel --yes
```

Your app is live. No Docker. No CI/CD. No YAML files.

## What You Can Skip (And Why)

| Skip This | Why You Don't Need It | What To Use Instead |
|-----------|----------------------|---------------------|
| React/Vue/Angular | Claude handles component logic | Vanilla JavaScript works fine |
| Webpack/Vite/Rollup | Modern browsers handle modules | Single HTML files or Claude manages builds |
| TypeScript | Plain JavaScript is fine | JavaScript + Claude catches errors |
| Docker/Kubernetes | Overkill for most projects | `vercel` or `python -m http.server` |
| npm dependency hell | Most projects don't need it | Zero dependencies, or Claude picks stable ones |
| Modern CSS Grid | Tell Claude: "Make this look decent" | Simple CSS or Claude writes it |

## Workflow: Building with AI Agents

### The Pattern

1. **Describe the goal** (not the implementation)
2. **Review what Claude suggests**
3. **Guide the iteration** ("simpler," "add a button," "make the text bigger")
4. **Test and refine**
5. **Deploy**

You are the architect. Claude is the implementation team.

### Example Session

```
You: I want a todo list. Simple. Just an input box, a button to add items,
     and a list that shows them. All in one HTML file.

Claude: [Creates complete HTML file with HTML, CSS, and JavaScript]

You: Can you make it save to local storage so it persists?

Claude: [Adds localStorage code]

You: The text is too small. Make it readable.

Claude: [Adjusts CSS]

You: Good. How do I deploy this?

Claude: Run `vercel --yes` in this directory.

You: [Deploys. Gets URL. Shares with friends.]
```

That's it. No package.json. No node_modules. No build step.

## Project Ideas to Start With

Pick something from your mental backlog:

- **Personal website** - Just HTML, your story, maybe a photo
- **Expense tracker** - Input expenses, show totals, simple charts
- **Quote randomizer** - Collection of quotes you love, random display
- **URL shortener** - Simple redirect service
- **Guestbook** - Old-school guestbook for your site
- **Project from the 80s/90s** - That idea you never built

The goal isn't to learn modern tools. The goal is to **ship something**.

## Handling Common Objections

### "But I don't know modern JavaScript"

You don't need to. Describe what you want in plain English. Claude knows the syntax.

Your job: Know what you want to build.
Claude's job: Write the code.

### "What if the code is wrong?"

Review it. Test it. Guide the fixes. You're not outsourcing your judgment—you're outsourcing the typing.

### "I feel like I'm cheating"

You're not. You're using the best tool for the job. Architects don't pour concrete. They design buildings.

### "What about maintenance?"

Simple projects are easy to maintain. And if Claude wrote it, Claude can fix it. Just ask.

## Recommended Stack for Returning Developers

### Frontend (Pick One)

**Option A: Zero-Build (Recommended)**
- Single HTML file
- Vanilla JavaScript
- Simple CSS (or a CDN like Tailwind via CDN)
- Deploy with Vercel

**Option B: Minimal Build**
- Vite (if Claude recommends it for your project)
- Still vanilla JavaScript
- Vercel or Netlify for deploy

### Backend (If You Need One)

**Option A: Serverless Functions**
- Vercel Functions
- Simple API endpoints
- No server management

**Option B: Simple Server**
- Python + Flask (if you know Python)
- Node.js + Express (if you want to stay in JS)
- Deploy to Railway or Render

### Database (If You Need One)

**Option A: JSON Files**
- Simple reads/writes
- Perfect for small projects

**Option B: SQLite**
- Single file database
- No server to run
- Claude handles the SQL

## Learning Path (Optional)

Don't feel obligated to learn these. But if you want to:

1. **Git basics** - Just commit and push. That's 90% of what you need.
2. **Vercel deploy** - One command. Zero config.
3. **Environment variables** - For API keys (Claude will show you)
4. **Basic debugging** - Browser DevTools (F12)

Everything else? Learn it when you need it.

## Resources

- **Claude Code Docs:** https://docs.anthropic.com/en/docs/claude-code
- **MDN Web Docs:** https://developer.mozilla.org (for reference)
- **Vercel:** https://vercel.com (free hosting)
- **Cortex:** https://cortex-pearl.vercel.app (managed AI agents)

## The Real Message

Your decades of experience aren't obsolete. They're **amplified** when the AI handles the syntax and you handle the decisions.

That project from the 80s? The one you've been thinking about for 40 years?

**Build it now.**

The tools finally caught up to your ideas.

---

*Questions? Start a project and ask Claude. That's the whole point.*
