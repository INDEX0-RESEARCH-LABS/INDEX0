import test from 'node:test';
import assert from 'node:assert/strict';
import { TerminalTokenFilter } from '../dist/filter.js';

test('TerminalTokenFilter — ANSI Stripping', () => {
  const colored = '\x1b[32mSuccess\x1b[0m: compilation finished with \x1b[1;33m2 warnings\x1b[0m';
  const stripped = TerminalTokenFilter.stripAnsi(colored);
  assert.equal(stripped, 'Success: compilation finished with 2 warnings');
});

test('TerminalTokenFilter — Progress Bar Squashing', () => {
  const progressText = 'Fetching packages...\r[=====>          ] 25%\r[==========>     ] 50%\r[===============>] 100%\nCompleted successfully.';
  const squashed = TerminalTokenFilter.squashProgress(progressText);
  assert.ok(squashed.includes('Completed successfully.'));
});

test('TerminalTokenFilter — Token Compression Metrics', () => {
  const noisyTerminalOutput = `
\x1b[36m⠋\x1b[0m Installing dependencies...
[==========>          ] 50%
\x1b[32m✔\x1b[0m Installed 1,420 packages in 3.4s
\x1b[90m[debug] polling status\x1b[0m
\x1b[90m[debug] polling status\x1b[0m
\x1b[90m[debug] polling status\x1b[0m
\x1b[90m[debug] polling status\x1b[0m
Build complete. Output written to dist/.
  `;

  const result = TerminalTokenFilter.filter(noisyTerminalOutput);
  assert.ok(result.stats.charsRemoved > 0);
  assert.ok(result.stats.reductionPercentage > 20);
  assert.ok(result.content.includes('Build complete. Output written to dist/.'));
  assert.ok(!result.content.includes('\x1b[36m'));
});
