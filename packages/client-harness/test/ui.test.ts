import test from 'node:test';
import assert from 'node:assert/strict';
import {
  stringWidth,
  drawBox,
  renderCockpitHeader,
  renderFooterHints,
  renderDiffBox,
  DEFAULT_SLASH_COMMANDS,
  promptInteractive
} from '../dist/ui.js';

test('UI Engine — Accurate stringWidth measurement', () => {
  assert.equal(stringWidth('hello'), 5);
  // ANSI escape code stripping
  assert.equal(stringWidth('\x1b[1m\x1b[2mbold-dim\x1b[0m'), 8);
  // Wide character measurement (e.g. box drawing or full-width)
  assert.equal(stringWidth('│  hello  │'), 11);
});

test('UI Engine — Cockpit Header and Box Rendering', () => {
  const header = renderCockpitHeader({ model: 'azure-gpt-4o', cwd: '/test/workspace', width: 78 });
  assert.ok(header.includes('INDEX0 AI // SOVEREIGN COCKPIT'));
  assert.ok(header.includes('azure-gpt-4o'));
  assert.ok(header.includes('/test/workspace'));
  assert.ok(header.includes('ZDR 100%'));
});

test('UI Engine — INDEX0 Footer Hints', () => {
  const footer = renderFooterHints(78);
  assert.ok(footer.includes('[Enter]'));
  assert.ok(footer.includes('Send'));
  assert.ok(footer.includes('[/]'));
  assert.ok(footer.includes('Commands'));
  assert.ok(footer.includes('[Ctrl+P]'));
  assert.ok(footer.includes('[F2]'));
});

test('UI Engine — Monochrome Diff Viewer', () => {
  const diff = `--- a/file.ts\n+++ b/file.ts\n@@ -1,2 +1,3 @@\n-old code\n+new verified code\n context`;
  const rendered = renderDiffBox(diff, 78);
  assert.ok(rendered.includes('GENERATED AST DIFF'));
  assert.ok(rendered.includes('+new verified code'));
  assert.ok(rendered.includes('-old code'));
});

test('UI Engine — Default Slash Commands Catalog', () => {
  const names = DEFAULT_SLASH_COMMANDS.map((c) => c.name);
  assert.ok(names.includes('/review'));
  assert.ok(names.includes('/prompt'));
  assert.ok(names.includes('/models'));
  assert.ok(names.includes('/stats'));
  assert.ok(names.includes('/worktrees'));
  assert.ok(names.includes('/clean'));
  assert.ok(names.includes('/health'));
  assert.ok(names.includes('/clear'));
  assert.ok(names.includes('/exit'));
});
