---
name: meeting-assistant
description: Transcribe meetings, extract action items, and summarize discussions automatically. Works with audio files, live recordings, or meeting platform exports.
---

# Meeting Assistant Skill

Turn chaotic meeting recordings into organized, actionable notes. This OpenClaw skill transcribes audio, extracts decisions and action items, and formats everything into a clean summary you can share or archive.

## What It Does

- **Transcribes meetings** from audio files or live recordings
- **Extracts action items** with assignees and deadlines
- **Identifies decisions** made during the meeting
- **Summarizes key points** by topic
- **Formats output** as markdown for easy sharing

## Why This Matters

Most meeting notes are incomplete, biased, or never written. This skill ensures:
- **Nothing gets forgotten** — every word is captured
- **Action items are tracked** — who does what by when
- **Decisions are documented** — no more "we agreed on what?"
- **Non-attendees stay informed** — shareable summaries

## Requirements

- OpenClaw agent with tool access
- Audio file (MP3, WAV, M4A) or meeting recording URL
- Whisper API key or local Whisper installation (for transcription)

## Quick Setup

### 1. Configure Environment

Add to your agent's environment:

```bash
WHISPER_API_KEY=your-openai-api-key  # Or use local Whisper
# Or for local: WHISPER_LOCAL_PATH=/path/to/whisper
```

### 2. Install the Skill

Copy this skill to your OpenClaw agent's skills directory:

```bash
cp -r skills/meeting-assistant /path/to/openclaw/skills/
```

## Usage

### Process a Recorded Meeting

```
You: Process this meeting recording: /uploads/team-sync-april-6.m4a
Agent: Transcribing... extracting action items... summarizing...

📋 Meeting Summary: Team Sync — April 6, 2026

🎯 Key Decisions:
• Migrate database to Postgres 16 by end of quarter
• Deprecate legacy API endpoints on May 1st
• Hire senior backend engineer (budget approved)

✅ Action Items:
• @sarah: Draft migration plan — Due: April 10
• @mike: Update API documentation — Due: April 15
• @alex: Post job description — Due: April 8

📝 Discussion Notes:
• Reviewed Q1 metrics — 23% over target
• Discussed new compliance requirements for EU customers
• Brainstormed feature priorities for v2.1 release
```

### Live Meeting Mode

```
You: Start live meeting transcription for "Product Roadmap Review"
Agent: 🎙️ Live transcription started. Say "end meeting" when done.

[During meeting...]
Agent: 💡 Decision detected: "We'll prioritize mobile app redesign"
Agent: ✅ Action item: @jordan to create mockups by Friday

You: End meeting
Agent: [Full summary generated]
```

### Export to Your Tools

```
You: Send action items to Linear and summary to Slack #general
Agent: ✅ Created 4 Linear issues
Agent: ✅ Posted summary to #general
```

## How It Works

```
Audio Input
    ↓
[Whisper Transcription]
    ↓
Raw transcript
    ↓
[LLM Analysis]
    ├── Extract decisions ("we decided...", "let's go with...")
    ├── Extract action items ("@name will...", "action: ...")
    ├── Identify topics and summarize
    └── Format for output
    ↓
Structured meeting notes
```

## Output Format

The skill generates structured markdown:

```markdown
# Meeting: [Title] — [Date]

**Attendees:** [extracted from transcript]
**Duration:** [calculated]

## 🎯 Key Decisions
• [Decision 1 with context]
• [Decision 2 with context]

## ✅ Action Items
| Task | Assignee | Due |
|------|----------|-----|
| [Task] | @name | [Date] |

## 📝 Discussion Summary
### [Topic 1]
[Summary]

### [Topic 2]
[Summary]

## 🔗 Full Transcript
<details>
<summary>Click to expand</summary>
[Full transcript here]
</details>
```

## Advanced Features

### Custom Extraction Rules

Add to `config.json`:

```json
{
  "extraction_rules": {
    "decision_patterns": [
      "we decided",
      "let's go with",
      "agreed to"
    ],
    "action_patterns": [
      "@(\w+) will",
      "action item",
      "todo:"
    ]
  }
}
```

### Integrations

The skill can export to:
- **Linear** — Create issues from action items
- **Slack** — Post summaries to channels
- **Notion** — Save to meeting notes database
- **Email** — Send summary to attendees

Configure in `integrations.json`:

```json
{
  "linear": { "api_key": "...", "team_id": "..." },
  "slack": { "token": "...", "default_channel": "#meetings" },
  "notion": { "token": "...", "database_id": "..." }
}
```

### Speaker Identification

For multi-speaker meetings, the skill can:
- Detect speaker changes
- Label speakers as Speaker 1, Speaker 2...
- Learn speaker names from introductions ("Hi I'm Sarah...")

Enable in config:

```json
{
  "diarization": true,
  "min_speakers": 2,
  "max_speakers": 6
}
```

## Tips

1. **Record in quiet environments** — better transcription accuracy
2. **Ask attendees to introduce themselves** — improves speaker identification
3. **Use explicit action item language** — "@name will do X by Friday"
4. **Review and edit** — AI extracts well, but human review catches nuances
5. **Archive consistently** — save to a central location for searchability

## Privacy & Security

- **Local processing option** — Use local Whisper for sensitive meetings
- **No cloud retention** — Transcripts processed and deleted
- **PII redaction** — Optionally redact emails, phone numbers from output

Enable redaction:

```json
{
  "redact_pii": true,
  "redact_patterns": ["email", "phone", "ssn"]
}
```

## Example Workflows

### Weekly Team Sync

```
1. Record meeting via Zoom/Meet
2. Drop recording file into OpenClaw chat
3. Get structured summary in 2 minutes
4. Action items auto-created in Linear
5. Summary posted to Slack
```

### Client Call Notes

```
1. Start live transcription at call start
2. Mark key moments: "Note: client emphasized security requirements"
3. End transcription at call end
4. Get summary + full transcript
5. Save to CRM with client record
```

### All-Hands Meeting

```
1. Upload company all-hands recording
2. Generate executive summary (top decisions only)
3. Generate full notes for those who missed it
4. Post both to company wiki
```

## Files

- `SKILL.md` — This documentation
- `scripts/transcribe.js` — Audio → text via Whisper
- `scripts/extract.js` — LLM-based extraction
- `scripts/format.js` — Output formatting
- `scripts/integrations.js` — Tool connectors

## Related

- [Whisper API](https://platform.openai.com/) — Transcription engine
- [Cortex Blog: Intelligent Meeting Notes](https://cortex.go/blog/meeting-assistant) — Deep dive
- [OpenClaw Documentation](https://docs.openclaw.io) — Platform docs

## License

MIT — Free for personal and commercial use.
