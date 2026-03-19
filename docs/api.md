# Agent Flexbox Engine API Documentation

## FlexboxEngine Class

### Constructor
```javascript
new FlexboxEngine(options = {})
```

**Options:**
- `precision: number` - Layout calculation precision (default: 0.001)
- `maxIterations: number` - Max layout calculation passes (default: 100)

### Methods

#### registerElement(id, element)
Register a flex container or item.

**Parameters:**
- `id: string` - Unique element identifier
- `element: Object` - Element definition

**Element Properties:**
```javascript
{
  // Container properties
  display: 'flex',
  flexDirection: 'row' | 'column' | 'row-reverse' | 'column-reverse',
  flexWrap: 'nowrap' | 'wrap' | 'wrap-reverse',
  justifyContent: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly',
  alignItems: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch',
  alignContent: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'stretch',
  gap: number,
  
  // Size properties
  width: number | 'fill_container',
  height: number | 'fill_container',
  minWidth: number,
  minHeight: number,
  maxWidth: number,
  maxHeight: number,
  
  // Flex item properties
  flexGrow: number,
  flexShrink: number,
  flexBasis: number | 'auto' | string,
  alignSelf: 'auto' | 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch',
  
  // Spacing
  margin: number | [number] | [number, number] | [number, number, number, number],
  padding: number | [number] | [number, number] | [number, number, number, number],
  
  // Relationships
  parent: string,
  children: string[]
}
```

#### calculateLayout(viewport)
Calculate layout for all registered elements.

**Parameters:**
- `viewport: Object` - Available viewport size `{ width: number, height: number }`

**Returns:**
- `Map<string, Layout>` - Computed layouts keyed by element ID

#### exportLayout()
Export computed layouts as JSON.

**Returns:**
```javascript
{
  layouts: Array<{
    id: string,
    type: string,
    x: number,
    y: number,
    width: number,
    height: number,
    children: Array<Layout>
  }>,
  timestamp: string,
  engine: 'agent-flexbox-engine',
  version: string
}
```

## CLI Interface

### Commands

#### create
Create a flex element.

```bash
node src/index.js create <type> <id> [--property value]...
```

**Example:**
```bash
node src/index.js create container main --width 400 --height 300 --flexDirection column
```

#### layout
Calculate layout for viewport.

```bash
node src/index.js layout [width] [height]
```

**Example:**
```bash
node src/index.js layout 390 844
```

#### export
Export layout as JSON.

```bash
node src/index.js export [filename]
```

**Example:**
```bash
node src/index.js export layout.json
```

#### test
Run basic functionality test.

```bash
node src/index.js test
```

#### help
Show help information.

```bash
node src/index.js help
```

## Performance Characteristics

- **Layout calculation**: O(n) where n = number of elements
- **Memory usage**: O(n) proportional to element count  
- **Typical performance**: <1ms for simple layouts, <10ms for complex layouts
- **Scalability**: Linear scaling up to 1000+ elements
