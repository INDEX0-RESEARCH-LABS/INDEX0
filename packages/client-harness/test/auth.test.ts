import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {
  getCredentialsPath,
  getConfigDir,
  loadCredentials,
  saveCredentials,
  clearCredentials,
  type IIndex0Credentials
} from '../dist/auth.js';

test('Auth — Config and Credentials Paths', () => {
  const configDir = getConfigDir();
  const credPath = getCredentialsPath();

  assert.equal(configDir, path.join(os.homedir(), '.index0'));
  assert.equal(credPath, path.join(os.homedir(), '.index0', 'credentials.json'));
});

test('Auth — Save, Load, and Clear Lifecycle', () => {
  // Backup existing credentials if present
  const original = loadCredentials();

  const mockCreds: IIndex0Credentials = {
    githubToken: 'gho_test_token_1234567890',
    username: 'test-user',
    email: 'test@index0.in',
    avatarUrl: 'https://github.com/test-user.png',
    githubId: 99999999,
    authenticatedAt: new Date().toISOString()
  };

  try {
    saveCredentials(mockCreds);
    const loaded = loadCredentials();
    assert.ok(loaded !== null);
    assert.equal(loaded?.username, 'test-user');
    assert.equal(loaded?.githubId, 99999999);
    assert.equal(loaded?.githubToken, 'gho_test_token_1234567890');

    const cleared = clearCredentials();
    assert.equal(cleared, true);
    assert.equal(loadCredentials(), null);
  } finally {
    // Restore original credentials if there were any
    if (original) {
      saveCredentials(original);
    }
  }
});
