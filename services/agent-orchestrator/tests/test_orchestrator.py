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
async def test_developer_node():
    state = {
        "architecture_plan": "Step 1: Write auth handler",
        "iteration": 0,
        "history": []
    }
    result = await developer_node(state)
    assert result["iteration"] == 1
    assert "implementation_diff" in result
    assert "export const isVerified = true;" in result["implementation_diff"]


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
    assert final_state["status"] == "qa_verified"
    assert "qa_results" in final_state
    assert final_state["qa_results"]["status"] == "passed"


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
