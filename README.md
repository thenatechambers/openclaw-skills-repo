# OpenClaw Skills Repository

> Free, community-built skills for [OpenClaw](https://openclaw.ai) and [Cortex](https://cortex-pearl.vercel.app) — the AI agent platform for non-technical teams.

---

## What are Skills?

Skills are modular, self-contained packages that give your AI agent specialized capabilities. Drop a skill into OpenClaw and your agent instantly knows how to:

- Research topics on Reddit, X, or Hacker News
- Write blog posts with a consistent structure
- Manage your Notion workspace
- Monitor competitors
- Draft outbound emails
- ...and much more

Each skill is a folder with a `SKILL.md` file (and optional scripts/references). They're plain text — read them, remix them, contribute your own.

---

## 📦 Skills Index

| Skill | Description | Blog Post |
|-------|-------------|-----------|
| _(coming soon — first skills drop week of 2026-03-01)_ | | |

---

## 🚀 How to Install a Skill

1. Browse the `skills/` directory below
2. Copy the skill folder into your OpenClaw workspace at `~/.openclaw/workspace/skills/[skill-name]/`
3. Restart your OpenClaw gateway (`openclaw gateway restart`)
4. Your agent now has the skill — try it!

> New to OpenClaw? → [Get started with Cortex](https://cortex-pearl.vercel.app)

---

## 🤝 Contributing

Have a skill that's saved you time? We'd love to include it.

1. Fork this repo
2. Add your skill under `skills/[your-skill-name]/`
3. Make sure your `SKILL.md` has proper YAML frontmatter (`name` + `description`)
4. Open a PR with a short description

**Skill guidelines:**
- `SKILL.md` must have `name:` and `description:` in YAML frontmatter
- Keep SKILL.md under 500 lines (use `references/` for detailed docs)
- Test your skill at least once before submitting
- No PII, API keys, or proprietary data

---

## 📰 Blog

New skills are announced on the [Cortex blog](https://cortex-pearl.vercel.app/blog) — one post per day, each with a free downloadable skill and a concrete recommendation you can use immediately.

Subscribe to stay updated.

---

Built with ❤️ by [Cortex](https://cortex-pearl.vercel.app) · [OpenClaw](https://openclaw.ai)
