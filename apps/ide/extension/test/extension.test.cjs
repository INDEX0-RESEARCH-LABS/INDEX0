const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const dir = __dirname + '/..';

describe('INDEX0 Extension build', () => {
  it('dist/extension.js exists and is > 1KB', () => {
    const s = fs.statSync(path.join(dir, 'dist/extension.js'));
    assert.ok(s.size > 1000);
  });
  it('dist/webview.js contains styles and role badges', () => {
    const c = fs.readFileSync(path.join(dir, 'dist/webview.js'), 'utf8');
    assert.ok(c.includes('chat-container'));
    assert.ok(c.includes('role-badge'));
  });
  it('index0.vsix exists and is > 10KB', () => {
    const s = fs.statSync(path.join(dir, 'index0.vsix'));
    assert.ok(s.size > 10000);
  });
});
