# DAY 3 TASK: INDEX0 IDE Foundation

## ROLE
Vibecoder B

## OBJECTIVE
Establish the conceptual and presentation foundation for the INDEX0 IDE, comprising the web-based IDE application and VS Code extension architecture.

## CONTRACT
- `@index0/contracts/v1/api`
- `@index0/contracts/v1/agent`
- `@index0/contracts/v1/project`

## ALLOWED FILES
- `apps/ide/**`

## DEPENDENCIES
- React / Next.js or Vite for Web IDE
- Monaco Editor / VS Code API
- TypeScript

## REQUIREMENTS
1. Structure modules for:
   - **Editor**: Code display, multi-tab buffer management, and syntax highlighting.
   - **Explorer**: File tree navigation with safe workspace boundaries.
   - **Terminal**: Interactive shell interface connected to sandbox session.
   - **Agent Panel**: Interactive chat, plan inspection, and step confirmation.
   - **Agent Events**: SSE client receiving real-time agent execution stream.
   - **Execution Results**: Test and build outcome visualizer.
2. Ensure all external network requests route strictly through the API Gateway. Direct calls to internal microservice ports are forbidden.
3. Provide VS Code extension skeleton in `apps/ide/extension/`.

## FORBIDDEN CHANGES
- Do not hardcode internal ports (e.g. `localhost:4001`, `localhost:4002`) into frontend clients.
- Do not bypass API Gateway authentication headers.

## TESTS
- Component render tests for Editor and Agent Panel.
- SSE event consumer parsing tests.

## DEFINITION OF DONE
- [ ] `apps/ide/web` builds cleanly.
- [ ] `apps/ide/extension` packages without syntax or type errors.
- [ ] Agent panel component renders and parses mock `IAgentEvent` stream.
