#!/usr/bin/env node
/**
 * Smart Notify CLI
 * Send notifications through the intelligent filtering system
 */

import { sendNotification } from './lib/notify.mjs';

const args = process.argv.slice(2);
const flags = {};

for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith('--')) {
    const key = args[i].slice(2);
    const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
    flags[key] = value;
    if (value !== true) i++;
  }
}

async function main() {
  if (!flags.message) {
    console.error('Usage: node notify.mjs --message "Your message" [--priority low|medium|high|critical] [--source agent-name]');
    process.exit(1);
  }

  const notification = {
    message: flags.message,
    priority: flags.priority || 'medium',
    source: flags.source || 'manual',
    timestamp: new Date().toISOString(),
    metadata: flags.metadata ? JSON.parse(flags.metadata) : {}
  };

  try {
    const result = await sendNotification(notification);
    console.log('✅ Notification sent:', result.route);
  } catch (error) {
    console.error('❌ Failed to send:', error.message);
    process.exit(1);
  }
}

main();
