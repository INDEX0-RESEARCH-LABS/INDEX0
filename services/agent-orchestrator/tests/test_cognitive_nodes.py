"""Unit tests for Phase 1 Cognitive Nodes and LiteLLM Client."""
import base64
import re
import subprocess

import httpx
import pytest
from pydantic import BaseModel
from src.llm.client import LiteLLMClient
from src.graph.nodes.architect import architect_node
from src.graph.nodes.developer import developer_node
from src.graph.nodes.critic import critic_node
from src.graph.nodes.qa import qa_node, verification_command
from src.models import ArchitectSpec, AlgorithmicHypothesis


class SampleSchema(BaseModel):
    name: str
    count: int


def test_litellm_client_json_extraction():
    client = LiteLLMClient(base_url="http://localhost:4000", api_key="test-key")
    assert client.endpoint == "http://localhost:4000/v1/chat/completions"

    raw_markdown = "Here is the response:\n```json\n{\"name\": \"test\", \"count\": 42}\n```\nHope it helps!"
    extracted = client._extract_json_block(raw_markdown)
    assert extracted == '{"name": "test", "count": 42}'


@pytest.mark.asyncio
async def test_architect_node_spec_generation():
    state = {
        "cycle_id": "arch-test-cycle",
        "task_id": "task-zero-race",
        "user_prompt": "Eliminate TSAN race condition in concurrent worker pool",
        "context_files": ["src/worker.go"],
        "history": []
    }
    result = await architect_node(state)

    assert "architecture_plan" in result
    assert "architect_spec" in result
    assert "active_hypothesis" in result
    spec = result["architect_spec"]
    assert len(spec["invariants"]) > 0
    assert len(spec["hypotheses"]) >= 2
    assert result["current_role"] == "architect"
    assert result["status"] == "planned"


@pytest.mark.asyncio
async def test_developer_node_with_textgrad_feedback(monkeypatch):
    async def fake_complete(**kwargs):
        # The TextGrad directive must reach the model.
        user_message = kwargs["messages"][-1]["content"]
        assert "Race on line 42" in user_message
        return "### FILE: src/worker.ts\n```ts\nexport const guarded = true;\n```"

    monkeypatch.setattr(
        "src.graph.nodes.developer.get_llm_client",
        lambda: type("LLM", (), {"complete": staticmethod(fake_complete)})(),
    )
    state = {
        "cycle_id": "dev-test-cycle",
        "task_id": "task-zero-race",
        "user_prompt": "Eliminate TSAN race condition",
        "architecture_plan": "Invariant: zero data races.",
        "active_hypothesis": {
            "hypothesis_id": "hyp-alpha",
            "name": "Lock-Free Ring Buffer",
            "implementation_strategy": "Surgical CAS"
        },
        "context_files": ["src/worker.ts"],
        "textgrad_prompt": "CRITICAL: Race on line 42. Synchronize access with atomic CAS.",
        "iteration": 1,
        "history": []
    }
    result = await developer_node(state)

    assert result["generated_code"] == {"src/worker.ts": "export const guarded = true;\n"}
    assert result["implementation_diff"].startswith("diff --git a/src/worker.ts b/src/worker.ts")
    assert result["iteration"] == 2
    assert result["current_role"] == "developer"


def test_verification_command_writes_whole_files_and_stays_inside_the_workspace():
    command = verification_command(
        "",
        files={"src/math.js": "export const ok = true;\n", "../escape.js": "nope\n"},
    )

    # Whole-file output is written directly; unsafe paths are dropped.
    assert "../escape.js" not in command
    match = re.search(r"printf %s '([^']+)' \| base64 -d > src/math\.js", command)
    assert match, command
    assert base64.b64decode(match.group(1)).decode() == "export const ok = true;\n"
    assert command.rstrip().endswith("npm test")
    # The command must be a valid shell program (quoting/redirection bugs fail here).
    subprocess.run(["sh", "-n", "-c", command], check=True)
    # ...and every step is chained, so no failure can be swallowed.
    assert " || " not in command


@pytest.mark.asyncio
async def test_critic_node_detects_slop():
    state = {
        "cycle_id": "critic-test-cycle",
        "user_prompt": "Implement secure auth handshake",
        "architecture_plan": "Invariant: No swallowed exceptions.",
        "implementation_diff": "--- a/auth.ts\n+++ b/auth.ts\n@@ -1 +1 @@\n+ try { verify() } catch (e) {}",
        "iteration": 1,
        "history": []
    }
    result = await critic_node(state)

    assert result["critic_verdict"]["decision"] == "request_changes"
    assert result["textgrad_loss"] > 0.0
    assert result["textgrad_prompt"] is not None
    assert any("slop" in str(f).lower() or "swallowed" in str(f).lower() for f in result["critic_findings"])


@pytest.mark.asyncio
async def test_qa_node_fails_closed_when_sandbox_is_unreachable(monkeypatch):
    """No sandbox means nothing was verified: the gate must not report a pass."""
    async def unreachable(*args, **kwargs):
        raise httpx.ConnectError("sandbox-manager offline")

    monkeypatch.setattr("src.graph.nodes.qa.execute_in_sandbox", unreachable)
    state = {
        "cycle_id": "qa-test-cycle",
        "task_id": "task-test-qa",
        "implementation_diff": "diff --git a/main.ts b/main.ts\n+ export const ok = true;",
        "iteration": 1,
        "history": []
    }
    result = await qa_node(state)

    qa = result["qa_results"]
    assert qa["passed"] is False
    assert qa["tests_run"] == 0
    assert qa["sastFindings"] is None
    assert qa["sandboxMode"] == "unverified"
    assert result["final_verdict"] == "rejected"


@pytest.mark.asyncio
async def test_qa_node_reports_only_observed_results(monkeypatch):
    captured = {}

    async def fake_sandbox(sandbox_url, command, timeout_ms=30000, workspace_path=""):
        captured["cmd"] = command
        captured["workspace"] = workspace_path
        return {"exitCode": 0, "stdout": "24 passed, 0 failed", "stderr": "", "durationMs": 1234}

    monkeypatch.setattr("src.graph.nodes.qa.execute_in_sandbox", fake_sandbox)
    state = {
        "cycle_id": "qa-test-cycle",
        "task_id": "task-test-qa",
        "implementation_diff": "diff --git a/main.ts b/main.ts\n+ export const ok = true;",
        "repository_root": "/srv/repo-under-test",
        "iteration": 1,
        "history": []
    }
    result = await qa_node(state)

    qa = result["qa_results"]
    assert qa["passed"] is True
    assert qa["tests_run"] == 24
    assert qa["tests_passed"] == 24
    assert qa["duration_ms"] == 1234
    # QA must verify the repo this cycle was started against.
    assert captured["workspace"] == "/srv/repo-under-test"
    # The verification command must be able to fail (no '|| echo' rescue).
    assert "echo" not in captured["cmd"]
