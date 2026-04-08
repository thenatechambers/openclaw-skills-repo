---
name: content-repurposer
description: Transform long-form content (blog posts, articles, transcripts) into platform-native formats. Generates LinkedIn posts, Twitter/X threads, email summaries, and social snippets from a single source. Maintains your voice and style across all outputs.
author: cortex
version: 1.0.0
tags: [content, marketing, social-media, productivity]
---

# Content Repurposer Skill

Turn one piece of content into a week's worth of posts. This skill reads your long-form content and generates platform-optimized versions that sound like you wrote them.

## What It Does

- **Blog → LinkedIn**: Converts articles into engaging LinkedIn posts with hooks and line breaks
- **Blog → Twitter/X Thread**: Breaks content into 280-character chunks with thread numbering
- **Any → Email Summary**: Creates a brief newsletter-style summary with key takeaways
- **Any → Social Snippets**: Extracts quotable one-liners for easy sharing

## Required Secrets

```bash
# OpenAI API key for content generation
OPENAI_API_KEY=sk-...

# Optional: Anthropic key for Claude-based rewriting
ANTHROPIC_API_KEY=sk-ant-...
```

## Installation

```bash
# Clone into your OpenClaw skills directory
cd ~/.openclaw/skills
git clone https://github.com/thenatechambers/openclaw-skills-repo.git cortex-skills
ln -s cortex-skills/skills/content-repurposer content-repurposer
```

## Usage

### Basic Usage

```bash
# Repurpose a blog post URL
openclaw run content-repurposer --url "https://yourblog.com/post"

# Repurpose from clipboard content  
openclaw run content-repurposer --clipboard --format linkedin

# Repurpose a local file
openclaw run content-repurposer --file ./article.md --format thread
```

### Available Formats

| Format | Output | Best For |
|--------|--------|----------|
| `linkedin` | Single post with emojis and line breaks | Professional audience |
| `thread` | Numbered Twitter/X thread | Thought leadership |
| `email` | Newsletter-style summary | Email list |
| `snippets` | 5-10 quotable one-liners | Quick social posts |
| `all` | All formats at once | Full content package |

### Examples

**LinkedIn Post:**
```bash
$ openclaw run content-repurposer --url "https://example.com/ai-automation" --format linkedin

🔥 I just shipped an AI agent that saved me 10 hours this week.

Here's what most people get wrong about automation:

❌ They try to automate everything at once
✅ They should automate one painful task first

The 10-hour task I automated?
Weekly status reports.

My agent now:
→ Pulls data from 3 tools
→ Drafts the report
→ Sends it to Slack

The best part?

I didn't write a single line of code.

OpenClaw skills handle the heavy lifting.

What's your most painful weekly task?

#AI #Automation #Productivity
```

**Twitter Thread:**
```bash
$ openclaw run content-repurposer --url "https://example.com/post" --format thread

1/ I spent 2 years building AI agents.

Here are 7 lessons I wish I knew on day 1:

🧵

2/ Lesson 1: Start with the pain, not the tool

Most people ask "what can AI do?"

Better question: "what hurts most in my workflow?"

The best automations solve real problems.

3/ Lesson 2: ...
```

## How It Works

1. **Extract**: Fetches content from URL, file, or clipboard
2. **Analyze**: Identifies key points, tone, and structure
3. **Transform**: Rewrites for target platform using LLM
4. **Format**: Applies platform-specific formatting (emojis, line breaks, hashtags)
5. **Output**: Returns ready-to-post content

## Voice Training (Optional)

To match your writing style, create a `VOICE.md` in the skill directory:

```markdown
# My Writing Voice

- Use short sentences. Like this.
- Start some sentences with "And" or "But"
- Write like I talk, not like I write
- Use emojis sparingly for emphasis
- End with questions to drive engagement
- Avoid jargon: say "use" not "leverage"
```

Then reference it:
```bash
openclaw run content-repurposer --url "..." --voice ./VOICE.md
```

## Advanced: Custom Templates

Create platform-specific templates in `templates/`:

```bash
templates/
  linkedin.txt    # LinkedIn post template
  thread.txt      # Twitter thread template  
  email.txt       # Email newsletter template
```

Template variables:
- `{{hook}}` - Opening line
- `{{body}}` - Main content
- `{{cta}}` - Call to action
- `{{hashtags}}` - Auto-generated tags

## Tips for Best Results

1. **Start with strong source content** — garbage in, garbage out
2. **Review and edit** — AI gets you 80% there, you add the final 20%
3. **Batch process** — repurpose multiple pieces at once
4. **Save your favorites** — build a swipe file of high-performing outputs
5. **A/B test formats** — same content, different formats, see what wins

## Integration with OpenClaw

Add to your OpenClaw config to enable from chat:

```json
{
  "skills": {
    "content-repurposer": {
      "enabled": true,
      "formats": ["linkedin", "thread", "email"]
    }
  }
}
```

Then use naturally in conversation:

> "Repurpose this blog post for LinkedIn: https://..."

## Related Skills

- `social-scheduler` — Schedule repurposed content across platforms
- `content-calendar` — Plan your content strategy
- `analytics-tracker` — Track performance of repurposed posts

## Credits

Built by the Cortex team. Inspired by founders who needed to do more with less.

---

*Part of the [OpenClaw Skills Repo](https://github.com/thenatechambers/openclaw-skills-repo) — free skills for AI agents.*
