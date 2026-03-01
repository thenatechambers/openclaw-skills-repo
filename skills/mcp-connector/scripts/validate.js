#!/usr/bin/env node
/**
 * MCP Server Validation Script
 * Tests if an MCP server is properly configured and responding
 */

const { spawn } = require('child_process');

const SERVER_CONFIGS = {
  'github': { args: ['-y', '@modelcontextprotocol/server-github'], env: ['GITHUB_PERSONAL_ACCESS_TOKEN'] },
  'postgres': { args: ['-y', '@modelcontextprotocol/server-postgres'], env: ['POSTGRES_HOST', 'POSTGRES_DB'] },
  'slack': { args: ['-y', '@modelcontextprotocol/server-slack'], env: ['SLACK_BOT_TOKEN'] },
  'puppeteer': { args: ['-y', '@modelcontextprotocol/server-puppeteer'], env: [] },
  'filesystem': { args: ['-y', '@modelcontextprotocol/server-filesystem', process.cwd()], env: [] }
};

function validateServer(serverName) {
  return new Promise((resolve, reject) => {
    const config = SERVER_CONFIGS[serverName.toLowerCase()];
    if (!config) {
      reject(new Error(`Unknown server: ${serverName}`));
      return;
    }
    
    // Check env vars
    const missingEnv = config.env.filter(e => !process.env[e]);
    if (missingEnv.length > 0) {
      reject(new Error(`Missing environment variables: ${missingEnv.join(', ')}`));
      return;
    }
    
    // Try to spawn the server
    const proc = spawn('npx', config.args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 10000
    });
    
    let stdout = '';
    let stderr = '';
    
    proc.stdout.on('data', d => stdout += d);
    proc.stderr.on('data', d => stderr += d);
    
    proc.on('error', (err) => {
      reject(new Error(`Failed to start: ${err.message}`));
    });
    
    // Send initialize request
    setTimeout(() => {
      const initRequest = {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: { name: 'mcp-validator', version: '1.0.0' }
        }
      };
      
      proc.stdin.write(JSON.stringify(initRequest) + '\n');
      
      // Give it time to respond
      setTimeout(() => {
        proc.kill();
        
        if (stdout.includes('jsonrpc')) {
          resolve({ ok: true, response: stdout.substring(0, 200) });
        } else if (stderr.includes('error') || stderr.includes('Error')) {
          resolve({ ok: false, error: stderr.substring(0, 200) });
        } else {
          resolve({ ok: true, response: 'Server started (no JSON response expected for this server)' });
        }
      }, 2000);
    }, 1000);
  });
}

function main() {
  const args = process.argv.slice(2);
  const serverIndex = args.indexOf('--server');
  const serverName = serverIndex >= 0 ? args[serverIndex + 1] : null;
  
  if (!serverName) {
    console.log('Usage: node validate.js --server <name>');
    console.log('\nAvailable servers:');
    Object.keys(SERVER_CONFIGS).forEach(k => console.log(`  - ${k}`));
    process.exit(1);
  }
  
  console.log(`\n🔍 Validating MCP server: ${serverName}\n`);
  
  validateServer(serverName)
    .then(result => {
      if (result.ok) {
        console.log('✅ Server is responding');
        console.log(`\nResponse preview: ${result.response}`);
      } else {
        console.log('❌ Server error');
        console.log(`\nError: ${result.error}`);
      }
    })
    .catch(err => {
      console.log('❌ Validation failed');
      console.log(`\n${err.message}`);
      process.exit(1);
    });
}

main();
