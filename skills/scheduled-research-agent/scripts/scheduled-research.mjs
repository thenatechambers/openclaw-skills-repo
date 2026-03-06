#!/usr/bin/env node
/**
 * Scheduled Research Agent
 * 
 * A self-contained research agent with persistent memory.
 * Remembers what it found and only surfaces new information.
 * 
 * Usage:
 *   node scheduled-research.mjs --config ./config.json --dry-run
 *   node scheduled-research.mjs --config ./config.json --output ./results.json
 */

import { readFile, writeFile, mkdir, access } from 'fs/promises';
import { existsSync } from 'fs';
import { dirname, join } from 'path';

const CONFIG_PATH = process.argv.includes('--config') 
  ? process.argv[process.argv.indexOf('--config') + 1]
  : './config.json';
const DRY_RUN = process.argv.includes('--dry-run');
const INIT = process.argv.includes('--init');

// Default configuration template
const DEFAULT_CONFIG = {
  name: "My Research Monitor",
  schedule: "0 9 * * *",
  sources: [
    {
      type: "hackernews",
      query: "AI agent",
      min_points: 3
    }
  ],
  deduplication: {
    key: "url",
    retention_days: 30
  },
  alert: {
    min_new_items: 1,
    channels: ["file"]
  }
};

// Source adapters
async function searchHackerNews(query, minPoints = 3) {
  try {
    const response = await fetch(
      `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=20`
    );
    if (!response.ok) throw new Error(`HN API error: ${response.status}`);
    const data = await response.json();
    return data.hits
      .filter(h => h.points >= minPoints)
      .map(h => ({
        url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
        title: h.title,
        source: 'hackernews',
        score: h.points,
        comments: h.num_comments,
        created_at: new Date(h.created_at).toISOString()
      }));
  } catch (error) {
    console.error(`❌ HN search failed: ${error.message}`);
    return [];
  }
}

async function searchGitHub(query, sort = 'updated') {
  try {
    const response = await fetch(
      `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=${sort}&order=desc&per_page=10`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'OpenClawResearchBot/1.0'
        }
      }
    );
    if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
    const data = await response.json();
    return data.items?.map(r => ({
      url: r.html_url,
      title: r.full_name,
      description: r.description,
      source: 'github',
      stars: r.stargazers_count,
      updated: r.updated_at,
      created_at: r.created_at
    })) || [];
  } catch (error) {
    console.error(`❌ GitHub search failed: ${error.message}`);
    return [];
  }
}

async function searchReddit(subreddit, keywords = [], limit = 25) {
  try {
    const response = await fetch(
      `https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}`,
      { 
        headers: { 
          'User-Agent': 'OpenClawResearchBot/1.0 (research monitoring)' 
        } 
      }
    );
    if (!response.ok) throw new Error(`Reddit API error: ${response.status}`);
    const data = await response.json();
    const posts = data.data?.children || [];
    
    // Filter by keywords if provided
    const filtered = keywords.length > 0
      ? posts.filter(p => keywords.some(k => 
          p.data.title.toLowerCase().includes(k.toLowerCase()) ||
          (p.data.selftext && p.data.selftext.toLowerCase().includes(k.toLowerCase()))
        ))
      : posts;
    
    return filtered.map(p => ({
      url: `https://reddit.com${p.data.permalink}`,
      title: p.data.title,
      source: 'reddit',
      subreddit,
      score: p.data.score,
      comments: p.data.num_comments,
      created_at: new Date(p.data.created_utc * 1000).toISOString()
    }));
  } catch (error) {
    console.error(`❌ Reddit search failed: ${error.message}`);
    return [];
  }
}

// Memory management
async function loadMemory(memoryPath) {
  try {
    const data = await readFile(memoryPath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {
      initialized: new Date().toISOString(),
      last_run: null,
      seen: {},
      stats: { total_runs: 0, total_discovered: 0, total_new: 0 }
    };
  }
}

async function saveMemory(memoryPath, memory) {
  await mkdir(dirname(memoryPath), { recursive: true });
  await writeFile(memoryPath, JSON.stringify(memory, null, 2));
}

function cleanupOldEntries(memory, retentionDays) {
  const cutoff = Date.now() - (retentionDays * 24 * 60 * 60 * 1000);
  let removed = 0;
  
  for (const [key, meta] of Object.entries(memory.seen)) {
    const entryDate = new Date(meta.first_seen || memory.initialized).getTime();
    if (entryDate < cutoff) {
      delete memory.seen[key];
      removed++;
    }
  }
  
  if (removed > 0) {
    console.log(`🧹 Cleaned up ${removed} old entries (>${retentionDays} days)`);
  }
  
  return memory;
}

function findNewItems(results, memory) {
  const seen = new Set(Object.keys(memory.seen));
  return results.filter(item => !seen.has(item.url));
}

function updateMemory(memory, newItems, source) {
  const now = new Date().toISOString();
  
  for (const item of newItems) {
    memory.seen[item.url] = {
      first_seen: now,
      source: item.source || source,
      title: item.title
    };
  }
  
  memory.last_run = now;
  memory.stats.total_runs++;
  memory.stats.total_discovered += newItems.length;
  memory.stats.total_new += newItems.length;
  
  return memory;
}

// Main execution
async function runResearch(config, memory) {
  const allResults = [];
  const bySource = {};
  
  console.log(`🔍 Running research: ${config.name}`);
  console.log(`   Sources: ${config.sources.length}`);
  
  for (const source of config.sources) {
    let results = [];
    
    try {
      switch (source.type) {
        case 'hackernews':
          results = await searchHackerNews(source.query, source.min_points);
          break;
        case 'github':
          results = await searchGitHub(source.query, source.sort);
          break;
        case 'reddit':
          results = await searchReddit(source.subreddit, source.keywords, source.limit);
          break;
        default:
          console.warn(`⚠️ Unknown source type: ${source.type}`);
      }
      
      bySource[source.type] = results.length;
      allResults.push(...results);
      
      // Rate limit protection
      await new Promise(r => setTimeout(r, 1000));
      
    } catch (error) {
      console.error(`❌ Source ${source.type} failed: ${error.message}`);
      bySource[source.type] = 0;
    }
  }
  
  // Deduplicate
  const newItems = findNewItems(allResults, memory);
  
  return {
    all: allResults,
    new: newItems,
    bySource
  };
}

async function generateOutput(config, results, memory) {
  const now = new Date().toISOString();
  const date = now.split('T')[0];
  
  return {
    date,
    config_name: config.name,
    run_at: now,
    summary: {
      total_checked: config.sources.length,
      total_found: results.all.length,
      new_items: results.new.length,
      by_source: results.bySource
    },
    new_items: results.new.map(item => ({
      ...item,
      discovered_at: now
    })),
    stats: memory.stats
  };
}

async function sendAlert(config, output, outputPath) {
  const { alert } = config;
  
  if (output.new_items.length < alert.min_new_items) {
    console.log(`📭 No alert sent (${output.new_items.length} new items, minimum ${alert.min_new_items})`);
    return;
  }
  
  // File alert (always)
  if (alert.channels.includes('file')) {
    console.log(`\n📝 Results saved to: ${outputPath}`);
  }
  
  // Console alert
  console.log(`\n🔔 ALERT: ${output.new_items.length} new items found!`);
  console.log('='.repeat(50));
  
  for (const item of output.new_items.slice(0, 5)) {
    const meta = item.stars ? `⭐ ${item.stars}` : 
                 item.score ? `⬆️ ${item.score}` : '';
    console.log(`\n• ${item.title} ${meta}`);
    console.log(`  ${item.url}`);
    if (item.description) {
      console.log(`  ${item.description.slice(0, 100)}...`);
    }
  }
  
  if (output.new_items.length > 5) {
    console.log(`\n... and ${output.new_items.length - 5} more`);
  }
  
  console.log(`\nSee full results: ${outputPath}`);
  console.log('='.repeat(50));
}

async function initialize() {
  const configDir = dirname(CONFIG_PATH);
  
  // Create directories
  await mkdir(configDir, { recursive: true });
  await mkdir(join(configDir, 'outputs'), { recursive: true });
  
  // Write default config
  await writeFile(CONFIG_PATH, JSON.stringify(DEFAULT_CONFIG, null, 2));
  
  console.log('✅ Initialized scheduled research agent');
  console.log(`   Config: ${CONFIG_PATH}`);
  console.log(`   Edit the config, then run without --init`);
}

// Main
async function main() {
  if (INIT) {
    await initialize();
    return;
  }
  
  // Load config
  let config;
  try {
    const configData = await readFile(CONFIG_PATH, 'utf-8');
    config = JSON.parse(configData);
  } catch (error) {
    console.error(`❌ Failed to load config: ${error.message}`);
    console.log('Run with --init to create a default config');
    process.exit(1);
  }
  
  // Set up paths
  const baseDir = dirname(CONFIG_PATH);
  const memoryPath = join(baseDir, 'memory.json');
  const outputsDir = join(baseDir, 'outputs');
  
  // Ensure outputs directory exists
  await mkdir(outputsDir, { recursive: true });
  
  // Load or initialize memory
  let memory = await loadMemory(memoryPath);
  
  // Clean up old entries
  memory = cleanupOldEntries(memory, config.deduplication?.retention_days || 30);
  
  if (DRY_RUN) {
    console.log('🔍 DRY RUN MODE');
    console.log(`Memory contains ${Object.keys(memory.seen).length} seen items`);
  }
  
  // Run research
  const results = await runResearch(config, memory);
  
  console.log(`\n📊 Results:`);
  console.log(`   Total found: ${results.all.length}`);
  console.log(`   New items: ${results.new.length}`);
  Object.entries(results.bySource).forEach(([source, count]) => {
    console.log(`   - ${source}: ${count}`);
  });
  
  if (!DRY_RUN) {
    // Update memory with new items
    memory = updateMemory(memory, results.new, 'research-run');
    await saveMemory(memoryPath, memory);
    
    // Generate output
    const output = await generateOutput(config, results, memory);
    const outputPath = join(outputsDir, `${output.date}.json`);
    await writeFile(outputPath, JSON.stringify(output, null, 2));
    
    // Send alerts
    await sendAlert(config, output, outputPath);
    
    console.log(`\n✅ Run complete`);
    console.log(`   Memory: ${Object.keys(memory.seen).length} items tracked`);
    console.log(`   Output: ${outputPath}`);
  } else {
    console.log('\n🔍 Dry run complete (no changes made)');
    console.log(`Would add ${results.new.length} new items to memory`);
  }
}

main().catch(error => {
  console.error(`❌ Fatal error: ${error.message}`);
  process.exit(1);
});
