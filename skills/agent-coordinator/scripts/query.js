#!/usr/bin/env node
/**
 * Query tool for Claude Code integration
 * Returns formatted state for agent consumption
 */

const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '..', '.coordinator-config.json');

function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

function loadState(config) {
  if (!config || config.backend !== 'json') {
    return null;
  }
  if (!fs.existsSync(config.statePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(config.statePath, 'utf8'));
}

function query() {
  const config = loadConfig();
  const state = loadState(config);
  
  if (!state) {
    console.log(JSON.stringify({ error: 'Coordinator not initialized or no state' }));
    return;
  }
  
  // Format for agent consumption
  const activeAgents = Object.entries(state.agents)
    .filter(([_, info]) => {
      const idle = Date.now() - new Date(info.last_ping).getTime() > 5 * 60 * 1000;
      return !idle;
    })
    .map(([id, info]) => ({
      id,
      task: info.current_task,
      message: info.message
    }));
  
  const inProgressTasks = Object.entries(state.tasks)
    .filter(([_, info]) => info.status === 'in_progress')
    .map(([name, info]) => ({
      name,
      claimedBy: info.claimed_by,
      claimedAt: info.claimed_at
    }));
  
  const recentChanges = state.ground_truth?.recent_changes?.slice(-5) || [];
  
  console.log(JSON.stringify({
    activeAgents,
    inProgressTasks,
    recentChanges,
    version: state.version,
    lastUpdated: state.last_updated
  }, null, 2));
}

query();
