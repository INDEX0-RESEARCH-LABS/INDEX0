import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  SANDBOX_QUOTAS,
  type ISandboxRequest,
  type ISandboxExecutionResult,
  type ISandboxHealthResponse,
  type SandboxLanguage,
  type IApiResponse,
  type IProblemDetails
} from '@index0/contracts';

describe('Authoritative Sandbox Contract Conformance', () => {
  describe('ISandboxRequest Conformance', () => {
    it('should validate standard Python execution request payload', () => {
      const request: ISandboxRequest = {
        id: 'req-py-001',
        code: 'print("Hello from INDEX0 sandbox")',
        language: 'python',
        timeoutMs: 15_000,
        environmentVariables: {
          ENV_NAME: 'test',
          DEBUG: 'true'
        },
        cpuCount: 1,
        memoryMb: 512
      };

      assert.equal(request.id, 'req-py-001');
      assert.equal(request.language, 'python');
      assert.ok(request.timeoutMs <= SANDBOX_QUOTAS.maxTimeoutMs);
      assert.equal(request.environmentVariables?.['DEBUG'], 'true');
    });

    it('should validate TypeScript and Bash language variations', () => {
      const tsRequest: ISandboxRequest = {
        id: 'req-ts-002',
        code: 'const nums: number[] = [1, 2, 3]; console.log(nums.reduce((a, b) => a + b));',
        language: 'typescript',
        timeoutMs: SANDBOX_QUOTAS.defaultTimeoutMs
      };

      const bashRequest: ISandboxRequest = {
        id: 'req-bash-003',
        code: 'uname -a && whoami',
        language: 'bash',
        timeoutMs: 5_000
      };

      const languages: SandboxLanguage[] = [tsRequest.language, bashRequest.language];
      assert.deepEqual(languages, ['typescript', 'bash']);
    });
  });

  describe('SANDBOX_QUOTAS Invariants', () => {
    it('should enforce non-negotiable quota constants', () => {
      assert.equal(SANDBOX_QUOTAS.defaultTimeoutMs, 30_000);
      assert.equal(SANDBOX_QUOTAS.maxTimeoutMs, 300_000);
      assert.equal(SANDBOX_QUOTAS.maxMemoryMb, 1024);
      assert.equal(SANDBOX_QUOTAS.defaultCpuCount, 1);
    });

    it('should identify quota boundary violations', () => {
      const isWithinQuotas = (timeoutMs: number, memoryMb?: number): boolean => {
        if (timeoutMs <= 0 || timeoutMs > SANDBOX_QUOTAS.maxTimeoutMs) return false;
        if (memoryMb !== undefined && (memoryMb <= 0 || memoryMb > SANDBOX_QUOTAS.maxMemoryMb)) return false;
        return true;
      };

      assert.equal(isWithinQuotas(30_000), true);
      assert.equal(isWithinQuotas(300_000, 1024), true);
      assert.equal(isWithinQuotas(300_001), false);
      assert.equal(isWithinQuotas(0), false);
      assert.equal(isWithinQuotas(-100), false);
      assert.equal(isWithinQuotas(10_000, 2048), false);
    });
  });

  describe('ISandboxExecutionResult Conformance', () => {
    it('should validate successful execution result structure (Exit 0)', () => {
      const successResult: ISandboxExecutionResult = {
        id: 'res-py-001',
        exitCode: 0,
        stdout: '4\n',
        stderr: '',
        durationMs: 42,
        timedOut: false
      };

      assert.equal(successResult.id, 'res-py-001');
      assert.equal(successResult.exitCode, 0);
      assert.equal(successResult.stdout, '4\n');
      assert.equal(successResult.stderr, '');
      assert.equal(successResult.timedOut, false);
      assert.equal(successResult.error, undefined);
    });

    it('should validate error execution result structure (Non-zero Exit)', () => {
      const errorResult: ISandboxExecutionResult = {
        id: 'res-py-002',
        exitCode: 1,
        stdout: '',
        stderr: 'ZeroDivisionError: division by zero\n',
        durationMs: 15,
        error: 'Execution failed with exit code 1',
        timedOut: false
      };

      assert.equal(errorResult.exitCode, 1);
      assert.ok(errorResult.stderr.includes('ZeroDivisionError'));
      assert.ok(errorResult.error !== undefined);
    });

    it('should validate timed out execution result structure (Exit 124)', () => {
      const timeoutResult: ISandboxExecutionResult = {
        id: 'res-py-003',
        exitCode: 124,
        stdout: '',
        stderr: 'Execution timed out after 5000ms\n',
        durationMs: 5000,
        error: 'Execution timed out after 5000ms',
        timedOut: true
      };

      assert.equal(timeoutResult.exitCode, 124);
      assert.equal(timeoutResult.timedOut, true);
    });
  });

  describe('ISandboxHealthResponse Conformance', () => {
    it('should validate health check contract structure', () => {
      const health: ISandboxHealthResponse = {
        status: 'healthy',
        activeSandboxes: 0,
        timestamp: new Date().toISOString()
      };

      assert.equal(health.status, 'healthy');
      assert.equal(typeof health.activeSandboxes, 'number');
      assert.ok(!Number.isNaN(Date.parse(health.timestamp)));
    });
  });

  describe('API Envelope & RFC 7807 Problem Details Conformance', () => {
    it('should conform to IApiResponse wrapper on successful execution', () => {
      const response: IApiResponse<ISandboxExecutionResult> = {
        success: true,
        data: {
          id: 'res-success',
          exitCode: 0,
          stdout: 'Execution successful\n',
          stderr: '',
          durationMs: 25,
          timedOut: false
        },
        requestId: 'req-trace-001',
        timestamp: new Date().toISOString()
      };

      assert.equal(response.success, true);
      assert.ok(response.data);
      assert.equal(response.data.exitCode, 0);
      assert.equal(response.error, undefined);
    });

    it('should conform to RFC 7807 IProblemDetails on client error', () => {
      const problem: IProblemDetails = {
        type: 'https://index0.ai/errors/bad-request',
        title: 'Validation Failed',
        status: 400,
        detail: 'The sandbox request failed schema validation',
        instance: '/execute',
        invalidParams: [
          {
            name: 'timeoutMs',
            reason: 'timeoutMs must not exceed 300000ms'
          }
        ]
      };

      const errorResponse: IApiResponse = {
        success: false,
        error: problem,
        requestId: 'req-trace-002',
        timestamp: new Date().toISOString()
      };

      assert.equal(errorResponse.success, false);
      assert.equal(errorResponse.error?.status, 400);
      assert.equal(errorResponse.error?.invalidParams?.length, 1);
      assert.equal(errorResponse.error?.invalidParams?.[0]?.name, 'timeoutMs');
    });
  });
});
