# OPEN-SOURCE STACK — INDEX0 AI

> Technical breakdown, configuration schemas, and integration specifications for every
> open-source technology in the INDEX0 Sovereign AGI Architecture.

---

## 1. Stack Overview

| Layer | Technology | Version | Language | License | Purpose |
|-------|-----------|---------|----------|---------|---------|
| Voice | LiveKit Agents SDK | ≥0.11 | Python | Apache 2.0 | WebRTC agent framework |
| Voice | Pipecat | ≥0.0.43 | Python | BSD-2 | Frame-based voice pipeline |
| Voice | LiveKit Server | ≥1.7 | Go | Apache 2.0 | WebRTC SFU server |
| Edge | TabbyML | ≥0.18 | Rust | Apache 2.0 | Code completion server |
| Edge | vLLM | ≥0.6 | Python | Apache 2.0 | High-throughput LLM inference |
| Sandbox | E2B Code Interpreter | ≥1.0.4 | TypeScript | Apache 2.0 | Cloud MicroVM SDK |
| Sandbox | E2B Desktop | ≥1.0 | TypeScript | Apache 2.0 | Desktop automation SDK |
| Sandbox | Firecracker | ≥1.7 | Rust | Apache 2.0 | Self-hosted MicroVM hypervisor |
| Protocol | GNAP | Custom | TypeScript | Apache 2.0 | Git-native agent protocol |
| Protocol | Postcard | Custom | TypeScript | Apache 2.0 | Agent message envelope |
| Context | OpenViking | Custom | TypeScript | Apache 2.0 | 3-tier context retrieval |
| Memory | Letta (MemGPT) | ≥0.5 | Python | Apache 2.0 | Persistent agent memory |
| Router | LiteLLM | ≥1.50 | Python/Rust | MIT | Model routing proxy |
| Agent | LangGraph | ≥0.2 | Python | MIT | Multi-agent state graphs |
| Feedback | TextGrad | ≥0.1 | Python | MIT | Textual backpropagation |
| Security | Semgrep | ≥1.90 | OCaml | LGPL 2.1 | Static analysis (SAST) |
| Security | Trivy | ≥0.56 | Go | Apache 2.0 | Vulnerability scanning |
| Workflow | Flyte (Union.ai) | ≥1.13 | Python/Go | Apache 2.0 | Replay-log workflows |
| Existing | OpenHands | 0.18 | Python | MIT | Autonomous dev workbench |
| Existing | Temporal | 1.24.2 | Go | MIT | Durable workflow engine |
| Existing | Caddy | 2.x | Go | Apache 2.0 | Reverse proxy gateway |
| Existing | Zitadel | 2.54.0 | Go | Apache 2.0 | OIDC identity provider |
| Existing | PostgreSQL | 16 | C | PostgreSQL | Primary relational store |
| Existing | ClickHouse | 24 | C++ | Apache 2.0 | Columnar analytics store |
| Existing | OpenMeter | Latest | Go | Apache 2.0 | Usage metering |
| Existing | Lago | 1.12.0 | Ruby | AGPL 3.0 | Subscription billing |

---

## 2. LiveKit Agents SDK

### 2.1 Purpose
Real-time, low-latency conversational AI framework for WebRTC-based voice and multimodal interaction.

### 2.2 Integration Architecture

```text
LiveKit Server (WebRTC SFU)
    │
    ├── Room Management (create, join, leave)
    ├── Track Publishing (audio, video, screen share)
    ├── Data Channel Messages (text, structured data)
    │
    ▼
Voice Agent Worker (Python)
    │
    ├── AgentSession: manages conversation lifecycle
    ├── VoicePipelineAgent: STT → LLM → TTS pipeline
    ├── Semantic Turn Detection: natural interruption handling
    └── Tool Calling: bridges to Agent Orchestrator
```

### 2.3 Configuration Schema

```yaml
# services/voice-agent/config.yaml
livekit:
  url: "ws://livekit:7880"
  api_key: "${LIVEKIT_API_KEY}"
  api_secret: "${LIVEKIT_API_SECRET}"

stt:
  provider: "deepgram"  # or "whisper" for local
  model: "nova-2"
  language: "en"

tts:
  provider: "elevenlabs"  # or "bark" for local
  voice_id: "21m00Tcm4TlvDq8ikWAM"

llm:
  provider: "litellm"     # routes through LiteLLM gateway
  model: "auto"           # auto-selects based on task
  
agent:
  min_endpointing_delay: 0.5
  max_silence_duration: 2.0
  interrupt_speech_duration: 0.5
```

### 2.4 Docker Compose

```yaml
# infra/compose/livekit.yml
services:
  livekit:
    image: livekit/livekit-server:v1.7
    container_name: index0-livekit
    restart: unless-stopped
    ports:
      - "7880:7880"   # WebSocket
      - "7881:7881"   # HTTP API
      - "7882:7882"   # ICE/TURN UDP
    environment:
      LIVEKIT_KEYS: "${LIVEKIT_API_KEY}:${LIVEKIT_API_SECRET}"
    command: --config /etc/livekit/config.yaml --dev
    volumes:
      - ./livekit-config.yaml:/etc/livekit/config.yaml:ro
    networks:
      - index0-net
```

---

## 3. Pipecat

### 3.1 Purpose
Frame-based, modular pipeline framework for building real-time conversational agents with STT, LLM, and TTS stages.

### 3.2 Pipeline Architecture

```text
AudioInput Frame
    │
    ▼
┌──────────────────┐
│  STT Processor   │  (Whisper / Deepgram)
│  Audio → Text    │
└────────┬─────────┘
         │ TranscriptionFrame
         ▼
┌──────────────────┐
│  LLM Processor   │  (via LiteLLM)
│  Text → Response │
└────────┬─────────┘
         │ TextFrame
         ▼
┌──────────────────┐
│  TTS Processor   │  (ElevenLabs / Bark)
│  Text → Audio    │
└────────┬─────────┘
         │ AudioFrame
         ▼
AudioOutput Frame → WebRTC Track
```

### 3.3 Integration Notes
- Pipecat runs inside the `services/voice-agent/` Python service
- Frames are strongly typed dataclasses passed between pipeline stages
- Custom `AgentBridgeProcessor` stage bridges Pipecat output to the Agent Orchestrator
- Supports pipeline branching for parallel processing (e.g., sentiment analysis alongside main response)

---

## 4. E2B (Code Interpreter + Desktop)

### 4.1 Current Integration
Already integrated in `services/sandbox-manager/src/sandbox/e2b-provider.ts`:
- `E2BSandboxProvider` implements `ISandboxProvider`
- `E2BSandboxSession` implements `ISandboxSession`
- Supports Python (via `runCode`), TypeScript, and Bash (via `commands.run`)

### 4.2 Desktop Extension

```typescript
// New: Desktop automation via @e2b/desktop
import { DesktopSandbox } from '@e2b/desktop';

interface IDesktopSession extends ISandboxSession {
  screenshot(): Promise<Buffer>;
  click(x: number, y: number): Promise<void>;
  type(text: string): Promise<void>;
  navigate(url: string): Promise<void>;
  getScreenSize(): Promise<{ width: number; height: number }>;
}
```

### 4.3 Configuration

```bash
# .env additions
E2B_API_KEY=e2b_api_key_here
E2B_DESKTOP_TEMPLATE=index0-desktop-v1  # Custom template with browser pre-installed
```

---

## 5. Firecracker (Self-Hosted MicroVM)

### 5.1 Purpose
Self-hosted alternative to E2B Cloud for sovereign/air-gapped deployments. Provides identical Firecracker MicroVM isolation without cloud dependency.

### 5.2 Architecture

```text
Sandbox Manager
    │
    ├── HTTP API Socket ──► /run/firecracker.socket
    │
    ├── PUT /machine-config
    │     { "vcpu_count": 1, "mem_size_mib": 512 }
    │
    ├── PUT /boot-source
    │     { "kernel_image_path": "/vm/vmlinux" }
    │
    ├── PUT /drives/rootfs
    │     { "path_on_host": "/vm/rootfs.ext4" }
    │
    ├── PUT /actions { "action_type": "InstanceStart" }
    │
    └── Serial console / vsock for command execution
```

### 5.3 Requirements
- Linux host with KVM support (`/dev/kvm`)
- Pre-built kernel image and rootfs
- Firecracker binary v1.7+

---

## 6. GNAP (Git-Native Agent Protocol)

### 6.1 Purpose
Serverless multi-agent coordination using Git commits as the communication medium. No central database or message broker required.

### 6.2 Message Schema

```json
{
  "$schema": "gnap/v1/message",
  "id": "msg-001-architect-plan",
  "from": { "role": "architect", "agent_id": "arch-01" },
  "to": { "role": "developer", "agent_id": "*" },
  "type": "plan_proposal",
  "parent_id": null,
  "payload": {
    "plan_steps": [...],
    "file_targets": [...],
    "constraints": [...]
  },
  "timestamp": "2026-09-23T22:00:00Z"
}
```

### 6.3 Directory Convention

```text
.gnap/
├── config.json           # Protocol version, agent roster
├── messages/
│   ├── 001-architect-plan.json
│   ├── 002-developer-impl.json
│   ├── 003-critic-review.json
│   └── 004-qa-verdict.json
└── state/
    └── current-cycle.json  # Current review cycle state
```

---

## 7. Postcard Protocol

### 7.1 Purpose
Lightweight JSON envelope format for inter-agent messages. Used within GNAP as the standard message wrapper.

### 7.2 Envelope Schema

```typescript
interface IPostcardEnvelope {
  version: "1.0";
  id: string;                    // UUIDv4
  from: IAgentIdentity;
  to: IAgentIdentity | "*";     // Broadcast
  type: PostcardMessageType;
  payload: Record<string, unknown>;
  timestamp: string;             // ISO 8601
  parent_id?: string;            // Reply chain
  ttl?: number;                  // Message expiry (seconds)
  signatures?: string[];         // Optional cryptographic signatures
}
```

---

## 8. OpenViking (`viking://` Protocol)

### 8.1 Purpose
3-tier progressive context retrieval protocol that dramatically reduces input token consumption by loading only the detail level needed for the current task.

### 8.2 Protocol Specification

```text
viking://repo-name/path/to/module?tier=L0
viking://repo-name/path/to/module?tier=L1
viking://repo-name/path/to/module?tier=L2

Tier Selection Logic:
  1. Always start with L0 (abstract)
  2. If agent needs structural understanding → escalate to L1
  3. If agent needs to read/modify code → escalate to L2
  4. Cache L0 and L1 results for session duration
```

### 8.3 Token Savings Matrix

| Scenario | Without Viking | With Viking (L0+L1) | Savings |
|----------|---------------|---------------------|---------|
| Route to correct module | ~5000 tokens | ~50 tokens | 99.0% |
| Understand module API | ~5000 tokens | ~550 tokens | 89.0% |
| Implement new function | ~5000 tokens | ~3300 tokens | 34.3% |
| Weighted average | ~5000 tokens | ~450 tokens | 91.0% |

### 8.4 Cache Strategy
- L0 abstracts: Generated once per repository, refreshed on `git push`
- L1 overviews: Generated once per module, refreshed on file modification
- L2 full code: Never cached (always read from filesystem)
- Cache store: PostgreSQL `context_cache` table with TTL eviction

---

## 9. Letta (MemGPT)

### 9.1 Purpose
Persistent, structured agent memory system that enables agents to remember context, preferences, and decisions across sessions.

### 9.2 Memory Architecture

```text
┌─────────────────────────────────────┐
│           LETTA MEMORY              │
├─────────────────────────────────────┤
│                                      │
│  CORE MEMORY (always in context)     │
│  ─────────────────────────────       │
│  • Human: user preferences, style    │
│  • Persona: agent behavior config    │
│  • System: platform constraints      │
│                                      │
│  ARCHIVAL MEMORY (searchable)        │
│  ─────────────────────────────       │
│  • Project architecture decisions    │
│  • Past review cycle outcomes        │
│  • Learned coding patterns           │
│                                      │
│  RECALL MEMORY (conversation log)    │
│  ─────────────────────────────       │
│  • Full conversation history         │
│  • Searchable by keyword/date        │
│                                      │
└─────────────────────────────────────┘
```

### 9.3 Docker Compose

```yaml
# infra/compose/letta.yml
services:
  letta:
    image: letta/letta-server:latest
    container_name: index0-letta
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      LETTA_PG_URI: "postgresql://${POSTGRES_USER:-index0}:${POSTGRES_PASSWORD:-index0_secret}@postgres:5432/${POSTGRES_DB:-index0_dev}"
      LETTA_SERVER_PORT: 8283
    ports:
      - "8283:8283"
    networks:
      - index0-net
```

---

## 10. LiteLLM

### 10.1 Purpose
Unified model routing proxy supporting 100+ LLM providers with cost tracking, fallback chains, and load balancing.

### 10.2 Configuration Schema

```yaml
# infra/litellm/config.yaml
model_list:
  - model_name: "gpt-4o"
    litellm_params:
      model: "openai/gpt-4o"
      api_key: "os.environ/OPENAI_API_KEY"
    model_info:
      max_tokens: 128000
      input_cost_per_token: 0.0000025
      output_cost_per_token: 0.00001

  - model_name: "claude-sonnet-4"
    litellm_params:
      model: "anthropic/claude-sonnet-4-20250514"
      api_key: "os.environ/ANTHROPIC_API_KEY"
    model_info:
      max_tokens: 200000
      input_cost_per_token: 0.000003
      output_cost_per_token: 0.000015

  - model_name: "local-codellama"
    litellm_params:
      model: "openai/codellama-34b"
      api_base: "http://vllm:8000/v1"
    model_info:
      max_tokens: 16384
      input_cost_per_token: 0.0
      output_cost_per_token: 0.0

router_settings:
  routing_strategy: "cost-aware"
  fallbacks:
    - ["gpt-4o", "claude-sonnet-4"]
    - ["claude-sonnet-4", "local-codellama"]
  retry_policy:
    max_retries: 3
    retry_after_seconds: 1
```

### 10.3 Docker Compose

```yaml
# infra/compose/litellm.yml
services:
  litellm:
    image: ghcr.io/berriai/litellm:main-latest
    container_name: index0-litellm
    restart: unless-stopped
    environment:
      LITELLM_MASTER_KEY: "${LITELLM_MASTER_KEY:-sk-index0-litellm-dev}"
      DATABASE_URL: "postgresql://${POSTGRES_USER:-index0}:${POSTGRES_PASSWORD:-index0_secret}@postgres:5432/${POSTGRES_DB:-index0_dev}"
    ports:
      - "4000:4000"
    volumes:
      - ../litellm/config.yaml:/app/config.yaml:ro
    command: --config /app/config.yaml --detailed_debug
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - index0-net
```

---

## 11. LangGraph

### 11.1 Purpose
Framework for building multi-agent systems as stateful, cyclic computation graphs with built-in persistence and human-in-the-loop support.

### 11.2 INDEX0 State Graph

```python
# Simplified graph definition
from langgraph.graph import StateGraph, END

class ReviewState(TypedDict):
    prompt: str
    plan: Optional[dict]
    code_changes: Optional[list]
    review_verdict: Optional[str]
    test_results: Optional[dict]
    iteration: int
    max_iterations: int

graph = StateGraph(ReviewState)

graph.add_node("architect", architect_node)
graph.add_node("developer", developer_node)
graph.add_node("critic", critic_node)
graph.add_node("qa", qa_node)

graph.set_entry_point("architect")
graph.add_edge("architect", "developer")
graph.add_edge("developer", "critic")

# Conditional: critic can approve or request changes
graph.add_conditional_edges("critic", route_after_critic, {
    "approve": "qa",
    "request_changes": "developer",
    "reject": END
})

# Conditional: QA can approve or send back
graph.add_conditional_edges("qa", route_after_qa, {
    "approve": END,
    "reject": "developer"
})

app = graph.compile()
```

---

## 12. TextGrad

### 12.1 Purpose
Textual backpropagation framework that converts failed test traces into structured feedback for iterative prompt improvement without model re-training.

### 12.2 Feedback Loop

```text
Test Failure Trace
    │
    ▼
TextGrad Loss Function
    │  "The generated code failed because..."
    │  "Expected behavior: ..."
    │  "Actual behavior: ..."
    │
    ▼
Gradient Computation
    │  "To fix this, the prompt should emphasize..."
    │  "The developer node should prioritize..."
    │
    ▼
Prompt Update
    │  Original prompt + corrective feedback
    │
    ▼
Re-execution with improved prompt
```

### 12.3 Integration
- Runs as a sub-module within `services/agent-orchestrator/`
- Feedback stored in Letta archival memory for cross-session learning
- Batch processing mode: overnight prompt optimization across all historical failures

---

## 13. Semgrep

### 13.1 Purpose
Static Application Security Testing (SAST) engine with custom rule support for detecting code vulnerabilities, anti-patterns, and security issues.

### 13.2 MCP Server Configuration

```json
{
  "name": "semgrep-sast",
  "command": "semgrep",
  "args": ["scan", "--config=auto", "--json", "--quiet"],
  "transport": "stdio",
  "workspaceConfined": true,
  "description": "Pre-merge SAST scanning via Semgrep with auto-detected rule packs"
}
```

### 13.3 Custom Rules
- SQL injection detection (Python, TypeScript)
- Hardcoded secret patterns
- Path traversal via string concatenation
- Unsafe deserialization patterns
- Missing authentication checks on API endpoints

---

## 14. Trivy

### 14.1 Purpose
Comprehensive vulnerability scanner for containers, filesystems, and dependencies (CVE database, license compliance).

### 14.2 MCP Server Configuration

```json
{
  "name": "trivy-scanner",
  "command": "trivy",
  "args": ["fs", "--format=json", "--security-checks=vuln,secret,config"],
  "transport": "stdio",
  "workspaceConfined": true,
  "description": "Dependency vulnerability and license scanning via Trivy"
}
```

### 14.3 Gate Policy
- **CRITICAL**: Block merge, notify security team
- **HIGH**: Block merge, require explicit override
- **MEDIUM**: Warning, allow merge with acknowledgment
- **LOW**: Informational only

---

## 15. Flyte (Union.ai)

### 15.1 Purpose
Workflow orchestration with first-class support for replay logs and checkpoint-based crash recovery, complementing Temporal for batch/ML workloads.

### 15.2 Use Cases in INDEX0
- Long-running TextGrad batch optimization jobs
- Dataset generation and evaluation pipelines
- Model benchmark comparison workflows
- Checkpoint-based resume after infrastructure failures

### 15.3 Integration Notes
- Flyte is optional and additive; Temporal remains the primary workflow engine
- Used specifically for Python-native ML workflows where Flyte's type system and containerized tasks provide advantages over Temporal's activity model
