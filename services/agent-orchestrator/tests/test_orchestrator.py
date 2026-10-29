"""Unit tests for Agent Orchestrator service."""
import pytest
from src.graph.nodes import architect_node, developer_node, critic_node, qa_node
from src.graph.review_loop import ReviewLoopEngine, should_continue_review
from src.textgrad.feedback_engine import TextGradFeedbackEngine
from src.models import (
    AgentIdentity,
    AgentRole,
    ReviewVerdictDecision,
    ReviewFindingSeverity,
    ReviewFinding,
    ReviewVerdict,
)


@pytest.mark.asyncio
async def test_architect_node():
    state = {
        "task_id": "test-task-1",
        "user_prompt": "Build an authentication service with OAuth2",
        "context_files": ["packages/contracts/src/v1/auth/index.ts"],
        "history": []
    }
    result = await architect_node(state)
    assert "architecture_plan" in result
    assert "BLUEPRINT" in result["architecture_plan"]
    assert result["current_role"] == "architect"
    assert len(result["history"]) == 1


@pytest.mark.asyncio
async def test_developer_node_derives_a_diff_from_whole_file_output(tmp_path, monkeypatch):
    """The model returns whole files; the node computes the diff itself."""
    source = tmp_path / "src" / "math.js"
    source.parent.mkdir(parents=True)
    source.write_text("export function divide(a, b) {\n  return a / b;\n}\n")

    async def fake_complete(**kwargs):
        return (
            "### FILE: src/math.js\n```js\n"
            "export function divide(a, b) {\n"
            "  if (b === 0) throw new RangeError(\"division by zero\");\n"
            "  return a / b;\n"
            "}\n```"
        )

    monkeypatch.setattr(
        "src.graph.nodes.developer.get_llm_client",
        lambda: type("LLM", (), {"complete": staticmethod(fake_complete)})(),
    )

    state = {
        "user_prompt": "Make divide throw on a zero denominator",
        "architecture_plan": "Guard the denominator",
        "repository_root": str(tmp_path),
        "context_files": ["src/math.js"],
        "iteration": 0,
        "history": [],
    }
    result = await developer_node(state)

    assert result["generated_code"] == {
        "src/math.js": (
            'export function divide(a, b) {\n'
            '  if (b === 0) throw new RangeError("division by zero");\n'
            "  return a / b;\n}\n"
        )
    }
    diff = result["implementation_diff"]
    assert diff.startswith("diff --git a/src/math.js b/src/math.js")
    assert '+  if (b === 0) throw new RangeError("division by zero");' in diff
    assert result["iteration"] == 1


@pytest.mark.asyncio
async def test_developer_node_fabricates_nothing_when_the_model_is_unavailable(monkeypatch):
    async def boom(**kwargs):
        raise RuntimeError("model offline")

    monkeypatch.setattr(
        "src.graph.nodes.developer.get_llm_client",
        lambda: type("LLM", (), {"complete": staticmethod(boom)})(),
    )
    state = {"architecture_plan": "Step 1", "iteration": 0, "history": []}
    result = await developer_node(state)

    # An unavailable model must not produce a plausible-looking patch that no
    # test could ever verify.
    assert result["implementation_diff"] == ""
    assert result["generated_code"] == {}
    assert result["iteration"] == 1


@pytest.mark.asyncio
async def test_critic_node_approval():
    state = {
        "cycle_id": "test-cycle",
        "implementation_diff": "+ export const isVerified = true;",
        "iteration": 2,
        "history": []
    }
    result = await critic_node(state)
    assert result["critic_verdict"]["decision"] == "approve"
    assert result["textgrad_loss"] == 0.0


@pytest.mark.asyncio
async def test_critic_node_request_changes():
    state = {
        "cycle_id": "test-cycle",
        "implementation_diff": "+ const unverified = false;",
        "iteration": 1,
        "history": []
    }
    result = await critic_node(state)
    assert result["critic_verdict"]["decision"] == "request_changes"
    assert result["textgrad_loss"] > 0.0
    assert result["textgrad_prompt"] is not None


@pytest.mark.asyncio
async def test_review_loop_full_cycle():
    engine = ReviewLoopEngine()
    initial_state = {
        "cycle_id": "full-test-cycle",
        "task_id": "task-42",
        "user_prompt": "Implement sovereign token counter",
        "context_files": [],
        "max_iterations": 3,
        "history": []
    }
    final_state = await engine.execute_cycle(initial_state)
    assert final_state["is_complete"] is True
    # LiteLLM and the sandbox are both unreachable in unit tests, so the loop
    # must not claim verification. QA fails closed instead of reporting
    # "All unit and invariant tests passed".
    assert final_state["status"] == "qa_failed"
    assert "qa_results" in final_state
    assert final_state["qa_results"]["status"] == "failed"
    assert final_state["qa_results"]["tests_run"] == 0
    assert final_state["final_verdict"] == "rejected"


def test_textgrad_feedback_engine():
    engine = TextGradFeedbackEngine()
    findings = [
        {
            "filePath": "src/auth.ts",
            "line": 42,
            "severity": "critical",
            "category": "security",
            "message": "Hardcoded secret detected",
            "suggestedFix": "Use process.env.AUTH_SECRET"
        }
    ]
    res = engine.compute_feedback_gradient(
        current_code="const secret = '12345';",
        critic_comments="Security risk present",
        findings=findings
    )
    assert res["needs_refinement"] is True
    assert res["gradient_loss"] > 0.0
    assert "TEXTGRAD BACKPROPAGATION GRADIENT" in res["refinement_prompt"]
    assert "Hardcoded secret detected" in res["refinement_prompt"]
