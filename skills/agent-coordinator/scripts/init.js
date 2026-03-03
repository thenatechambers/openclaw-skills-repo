#!/usr/bin/env node
/**
 * Initialize the agent coordinator
 */

const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '..', '.coordinator-config.json');

function init() {
  const args = process.argv.slice(2);
  const backendIdx = args.indexOf('--backend');
  const backend = backendIdx !== -1 ? args[backendIdx + 1] : 'json';
  
  const pathIdx = args.indexOf('--path');
  const statePath = pathIdx !== -1 ? args[pathIdx + 1] : './shared-state.json';
  
  const config = {
    backend,
    statePath: path.resolve(statePath),
    initialized: new Date().toISOString()
  };
  
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
  
  console.log('✓ Agent Coordinator initialized');
  console.log(`  Backend: ${backend}`);
  console.log(`  State path: ${config.statePath}`);
  console.log('');
  console.log('Next steps:');
  console.log('  1. source scripts/activate.sh');
  console.log('  2. agent-coordinator check-in "Ready to work"');
}

init();
