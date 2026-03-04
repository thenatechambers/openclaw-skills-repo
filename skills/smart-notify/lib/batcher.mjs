/**
 * Batching engine
 * Groups notifications for digest delivery
 */

const batchQueue = new Map();
const batchTimers = new Map();

export async function addToBatch(notification) {
  const batchKey = `${notification.source}_${notification.priority}`;
  
  if (!batchQueue.has(batchKey)) {
    batchQueue.set(batchKey, []);
  }
  
  batchQueue.get(batchKey).push(notification);
  
  // Set flush timer if not already set
  if (!batchTimers.has(batchKey)) {
    const windowMs = getBatchWindowMs(notification.priority);
    batchTimers.set(batchKey, setTimeout(() => {
      flushBatch(batchKey);
    }, windowMs));
  }
  
  return { batched: true, batchKey, queueLength: batchQueue.get(batchKey).length };
}

export async function flushBatch(batchKey) {
  const notifications = batchQueue.get(batchKey);
  if (!notifications || notifications.length === 0) return;
  
  // Clear the batch and timer
  batchQueue.delete(batchKey);
  batchTimers.delete(batchKey);
  
  // Create digest
  const digest = createDigest(notifications);
  
  // Send digest
  console.log(`[DIGEST] ${batchKey}: ${digest.summary}`);
  
  return { sent: true, count: notifications.length, digest };
}

function createDigest(notifications) {
  const bySource = {};
  
  for (const n of notifications) {
    if (!bySource[n.source]) bySource[n.source] = [];
    bySource[n.source].push(n);
  }
  
  const parts = [];
  for (const [source, items] of Object.entries(bySource)) {
    parts.push(`${source}: ${items.length} notification${items.length > 1 ? 's' : ''}`);
  }
  
  return {
    summary: parts.join('; '),
    count: notifications.length,
    sources: Object.keys(bySource),
    items: notifications.map(n => n.message)
  };
}

function getBatchWindowMs(priority) {
  const minutes = priority === 'low' ? 60 : 15;
  return minutes * 60 * 1000;
}
