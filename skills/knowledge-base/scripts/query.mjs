#!/usr/bin/env node
/**
 * Knowledge Base Query CLI
 * Query your indexed documentation
 */

const query = process.argv.slice(2).join(' ');

if (!query) {
  console.log('Usage: node query.mjs "your question here"');
  process.exit(1);
}

console.log(`🔍 Searching knowledge base for: "${query}"\n`);

// Simulated search results for demonstration
// In production, this would query the actual vector store
const mockResults = [
  {
    file: "docs/deployment.md",
    excerpt: "The deployment process involves three steps: build, test, and deploy...",
    score: 0.92
  },
  {
    file: "docs/api-guide.md", 
    excerpt: "Authentication requires a bearer token in the Authorization header...",
    score: 0.87
  },
  {
    file: "docs/README.md",
    excerpt: "This project uses Docker for containerization and Kubernetes for orchestration...",
    score: 0.74
  }
];

mockResults.forEach((r, i) => {
  console.log(`${i + 1}. ${r.file} (${(r.score * 100).toFixed(0)}% match)`);
  console.log(`   ${r.excerpt.substring(0, 120)}...\n`);
});

console.log(`Found ${mockResults.length} relevant documents.`);
console.log('\n💡 Tip: Run `node index.mjs` to re-index your documentation.');
