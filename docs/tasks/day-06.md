# DAY 6 TASK: MCP Host & Semantic Code Search

## ROLE
Vibecoder B

## OBJECTIVE
Implement the Model Context Protocol (MCP) host package in Go, providing sandboxed, high-performance host tools over stdio/JSON-RPC, primarily ripgrep-driven code search and safe file operations.

## CONTRACT
- `@index0/contracts/v1/agent`
- Model Context Protocol (MCP) JSON-RPC 2.0 Specification

## ALLOWED FILES
- `packages/mcp-host/**`

## DEPENDENCIES
- Go 1.24+
- `ripgrep` (`rg`) binary

## REQUIREMENTS
1. Stdio JSON-RPC 2.0 transport listener adhering to MCP specification.
2. Tools implementation:
   - `search_text`: Executes `rg --json` with regex, case-sensitivity, file filters, and directory boundaries. Returns structured line numbers, matched submatches, and contextual lines.
   - `read_file`: Bounded file reader with line offset and max byte limits.
   - `list_directory`: Directory tree enumerator with recursion depth limits.
   - `search_files`: Glob-based file path search.
3. **Security Guardrail**: Strict workspace path bounding. Any path argument resolving outside the configured workspace directory must be rejected immediately with an access denied error.

## FORBIDDEN CHANGES
- Never execute arbitrary shell commands via the MCP host.
- Never allow file system operations outside the bounded workspace directory.

## TESTS
- Path canonicalization and path traversal prevention unit tests (`../../` escape attempts).
- Ripgrep output parsing and JSON-RPC formatting unit tests.

## DEFINITION OF DONE
- [ ] `packages/mcp-host` builds with `go build .`.
- [ ] `go test ./...` in `packages/mcp-host` passes.
- [ ] Path traversal security tests verify boundary containment.
