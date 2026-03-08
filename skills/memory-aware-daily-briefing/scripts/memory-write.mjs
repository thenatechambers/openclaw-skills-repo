#!/usr/bin/env node
/**
 * Memory Write Helper for Memory-Aware Daily Briefing
 * 
 * Writes briefing summaries and user context to persistent memory.
 * Usage: node memory-write.mjs --content "..." --tier daily --tags "briefing"
 */

import { execSync } from 'child_process';

const args = process.argv.slice(2);
const content = extractArg(args, '--content') || '';
const tier = extractArg(args, '--tier') || 'daily';
const scope = extractArg(args, '--scope') || 'agent';
const tags = extractArg(args, '--tags') || 'briefing';

function extractArg(args, flag) {
  const idx = args.indexOf(flag);
  if (idx !== -1 && args[idx + 1]) {
    return args[idx + 1];
  }
  return null;
}

if (!content) {
  console.error('Usage: node memory-write.mjs --content "..." [--tier daily] [--tags "tag1,tag2"]');
  process.exit(1);
}

// Call the workspace memory-write script
const workspaceRoot = process.env.OPENCLAW_WORKSPACE || '/home/keiko/.openclaw/workspace';
const cmd = `node ${workspaceRoot}/scripts/memory-write.mjs \\
  --content "${content.replace(/"/g, '\\"')}" \\
  --tier ${tier} \\
  --scope ${scope} \\
  --tags "${tags}"`;

try {
  execSync(cmd, { stdio: 'inherit' });
} catch (e) {
  console.error('Failed to write memory:', e.message);
  process.exit(1);
}
