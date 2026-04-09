---
name: daily-ai-router
description: Routes your daily tasks to the right AI tool, model, or workflow automatically. Eliminates context-switching between ChatGPT, Claude, Cursor, and other AI tools by providing a single entry point that delegates intelligently.
author: Keiko Atlas <keiko@goorca.ai>
tags: [productivity, automation, workflow, routing]
---

# Daily AI Router

Intelligent task routing for your personal AI stack. Stop juggling between ChatGPT, Claude, Cursor, NotebookLLM, and other AI tools — this skill figures out the best tool for the job and routes your request accordingly.

## The Problem It Solves

Based on HN discussion "What useful AI tools do you use every day?" (42pt, 72 comments), users reported using:
- **ChatGPT** for quick ideas and brainstorming
- **Claude** for writing articles and SEO optimization
- **Cursor** for coding tasks
- **NotebookLLM** for technical documentation research
- **Deepl Write** for language improvement
- **Google Lens** for visual identification

That's 5+ different AI interfaces to manage daily. This skill provides a unified entry point.

## What It Does

Analyzes your request and routes it to the appropriate tool/workflow:

| Task Type | Route To | Why |
|-----------|----------|-----|
| Quick brainstorming, vague questions | ChatGPT | Fast, creative, good for exploration |
| Writing, editing, SEO content | Claude | Superior writing quality, longer context |
| Code generation, refactoring, tests | Cursor | IDE integration, codebase awareness |
| Technical documentation Q&A | NotebookLLM | Source-grounded answers from your docs |
| Language translation/grammar | DeepL API | Purpose-built for language |
| Image analysis, plant/object ID | Vision-capable model | Multimodal understanding |
| Multi-step research | Self (Orchestrated) | Coordinates multiple tools |

## How to Use

Simply describe what you need. The skill handles routing:

```
"I need to write a blog post about AI automation"
→ Routes to Claude (writing task)

"Refactor this Python function to use async"
→ Routes to Cursor (coding task)

"What's the difference between REST and GraphQL?"
→ Routes to ChatGPT (quick concept explanation)

"Find the section about authentication in the API docs"
→ Routes to NotebookLLM (documentation query)
```

## Requirements

- OpenClaw with multiple model providers configured
- Optional: Cursor MCP, NotebookLLM integration, DeepL API key

## Configuration

Set your preferred providers in `config.yaml`:

```yaml
daily-ai-router:
  default_coding_agent: "cursor"
  default_writing_agent: "claude"
  default_quick_chat: "chatgpt"
  notebookllm_enabled: true
  deepl_api_key: "${DEEPL_API_KEY}"
```

## The Recommendation

**Don't try to replace your entire AI stack with one tool.** Each AI tool has strengths. Instead, build an orchestration layer that routes tasks intelligently. This skill is that orchestration layer — it preserves the specialized capabilities of each tool while eliminating the cognitive overhead of choosing which one to use.

## Extending This Skill

Add custom routing rules for your specific workflows:

```yaml
routing_rules:
  - pattern: "^docs? review"
    target: "claude"
    context: "You are a technical documentation reviewer. Check for clarity, completeness, and accuracy."
  
  - pattern: "^tweet|^social|^x post"
    target: "chatgpt"
    context: "Write concise, engaging social media content under 280 characters."
```

## Why This Matters

The future isn't one AI that does everything. It's a **personal AI corporation** — specialized agents coordinated by an intelligent router. This skill gives you that architecture today.

---

*Part of the [OpenClaw Skills Repo](https://github.com/thenatechambers/openclaw-skills-repo). Deploy your own AI agent at [Cortex](https://cortex-pearl.vercel.app).*
