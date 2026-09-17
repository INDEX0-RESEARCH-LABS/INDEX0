#!/usr/bin/env node
/**
 * INDEX0 Sandbox CLI Runner — @index0/client-harness
 * Command-line utility to test and benchmark sandbox executions.
 */

import { SandboxClient } from './index.js';
import type { SandboxLanguage, ISandboxRequest } from '@index0/contracts';

function printHelp(): void {
  console.log(`
\x1b[1mINDEX0 AI — Sandbox Execution CLI\x1b[0m

Usage:
  index0-sandbox [options]

Options:
  --lang=<language>   Runtime language: python, typescript, bash (default: python)
  --code=<code>       Code string to execute in sandbox
  --timeout=<ms>      Execution timeout in milliseconds (default: 30000)
  --mock              Run in local mock mode without network requests
  --url=<url>         Sandbox manager base URL (default: http://localhost:4001)
  --health            Check health of sandbox manager
  --help              Display this help message

Examples:
  index0-sandbox --mock --lang=python --code="print('Hello from sandbox')"
  index0-sandbox --mock --lang=typescript --code="console.log([1,2,3].map(x => x*2))"
  index0-sandbox --health
`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    return;
  }

  const isMock = args.includes('--mock');
  const isHealth = args.includes('--health');

  const getArgValue = (prefix: string): string | undefined => {
    const match = args.find((a) => a.startsWith(prefix));
    return match ? match.slice(prefix.length) : undefined;
  };

  const url = getArgValue('--url=') ?? 'http://localhost:4001';
  const lang = (getArgValue('--lang=') ?? 'python') as SandboxLanguage;
  const code = getArgValue('--code=') ?? "print('INDEX0 Sandbox execution OK')";
  const timeoutMs = Number(getArgValue('--timeout=') ?? '30000');

  const client = new SandboxClient({ baseUrl: url });

  if (isHealth) {
    console.log(`Checking health at ${url}/health...`);
    try {
      const health = await client.checkHealth();
      console.log(`Health Status: \x1b[32m${health.status}\x1b[0m`);
      console.log(`Active Sandboxes: ${health.activeSandboxes}`);
      console.log(`Timestamp: ${health.timestamp}`);
    } catch (err) {
      console.error(`Health check failed: ${(err as Error).message}`);
      process.exit(1);
    }
    return;
  }

  const request: ISandboxRequest = {
    id: `cli-${Date.now()}`,
    language: lang,
    code,
    timeoutMs
  };

  console.log(`\x1b[1mExecuting [${lang}] snippet...\x1b[0m`);

  if (isMock) {
    const result = client.simulateMockExecution(request);
    console.log(SandboxClient.formatResult(result));
    process.exit(result.exitCode);
  } else {
    try {
      const apiResponse = await client.execute(request);
      if (apiResponse.success && apiResponse.data) {
        console.log(SandboxClient.formatResult(apiResponse.data));
        process.exit(apiResponse.data.exitCode);
      } else {
        console.error(`Execution failed: ${apiResponse.error?.detail ?? 'Unknown error'}`);
        process.exit(1);
      }
    } catch (err) {
      console.error(`Connection error to ${url}: ${(err as Error).message}`);
      process.exit(1);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
