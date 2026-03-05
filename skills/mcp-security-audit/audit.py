#!/usr/bin/env python3
"""
MCP Security Audit Tool
Scans MCP configurations and generates security policies
"""

import json
import yaml
import sys
import os
import argparse
from pathlib import Path
from typing import Dict, List, Any

# Risk patterns for MCP tools
RISK_PATTERNS = {
    "critical": [
        ("shell", ["rm -rf", "sudo", "curl.*|.*sh", "wget.*|.*sh", "> /dev", "mkfs", "dd if"]),
        ("filesystem", ["rm -rf", "sudo", "chmod -R", "chown -R"]),
        ("postgres", ["DROP DATABASE", "DROP TABLE", "TRUNCATE", "DELETE FROM"]),
        ("github", ["force-push", "delete", "repo:delete", "admin:"]),
        ("slack", ["admin.", "users.", "conversations.archive"]),
    ],
    "high": [
        ("shell", ["curl", "wget", "ssh", "scp", "git push"]),
        ("filesystem", ["write", "delete", "move", "rename"]),
        ("postgres", ["UPDATE", "INSERT", "ALTER", "CREATE"]),
        ("github", ["push", "merge", "pr:merge", "workflow:dispatch"]),
    ],
    "medium": [
        ("search", ["*"]),
        ("filesystem", ["read", "list", "glob"]),
        ("email", ["send", "draft"]),
    ]
}

# Recommended policy templates
POLICY_TEMPLATES = {
    "postgres": {
        "name": "postgres-safety",
        "server": "postgres",
        "defaultAction": "gate",
        "rules": [
            {"pattern": "SELECT *", "action": "allow", "reason": "Read-only operations"},
            {"pattern": "DROP *", "action": "deny", "reason": "Prevent schema destruction"},
            {"pattern": "DELETE *", "action": "gate", "reason": "Require approval for deletion"},
            {"pattern": "UPDATE *", "action": "gate", "reason": "Require approval for updates"},
        ]
    },
    "shell": {
        "name": "shell-restrictions",
        "server": "shell",
        "defaultAction": "deny",
        "allowedCommands": [
            "ls *", "cat *", "grep *", "head *", "tail *", 
            "find *", "ps *", "pwd", "echo *"
        ],
        "blockedPatterns": [
            {"pattern": "rm -rf *", "reason": "Recursive deletion"},
            {"pattern": "sudo *", "reason": "Privilege escalation"},
            {"pattern": "curl *|*sh", "reason": "Pipe-to-shell attack"},
            {"pattern": "wget *|*sh", "reason": "Pipe-to-shell attack"},
        ]
    },
    "github": {
        "name": "github-protection",
        "server": "github",
        "defaultAction": "allow",
        "rules": [
            {"pattern": "repos:delete", "action": "deny", "reason": "Prevent repo deletion"},
            {"pattern": "force-push", "action": "deny", "reason": "Prevent history rewrite"},
            {"pattern": "pr:merge", "action": "gate", "reason": "Require approval for merges"},
        ]
    }
}


def load_mcp_config(config_path: str) -> Dict:
    """Load MCP configuration from JSON file"""
    path = Path(config_path).expanduser()
    if not path.exists():
        # Try common locations
        common_paths = [
            "~/.openclaw/mcp.json",
            "~/.config/openclaw/mcp.json",
            "./mcp.json",
            "./openclaw.json"
        ]
        for p in common_paths:
            alt_path = Path(p).expanduser()
            if alt_path.exists():
                path = alt_path
                break
    
    if not path.exists():
        print(f"❌ Error: No MCP configuration found at {config_path}")
        print("💡 Tip: Run with --config to specify your MCP config file")
        sys.exit(1)
    
    with open(path) as f:
        config = json.load(f)
    
    # Handle both direct mcpServers and nested config
    if "mcpServers" in config:
        return config["mcpServers"]
    return config


def analyze_server(name: str, config: Dict) -> Dict[str, Any]:
    """Analyze a single MCP server configuration"""
    risks = []
    score = 0
    
    command = config.get("command", "")
    args = config.get("args", [])
    env = config.get("env", {})
    
    # Check for shell access
    if any(x in command.lower() for x in ["bash", "sh", "zsh", "shell"]):
        risks.append({
            "level": "critical",
            "message": "Shell access detected - can execute arbitrary commands",
            "recommendation": "Restrict to allowedCommands or use deny-by-default policy"
        })
        score += 40
    
    # Check for database access
    if any(x in name.lower() for x in ["postgres", "mysql", "sqlite", "db"]):
        has_write = any(x in str(args).lower() for x in ["write", "execute"])
        if has_write:
            risks.append({
                "level": "high",
                "message": "Database write access enabled",
                "recommendation": "Gate DELETE/DROP/UPDATE operations"
            })
            score += 25
    
    # Check for GitHub destructive operations
    if "github" in name.lower():
        risks.append({
            "level": "high", 
            "message": "GitHub access can delete repos, force-push, merge PRs",
            "recommendation": "Deny repo:delete and force-push operations"
        })
        score += 20
    
    # Check environment variables for secrets
    for key, value in env.items():
        if any(x in key.lower() for x in ["token", "key", "secret", "password", "auth"]):
            risks.append({
                "level": "medium",
                "message": f"Potential secret in env var: {key}",
                "recommendation": "Use secret manager instead of env vars"
            })
            score += 10
    
    # Check for filesystem access
    if any(x in name.lower() for x in ["fs", "file", "filesystem"]):
        risks.append({
            "level": "medium",
            "message": "Filesystem access detected",
            "recommendation": "Restrict to specific directories with allowedPaths"
        })
        score += 15
    
    return {
        "name": name,
        "command": command,
        "args": args,
        "risk_score": min(score, 100),
        "risks": risks
    }


def generate_policy(server_name: str, analysis: Dict) -> Dict:
    """Generate a security policy for a server"""
    # Find matching template
    for key, template in POLICY_TEMPLATES.items():
        if key in server_name.lower():
            return template
    
    # Generic policy for unknown servers
    return {
        "name": f"{server_name}-policy",
        "server": server_name,
        "defaultAction": "gate",
        "rules": [
            {"pattern": "*", "action": "gate", "reason": "Unknown server - require approval"}
        ]
    }


def audit_config(config: Dict) -> List[Dict]:
    """Audit all servers in the configuration"""
    results = []
    for name, server_config in config.items():
        analysis = analyze_server(name, server_config)
        results.append(analysis)
    return results


def print_report(results: List[Dict]):
    """Print audit report"""
    print("\n" + "=" * 70)
    print("🔒 MCP SECURITY AUDIT REPORT")
    print("=" * 70)
    
    total_score = sum(r["risk_score"] for r in results) // len(results) if results else 0
    
    # Overall risk rating
    if total_score < 30:
        rating = "🟢 LOW RISK"
    elif total_score < 60:
        rating = "🟡 MEDIUM RISK"
    elif total_score < 90:
        rating = "🟠 HIGH RISK"
    else:
        rating = "🔴 CRITICAL RISK"
    
    print(f"\nOverall Risk Score: {total_score}/100 - {rating}\n")
    
    for result in results:
        print(f"\n📦 Server: {result['name']}")
        print(f"   Command: {result['command']}")
        print(f"   Risk Score: {result['risk_score']}/100")
        
        if result['risks']:
            print("   Issues Found:")
            for risk in result['risks']:
                icon = "🔴" if risk['level'] == 'critical' else "🟠" if risk['level'] == 'high' else "🟡"
                print(f"   {icon} {risk['message']}")
                print(f"      💡 {risk['recommendation']}")
        else:
            print("   ✅ No major issues detected")
    
    print("\n" + "=" * 70)
    print(f"Scanned {len(results)} MCP server(s)")
    print("Run with --generate-policy to create security policies")
    print("=" * 70 + "\n")


def generate_full_policy(results: List[Dict], servers: List[str] = None) -> Dict:
    """Generate complete policy document"""
    policies = []
    
    for result in results:
        if servers and result['name'] not in servers:
            continue
        policy = generate_policy(result['name'], result)
        policies.append(policy)
    
    return {
        "version": "1.0",
        "description": "Auto-generated MCP security policy",
        "policies": policies
    }


def main():
    parser = argparse.ArgumentParser(description="MCP Security Audit Tool")
    parser.add_argument("--config", default="~/.openclaw/mcp.json", help="Path to MCP config")
    parser.add_argument("--action", choices=["audit", "generate-policy", "validate"], 
                       default="audit", help="Action to perform")
    parser.add_argument("--output", "-o", help="Output file for policy")
    parser.add_argument("--servers", help="Comma-separated list of servers to include")
    parser.add_argument("--policy", help="Policy file to validate")
    
    args = parser.parse_args()
    
    if args.action == "validate":
        if not args.policy:
            print("❌ Error: --policy required for validate action")
            sys.exit(1)
        print(f"✅ Policy validation not yet implemented")
        return
    
    # Load and analyze configuration
    try:
        config = load_mcp_config(args.config)
    except Exception as e:
        print(f"❌ Error loading config: {e}")
        sys.exit(1)
    
    results = audit_config(config)
    
    if args.action == "audit":
        print_report(results)
    
    elif args.action == "generate-policy":
        server_list = args.servers.split(",") if args.servers else None
        policy = generate_full_policy(results, server_list)
        
        output = yaml.dump(policy, default_flow_style=False, sort_keys=False)
        
        if args.output:
            with open(args.output, 'w') as f:
                f.write(output)
            print(f"✅ Policy written to {args.output}")
        else:
            print("\n--- GENERATED POLICY ---\n")
            print(output)


if __name__ == "__main__":
    main()
