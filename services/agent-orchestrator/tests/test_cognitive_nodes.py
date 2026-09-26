"""Unit tests for Phase 1 Cognitive Nodes and LiteLLM Client."""
import pytest
from pydantic import BaseModel
from src.llm.client import LiteLLMClient
from src.graph.nodes.architect import architect_node
from src.graph.nodes.developer import developer_node
from src.graph.nodes.critic import critic_node
from src.graph.nodes.qa import qa_node
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
async def test_developer_node_with_textgrad_feedback():
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

    assert "implementation_diff" in result
    diff = result["implementation_diff"]
    assert len(diff) > 20
    assert result["iteration"] == 2
    assert result["current_role"] == "developer"


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
async def test_qa_node_execution():
    state = {
        "cycle_id": "qa-test-cycle",
        "task_id": "task-test-qa",
        "implementation_diff": "diff --git a/main.ts b/main.ts\n+ export const ok = true;",
        "iteration": 1,
        "history": []
    }
    result = await qa_node(state)

    assert "qa_results" in result
    qa = result["qa_results"]
    assert "passed" in qa
    assert qa["passed"] is True
    assert qa["tests_run"] == 5
    assert result["final_verdict"] == "approved"
