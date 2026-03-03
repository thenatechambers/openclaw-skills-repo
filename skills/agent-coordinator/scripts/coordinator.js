#!/usr/bin/env node
/**
 * Agent Coordinator - Core coordination logic
 * Maintains shared state across multiple agent instances
 */

const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '..', '.coordinator-config.json');
const DEFAULT_STATE = {
  project: 'untitled',
  version: 0,
  last_updated: new Date().toISOString(),
  agents: {},
  tasks: {},
  ground_truth: {
    architecture: '',
    invariants: [],
    recent_changes: []
  }
};

function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    console.error('Coordinator not initialized. Run: node scripts/init.js');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

function loadState(config) {
  if (config.backend === 'json') {
    if (!fs.existsSync(config.statePath)) {
      return { ...DEFAULT_STATE };
    }
    return JSON.parse(fs.readFileSync(config.statePath, 'utf8'));
  }
  // Supabase backend would be implemented here
  console.error('Supabase backend not yet implemented in this version');
  process.exit(1);
}

function saveState(config, state) {
  state.version++;
  state.last_updated = new Date().toISOString();
  
  if (config.backend === 'json') {
    fs.writeFileSync(config.statePath, JSON.stringify(state, null, 2));
  }
}

function getAgentId() {
  return process.env.AGENT_ID || process.env.USER || 'unknown-agent';
}

function checkIn(message) {
  const config = loadConfig();
  const state = loadState(config);
  const agentId = getAgentId();
  
  state.agents[agentId] = {
    status: 'active',
    message: message,
    last_ping: new Date().toISOString()
  };
  
  saveState(config, state);
  console.log(`✓ ${agentId} checked in: ${message}`);
}

function claimTask(taskName) {
  const config = loadConfig();
  const state = loadState(config);
  const agentId = getAgentId();
  
  // Check if task is already claimed
  if (state.tasks[taskName] && state.tasks[taskName].status === 'in_progress') {
    const claimedBy = state.tasks[taskName].claimed_by;
    if (claimedBy !== agentId) {
      console.log(`⚠ Task "${taskName}" is already claimed by ${claimedBy}`);
      console.log(`  Claimed at: ${state.tasks[taskName].claimed_at}`);
      return;
    }
  }
  
  // Release any current task
  Object.keys(state.tasks).forEach(key => {
    if (state.tasks[key].claimed_by === agentId) {
      state.tasks[key].status = 'completed';
      state.tasks[key].completed_at = new Date().toISOString();
      delete state.tasks[key].claimed_by;
    }
  });
  
  // Claim new task
  state.tasks[taskName] = {
    status: 'in_progress',
    claimed_by: agentId,
    claimed_at: new Date().toISOString()
  };
  
  state.agents[agentId] = {
    ...state.agents[agentId],
    current_task: taskName,
    last_ping: new Date().toISOString()
  };
  
  saveState(config, state);
  console.log(`✓ ${agentId} claimed task: ${taskName}`);
}

function releaseTask() {
  const config = loadConfig();
  const state = loadState(config);
  const agentId = getAgentId();
  
  const currentTask = state.agents[agentId]?.current_task;
  if (!currentTask) {
    console.log('No active task to release');
    return;
  }
  
  if (state.tasks[currentTask]) {
    state.tasks[currentTask].status = 'completed';
    state.tasks[currentTask].completed_at = new Date().toISOString();
    delete state.tasks[currentTask].claimed_by;
  }
  
  delete state.agents[agentId].current_task;
  state.agents[agentId].last_ping = new Date().toISOString();
  
  saveState(config, state);
  console.log(`✓ ${agentId} completed task: ${currentTask}`);
}

function listAgents() {
  const config = loadConfig();
  const state = loadState(config);
  
  console.log('Active Agents:');
  console.log('==============');
  
  Object.entries(state.agents).forEach(([id, info]) => {
    const idle = Date.now() - new Date(info.last_ping).getTime() > 5 * 60 * 1000;
    const status = idle ? 'IDLE' : info.status?.toUpperCase() || 'UNKNOWN';
    const task = info.current_task ? `→ ${info.current_task}` : '';
    console.log(`${id}: ${status} ${task}`);
    if (info.message) console.log(`  "${info.message}"`);
  });
}

function listTasks() {
  const config = loadConfig();
  const state = loadState(config);
  
  console.log('Tasks:');
  console.log('======');
  
  Object.entries(state.tasks).forEach(([name, info]) => {
    const status = info.status.toUpperCase();
    const owner = info.claimed_by ? `(${info.claimed_by})` : '';
    console.log(`[${status}] ${name} ${owner}`);
  });
}

function readGroundTruth() {
  const config = loadConfig();
  const state = loadState(config);
  
  console.log('Ground Truth:');
  console.log('=============');
  console.log(state.ground_truth.architecture || '(No architecture documented)');
  
  if (state.ground_truth.invariants.length > 0) {
    console.log('\nInvariants:');
    state.ground_truth.invariants.forEach(inv => console.log(`  • ${inv}`));
  }
  
  if (state.ground_truth.recent_changes.length > 0) {
    console.log('\nRecent Changes:');
    state.ground_truth.recent_changes.slice(-5).forEach(chg => console.log(`  • ${chg}`));
  }
}

function ping() {
  const config = loadConfig();
  const state = loadState(config);
  const agentId = getAgentId();
  
  if (!state.agents[agentId]) {
    state.agents[agentId] = {};
  }
  
  state.agents[agentId].last_ping = new Date().toISOString();
  saveState(config, state);
}

// CLI
const command = process.argv[2];
const args = process.argv.slice(3);

switch (command) {
  case 'check-in':
    checkIn(args.join(' '));
    break;
  case 'claim-task':
    claimTask(args[0]);
    break;
  case 'release-task':
    releaseTask();
    break;
  case 'list-agents':
    listAgents();
    break;
  case 'list-tasks':
    listTasks();
    break;
  case 'read-ground-truth':
    readGroundTruth();
    break;
  case 'ping':
    ping();
    break;
  default:
    console.log('Agent Coordinator');
    console.log('=================');
    console.log('Commands:');
    console.log('  check-in "message"     - Announce what you\'re working on');
    console.log('  claim-task "name"      - Lock a task to prevent conflicts');
    console.log('  release-task           - Mark current task as done');
    console.log('  list-agents            - See who\'s active');
    console.log('  list-tasks             - See all tasks');
    console.log('  read-ground-truth      - Get the canonical spec');
    console.log('  ping                   - Update your heartbeat');
}
