#!/usr/bin/env node
/**
 * Analyze learning data and show insights
 */

import { getPreferences } from './lib/learner.mjs';

const args = process.argv.slice(2);

async function main() {
  if (args.includes('--show-profile')) {
    console.log('📊 Your Notification Profile\n');
    
    const prefs = await getPreferences();
    
    if (Object.keys(prefs).length === 0) {
      console.log('No data yet. Send some notifications first!');
      return;
    }
    
    console.log('Source Engagement Rates:');
    for (const [source, data] of Object.entries(prefs)) {
      const rate = (data.engagementRate * 100).toFixed(1);
      const icon = data.recommendation === 'keep' ? '✅' : '⚠️';
      console.log(`  ${icon} ${source}: ${rate}% (${data.totalSent} sent)`);
    }
  }
  
  if (args.includes('--show-sources')) {
    console.log('📡 Notification Sources\n');
    console.log('Run with --show-profile to see engagement stats');
  }
}

main().catch(console.error);
