/**
 * Core notification library
 * Routes notifications based on priority, batching rules, and user preferences
 */

import { isQuietHours, shouldBatch } from './priority.mjs';
import { addToBatch, flushBatch } from './batcher.mjs';
import { logEngagement, getPreferences } from './learner.mjs';

const config = {
  channels: {
    slack: { enabled: true },
    sms: { enabled: false },
    email: { enabled: false }
  },
  priority_rules: {
    critical: { channels: ['sms', 'slack'], escalate_after_minutes: 5 },
    high: { channels: ['slack'], escalate_after_minutes: 30 },
    medium: { channels: ['slack'], batch_minutes: 15 },
    low: { channels: ['slack'], batch_minutes: 60 }
  }
};

export async function sendNotification(notification) {
  const { priority, message, source } = notification;
  const rules = config.priority_rules[priority] || config.priority_rules.medium;
  
  // Check if we should batch this notification
  if (shouldBatch(priority) && !notification.immediate) {
    await addToBatch(notification);
    return { route: 'batched', queued: true };
  }
  
  // Check quiet hours
  if (isQuietHours() && !rules.bypass_quiet_hours && priority !== 'critical') {
    await addToBatch(notification);
    return { route: 'queued_quiet_hours', queued: true };
  }
  
  // Route to appropriate channels
  const results = [];
  for (const channel of rules.channels) {
    if (config.channels[channel]?.enabled) {
      const result = await deliverToChannel(channel, notification);
      results.push({ channel, status: result });
    }
  }
  
  // Log for learning
  await logEngagement(notification, 'sent');
  
  return { 
    route: 'immediate', 
    channels: results.map(r => r.channel),
    priority 
  };
}

async function deliverToChannel(channel, notification) {
  // Placeholder for actual delivery logic
  // In production, this would call Slack webhooks, Twilio, SendGrid, etc.
  console.log(`[${channel.toUpperCase()}] ${notification.priority}: ${notification.message}`);
  return 'delivered';
}

export function acknowledge(notificationId) {
  return logEngagement({ id: notificationId }, 'acknowledged');
}
