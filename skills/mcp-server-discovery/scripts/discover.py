#!/usr/bin/env python3
"""
MCP Server Discovery Tool
Discover, evaluate, and manage MCP servers for AI agents.
"""

import argparse
import json
import sys
from typing import Dict, List, Optional

# Curated MCP server registry
MCP_REGISTRY = {
    "sqlite-mcp": {
        "name": "SQLite MCP",
        "description": "Local SQLite database operations with minimal overhead",
        "category": "database",
        "cost_impact": 0.95,  # 95% reduction
        "popularity": "high",
        "install": "npm install -g @modelcontextprotocol/server-sqlite",
        "use_cases": ["local data storage", "session persistence", "analytics caching"],
        "github": "https://github.com/modelcontextprotocol/servers/tree/main/src/sqlite"
    },
    "postgres-mcp": {
        "name": "PostgreSQL MCP",
        "description": "PostgreSQL database queries with structured results",
        "category": "database",
        "cost_impact": 0.90,
        "popularity": "high",
        "install": "pip install mcp-server-postgres",
        "use_cases": ["production databases", "analytics", "user data"],
        "github": "https://github.com/modelcontextprotocol/servers/tree/main/src/postgres"
    },
    "browserwing": {
        "name": "BrowserWing",
        "description": "Convert browser actions into MCP commands",
        "category": "web",
        "cost_impact": 0.80,
        "popularity": "high",
        "install": "npm install -g @browserwing/mcp-server",
        "use_cases": ["web scraping", "browser automation", "E2E testing"],
        "github": "https://github.com/browserwing/browserwing"
    },
    "whatsapp-mcp": {
        "name": "WhatsApp MCP",
        "description": "WhatsApp Business API integration",
        "category": "communication",
        "cost_impact": 0.60,
        "popularity": "high",
        "install": "pip install whatsapp-mcp",
        "use_cases": ["customer support", "notifications", "chatbots"],
        "github": "https://github.com/lharries/whatsapp-mcp"
    },
    "github-mcp": {
        "name": "GitHub MCP",
        "description": "Repository operations, issues, PRs, and releases",
        "category": "dev-tools",
        "cost_impact": 0.70,
        "popularity": "high",
        "install": "npm install -g @modelcontextprotocol/server-github",
        "use_cases": ["code review", "issue tracking", "CI/CD integration"],
        "github": "https://github.com/modelcontextprotocol/servers/tree/main/src/github"
    },
    "ghidra-mcp": {
        "name": "Ghidra MCP",
        "description": "110+ tools for AI-assisted reverse engineering",
        "category": "dev-tools",
        "cost_impact": 0.88,
        "popularity": "niche",
        "install": "pip install ghidra-mcp",
        "use_cases": ["reverse engineering", "malware analysis", "binary research"],
        "github": "https://github.com/LaurieWired/GhidraMCP"
    },
    "redis-mcp": {
        "name": "Redis MCP",
        "description": "Caching, sessions, and real-time data",
        "category": "database",
        "cost_impact": 0.85,
        "popularity": "medium",
        "install": "npm install -g @modelcontextprotocol/server-redis",
        "use_cases": ["caching", "session store", "rate limiting"],
        "github": "https://github.com/modelcontextprotocol/servers/tree/main/src/redis"
    },
    "slack-mcp": {
        "name": "Slack MCP",
        "description": "Slack bot operations and messaging",
        "category": "communication",
        "cost_impact": 0.65,
        "popularity": "medium",
        "install": "npm install -g @modelcontextprotocol/server-slack",
        "use_cases": ["team notifications", "chatops", "alerting"],
        "github": "https://github.com/modelcontextprotocol/servers/tree/main/src/slack"
    },
    "docker-mcp": {
        "name": "Docker MCP",
        "description": "Container management and operations",
        "category": "dev-tools",
        "cost_impact": 0.60,
        "popularity": "medium",
        "install": "pip install mcp-server-docker",
        "use_cases": ["container orchestration", "deployment", "dev environments"],
        "github": "https://github.com/ckreiling/mcp-server-docker"
    },
    "aws-mcp": {
        "name": "AWS MCP",
        "description": "AWS cloud resource management",
        "category": "dev-tools",
        "cost_impact": 0.65,
        "popularity": "medium",
        "install": "npm install -g @modelcontextprotocol/server-aws",
        "use_cases": ["EC2 management", "S3 operations", "Lambda deployment"],
        "github": "https://github.com/modelcontextprotocol/servers/tree/main/src/aws"
    }
}


def search_servers(query: str, category: Optional[str] = None) -> List[Dict]:
    """Search MCP servers by query string."""
    results = []
    query_lower = query.lower()
    
    for key, server in MCP_REGISTRY.items():
        if category and server["category"] != category:
            continue
        
        # Search in name, description, and use cases
        searchable_text = f"{server['name']} {server['description']} {' '.join(server['use_cases'])}"
        if query_lower in searchable_text.lower():
            results.append({"id": key, **server})
    
    return sorted(results, key=lambda x: x["cost_impact"], reverse=True)


def get_server(name: str) -> Optional[Dict]:
    """Get detailed info on a specific server."""
    if name in MCP_REGISTRY:
        return {"id": name, **MCP_REGISTRY[name]}
    return None


def compare_servers(server_ids: List[str], metric: str = "cost_impact") -> List[Dict]:
    """Compare multiple servers by a metric."""
    results = []
    for sid in server_ids:
        server = get_server(sid.strip())
        if server:
            results.append(server)
    
    if metric == "cost_impact":
        return sorted(results, key=lambda x: x["cost_impact"], reverse=True)
    return results


def format_table(servers: List[Dict]) -> str:
    """Format servers as a table."""
    if not servers:
        return "No servers found."
    
    lines = [
        "┌─────────────────────┬──────────────────────┬─────────────┬────────────┐",
        "│ Server              │ Category             │ Cost Impact │ Popularity │",
        "├─────────────────────┼──────────────────────┼─────────────┼────────────┤"
    ]
    
    for s in servers:
        name = s['name'][:19].ljust(19)
        cat = s['category'][:20].ljust(20)
        impact = f"{int(s['cost_impact']*100)}%".center(11)
        pop = s['popularity'][:10].center(10)
        lines.append(f"│ {name} │ {cat} │ {impact} │ {pop} │")
    
    lines.append("└─────────────────────┴──────────────────────┴─────────────┴────────────┘")
    return "\n".join(lines)


def format_details(server: Dict) -> str:
    """Format detailed server info."""
    lines = [
        f"\n🛠️  {server['name']}",
        f"{'=' * 50}",
        f"\n📋 Description: {server['description']}",
        f"🏷️  Category: {server['category']}",
        f"📊 Cost Impact: {int(server['cost_impact']*100)}% reduction",
        f"⭐ Popularity: {server['popularity']}",
        f"\n💻 Installation:",
        f"   {server['install']}",
        f"\n🎯 Use Cases:",
    ]
    for uc in server['use_cases']:
        lines.append(f"   • {uc}")
    lines.extend([
        f"\n🔗 GitHub: {server['github']}"
    ])
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="Discover and evaluate MCP servers")
    parser.add_argument("--query", "-q", help="Search query for servers")
    parser.add_argument("--category", "-c", help="Filter by category (database/web/communication/dev-tools)")
    parser.add_argument("--name", "-n", help="Get details on a specific server")
    parser.add_argument("--compare", help="Compare servers (comma-separated IDs)")
    parser.add_argument("--metric", default="cost_impact", help="Comparison metric")
    parser.add_argument("--format", "-f", choices=["table", "json", "list"], default="list", help="Output format")
    parser.add_argument("--details", action="store_true", help="Show full details")
    parser.add_argument("--list-all", action="store_true", help="List all servers")
    
    args = parser.parse_args()
    
    if args.list_all:
        servers = [{"id": k, **v} for k, v in MCP_REGISTRY.items()]
        servers = sorted(servers, key=lambda x: x["cost_impact"], reverse=True)
        
        if args.format == "json":
            print(json.dumps(servers, indent=2))
        elif args.format == "table":
            print(format_table(servers))
        else:
            for s in servers:
                print(f"• {s['name']} ({s['category']}) — {int(s['cost_impact']*100)}% cost reduction")
    
    elif args.name:
        server = get_server(args.name)
        if server:
            if args.details:
                print(format_details(server))
            else:
                print(f"{server['name']}: {server['description']}")
                print(f"  Cost impact: {int(server['cost_impact']*100)}% | Install: {server['install']}")
        else:
            print(f"Server '{args.name}' not found. Run with --list-all to see available servers.")
            sys.exit(1)
    
    elif args.compare:
        server_ids = args.compare.split(",")
        results = compare_servers(server_ids, args.metric)
        
        if args.format == "json":
            print(json.dumps(results, indent=2))
        elif args.format == "table":
            print(format_table(results))
        else:
            print(f"Comparison by {args.metric}:")
            for s in results:
                print(f"  {s['name']}: {int(s['cost_impact']*100)}% cost reduction")
    
    elif args.query:
        results = search_servers(args.query, args.category)
        
        if args.format == "json":
            print(json.dumps(results, indent=2))
        elif args.format == "table":
            print(format_table(results))
        else:
            print(f"Found {len(results)} server(s) matching '{args.query}':\n")
            for s in results:
                print(f"• {s['name']}")
                print(f"  {s['description']}")
                print(f"  💰 {int(s['cost_impact']*100)}% cost reduction | ID: {s['id']}")
                print()
    
    else:
        parser.print_help()
        print("\n\nTip: Use --list-all to see all available MCP servers")


if __name__ == "__main__":
    main()
