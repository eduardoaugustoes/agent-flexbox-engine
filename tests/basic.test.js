/**
 * Basic functionality tests for Agent Flexbox Engine
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { FlexboxEngine } from '../src/core/FlexboxEngine.js';

test('FlexboxEngine initialization', () => {
  const engine = new FlexboxEngine();
  assert.ok(engine instanceof FlexboxEngine);
  assert.equal(engine.elements.size, 0);
  assert.equal(engine.layouts.size, 0);
});

test('Element registration', () => {
  const engine = new FlexboxEngine();
  
  const elementId = engine.registerElement('test', {
    id: 'test',
    type: 'container',
    width: 100,
    height: 200
  });
  
  assert.equal(elementId, 'test');
  assert.equal(engine.elements.size, 1);
  
  const element = engine.elements.get('test');
  assert.equal(element.width, 100);
  assert.equal(element.height, 200);
  assert.equal(element.flexDirection, 'row'); // default
});

test('Layout calculation', () => {
  const engine = new FlexboxEngine();
  
  // Create simple container
  engine.registerElement('container', {
    id: 'container',
    type: 'container',
    width: 400,
    height: 300
  });
  
  const layouts = engine.calculateLayout({ width: 800, height: 600 });
  
  assert.equal(layouts.size, 1);
  
  const containerLayout = layouts.get('container');
  assert.ok(containerLayout);
  assert.equal(containerLayout.width, 400);
  assert.equal(containerLayout.height, 300);
});

test('JSON export', () => {
  const engine = new FlexboxEngine();
  
  engine.registerElement('test', {
    id: 'test',
    type: 'test',
    width: 100,
    height: 100
  });
  
  engine.calculateLayout();
  const exported = engine.exportLayout();
  
  assert.ok(exported.layouts);
  assert.ok(exported.timestamp);
  assert.equal(exported.engine, 'agent-flexbox-engine');
  assert.equal(exported.version, '0.1.0');
  assert.equal(exported.layouts.length, 1);
});

console.log('✅ All basic tests defined');
