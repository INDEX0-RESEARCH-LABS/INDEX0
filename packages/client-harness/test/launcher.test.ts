import { test } from 'node:test';
import * as assert from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { patchEngineBranding, ensureIndex0Config, INDEX0_HOME, INDEX0_CONFIG_PATH } from '../dist/launcher.js';

test('Launcher — ensureIndex0Config creates valid sovereign configuration', () => {
  ensureIndex0Config();
  assert.strictEqual(fs.existsSync(INDEX0_CONFIG_PATH), true);
  const cfg = JSON.parse(fs.readFileSync(INDEX0_CONFIG_PATH, 'utf8'));
  assert.deepStrictEqual(cfg.enabled_providers, ['index0']);
  assert.strictEqual(cfg.disabled_providers, undefined);
  assert.strictEqual(cfg.provider.index0.name, 'INDEX0');
  assert.strictEqual(cfg.provider.index0.models['azure-gpt-4o'].name, 'GPT-4o');
});

test('Launcher — patchEngineBranding replaces ASCII logo and eradicates branding', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'index0-patch-test-'));
  const dummyBin = path.join(tmpDir, 'dummy-engine');

  // Create a dummy binary containing target chunk patterns and strings
  const chunkHeader = '\x00/$bunfs/root/chunk-mbaw4k9t.js\x00// @bun\n';
  const chunkBody = 'var _={left:["original_opencode_logo"],right:["original_right"]};export{_ as Dn,t as En};\n';
  const pad = '/*'.padEnd(500, ' ') + '*/';
  const nextChunk = '\x00/$bunfs/root/chunk-3rqjk32r.js\x00// @bun\n';
  const testPhrases = 'https://api.opencode.ai OpenCode OPENCODE_CONFIG_DIR "opencode"';

  const fullContent = Buffer.concat([
    Buffer.from('PRE_DATA_'.repeat(10)),
    Buffer.from(chunkHeader),
    Buffer.from(chunkBody),
    Buffer.from(pad),
    Buffer.from(nextChunk),
    Buffer.from(testPhrases),
    Buffer.from('POST_DATA_'.repeat(10))
  ]);

  const origLen = fullContent.length;
  fs.writeFileSync(dummyBin, fullContent);

  patchEngineBranding(dummyBin);

  const patched = fs.readFileSync(dummyBin);
  assert.strictEqual(patched.length, origLen, 'Binary length must remain 100% byte-for-byte identical');
  const patchedStr = patched.toString('utf8');
  assert.strictEqual(patchedStr.includes('original_opencode_logo'), false, 'Old logo must be removed');
  assert.strictEqual(patchedStr.includes('█▀▀▄ █▀▀█ █▀▀█ █  █ █▀▀█'), true, 'New index0 logo must be present');
  assert.strictEqual(patchedStr.includes('http://api.ai.index0.in'), true, 'API URL must be replaced');
  assert.strictEqual(patchedStr.includes('INDEX0___CONFIG_DIR'), true, 'Env var must be replaced with underscores');
  assert.strictEqual(/opencode/i.test(patchedStr), false, 'Zero occurrences of opencode allowed');

  fs.rmSync(tmpDir, { recursive: true, force: true });
});
