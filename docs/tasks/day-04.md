# DAY 4 TASK: Go API Gateway & Zitadel Authentication

## 1. Role-Wise Responsibilities

### Stream 1: Senior Tech Lead & System Architect
- **Responsibilities**:
  - Implement core Go API Gateway in `services/gateway/` (Go 1.24+).
  - Configure Zitadel OIDC server parameters in `infra/zitadel/`.
  - Author JWT authentication middleware, CORS policies, rate limiting, and reverse-proxy dispatcher.
  - Enforce RFC 7807 Problem Details error formats.
  - Coordinate Day 4 End-of-Day (EOD) Integration Ceremony.

### Stream 2: Platform & Backend Systems Engineer (AI Coding Agent: Antigravity Backend Agent)
- **Responsibilities**:
  - Configure Zitadel initial organization, project, and OIDC client scopes in Docker Compose.
  - Adapt backend services (`sandbox-manager`, `agent-host`) to accept trusted identity headers (`X-User-Id`, `X-Org-Id`) forwarded by the Gateway.
- **Target Files**: `infra/zitadel/**`, `services/sandbox-manager/src/middleware/auth.ts`.

### Stream 3: Developer Experience & Client Systems Engineer (AI Coding Agent: Antigravity Client Agent)
- **Responsibilities**:
  - Integrate Zitadel OIDC login flow (PKCE) into `apps/ide/web/`.
  - Attach bearer tokens to outgoing API Gateway requests and handle automatic token refresh.
- **Target Files**: `apps/ide/web/src/auth/**`.

---

## 2. Antigravity Agent Prompt Directives

### Directives for Stream 1 (Senior Tech Lead / Principal Agent)
```text
ROLE: Senior Tech Lead & System Architect
AGENT RUNTIME: Google Antigravity Agent (Architect Mode)
OBJECTIVE: Implement the sovereign Go API Gateway with Zitadel OIDC authentication and reverse routing.
CONTRACT: @index0/contracts/v1/api, @index0/contracts/v1/auth
ALLOWED FILES: services/gateway/**, infra/zitadel/**
DEPENDENCIES: Go 1.24+, standard library or chi/gin, jwt-go / coreos go-oidc
REQUIREMENTS:
- Implement main.go with graceful shutdown on SIGINT/SIGTERM.
- Implement GET /health returning standardized JSON health status.
- Implement middleware: RequestId (X-Request-ID), StructuredLogger, CORS, Recover.
- Implement auth middleware validating Zitadel JWT tokens against JWKS.
- Implement reverse proxy routing forwarding requests to sandbox-manager (4001), agent-host (4002), billing (4003).
- Enforce RFC 7807 Problem Details on unauthorized or routing errors.
FORBIDDEN CHANGES: Do not disable JWT verification in production mode; do not expose internal ports publicly.
TESTS: Run `go test ./...` in services/gateway.
```

### Directives for Stream 3 (DevEx Agent)
```text
ROLE: Developer Experience & Client Systems Engineer
AGENT RUNTIME: Google Antigravity Agent
OBJECTIVE: Connect Web IDE authentication flow to Zitadel OIDC via the API Gateway.
CONTRACT: @index0/contracts/v1/auth
ALLOWED FILES: apps/ide/web/src/auth/**
REQUIREMENTS:
- Implement OIDC PKCE client redirecting to Zitadel login and handling callback tokens.
- Inject Authorization: Bearer <token> into all API Gateway requests.
- Handle 401 Unauthorized responses with silent refresh or redirect to login.
TESTS: Unit test token storage and auth header interceptor.
```

---

## 3. Daily End-of-Day (EOD) Integration Ceremony

### Timeline (Standard Evening Session: 5:30 PM – 12:00 AM Midnight)
- **17:30 (5:30 PM)**: Kickoff, gateway contracts & prompt dispatch.
- **18:00 (6:00 PM)**: Parallel agentic implementation (Go Gateway & Zitadel auth).
- **22:30 (10:30 PM)**: Code Freeze on `feature/day-04-gateway` and `feature/day-04-client-auth`.
- **23:00 (11:00 PM)**: Rebase & merge onto `integration/day-04`.
- **23:30 (11:30 PM)**: Cross-service verification and live Gateway auth smoke test.
- **00:00 (12:00 AM Midnight)**: Senior Tech Lead sign-off & checkpoint tagging (`checkpoint/day-04`).

### Automated Verification Script
```bash
# 1. Gateway Go tests
(cd services/gateway && go test -v ./...)

# 2. Monorepo TypeScript check
pnpm typecheck
pnpm lint

# 3. Gateway compilation
(cd services/gateway && go build -o /dev/null .)
```

### Day 4 Integration Scenario
1. Start Zitadel and Gateway services (`docker compose up -d zitadel && cd services/gateway && go run main.go`).
2. Verify `GET http://localhost:8080/health` returns HTTP 200 with status `"healthy"`.
3. Request protected route `/v1/agents/runs` without token; verify Gateway returns HTTP 401 with RFC 7807 JSON error body.
4. Pass valid signed mock JWT token; verify Gateway validates claims, injects `X-User-Id` header, and reverse-proxies request to internal backend.

### Merge Gate Checklist
- [ ] Go Gateway builds and all Go tests pass.
- [ ] OIDC JWT validation correctly verifies signatures and rejects expired tokens.
- [ ] Reverse proxy forwards headers without corruption.
- [ ] Tag created: `checkpoint/day-04`.
