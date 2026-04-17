---
name: secure-context
description: Run OpenClaw agents in a security-hardened environment with defined boundaries, sandboxing guidance, and safe defaults. Essential for anyone concerned about AI agent security.
author: Keiko Atlas
version: 1.0.0
tags: [security, sandbox, setup, safety, hardening]
---

# Secure Context Skill

Run OpenClaw without losing sleep. This skill provides concrete security boundaries and safe defaults for running AI agents on your infrastructure.

## Purpose

OpenClaw is powerful—but with power comes risk. This skill helps you:
- Define clear security boundaries for your agent
- Set up sandboxed/isolated environments
- Follow security checklists before going live
- Choose between containerization and VM approaches

## Quick Start: The 5-Minute Secure Setup

The fastest way to run OpenClaw safely: **Docker with restricted permissions**.

```bash
# Create a dedicated directory for agent work
mkdir -p ~/openclaw-sandbox
cd ~/openclaw-sandbox

# Run OpenClaw in a container with limited scope
docker run -it --rm \
  --name openclaw-secure \
  --read-only \
  --tmpfs /tmp:noexec,nosuid,size=100m \
  -v $(pwd)/work:/home/openclaw/work:rw \
  -e OPENCLAW_WORK_DIR=/home/openclaw/work \
  --security-opt=no-new-privileges:true \
  --cap-drop=ALL \
  --cap-add=CHOWN \
  --cap-add=SETGID \
  --cap-add=SETUID \
  --network=bridge \
  ghcr.io/openclaw/openclaw:latest
```

This setup:
- ✅ Runs in an isolated container
- ✅ Has read-only filesystem (except work dir)
- ✅ Drops all unnecessary capabilities
- ✅ Prevents privilege escalation
- ✅ Limits network access

## Security Boundaries Checklist

Before running any agent with tool access, verify:

### File System Boundaries
- [ ] Agent can only access a dedicated working directory
- [ ] No access to `.ssh/`, `.aws/`, `.env` files, or other credentials
- [ ] No write access to system directories (`/usr`, `/etc`, `/bin`)
- [ ] Temporary files isolated to `/tmp` with noexec flag

### Network Boundaries
- [ ] Outbound traffic restricted to necessary endpoints only
- [ ] No inbound ports exposed (unless specifically needed)
- [ ] Internal network segments isolated (no access to `192.168.x.x`, `10.x.x.x`)

### Credential Boundaries
- [ ] API keys passed via environment variables, never in code
- [ ] Secrets mounted as files, not env vars where possible
- [ ] No long-lived credentials stored in agent memory
- [ ] Rotate any credentials the agent touches

### Tool Boundaries
- [ ] Agent only has tools it needs (no browser if doing backend work)
- [ ] Dangerous tools (`exec` with `rm`, `browser` with file uploads) disabled or sandboxed
- [ ] Message/send tools require explicit user confirmation

## Setup Approaches

### Option 1: Docker Container (Recommended for Most Users)

**Best for:** Development, testing, single-purpose agents
**Effort:** Low
**Isolation:** Medium-High

```dockerfile
# Dockerfile.secure
FROM ghcr.io/openclaw/openclaw:latest

# Create non-root user
RUN useradd -m -u 1000 openclaw && \
    mkdir -p /home/openclaw/work && \
    chown -R openclaw:openclaw /home/openclaw

# Switch to non-root
USER openclaw
WORKDIR /home/openclaw/work

# Set restrictive umask
ENV UMASK=0077

# Only mount what you need
VOLUME ["/home/openclaw/work"]
```

Run with:
```bash
docker build -f Dockerfile.secure -t openclaw-secure .
docker run -it --rm \
  --read-only \
  --security-opt=no-new-privileges:true \
  --cap-drop=ALL \
  -v $(pwd)/work:/home/openclaw/work:rw \
  -e OPENAI_API_KEY \
  openclaw-secure
```

### Option 2: VM or Cloud Instance (Maximum Isolation)

**Best for:** Production workloads, sensitive data, multi-tenant scenarios
**Effort:** Medium
**Isolation:** Maximum

```bash
# Launch a fresh VM (example: AWS EC2)
aws ec2 run-instances \
  --image-id ami-xxxxxxxx \
  --instance-type t3.medium \
  --key-name my-key \
  --security-group-ids sg-xxxxxxxx \
  --user-data '#!/bin/bash
    apt-get update
    apt-get install -y docker.io
    usermod -aG docker ubuntu
    # Run OpenClaw in container on boot
    docker run -d --name openclaw \
      --restart unless-stopped \
      --read-only \
      --security-opt=no-new-privileges:true \
      -v /home/ubuntu/agent-work:/work:rw \
      ghcr.io/openclaw/openclaw:latest'
```

Benefits:
- Complete OS isolation
- Snapshots/backups for recovery
- Easy to destroy and recreate
- No risk to host machine

### Option 3: Firejail (Linux Desktop Users)

**Best for:** Running on your daily driver with confidence
**Effort:** Low
**Isolation:** Medium

```bash
# Install firejail
sudo apt-get install firejail

# Create a profile for OpenClaw
cat > ~/.config/firejail/openclaw.profile << 'EOF'
include /etc/firejail/default.profile

# Whitelist only necessary directories
whitelist ~/openclaw-work
whitelist ~/.openclaw

# Blacklist sensitive areas
blacklist ~/.ssh
blacklist ~/.aws
blacklist ~/.gnupg
blacklist /etc/shadow

# Network restrictions
netfilter
protocol unix,inet,inet6
EOF

# Run OpenClaw in jail
firejail --profile=openclaw npm start
```

## The Paranoid's Pre-Flight Checklist

Run through this before any agent session with elevated risk:

```markdown
## Session Security Check

- [ ] Working in isolated directory (not home root)
- [ ] No sensitive files in agent's read path
- [ ] API keys are temporary/limited scope
- [ ] Output won't be logged to insecure location
- [ ] Can terminate session instantly if needed
- [ ] Understand what tools the agent can invoke
-```

## Safe Defaults Template

Copy this to your agent's `AGENTS.md` or `SOUL.md`:

```markdown
## Security Boundaries

I operate within these constraints:

1. **File Access**: Only read/write from `/home/openclaw/work/`. Never access:
   - SSH keys (~/.ssh/)
   - AWS credentials (~/.aws/)
   - Environment files (.env, .env.local)
   - System directories (/etc, /usr, /var)

2. **Network**: I will not:
   - Access internal IP ranges (10.x, 172.16-31.x, 192.168.x)
   - Make requests to unknown endpoints without confirmation
   - Upload files to external services

3. **Execution**: I will:
   - Ask before running destructive commands (rm, format, etc.)
   - Avoid sudo/root operations
   - Confirm before sending messages or emails

4. **Secrets**: I will:
   - Never log API keys or passwords
   - Treat all credentials as sensitive
   - Remind you to rotate keys after use
```

## Emergency Procedures

If something goes wrong:

1. **Kill the session immediately**: `Ctrl+C` or `docker kill <container>`
2. **Rotate exposed credentials**: Change any API keys the agent had access to
3. **Check logs**: Review what the agent accessed or executed
4. **Revoke tokens**: Disable OAuth tokens, SSH keys, or other credentials
5. **Document incident**: Note what happened for future hardening

## Common Mistakes to Avoid

❌ **Running as root** - Always use unprivileged users
❌ **Mounting entire home directory** - Only mount specific work folders
❌ **Using production API keys** - Create limited-scope keys for agents
❌ **Letting agents access email** - Email is a privilege escalation vector
❌ **Ignoring tool permissions** - Review what each skill/tool can do

## Advanced: Network Policies

For Kubernetes or container orchestration:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: openclaw-agent-policy
spec:
  podSelector:
    matchLabels:
      app: openclaw-agent
  policyTypes:
  - Ingress
  - Egress
  egress:
  - to:
    - namespaceSelector: {}
    ports:
    - protocol: TCP
      port: 443  # HTTPS only
  - to:
    - ipBlock:
        cidr: 0.0.0.0/0
        except:
        - 10.0.0.0/8
        - 172.16.0.0/12
        - 192.168.0.0/16
```

## Resources

- [Docker Security Best Practices](https://docs.docker.com/develop/security-best-practices/)
- [Firejail Documentation](https://firejail.wordpress.com/documentation-2/)
- [CIS Docker Benchmark](https://www.cisecurity.org/benchmark/docker)

## Version History

- **1.0.0** (2026-04-17): Initial release with Docker, VM, and Firejail approaches
