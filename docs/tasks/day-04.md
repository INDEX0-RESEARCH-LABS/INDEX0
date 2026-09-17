# DAY 4 TASK: Go API Gateway + Zitadel Authentication

## ROLE
Senior Tech Lead

## OBJECTIVE
Implement the primary public API Gateway in Go 1.24+, integrating Zitadel OIDC authentication, request logging, request ID propagation, rate limiting, and internal service reverse routing.

## CONTRACT
- `@index0/contracts/v1/api`
- `@index0/contracts/v1/auth`

## ALLOWED FILES
- `services/gateway/**`
- `infra/zitadel/**`
- `infra/compose/docker-compose.yml`

## DEPENDENCIES
- Go 1.24+
- Standard Go HTTP / Chi or Gin router
- OIDC / JWT validator library
- Zitadel OIDC server

## REQUIREMENTS
1. Implement `services/gateway/` structure:
   - `main.go`: Entry point, server lifecycle, graceful shutdown.
   - `health/`: Standard `GET /health` endpoint.
   - `config/`: Environment loader with defaults.
   - `middleware/`: Request ID (`X-Request-ID`), structured JSON logger, CORS, panic recovery.
   - `auth/`: Zitadel OIDC token validation and claims extractor.
   - `routing/`: Reverse-proxy router forwarding authenticated traffic to internal services (`agent-host`, `sandbox-manager`, `billing`).
2. Enforce standardized JSON Problem Details (RFC 7807) error responses.
3. Zitadel configuration in `infra/zitadel/`.

## FORBIDDEN CHANGES
- Do not expose internal service ports directly on public network interfaces.
- Do not disable JWT verification in production modes.
- Do not introduce untrusted third-party C-bindings in Go gateway.

## TESTS
- `go test ./...` in `services/gateway`.
- Health endpoint unit test.
- Middleware chaining and request ID propagation test.

## DEFINITION OF DONE
- [ ] `services/gateway` builds with `go build .`.
- [ ] `go test ./...` passes.
- [ ] `GET /health` returns HTTP 200 with system status JSON.
- [ ] OIDC validation middleware correctly verifies signed JWT headers.
