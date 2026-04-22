#!/bin/bash
#
# OpenClaw Security Audit Script
# Audits OpenClaw installation for security issues
#

set -euo pipefail

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Risk counters
HIGH_RISKS=0
MEDIUM_RISKS=0
LOW_RISKS=0

# Flags
FULL_AUDIT=false
APPLY_FIXES=false
REPORT_ONLY=false

# Paths
OPENCLAW_DIR="${HOME}/.openclaw"
MCP_CONFIG="${OPENCLAW_DIR}/mcp.json"
SETTINGS="${OPENCLAW_DIR}/settings.json"

usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --full       Run complete audit (default: quick scan)"
    echo "  --fix        Apply recommended fixes (interactive)"
    echo "  --report     Output report to stdout (no colors)"
    echo "  --help       Show this help"
    echo ""
    echo "Examples:"
    echo "  $0                    # Quick audit"
    echo "  $0 --full             # Full audit"
    echo "  $0 --report > audit.md # Save report"
}

parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --full) FULL_AUDIT=true ;;
            --fix) APPLY_FIXES=true ;;
            --report) REPORT_ONLY=true ;;
            --help) usage; exit 0 ;;
            *) echo "Unknown option: $1"; usage; exit 1 ;;
        esac
        shift
    done
}

print_header() {
    if [[ "$REPORT_ONLY" == "true" ]]; then
        echo "# OpenClaw Security Audit Report"
        echo "Generated: $(date -u +"%Y-%m-%d %H:%M UTC")"
        echo ""
    else
        echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${BLUE}║         OPENCLAW SECURITY AUDIT                            ║${NC}"
        echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
        echo ""
    fi
}

print_risk() {
    local level="$1"
    local message="$2"
    local recommendation="$3"

    if [[ "$REPORT_ONLY" == "true" ]]; then
        echo "## [$level] $message"
        echo "**Recommendation:** $recommendation"
        echo ""
    else
        case "$level" in
            HIGH)
                echo -e "${RED}[HIGH]${NC} $message"
                ((HIGH_RISKS++))
                ;;
            MEDIUM)
                echo -e "${YELLOW}[MEDIUM]${NC} $message"
                ((MEDIUM_RISKS++))
                ;;
            LOW)
                echo -e "${GREEN}[LOW]${NC} $message"
                ((LOW_RISKS++))
                ;;
        esac
        echo -e "  → $recommendation"
        echo ""
    fi
}

check_openclaw_installed() {
    if ! command -v openclaw &> /dev/null; then
        if [[ "$REPORT_ONLY" != "true" ]]; then
            echo -e "${YELLOW}⚠ OpenClaw not found in PATH${NC}"
        fi
        return 1
    fi
    return 0
}

check_mcp_servers() {
    if [[ ! -f "$MCP_CONFIG" ]]; then
        print_risk "MEDIUM" "No MCP config found" "Verify OpenClaw is properly configured"
        return
    fi

    # Check for filesystem MCP with broad access
    if grep -q '"filesystem"' "$MCP_CONFIG" 2>/dev/null || \
       grep -q 'filesystem-server' "$MCP_CONFIG" 2>/dev/null; then
        
        # Try to read the config to check scope
        if grep -q '"~"' "$MCP_CONFIG" 2>/dev/null || \
           grep -q '"/home' "$MCP_CONFIG" 2>/dev/null; then
            print_risk "HIGH" "MCP filesystem server has broad home directory access" \
                "Restrict MCP filesystem to ~/.openclaw/workspace only"
        fi
    fi

    # Check for fetch/server-fetched MCP (network access)
    if grep -q '"fetch"' "$MCP_CONFIG" 2>/dev/null || \
       grep -q 'server-fetch' "$MCP_CONFIG" 2>/dev/null; then
        print_risk "MEDIUM" "MCP fetch server enabled—review outbound connections" \
            "Audit fetch MCP config for allowed domains"
    fi

    # Count MCP servers (more = more attack surface)
    local mcp_count
    mcp_count=$(grep -c '"name"' "$MCP_CONFIG" 2>/dev/null || echo "0")
    if [[ "$mcp_count" -gt 5 ]]; then
        print_risk "LOW" "$mcp_count MCP servers configured (high attack surface)" \
            "Remove unused MCP servers"
    fi
}

check_env_files() {
    local workspaces=("$OPENCLAW_DIR" "${OPENCLAW_DIR}/workspace" "$(pwd)")
    
    for workspace in "${workspaces[@]}"; do
        if [[ -d "$workspace" ]]; then
            # Find .env files
            while IFS= read -r -d '' envfile; do
                local basename
                basename=$(basename "$envfile")
                
                if [[ "$basename" == ".env" ]] || [[ "$basename" == ".env.local" ]]; then
                    # Check if it's in a safe location
                    if [[ "$envfile" != "$OPENCLAW_DIR"* ]]; then
                        print_risk "MEDIUM" "Environment file found outside .openclaw: $envfile" \
                            "Move to ~/.openclaw/.env and update .gitignore"
                    fi
                    
                    # Check permissions
                    local perms
                    perms=$(stat -c "%a" "$envfile" 2>/dev/null || stat -f "%Lp" "$envfile" 2>/dev/null || echo "644")
                    if [[ "$perms" != "600" ]] && [[ "$perms" != "400" ]]; then
                        print_risk "MEDIUM" "Environment file has loose permissions ($perms): $envfile" \
                            "Run: chmod 600 $envfile"
                    fi
                fi
            done < <(find "$workspace" -maxdepth 2 -name ".env*" -type f -print0 2>/dev/null || true)
        fi
    done
}

check_secrets_exposure() {
    if [[ "$FULL_AUDIT" != "true" ]]; then
        return
    fi

    local patterns=("api_key" "apikey" "password" "secret" "token" "PRIVATE_KEY")
    local workspace="${OPENCLAW_DIR}/workspace"
    
    if [[ ! -d "$workspace" ]]; then
        return
    fi

    for pattern in "${patterns[@]}"; do
        # Quick grep for secrets in common file types
        local matches
        matches=$(grep -ri "$pattern" "$workspace" --include="*.js" --include="*.ts" --include="*.json" --include="*.md" 2>/dev/null | grep -v "node_modules" | head -5 || true)
        
        if [[ -n "$matches" ]]; then
            print_risk "HIGH" "Potential secret exposure: found '$pattern' in code files" \
                "Move secrets to environment variables, use .env files, verify .gitignore"
            break
        fi
    done
}

check_gitignore() {
    local gitignore_paths=("${HOME}/.gitignore" "${OPENCLAW_DIR}/../.gitignore" "$(pwd)/.gitignore")
    local found_openclaw=false
    
    for gitignore in "${gitignore_paths[@]}"; do
        if [[ -f "$gitignore" ]]; then
            if grep -q "\.openclaw" "$gitignore" 2>/dev/null; then
                found_openclaw=true
                break
            fi
        fi
    done
    
    if [[ "$found_openclaw" == "false" ]]; then
        print_risk "LOW" ".openclaw not found in .gitignore" \
            "Add '.openclaw' to ~/.gitignore to prevent accidental commits"
    fi
}

check_ssh_key_access() {
    if [[ -d "${HOME}/.ssh" ]]; then
        # Check if OpenClaw could access SSH keys (indirect check)
        if [[ -f "$MCP_CONFIG" ]]; then
            if grep -q '"~"' "$MCP_CONFIG" 2>/dev/null || \
               grep -q '"/home' "$MCP_CONFIG" 2>/dev/null || \
               grep -q 'root_path.*"~"' "$MCP_CONFIG" 2>/dev/null; then
                print_risk "HIGH" "OpenClaw MCP may have access to ~/.ssh directory" \
                    "Restrict MCP filesystem scope, never allow access to ~/.ssh"
            fi
        fi
    fi
}

print_summary() {
    if [[ "$REPORT_ONLY" == "true" ]]; then
        echo "---"
        echo ""
        echo "## Summary"
        echo ""
        if [[ $HIGH_RISKS -gt 0 ]]; then
            echo "**Risk Level: HIGH** — Address issues before using with production data"
        elif [[ $MEDIUM_RISKS -gt 0 ]]; then
            echo "**Risk Level: MEDIUM** — Review and fix recommended"
        else
            echo "**Risk Level: LOW** — Basic security hygiene maintained"
        fi
        echo ""
        echo "- High risks: $HIGH_RISKS"
        echo "- Medium risks: $MEDIUM_RISKS"  
        echo "- Low risks: $LOW_RISKS"
        echo ""
        echo "Run \`./audit.sh --fix\` to apply recommended fixes."
    else
        echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
        echo ""
        if [[ $HIGH_RISKS -gt 0 ]]; then
            echo -e "${RED}Risk Level: HIGH${NC} — Address issues before using with production data"
        elif [[ $MEDIUM_RISKS -gt 0 ]]; then
            echo -e "${YELLOW}Risk Level: MEDIUM${NC} — Review and fix recommended"
        else
            echo -e "${GREEN}Risk Level: LOW${NC} — Basic security hygiene maintained"
        fi
        echo ""
        echo "High risks: $HIGH_RISKS | Medium risks: $MEDIUM_RISKS | Low risks: $LOW_RISKS"
        echo ""
        echo "Run ./audit.sh --fix to apply recommended fixes."
    fi
}

main() {
    parse_args "$@"
    print_header
    
    check_openclaw_installed || true
    check_mcp_servers
    check_env_files
    check_secrets_exposure
    check_gitignore
    check_ssh_key_access
    
    print_summary
}

main "$@"
