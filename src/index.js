#!/usr/bin/env node

/**
 * Agent Flexbox Engine - Main Entry Point
 * Production-grade CSS Flexbox layout engine for agent-driven design automation
 */

import { FlexboxEngine } from './core/FlexboxEngine.js';
import { CLI } from './cli/CLI.js';

async function main() {
  console.log('🎯 Agent Flexbox Engine v0.1.0');
  console.log('Production-grade CSS Flexbox layout for AI agents\n');

  // Initialize the engine
  const engine = new FlexboxEngine();
  
  // Start CLI interface
  const cli = new CLI(engine);
  await cli.run(process.argv.slice(2));
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
