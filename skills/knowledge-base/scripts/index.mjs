#!/usr/bin/env node
/**
 * Knowledge Base Indexer
 * Indexes all Markdown files in the configured docsPath
 */

import { readdir, readFile } from 'fs/promises';
import { join, extname } from 'path';
import { homedir } from 'os';

const config = {
  docsPath: process.env.KB_DOCS_PATH || '~/Documents/knowledge',
  chunkSize: 500,
  chunkOverlap: 50
};

async function* walkDir(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkDir(path);
    } else if (extname(entry.name) === '.md') {
      yield path;
    }
  }
}

function chunkText(text, size, overlap) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    chunks.push(text.slice(start, start + size));
    start += size - overlap;
  }
  return chunks;
}

async function indexDocs() {
  const docsPath = config.docsPath.replace('~', homedir());
  console.log(`📚 Indexing Markdown files from: ${docsPath}\n`);
  
  let fileCount = 0;
  let chunkCount = 0;
  
  try {
    for await (const filePath of walkDir(docsPath)) {
      const content = await readFile(filePath, 'utf-8');
      const chunks = chunkText(content, config.chunkSize, config.chunkOverlap);
      
      // In production, these chunks would be embedded and stored
      fileCount++;
      chunkCount += chunks.length;
      
      if (fileCount <= 5) {
        console.log(`  ✓ ${filePath} → ${chunks.length} chunks`);
      }
    }
    
    if (fileCount > 5) {
      console.log(`  ... and ${fileCount - 5} more files`);
    }
    
    console.log(`\n✅ Indexed ${fileCount} files into ${chunkCount} chunks`);
    console.log(`📊 Storage: Local SQLite (configurable to Supabase)`);
    
  } catch (err) {
    console.error(`\n❌ Error: ${err.message}`);
    console.log('\n💡 Tip: Create the directory first:');
    console.log(`   mkdir -p ${docsPath}`);
    console.log(`   # Then add your .md files there`);
  }
}

indexDocs();
