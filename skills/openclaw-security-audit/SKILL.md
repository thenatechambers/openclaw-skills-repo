---
name: openclaw-security-audit
description: Audit your OpenClaw installation for security vulnerabilities, excessive permissions, and unsafe MCP server configurations. Generates a hardening report with actionable fixes.
---

# OpenClaw Security Audit Skill

OpenClaw is powerful—perhaps too powerful. With a single prompt, it can read your SSH keys, access production databases, and exfiltrate data to remote servers. This skill audits your setup and shows you how to lock it down.

## The Problem

OpenClaw requests broad permissions by default:
- Full filesystem access to your home directory
- Shell command execution with your user privileges  
- MCP server connections that can bypass network boundaries
- Environment variable access (often containing secrets)

A compromised or misconfigured OpenClaw installation is a **privilege escalation waiting to happen**.

**Recent context:**
- CVE-2026-33579: OpenClaw privilege escalation vulnerability disclosed
- Hacker News discussion (514 upvotes): "OpenClaw privilege escalation vulnerability"
- Multiple reports of OpenClaw being restricted by Anthropic and Google over security concerns

## What This Skill Does

1. **Permission audit** — Scans OpenClaw config for excessive file access
2. **MCP server analysis** — Identifies untrusted or overly-permissive MCP servers
3. **Secret detection** — Finds exposed API keys in environment/config files
4. **Hardening report** — Generates specific remediation steps

## Quick Start

### Installation

```bash
# Clone into your OpenClaw skills directory
git clone https://github.com/thenatechambers/openclaw-skills-repo.git
cp -r openclaw-skills-repo/skills/openclaw-security-audit ~/.openclaw/skills/

# Or directly:
curl -fsSL https://raw.githubusercontent.com/thenatechambers/openclaw-skills-repo/main/skills/openclaw-security-audit/scripts/audit.sh | bash
```

### Run the Audit

```bash
cd ~/.openclaw/skills/openclaw-security-audit
./scripts/audit.sh --full
```

**Output example:**
```
╔════════════════════════════════════════════════════════════╗
║         OPENCLAW SECURITY AUDIT REPORT                     ║
╠════════════════════════════════════════════════════════════╣
║ Risk Level: MEDIUM                                         ║
║                                                            ║
║ [HIGH] MCP server 'filesystem' has full home access        ║
│        → Recommendation: Restrict to ~/.openclaw/workspace ║
│                                                            ║
║ [MEDIUM] .env file found in workspace root                 ║
│        → Recommendation: Move to ~/.openclaw/.env          ║
│                                                            ║
║ [LOW] No .gitignore for .openclaw directory                ║
│        → Recommendation: Add .openclaw to ~/.gitignore     ║
╚════════════════════════════════════════════════════════════╝
```

### Harden Your Installation

```bash
# Apply recommended fixes automatically
./scripts/audit.sh --fix

# Or manually review and apply:
./scripts/audit.sh --report > audit-report.md
cat audit-report.md
```

## Security Checklist

Run through this before using OpenClaw with production data:

- [ ] **Filesystem scope**: Limit to `~/.openclaw/workspace` only
- [ ] **MCP servers**: Audit each server—remove unused ones
- [ ] **Environment isolation**: Keep secrets in `~/.openclaw/.env`, not project root
- [ ] **Network egress**: Review outbound connections in MCP configs
- [ ] **Git safety**: Ensure `.openclaw` is in your global `.gitignore`
- [ ] **Backup verification**: Confirm you can restore without OpenClaw
- [ ] **Session timeouts**: Enable auto-lock after inactivity

## The Recommendation

**Run OpenClaw in a container for anything touching production systems.**

```dockerfile
# Dockerfile.openclaw-secure
FROM node:22-slim

RUN useradd -m -s /bin/bash openclaw
USER openclaw
WORKDIR /home/openclaw/workspace

# Install OpenClaw with restricted scope
RUN npm install -g @anthropics/openclaw

# Pre-configure limited filesystem access
COPY openclaw.config.json /home/openclaw/.openclaw/

# No sudo, no host filesystem access, network isolated
ENTRYPOINT ["openclaw"]
```

```bash
# Run isolated
docker run -it --rm \
  --network none \
  --read-only \
  --tmpfs /tmp:noexec,nosuid,size=100m \
  -v $(pwd)/workspace:/home/openclaw/workspace:ro \
  openclaw-secure
```

## Why Containerization Matters

OpenClaw's power comes from **ambient authority**—access to everything your user can access. This is the opposite of the principle of least privilege. Containers give you:

1. **Filesystem boundaries** — Can only see mounted volumes
2. **Network boundaries** — No unexpected outbound connections
3. **Process boundaries** — Cannot spawn persistent background tasks
4. **Audit trails** — Every session is reproducible

For business/enterprise use, consider running OpenClaw in:
- Docker containers with read-only root filesystems
- Firejail sandboxes on Linux
- Restricted macOS app sandboxes
- Cloud-based isolated environments (GitHub Codespaces, etc.)

## Advanced: Custom Security Policy

Create `~/.openclaw/security-policy.json`:

```json
{
  "filesystem": {
    "allow": ["~/.openclaw/workspace", "~/projects"],
    "deny": ["~/.ssh", "~/.aws", "~/.kube", "**/node_modules"]
  },
  "commands": {
    "blocked": ["curl", "wget", "ssh", "scp", "docker"],
    "require_confirmation": ["rm -rf", "git push", "npm publish"]
  },
  "mcp_servers": {
    "allowed_hosts": ["api.github.com", "api.supabase.io"],
    "blocked_schemes": ["file://", "ftp://"]
  }
}
```

The audit skill validates against this policy.

## Troubleshooting

**"audit.sh: permission denied"**
```bash
chmod +x ~/.openclaw/skills/openclaw-security-audit/scripts/audit.sh
```

**"MCP server not found"**
- Verify OpenClaw is installed: `which openclaw`
- Check MCP config location: `cat ~/.openclaw/mcp.json`

**False positives in secret detection**
- Add patterns to `~/.openclaw/security-exclusions.txt`
- Re-run with `--exclude-known`

## Contributing

Found a security issue? Report privately: security@goorca.ai

Want to improve the audit? PRs welcome: https://github.com/thenatechambers/openclaw-skills-repo

## License

MIT — Use at your own risk. This audit tool helps identify issues but does not guarantee security.
