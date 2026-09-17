# DAY 2 TASK: E2B Sandbox Manager

## ROLE
Vibecoder A

## OBJECTIVE
Implement the Sandbox Manager service using Node.js, Express, TypeScript, and the E2B SDK, guaranteeing safe isolated code execution and deterministic resource deallocation.

## CONTRACT
- `@index0/contracts/v1/sandbox`
- `@index0/contracts/v1/api`

## ALLOWED FILES
- `services/sandbox-manager/**`
- `packages/contracts/v1/sandbox/**` (read-only)

## DEPENDENCIES
- Express
- TypeScript
- `@e2b/code-interpreter` (or standard E2B SDK)
- `dotenv`
- `zod`

## REQUIREMENTS
1. Expose `POST /execute` adhering strictly to `ISandboxRequest`:
   - `id`: unique execution ID
   - `code`: code payload
   - `language`: `python` | `typescript` | `bash`
   - `timeoutMs`: execution timeout
2. Expose `GET /health` returning standard service health status.
3. Implement execution lifecycle:
   ```text
   create → execute → capture result → telemetry → cleanup
   ```
4. **MANDATORY**: Wrap execution in `try/catch/finally`. All sandbox resources MUST be cleaned up in the `finally` block regardless of success or failure.
5. Capture stdout, stderr, execution duration, and exit codes into `ISandboxExecutionResult`.

## FORBIDDEN CHANGES
- Never omit the `finally` cleanup block.
- Never execute code directly on the host operating system without E2B microVM isolation.
- Do not alter `ISandboxRequest` contract fields without approval.

## TESTS
- Unit test mocking E2B client verifying lifecycle transitions.
- Unit test verifying cleanup occurs upon execution error or timeout.

## DEFINITION OF DONE
- [ ] `services/sandbox-manager` compiles under strict TypeScript.
- [ ] `pnpm --filter @index0/sandbox-manager test` passes.
- [ ] `POST /execute` responds in accordance with `@index0/contracts`.
- [ ] Zero dangling sandbox sessions on simulated runtime failures.
