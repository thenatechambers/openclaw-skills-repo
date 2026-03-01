#!/usr/bin/env node
/**
 * MCP Server Discovery Script
 * Queries the MCP server registry and returns available servers
 */

const https = require('https');

const REGISTRY_URL = 'raw.githubusercontent.com/modelcontextprotocol/servers/refs/heads/main/README.md';

async function fetchRegistry() {
  return new Promise((resolve, reject) => {
    const req = https.get(`https://${REGISTRY_URL}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
  });
}

function parseServers(readme) {
  const servers = [];
  const lines = readme.split('\n');
  let inTable = false;
  
  for (const line of lines) {
    // Look for server entries in the format: | [name](url) | description |
    const match = line.match(/\|\s*\[([^\]]+)\]\(([^)]+)\)\s*\|\s*([^|]+)\|/);
    if (match && !line.includes('---')) {
      servers.push({
        name: match[1].trim(),
        url: match[2].trim(),
        description: match[3].trim()
      });
    }
  }
  
  return servers;
}

function main() {
  const args = process.argv.slice(2);
  const searchTerm = args.find((a, i) => args[i-1] === '--search') || '';
  const category = args.find((a, i) => args[i-1] === '--category') || '';
  const jsonOutput = args.includes('--json');
  
  fetchRegistry()
    .then(readme => {
      let servers = parseServers(readme);
      
      // Filter by search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        servers = servers.filter(s => 
          s.name.toLowerCase().includes(term) ||
          s.description.toLowerCase().includes(term)
        );
      }
      
      // Output
      if (jsonOutput) {
        console.log(JSON.stringify(servers, null, 2));
      } else {
        console.log(`\n📦 MCP Servers${searchTerm ? ` matching "${searchTerm}"` : ''}\n`);
        console.log('=' .repeat(60));
        servers.slice(0, 20).forEach(s => {
          console.log(`\n${s.name}`);
          console.log(`  ${s.description.substring(0, 80)}${s.description.length > 80 ? '...' : ''}`);
          console.log(`  → ${s.url}`);
        });
        console.log(`\n${servers.length} server(s) found`);
      }
    })
    .catch(err => {
      console.error('❌ Failed to fetch registry:', err.message);
      console.log('\nCommon MCP servers to try:');
      console.log('  @modelcontextprotocol/server-github');
      console.log('  @modelcontextprotocol/server-postgres');
      console.log('  @modelcontextprotocol/server-slack');
      console.log('  @modelcontextprotocol/server-puppeteer');
      process.exit(1);
    });
}

main();
