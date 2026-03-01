#!/usr/bin/env node
/**
 * MCP Server Configuration Generator
 * Generates ready-to-use config for a specific MCP server
 */

const SERVER_CONFIGS = {
  'github': {
    name: '@modelcontextprotocol/server-github',
    description: 'GitHub integration - repos, issues, PRs',
    env: {
      GITHUB_PERSONAL_ACCESS_TOKEN: {
        description: 'GitHub Personal Access Token with repo scope',
        required: true,
        example: 'ghp_xxxxxxxxxxxx'
      }
    },
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-github']
  },
  'postgres': {
    name: '@modelcontextprotocol/server-postgres',
    description: 'PostgreSQL database integration',
    env: {
      POSTGRES_HOST: { description: 'Database host', required: true, example: 'localhost' },
      POSTGRES_PORT: { description: 'Database port', required: false, example: '5432', default: '5432' },
      POSTGRES_DB: { description: 'Database name', required: true, example: 'mydb' },
      POSTGRES_USER: { description: 'Database user', required: true, example: 'postgres' },
      POSTGRES_PASSWORD: { description: 'Database password', required: true, example: 'secret' }
    },
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-postgres']
  },
  'slack': {
    name: '@modelcontextprotocol/server-slack',
    description: 'Slack workspace integration',
    env: {
      SLACK_BOT_TOKEN: { description: 'Slack Bot User OAuth Token', required: true, example: 'xoxb-...' },
      SLACK_TEAM_ID: { description: 'Slack Team/Workspace ID', required: false, example: 'T12345678' }
    },
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-slack']
  },
  'puppeteer': {
    name: '@modelcontextprotocol/server-puppeteer',
    description: 'Browser automation with Puppeteer',
    env: {},
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-puppeteer']
  },
  'filesystem': {
    name: '@modelcontextprotocol/server-filesystem',
    description: 'Safe file system access (respects .gitignore)',
    env: {},
    args_path: true,
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem']
  }
};

function generateConfig(serverName, format = 'json') {
  const config = SERVER_CONFIGS[serverName.toLowerCase()];
  if (!config) {
    console.error(`❌ Unknown server: ${serverName}`);
    console.log('\nAvailable servers:');
    Object.keys(SERVER_CONFIGS).forEach(k => console.log(`  - ${k}`));
    process.exit(1);
  }

  if (format === 'json') {
    const mcpConfig = {
      mcpServers: {
        [serverName]: {
          command: config.command,
          args: config.args,
          env: Object.fromEntries(
            Object.entries(config.env).map(([k, v]) => [k, v.example || v.default || ''])
          )
        }
      }
    };
    
    // Add path arg for filesystem server
    if (config.args_path) {
      mcpConfig.mcpServers[serverName].args.push('/path/to/allowed/directory');
    }
    
    return JSON.stringify(mcpConfig, null, 2);
  }
  
  if (format === 'env') {
    return Object.entries(config.env)
      .map(([k, v]) => `${k}=${v.example || v.default || ''}`)
      .join('\n');
  }
  
  return config;
}

function main() {
  const args = process.argv.slice(2);
  const serverIndex = args.indexOf('--server');
  const serverName = serverIndex >= 0 ? args[serverIndex + 1] : null;
  const format = args.find((a, i) => args[i-1] === '--output') || 'json';
  
  if (!serverName) {
    console.log('Usage: node configure.js --server <name> [--output json|env]');
    console.log('\nAvailable servers:');
    Object.entries(SERVER_CONFIGS).forEach(([k, v]) => {
      console.log(`  ${k.padEnd(12)} - ${v.description}`);
    });
    process.exit(1);
  }
  
  console.log(`\n⚙️  MCP Server Configuration: ${serverName}\n`);
  console.log(generateConfig(serverName, format));
  
  const config = SERVER_CONFIGS[serverName.toLowerCase()];
  if (Object.keys(config.env).length > 0) {
    console.log('\n📋 Required Environment Variables:');
    Object.entries(config.env).forEach(([k, v]) => {
      const status = v.required ? '✓ required' : '○ optional';
      console.log(`  ${k}: ${v.description} (${status})`);
    });
  }
  
  console.log('\n📝 Next Steps:');
  console.log('  1. Set the environment variables shown above');
  console.log('  2. Add the config to your claw.json file');
  console.log('  3. Restart OpenClaw to load the MCP server');
}

main();
