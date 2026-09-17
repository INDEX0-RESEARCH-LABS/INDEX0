# DAY 4 TASK: Caddy API Gateway & Zitadel Authentication

> **Option A Architecture**: Orchestrating off-the-shelf open-source containers with zero scratch-built backend/gateway code.

---

## 1. Role-Wise Responsibilities

### Stream 1: Senior Tech Lead & System Architect (Dev 1)
- **Responsibilities**:
  - Govern declarative gateway routing rules in `infra/gateway/Caddyfile` for all subsystems (OpenHands on port 3000, Zitadel on 8085, Temporal UI on 8233, ClickHouse on 8123).
  - Configure Zitadel OIDC parameters and Caddy reverse-proxy mounts in `infra/compose/docker-compose.yml`.
  - Validate security headers, reverse-proxy pass-through, and unbuffered WebSocket/SSE support in Caddy.
  - Author automated gateway route verification test suite in `tests/gateway/gateway.test.ts`.
  - Coordinate Day 4 End-of-Day (EOD) Integration Ceremony and tag release checkpoint `checkpoint/day-04`.
- **Target Files**: `infra/gateway/Caddyfile`, `infra/compose/docker-compose.yml`, `tests/gateway/**`, `docs/tasks/day-04.md`.

### Stream 2: Platform & Backend Systems Engineer (AI Coding Agent: Antigravity Backend Agent / Dev 2)
- **Responsibilities**:
  - Author declarative Zitadel OIDC tenant & client provisioning configuration in `infra/zitadel/init-config.yaml` with client `index0-ide`, PKCE code flow, redirect URIs, and RBAC roles (`admin`, `member`, `viewer`, `agent`) conforming to `@index0/contracts/v1/auth`.
  - Align container orchestration in `infra/compose/docker-compose.yml` by mounting `init-config.yaml`, parameterizing `ZITADEL_EXTERNALPORT` (8000), `ZITADEL_EXTERNALDOMAIN` (localhost), and configuring org name.
  - Enforce sanitized reverse-proxy forwarding headers (`Host`, `X-Real-IP`, `X-Forwarded-For`, `X-Forwarded-Proto`) and CORS in `infra/gateway/Caddyfile`.
  - Author comprehensive proxy smoke test suite in `tests/gateway/proxy-smoke.test.ts` verifying all routes, unbuffered SSE streaming, security headers, and compose service dependencies.
  - Maintain Option A Architecture compliance (zero custom Go gateway code).
- **Target Files**: `infra/zitadel/init-config.yaml`, `infra/compose/docker-compose.yml`, `infra/gateway/Caddyfile`, `tests/gateway/proxy-smoke.test.ts`, `docs/tasks/day-04.md`.

### Stream 3: Developer Experience & Client Systems Engineer (AI Coding Agent: Antigravity Client Agent / Dev 3)
- **Responsibilities**:
  - Implement zero-dependency Zitadel OIDC client with PKCE code flow (`apps/ide/web/src/auth/oidcClient.ts`) conforming to `@index0/contracts/v1/auth`, decoding `IJwtClaims`, and computing RBAC permissions via `DEFAULT_ROLE_PERMISSIONS`.
  - Author React authentication context and provider (`apps/ide/web/src/auth/AuthContext.tsx`) managing user session state, tenant context (`Acme Software Labs`), demo role switcher, and silent token refresh loop.
  - Implement authenticated Gateway fetch interceptor (`apps/ide/web/src/auth/authFetch.ts`) injecting `Authorization: Bearer <token>`, `X-Request-ID` tracing headers, and session credentials into requests to Caddy on port 8000.
  - Implement user profile and tenant navigation header (`apps/ide/web/src/components/UserNav.tsx`) with user avatar, organization pill, role badges (`ADMIN`, `MEMBER`, `VIEWER`, `AGENT`), and permission dropdown.
  - Embed OpenHands All-in-One autonomous agent workbench (`apps/ide/web/src/components/OpenHandsViewer.tsx`) and add view mode toggle in `Workbench.tsx` (INDEX0 Editor vs OpenHands Agent).
  - Author automated test suite in `apps/ide/web/test/auth.test.ts` validating PKCE challenge generation, token claim decoding, RBAC resolution, and header injection.
- **Target Files**: `apps/ide/web/src/auth/**`, `apps/ide/web/src/components/**`, `apps/ide/web/src/workbench/**`, `apps/ide/web/test/auth.test.ts`, `docs/tasks/day-04.md`.

---

## 2. Antigravity Agent Prompt Directives

### Directives for Stream 1 (Senior Tech Lead / Principal Agent / Dev 1)
```text
ROLE: Senior Tech Lead & System Architect
AGENT RUNTIME: Google Antigravity Agent (Architect Mode)
OBJECTIVE: Govern declarative Caddy API Gateway routing, optimize reverse-proxy streaming and security headers, author gateway verification tests, and coordinate Day 4 EOD convergence.
CONTRACT: System Blueprint (Sections 1, 2.1, 5, 7) & @index0/contracts/v1/api, @index0/contracts/v1/auth
ALLOWED FILES: infra/gateway/**, infra/compose/**, tests/gateway/**, package.json, docs/tasks/day-04.md
DEPENDENCIES: Docker Compose, Caddy 2, Node.js 20+, pnpm 12+
REQUIREMENTS:
- Govern declarative routing in infra/gateway/Caddyfile:
  - GET /health -> returns 200 with JSON health status.
  - /auth* -> reverse proxy to zitadel:8085.
  - /temporal* -> reverse proxy to temporal-ui:8233.
  - /analytics* -> reverse proxy to clickhouse:8123.
  - /* -> reverse proxy to openhands:3000 with WebSocket and unbuffered SSE streaming (flush_interval -1).
- Enforce security headers: X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, Referrer-Policy, -Server.
- Author tests/gateway/gateway.test.ts validating route mapping and compose graph.
- Verify zero custom Go gateway code to maintain (Option A compliance).
- Execute Day 4 EOD integration ceremony and tag checkpoint/day-04.
FORBIDDEN CHANGES: Do not introduce scratch-built custom gateway code; do not expose internal container ports directly.
TESTS:
- `docker compose -f infra/compose/docker-compose.yml config`
- `pnpm test:gateway`
- `pnpm build && pnpm typecheck && pnpm test`
DEFINITION OF DONE:
- Docker Compose validates with all 7 services on index0-net.
- Gateway test suite passes verifying route definitions and security headers.
- docs/tasks/day-04.md updated with full directives for all three streams under Schedule B.
- Checkpoint tag checkpoint/day-04 created.
```

### Directives for Stream 2 (Platform Agent / Dev 2)
```text
ROLE: Platform & Backend Systems Engineer (Dev 2)
AGENT RUNTIME: Google Antigravity Agent
OBJECTIVE: Configure Zitadel OIDC tenant settings, enforce sanitized proxy forwarding headers in Caddyfile, and author gateway proxy smoke tests for Day 4.
CONTRACT: @index0/contracts/v1/auth, @index0/contracts/v1/api
ALLOWED FILES: infra/zitadel/**, infra/gateway/Caddyfile, infra/compose/docker-compose.yml, tests/gateway/**, docs/tasks/day-04.md
DEPENDENCIES: Docker Compose, Caddy 2, Node.js 20+, pnpm 12+, TypeScript 5.4+
REQUIREMENTS:
- Author infra/zitadel/init-config.yaml defining tenant Acme Software Labs, OIDC client index0-ide, redirect URIs (5173, 8000, 3000), and RBAC roles (admin, member, viewer, agent).
- Update infra/compose/docker-compose.yml parameterizing Zitadel external domain/port and mounting init-config.yaml.
- Ensure all reverse_proxy blocks in infra/gateway/Caddyfile explicitly sanitize headers (Host, X-Real-IP, X-Forwarded-For, X-Forwarded-Proto).
- Author tests/gateway/proxy-smoke.test.ts verifying routing, header sanitization, streaming flush interval, and compose service graph.
- Verify zero custom Go gateway code is introduced (Option A compliance).
FORBIDDEN CHANGES: Do not introduce scratch-built custom gateway code; do not expose internal database/daemon ports to public interfaces.
TESTS:
- `docker compose -f infra/compose/docker-compose.yml config`
- `pnpm test:gateway`
- `pnpm build && pnpm typecheck && pnpm test`
DEFINITION OF DONE:
- Docker Compose config validates with all 7 services on index0-net.
- Gateway test suite passes 100% of tests.
- Caddyfile and Zitadel configuration fully satisfy OIDC discovery and proxy routing.
```

### Directives for Stream 3 (DevEx Agent / Dev 3)
```text
ROLE: Developer Experience & Client Systems Engineer (Dev 3)
AGENT RUNTIME: Google Antigravity Agent
OBJECTIVE: Connect Web IDE client authentication flows to Zitadel OIDC via the Caddy Gateway on port 8000, embed OpenHands workbench, and enforce token injection.
CONTRACT: @index0/contracts/v1/auth, @index0/contracts/v1/api
ALLOWED FILES: apps/ide/web/src/auth/**, apps/ide/web/src/components/**, apps/ide/web/src/workbench/**, apps/ide/web/test/**, docs/tasks/day-04.md
DEPENDENCIES: Node.js 20+, pnpm 12+, TypeScript 5.4+, React 18+, Lucide-React, @index0/contracts
REQUIREMENTS:
- Implement apps/ide/web/src/auth/oidcClient.ts with PKCE code verifier and challenge generation (S256 method), authorization URL builder, JWT claims decoding (IJwtClaims), and permission resolution (DEFAULT_ROLE_PERMISSIONS).
- Implement apps/ide/web/src/auth/AuthContext.tsx providing session state (user, organization, tenantContext, token, roles, permissions), automatic silent refresh, and demo role switcher.
- Implement apps/ide/web/src/auth/authFetch.ts injecting Authorization: Bearer <token> and X-Request-ID headers for requests to Caddy Gateway (port 8000).
- Implement apps/ide/web/src/components/UserNav.tsx rendering user profile, tenant organization, role badge, and session controls.
- Implement apps/ide/web/src/components/OpenHandsViewer.tsx embedding OpenHands autonomous agent workspace via Gateway reverse-proxy on port 8000.
- Update Workbench.tsx with view mode switcher (INDEX0 Editor vs OpenHands Agent) and port 8000 Gateway indicator.
- Author unit tests in apps/ide/web/test/auth.test.ts verifying PKCE flow, claims decoding, RBAC resolution, and header injection.
FORBIDDEN CHANGES: Do not hardcode internal service ports (4001, 8085, 3000); route all traffic through Gateway (port 8000); do not introduce scratch-built custom gateway code.
TESTS:
- `pnpm --filter @index0/ide-web build`
- `pnpm --filter @index0/ide-web typecheck`
- `pnpm --filter @index0/ide-web test`
- `pnpm test:gateway`
- `pnpm build && pnpm typecheck && pnpm test`
DEFINITION OF DONE:
- Web IDE builds production bundle cleanly and passes all 22 tests.
- Zitadel OIDC client correctly handles PKCE parameters and JWT claims parsing.
- Gateway authFetch injects Bearer token and X-Request-ID headers.
- OpenHands embedded viewer and UserNav components render without errors.
- Full Turborepo build, typecheck, and test pipelines pass across monorepo.
```

---

## 3. Daily End-of-Day (EOD) Integration Ceremony

### Timeline (Schedule B: Standard Evening Rhythm: 5:30 PM – 12:00 AM Midnight)
- **17:30 (5:30 PM)**: Evening Contract Alignment & Option A Architecture Review.
- **18:00 (6:00 PM)**: Parallel Agentic Implementation (Stream 1: Caddy routing, Stream 2: Zitadel, Stream 3: Client auth).
- **22:30 (10:30 PM)**: Code Freeze & Pre-Integration Check (T - 90m).
- **23:00 (11:00 PM)**: Daily Convergence & Rebase onto `integration/day-04` (T - 60m).
- **23:30 (11:30 PM)**: Live Integration Scenario & Smoke Testing (T - 30m).
- **00:00 (12:00 AM Midnight)**: Merge Gate Sign-Off & Checkpoint Tagging (`checkpoint/day-04`).

### Automated Verification Script
```bash
# 1. Validate Docker Compose configuration
docker compose -f infra/compose/docker-compose.yml config

# 2. Run Gateway conformance tests
pnpm test:gateway

# 3. Monorepo build, typecheck, and test suite
pnpm build
pnpm typecheck
pnpm test
```

### Day 4 Integration Scenario
1. Validate `docker compose config` passes with `gateway` (Caddy), `zitadel`, `openhands`, `temporal`, `temporal-ui`, `clickhouse`, `postgres`.
2. Verify Caddyfile configuration routes `/health` and upstream targets correctly without manual Go compilation.
3. Confirm unbuffered streaming and security headers are enforced.

### Merge Gate Checklist
- [x] Caddyfile authored and mounted in Docker Compose.
- [x] Docker Compose config validation passes with zero errors across all 7 services.
- [x] Gateway route verification tests pass (`tests/gateway/gateway.test.ts`).
- [x] Zitadel OIDC initialization configuration authored (`infra/zitadel/init-config.yaml`).
- [x] Gateway proxy smoke tests pass (`tests/gateway/proxy-smoke.test.ts`).
- [x] Zitadel OIDC client & authFetch interceptor verified with Bearer token injection (`apps/ide/web/src/auth/**`).
- [x] OpenHands embedded workbench viewer & UserNav integrated into Web IDE (`apps/ide/web/src/components/**`).
- [x] TypeScript contracts and monorepo typecheck pass cleanly.
- [x] Tag created: `checkpoint/day-04`.

