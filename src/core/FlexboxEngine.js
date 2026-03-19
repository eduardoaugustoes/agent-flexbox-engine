/**
 * FlexboxEngine - Core CSS Flexbox Layout Implementation
 * 
 * This class implements CSS Flexbox layout algorithm for agent-driven design automation.
 * Designed to be deterministic, fast, and precise for programmatic use.
 */

export class FlexboxEngine {
  constructor(options = {}) {
    this.options = {
      precision: 0.001, // Layout calculation precision
      maxIterations: 100, // Max layout calculation passes
      ...options
    };
    
    this.elements = new Map(); // Element registry
    this.layouts = new Map(); // Computed layouts
  }

  /**
   * Register a flex container element
   * @param {string} id - Element ID
   * @param {Object} element - Element definition
   */
  registerElement(id, element) {
    const normalizedElement = this.normalizeElement(element);
    this.elements.set(id, normalizedElement);
    return id;
  }

  /**
   * Calculate layout for all registered elements
   * @param {Object} viewport - Available viewport size
   * @returns {Map} Computed layouts for each element
   */
  calculateLayout(viewport = { width: 800, height: 600 }) {
    console.log(`🔄 Calculating layout for ${this.elements.size} elements`);
    
    this.layouts.clear();
    
    // Find root elements (no parent)
    const rootElements = Array.from(this.elements.entries())
      .filter(([id, el]) => !el.parent);
    
    // Calculate layout for each root element
    for (const [id, element] of rootElements) {
      const layout = this.calculateElementLayout(element, viewport, null);
      this.layouts.set(id, layout);
    }
    
    console.log(`✅ Layout calculation complete`);
    return this.layouts;
  }

  /**
   * Normalize element properties to CSS Flexbox standard
   */
  normalizeElement(element) {
    return {
      // Container properties
      display: element.display || 'flex',
      flexDirection: element.flexDirection || element.layout === 'vertical' ? 'column' : 'row',
      flexWrap: element.flexWrap || 'nowrap',
      justifyContent: element.justifyContent || 'flex-start',
      alignItems: element.alignItems || 'stretch',
      alignContent: element.alignContent || 'stretch',
      gap: element.gap || 0,
      
      // Size properties
      width: element.width,
      height: element.height,
      minWidth: element.minWidth || 0,
      minHeight: element.minHeight || 0,
      maxWidth: element.maxWidth || Infinity,
      maxHeight: element.maxHeight || Infinity,
      
      // Flex item properties
      flex: element.flex || '0 1 auto',
      flexGrow: element.flexGrow || 0,
      flexShrink: element.flexShrink || 1,
      flexBasis: element.flexBasis || 'auto',
      alignSelf: element.alignSelf || 'auto',
      
      // Spacing
      margin: this.normalizeSpacing(element.margin || 0),
      padding: this.normalizeSpacing(element.padding || 0),
      
      // Metadata
      id: element.id,
      parent: element.parent,
      children: element.children || [],
      type: element.type || 'div'
    };
  }

  /**
   * Calculate layout for a single element and its children
   */
  calculateElementLayout(element, availableSpace, parentLayout) {
    // Calculate element size
    const elementSize = this.resolveElementSize(element, availableSpace);
    
    // Create layout result
    const layout = {
      id: element.id,
      type: element.type,
      x: parentLayout ? parentLayout.x + element.margin[3] : element.margin[3],
      y: parentLayout ? parentLayout.y + element.margin[0] : element.margin[0],
      width: elementSize.width,
      height: elementSize.height,
      children: []
    };
    
    // Calculate children layouts if this is a flex container
    if (element.children && element.children.length > 0) {
      layout.children = this.calculateFlexChildren(element, layout);
    }
    
    return layout;
  }

  /**
   * Calculate children positions using flexbox algorithm
   */
  calculateFlexChildren(container, containerLayout) {
    const children = container.children.map(childId => this.elements.get(childId));
    const direction = container.flexDirection;
    const isRow = direction === 'row' || direction === 'row-reverse';
    
    // Available space for children (minus container padding)
    const availableWidth = containerLayout.width - container.padding[1] - container.padding[3];
    const availableHeight = containerLayout.height - container.padding[0] - container.padding[2];
    
    // Phase 1: Calculate intrinsic sizes
    const childLayouts = children.map(child => {
      const childSize = this.resolveElementSize(child, {
        width: availableWidth,
        height: availableHeight
      });
      
      return {
        id: child.id,
        type: child.type,
        width: childSize.width,
        height: childSize.height,
        flexGrow: child.flexGrow,
        flexShrink: child.flexShrink,
        flexBasis: this.resolveFlexBasis(child.flexBasis, isRow ? availableWidth : availableHeight)
      };
    });
    
    // Phase 2: Distribute available space
    this.distributeFlexSpace(childLayouts, container, availableWidth, availableHeight);
    
    // Phase 3: Position children
    this.positionFlexChildren(childLayouts, container, containerLayout);
    
    return childLayouts;
  }

  /**
   * Resolve element size based on CSS sizing rules
   */
  resolveElementSize(element, availableSpace) {
    let width = element.width;
    let height = element.height;
    
    // Handle fill_container (equivalent to 100%)
    if (width === 'fill_container' || width === '100%') {
      width = availableSpace.width;
    }
    if (height === 'fill_container' || height === '100%') {
      height = availableSpace.height;
    }
    
    // Ensure numbers
    width = typeof width === 'number' ? width : 100; // Default width
    height = typeof height === 'number' ? height : 20; // Default height
    
    // Apply constraints
    width = Math.max(element.minWidth, Math.min(element.maxWidth, width));
    height = Math.max(element.minHeight, Math.min(element.maxHeight, height));
    
    return { width, height };
  }

  /**
   * Resolve flex-basis value
   */
  resolveFlexBasis(flexBasis, availableSize) {
    if (flexBasis === 'auto') return 0; // Use content size (simplified)
    if (typeof flexBasis === 'string' && flexBasis.endsWith('%')) {
      const percent = parseFloat(flexBasis) / 100;
      return availableSize * percent;
    }
    return typeof flexBasis === 'number' ? flexBasis : 0;
  }

  /**
   * Distribute space among flex items
   */
  distributeFlexSpace(childLayouts, container, availableWidth, availableHeight) {
    const isRow = container.flexDirection === 'row' || container.flexDirection === 'row-reverse';
    const availableSize = isRow ? availableWidth : availableHeight;
    
    // Calculate total basis size and grow/shrink factors
    let totalBasisSize = 0;
    let totalGrowFactor = 0;
    let totalShrinkFactor = 0;
    
    childLayouts.forEach(child => {
      totalBasisSize += child.flexBasis;
      totalGrowFactor += child.flexGrow;
      totalShrinkFactor += child.flexShrink;
    });
    
    const remainingSpace = availableSize - totalBasisSize;
    
    // Distribute remaining space
    if (remainingSpace > 0 && totalGrowFactor > 0) {
      // Grow items
      childLayouts.forEach(child => {
        const growth = (child.flexGrow / totalGrowFactor) * remainingSpace;
        if (isRow) {
          child.width = child.flexBasis + growth;
        } else {
          child.height = child.flexBasis + growth;
        }
      });
    } else if (remainingSpace < 0 && totalShrinkFactor > 0) {
      // Shrink items
      childLayouts.forEach(child => {
        const shrinkage = (child.flexShrink / totalShrinkFactor) * Math.abs(remainingSpace);
        if (isRow) {
          child.width = Math.max(0, child.flexBasis - shrinkage);
        } else {
          child.height = Math.max(0, child.flexBasis - shrinkage);
        }
      });
    } else {
      // Use basis size
      childLayouts.forEach(child => {
        if (isRow) {
          child.width = child.flexBasis;
        } else {
          child.height = child.flexBasis;
        }
      });
    }
  }

  /**
   * Position flex children based on justify-content and align-items
   */
  positionFlexChildren(childLayouts, container, containerLayout) {
    const isRow = container.flexDirection === 'row' || container.flexDirection === 'row-reverse';
    const gap = container.gap || 0;
    
    let currentPos = 0;
    
    // Position along main axis (justify-content)
    childLayouts.forEach((child, index) => {
      if (isRow) {
        child.x = containerLayout.x + container.padding[3] + currentPos;
        child.y = containerLayout.y + container.padding[0]; // Will be adjusted by align-items
        currentPos += child.width + (index < childLayouts.length - 1 ? gap : 0);
      } else {
        child.x = containerLayout.x + container.padding[3]; // Will be adjusted by align-items  
        child.y = containerLayout.y + container.padding[0] + currentPos;
        currentPos += child.height + (index < childLayouts.length - 1 ? gap : 0);
      }
    });
    
    // Handle justify-content spacing adjustments
    // (This is simplified - full implementation would handle all justify-content values)
    
    // Handle align-items (cross-axis alignment)  
    // (This is simplified - full implementation would handle all align-items values)
  }

  /**
   * Normalize spacing values (margin, padding)
   */
  normalizeSpacing(spacing) {
    if (typeof spacing === 'number') {
      return [spacing, spacing, spacing, spacing]; // top, right, bottom, left
    }
    if (Array.isArray(spacing)) {
      switch (spacing.length) {
        case 1: return [spacing[0], spacing[0], spacing[0], spacing[0]];
        case 2: return [spacing[0], spacing[1], spacing[0], spacing[1]];
        case 3: return [spacing[0], spacing[1], spacing[2], spacing[1]];
        case 4: return spacing;
        default: return [0, 0, 0, 0];
      }
    }
    return [0, 0, 0, 0];
  }

  /**
   * Export computed layout as JSON
   */
  exportLayout() {
    return {
      layouts: Array.from(this.layouts.entries()).map(([id, layout]) => ({
        id,
        ...layout
      })),
      timestamp: new Date().toISOString(),
      engine: 'agent-flexbox-engine',
      version: '0.1.0'
    };
  }
}
