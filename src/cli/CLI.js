/**
 * CLI - Command Line Interface for Agent Flexbox Engine
 * Optimized for programmatic use by AI agents
 */

export class CLI {
  constructor(engine) {
    this.engine = engine;
    this.commands = {
      'create': this.createCommand.bind(this),
      'layout': this.layoutCommand.bind(this),
      'export': this.exportCommand.bind(this),
      'test': this.testCommand.bind(this),
      'help': this.helpCommand.bind(this)
    };
  }

  async run(args) {
    if (args.length === 0) {
      return this.helpCommand();
    }

    const [command, ...params] = args;
    
    if (!this.commands[command]) {
      console.error(`❌ Unknown command: ${command}`);
      console.error('Use "help" to see available commands');
      process.exit(1);
    }

    try {
      await this.commands[command](params);
    } catch (error) {
      console.error(`❌ Error executing command: ${error.message}`);
      process.exit(1);
    }
  }

  /**
   * Create a flex container or item
   */
  createCommand(args) {
    const [type, id, ...props] = args;
    
    if (!type || !id) {
      console.error('Usage: create <type> <id> [props...]');
      return;
    }

    // Parse properties from command line
    const element = { id, type };
    
    for (let i = 0; i < props.length; i += 2) {
      const key = props[i]?.replace('--', '');
      const value = props[i + 1];
      
      if (key && value !== undefined) {
        // Parse numeric values
        if (!isNaN(value)) {
          element[key] = parseFloat(value);
        } else if (value === 'true' || value === 'false') {
          element[key] = value === 'true';
        } else {
          element[key] = value;
        }
      }
    }

    const elementId = this.engine.registerElement(id, element);
    console.log(`✅ Created ${type} element: ${elementId}`);
    console.log(`   Properties: ${JSON.stringify(element, null, 2)}`);
  }

  /**
   * Calculate layout for all elements
   */
  layoutCommand(args) {
    const [widthStr = '800', heightStr = '600'] = args;
    const width = parseFloat(widthStr);
    const height = parseFloat(heightStr);

    console.log(`🔄 Calculating layout for viewport ${width}x${height}`);
    
    const layouts = this.engine.calculateLayout({ width, height });
    
    console.log(`✅ Layout calculated for ${layouts.size} elements:`);
    layouts.forEach((layout, id) => {
      console.log(`   ${id}: (${layout.x}, ${layout.y}) ${layout.width}x${layout.height}`);
    });
  }

  /**
   * Export layout as JSON
   */
  exportCommand(args) {
    const [filename] = args;
    const layout = this.engine.exportLayout();
    
    if (filename) {
      const fs = await import('fs');
      fs.writeFileSync(filename, JSON.stringify(layout, null, 2));
      console.log(`✅ Layout exported to: ${filename}`);
    } else {
      console.log(JSON.stringify(layout, null, 2));
    }
  }

  /**
   * Run basic functionality test
   */
  testCommand(args) {
    console.log('🧪 Running basic functionality test...');
    
    // Create test layout
    this.engine.registerElement('container', {
      id: 'container',
      type: 'container',
      width: 400,
      height: 300,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      padding: [20, 20, 20, 20],
      children: ['header', 'content', 'footer']
    });
    
    this.engine.registerElement('header', {
      id: 'header',
      type: 'header',
      height: 60,
      flexGrow: 0,
      flexShrink: 0
    });
    
    this.engine.registerElement('content', {
      id: 'content', 
      type: 'content',
      flexGrow: 1
    });
    
    this.engine.registerElement('footer', {
      id: 'footer',
      type: 'footer', 
      height: 40,
      flexGrow: 0,
      flexShrink: 0
    });

    const layouts = this.engine.calculateLayout({ width: 400, height: 300 });
    
    console.log('✅ Test completed. Layout results:');
    layouts.forEach((layout, id) => {
      console.log(`   ${id}: (${Math.round(layout.x)}, ${Math.round(layout.y)}) ${Math.round(layout.width)}x${Math.round(layout.height)}`);
    });

    // Verify basic expectations
    const containerLayout = layouts.get('container');
    if (containerLayout && containerLayout.width === 400 && containerLayout.height === 300) {
      console.log('✅ Container layout correct');
    } else {
      console.log('❌ Container layout incorrect');
    }
  }

  /**
   * Show help information  
   */
  helpCommand() {
    console.log(`
🎯 Agent Flexbox Engine CLI

USAGE:
  agent-flexbox <command> [options]

COMMANDS:
  create <type> <id> [props...]   Create a flex element
    Example: create container main --width 400 --height 300 --flexDirection column
    
  layout [width] [height]         Calculate layout (default: 800x600)
    Example: layout 390 844
    
  export [filename]               Export layout as JSON 
    Example: export layout.json
    
  test                           Run basic functionality test
  
  help                           Show this help

EXAMPLES:
  # Create a mobile app layout
  agent-flexbox create container app --width 390 --height 844 --flexDirection column
  agent-flexbox create header nav --height 64 --flexShrink 0
  agent-flexbox create main content --flexGrow 1
  agent-flexbox layout 390 844
  agent-flexbox export mobile-layout.json

AGENT-OPTIMIZED FEATURES:
  ✅ Deterministic output (same input = same result)
  ✅ JSON export for programmatic processing
  ✅ Performance timing for optimization
  ✅ Clear success/error responses
  ✅ Minimal dependencies
`);
  }
}
