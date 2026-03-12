#!/usr/bin/env node
/**
 * collect-github.mjs - Fetch GitHub activity for standup report
 * Usage: node collect-github.mjs --username <user> --repos repo1,repo2 --since 2026-03-11
 */

import { readFile } from 'fs/promises';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
  console.error('Error: GITHUB_TOKEN environment variable required');
  process.exit(1);
}

// Parse args
const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const [k, v] = a.replace('--', '').split('=');
  return [k, v || true];
}));

const username = args.username;
const repos = (args.repos || '').split(',').filter(Boolean);
const since = args.since || new Date(Date.now() - 24*60*60*1000).toISOString().split('T')[0];

if (!username || repos.length === 0) {
  console.error('Usage: node collect-github.mjs --username <user> --repos org/repo1,org/repo2');
  process.exit(1);
}

async function fetchGitHub(path) {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  });
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  return res.json();
}

async function collectRepoActivity(repo) {
  const [owner, name] = repo.split('/');
  const sinceISO = `${since}T00:00:00Z`;
  
  try {
    // Fetch commits by user
    const commits = await fetchGitHub(`/repos/${repo}/commits?author=${username}&since=${sinceISO}&per_page=10`);
    
    // Fetch user's PRs
    const prs = await fetchGitHub(`/repos/${repo}/pulls?state=all&per_page=20`);
    const myPrs = prs.filter(p => p.user.login === username && p.created_at >= sinceISO);
    
    // Fetch issues closed by user
    const issues = await fetchGitHub(`/repos/${repo}/issues?state=closed&since=${sinceISO}&per_page=20`);
    const myIssues = issues.filter(i => i.closed_by?.login === username);
    
    return {
      repo,
      commits: commits.map(c => ({ sha: c.sha.slice(0,7), message: c.commit.message.split('\n')[0] })),
      prsOpened: myPrs.filter(p => p.state === 'open').length,
      prsMerged: myPrs.filter(p => p.merged_at).length,
      issuesClosed: myIssues.length
    };
  } catch (err) {
    return { repo, error: err.message };
  }
}

async function main() {
  console.error(`Collecting GitHub activity for ${username} since ${since}...`);
  
  const results = await Promise.all(repos.map(collectRepoActivity));
  
  // Output as JSON
  console.log(JSON.stringify({
    username,
    since,
    repositories: results
  }, null, 2));
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
