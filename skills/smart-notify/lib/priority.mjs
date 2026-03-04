/**
 * Priority and routing logic
 * Determines when to batch, escalate, or send immediately
 */

const config = {
  quiet_hours: {
    enabled: true,
    start: 22, // 10 PM
    end: 8     // 8 AM
  },
  batching: {
    medium: 15,  // 15 minutes
    low: 60      // 1 hour
  }
};

export function isQuietHours() {
  if (!config.quiet_hours.enabled) return false;
  
  const now = new Date();
  const hour = now.getHours();
  
  if (config.quiet_hours.start > config.quiet_hours.end) {
    // Overnight quiet hours (e.g., 22:00 - 08:00)
    return hour >= config.quiet_hours.start || hour < config.quiet_hours.end;
  }
  
  return hour >= config.quiet_hours.start && hour < config.quiet_hours.end;
}

export function shouldBatch(priority) {
  return priority === 'low' || priority === 'medium';
}

export function getBatchWindow(priority) {
  return config.batching[priority] || config.batching.medium;
}

export function shouldEscalate(notification, minutesElapsed) {
  const rules = {
    critical: 5,
    high: 30
  };
  
  const threshold = rules[notification.priority];
  if (!threshold) return false;
  
  return minutesElapsed >= threshold;
}
