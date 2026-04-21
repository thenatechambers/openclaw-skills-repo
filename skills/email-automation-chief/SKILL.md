---
name: email-automation-chief
description: An OpenClaw skill that acts as your email Chief of Staff — automatically categorizes incoming emails, drafts contextual responses, and surfaces only what needs your attention. Perfect for founders drowning in inbox overload.
author: cortex
tags: [email, automation, productivity, founder-tools, gmail]
difficulty: intermediate
---

# Email Automation Chief

Stop living in your inbox. This skill turns your OpenClaw agent into an email Chief of Staff that handles the busywork so you can focus on building.

## What It Does

- **Categorizes** incoming emails by priority (urgent, needs response, FYI, spam)
- **Drafts responses** for common scenarios using your tone and context
- **Surfaces action items** — only emails that actually need YOU
- **Unsubscribe suggestions** — identifies newsletters you never open
- **Daily inbox summary** — morning briefing of what matters today

## Prerequisites

1. Gmail account with IMAP enabled (or any email supporting IMAP)
2. OpenClaw agent with browser/tool access
3. Optional: OpenAI/Anthropic API key for response drafting

## Quick Start

### 1. Configure Environment Variables

```bash
# Add to your OpenClaw .env
EMAIL_ADDRESS=you@yourcompany.com
EMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx  # Gmail app password, not your login
EMAIL_IMAP_SERVER=imap.gmail.com
EMAIL_IMAP_PORT=993
```

**Get Gmail App Password:**
1. Go to Google Account → Security → 2-Step Verification
2. At bottom: "App passwords" → Select "Mail" + "Other (Custom name)"
3. Copy the 16-character password

### 2. Install Skill

```bash
cp -r skills/email-automation-chief $OPENCLAW_WORKSPACE/skills/
```

### 3. Test Run

```bash
# In your OpenClaw session
Run the email-automation-chief skill to check my inbox and summarize what needs attention
```

## How It Works

### Email Processing Pipeline

```
INBOX → Categorize → Draft Response? → Queue for Review → Send/Archive
              ↓
         Action Required? → Surface to User
              ↓
         Newsletter? → Mark for Unsubscribe List
```

### Priority Scoring

The skill assigns each email a priority score (1-10):

| Score | Category | Action |
|-------|----------|--------|
| 9-10 | Urgent | Immediate notification |
| 7-8 | Needs Response | Draft reply, queue for review |
| 5-6 | FYI | Add to daily digest |
| 1-4 | Low Priority | Archive or mark read |

### Response Drafting

For emails scoring 7+, the skill:
1. Extracts the sender's question/ask
2. Checks your calendar for conflicts
3. Drafts a contextual response in your tone
4. Saves as draft — you review before sending

## Customization

### 1. Adjust Priority Rules

Edit `config/priority-rules.json`:

```json
{
  "urgent_keywords": ["urgent", "asap", "deadline", "meeting", "invoice"],
  "vip_senders": ["investor@vc.com", "co-founder@company.com"],
  "auto_archive_patterns": ["unsubscribe", "no-reply@", "noreply@"]
}
```

### 2. Response Templates

Add your own templates in `templates/`:

```markdown
# templates/meeting-request.md
Hi {{sender_name}},

Thanks for reaching out. I'm generally available {{availability}}.

{{suggested_times}}

Best,
{{my_name}}
```

### 3. Tone Configuration

Tell your agent your preferences:

```
When drafting emails for me:
- Keep it under 3 sentences unless complex
- Friendly but professional
- Always offer specific times for meetings
- Sign off with "Best" not "Regards"
```

## Automation Workflows

### Daily Morning Briefing (Recommended)

Set up a cron job in OpenClaw:

```
cron: 0 8 * * * email-automation-chief
```

You'll get a message like:

> ☀️ **Morning Email Brief**
> 
> **3 emails need response today:**
> 1. Investor update request (draft ready)
> 2. Customer support escalation
> 3. Partnership inquiry from TechCorp
> 
> **2 meetings suggested** — check your calendar
> 
> **12 newsletters** — want me to unsubscribe from any?

### Real-Time Urgent Alerts

For truly urgent items (investor emails, outages, etc.):

```
cron: */15 * * * * email-automation-chief --urgent-only
```

## Safety & Privacy

- **Drafts only** — The skill never sends emails without your review by default
- **Local processing** — Email content is processed locally, not stored in third-party services
- **Audit trail** — All actions logged to `logs/email-actions.log`

To enable auto-send for trusted contacts only:

```json
{
  "auto_send_allowed": ["co-founder@company.com", "assistant@company.com"],
  "auto_send_max_per_day": 10
}
```

## Troubleshooting

### "Authentication failed"
- Make sure you're using an App Password, not your regular Gmail password
- Enable "Less secure app access" if not using 2FA (not recommended)

### "IMAP connection timeout"
- Check firewall settings
- Verify IMAP is enabled in Gmail settings

### "Emails not being categorized"
- The skill learns over time — give it feedback on miscategorizations
- Check `logs/classification.log` for debug info

## Advanced: Multi-Account Setup

Managing multiple inboxes (personal + company)?

```bash
# Clone skill for second account
cp -r email-automation-chief email-automation-company

# Edit .env
EMAIL_ADDRESS=founder@company.com
EMAIL_CONFIG_NAME=company
```

## Integration with Other Skills

Combine with:

- **calendar-assistant** — Auto-check availability before drafting meeting responses
- **crm-connector** — Log customer emails to your CRM automatically
- **slack-notifier** — Forward urgent emails to Slack DMs

## Why This Matters

The average founder spends **2.6 hours per day** on email. That's 13 hours a week — nearly a third of a standard work week — just processing messages.

This skill doesn't just save time. It restores **cognitive bandwidth**. By handling the routine and surfacing only what matters, you get your mornings back for deep work.

## Credits

Built by the Cortex team. Part of the [OpenClaw Skills Library](https://github.com/thenatechambers/openclaw-skills-repo).

Want a managed version with team collaboration features? [Check out Cortex](https://cortex-pearl.vercel.app).
