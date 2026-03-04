/**
 * Learning and preference tracking
 * Adapts notification behavior based on user engagement
 */

import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';

const LEARNING_FILE = './learning-data.json';

let learningData = {
  engagement: [],
  sourcePreferences: {},
  timePatterns: {},
  lastUpdated: new Date().toISOString()
};

export async function loadLearningData() {
  try {
    if (existsSync(LEARNING_FILE)) {
      const data = await readFile(LEARNING_FILE, 'utf-8');
      learningData = JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load learning data:', error.message);
  }
}

export async function saveLearningData() {
  try {
    await writeFile(LEARNING_FILE, JSON.stringify(learningData, null, 2));
  } catch (error) {
    console.error('Failed to save learning data:', error.message);
  }
}

export async function logEngagement(notification, action) {
  await loadLearningData();
  
  learningData.engagement.push({
    timestamp: new Date().toISOString(),
    source: notification.source,
    priority: notification.priority,
    action // 'sent', 'acknowledged', 'ignored'
  });
  
  // Keep last 1000 entries
  if (learningData.engagement.length > 1000) {
    learningData.engagement = learningData.engagement.slice(-1000);
  }
  
  await saveLearningData();
}

export async function getPreferences() {
  await loadLearningData();
  
  // Calculate source preferences
  const sourceStats = {};
  
  for (const event of learningData.engagement) {
    if (!sourceStats[event.source]) {
      sourceStats[event.source] = { sent: 0, acknowledged: 0 };
    }
    sourceStats[event.source].sent++;
    if (event.action === 'acknowledged') {
      sourceStats[event.source].acknowledged++;
    }
  }
  
  // Calculate engagement rates
  const preferences = {};
  for (const [source, stats] of Object.entries(sourceStats)) {
    preferences[source] = {
      engagementRate: stats.acknowledged / stats.sent,
      totalSent: stats.sent,
      recommendation: stats.acknowledged / stats.sent > 0.5 ? 'keep' : 'reduce'
    };
  }
  
  return preferences;
}

export async function shouldReduceFrequency(source) {
  const prefs = await getPreferences();
  return prefs[source]?.recommendation === 'reduce';
}
