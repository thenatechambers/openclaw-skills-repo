#!/usr/bin/env node
/**
 * update-memory.mjs - Persist standup data for tomorrow's context
 * Usage: node update-memory.mjs --blockers "item1,item2" --learnings "note1,note2"
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

// Parse args
const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const [k, v] = a.replace('--', '').split('=');
  return [k, v || ''];
}));

const memoryPath = (args.path || '~/.openclaw/memory/standup-history.json')
  .replace('~', homedir());

const blockers = args.blockers ? args.blockers.split(',').filter(Boolean) : [];
const learnings = args.learnings ? args.learnings.split(',').filter(Boolean) : [];
const priorities = args.priorities ? args.priorities.split(',').filter(Boolean) : [];

async function main() {
  // Ensure directory exists
  const dir = join(memoryPath, '..');
  await mkdir(dir, { recursive: true });
  
  // Load existing or create new
  let data = { history: [] };
  if (existsSync(memoryPath)) {
    try {
      const content = await readFile(memoryPath, 'utf-8');
      data = JSON.parse(content);
    } catch (e) {
      console.error('Warning: Could not parse existing memory, starting fresh');
    }
  }
  
  // Add today's entry
  const today = new Date().toISOString().split('T')[0];
  data.history.unshift({
    date: today,
    blockers,
    learnings,
    priorities,
    timestamp: new Date().toISOString()
  });
  
  // Keep only last 30 days
  data.last_standup = today;
  data.blockers = blockers;
  data.priorities = priorities;
  data.learnings = learnings;
  data.history = data.history.slice(0, 30);
  
  // Write back
  await writeFile(memoryPath, JSON.stringify(data, null, 2));
  console.error(`Memory updated: ${memoryPath}`);
  console.log(JSON.stringify({ success: true, entries: data.history.length }));
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
