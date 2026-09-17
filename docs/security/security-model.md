# Security Model & Baseline — INDEX0 AI

INDEX0 AI enforces defense-in-depth across identity, network boundaries, container runtimes, and execution sandboxes.

---

## 1. Threat Model & Security Boundaries

```text
               PUBLIC UNTRUSTED ZONE
      (Developers, Web IDE, VS Code Extension)
                         │
                         │ HTTPS / WSS / TLS 1.3
                         ▼
        ┌──────────────────────────────────┐
        │       BOUNDARY 1: API GATEWAY     │
        │   OIDC JWT Validation + Rate Lim  │
        └────────────────┬─────────────────┘
                         │
               PRIVATE SOVEREIGN ZONE
              (Docker Bridge: index0-net)
                         │
        ┌────────────────┼─────────────────┐
        │                │                 │
        ▼                ▼                 ▼
   ┌─────────┐      ┌─────────┐      ┌───────────┐
   │ Agent   │      │ DB / PG │      │ ClickHouse│
   │ Host    │      │ 16      │      │ Analytics │
   └────┬────┘      └─────────┘      └───────────┘
        │
        │
        ▼
   ┌──────────────────────────────────┐
   │    BOUNDARY 2: SANDBOX MANAGER    │
   │      E2B MicroVM / Virtual CPU    │
   └────────────────┬─────────────────┘
                    │
                    ▼
          ISOLATED GUEST VM ZONE
          (Ephemeral MicroVM)
```

---

## 2. Security Principles

### 2.1 Identity & Authentication (OIDC / Zitadel)
- All external requests must provide a valid JSON Web Token (JWT) issued by Zitadel.
- The API Gateway validates:
  - Signature against Zitadel's JWKS endpoint.
  - Issuer (`iss`) and Audience (`aud`).
  - Expiration time (`exp`) and not-before (`nbf`).
- Context injection: Validated claims (`sub`, `email`, `org_id`, `roles`) are injected as trusted headers (`X-User-Id`, `X-Org-Id`, `X-User-Roles`) to downstream internal services.

### 2.2 Network Isolation (`index0-net`)
- Internal databases (PostgreSQL, ClickHouse), Temporal, and internal microservices (`agent-host`, `sandbox-manager`, `telemetry`, `billing`) reside on an isolated internal Docker bridge network (`index0-net`).
- Direct ingress ports for PostgreSQL (5432) and ClickHouse (8123/9000) are never exposed publicly in production. Only the API Gateway publishes an external port (443/80).

### 2.3 MicroVM Sandbox Isolation (E2B)
- Untrusted user code and agent execution never run on the host system.
- Execution occurs inside disposable E2B microVMs running dedicated guest Linux kernels.
- Memory, CPU, and execution timeout quotas are strictly enforced.
- **Guaranteed Deallocation**: All sandbox sessions are wrapped in `try/catch/finally` to guarantee sandbox termination in the `finally` block, mitigating denial-of-wallet and zombie microVM leaks.

### 2.4 MCP Host Sandboxing
- Path traversal defense: All file operations (`read_file`, `search_files`, `list_directory`, `search_text`) are canonicalized and checked to verify they remain strictly within the designated workspace root.
- Invocations attempting to traverse outside (`../../`, symlink escapes) trigger immediate security faults and audit logs.

### 2.5 Secret Isolation
- Zero secrets committed to Git repository.
- CI includes automated secret scanning using Gitleaks/TruffleHog.
- Production secrets injected exclusively via runtime environment managers.
- Least-privilege database users (e.g. read-only analytics users for ClickHouse).

### 2.6 Audit Logging
- Every administrative action, authentication attempt, sandbox execution, and billing adjustment writes an immutable record to the ClickHouse `audit_events` table with:
  - `event_id` (UUIDv4)
  - `timestamp` (UTC)
  - `actor_id` (User or Agent ID)
  - `action` (e.g., `sandbox.execute`, `auth.login`, `project.delete`)
  - `ip_address`
  - `metadata` (JSON)
