#!/bin/bash
# Agent Coordinator - Shell activation script
# Source this file to add coordinator commands to your shell

COORDINATOR_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

agent-coordinator() {
  node "$COORDINATOR_DIR/scripts/coordinator.js" "$@"
}

export -f agent-coordinator

echo "Agent Coordinator activated"
echo "Commands available: agent-coordinator [check-in|claim-task|release-task|list-agents|list-tasks|read-ground-truth|ping]"
