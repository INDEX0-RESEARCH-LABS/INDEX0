"""Critic Node — Multi-Agent Coordination.

Reviews the developer's implementation diff, evaluates security, architectural fidelity,
and either approves or triggers textual backpropagation via TextGrad.
"""
from datetime import datetime, timezone
import uuid
from typing import Any, Dict, List
from ...textgrad.feedback_engine import TextGradFeedbackEngine
from ..state import ReviewLoopState

feedback_engine = TextGradFeedbackEngine()


async def critic_node(state: ReviewLoopState) -> Dict[str, Any]:
    """Execute Critic code review phase."""
    diff = state.get("implementation_diff", "")
    iteration = state.get("iteration", 1)
    cycle_id = state.get("cycle_id", str(uuid.uuid4()))

    findings: List[Dict[str, Any]] = []

    # Mock evaluation logic: approve if iteration >= 2 or if diff meets quality bar
    if iteration < 2 and "isVerified = true" not in diff:
        findings.append({
            "filePath": "src/main.ts",
            "line": 1,
            "severity": "warning",
            "category": "correctness",
            "message": "Missing explicit verification signature export",
            "suggestedFix": "Export const isVerified = true;"
        })
        decision = "request_changes"
        comments = "Changes required: please satisfy verification contract export."
    else:
        decision = "approve"
        comments = "Code diff meets architectural constraints and passes review gates."

    verdict = {
        "id": f"verdict-{uuid.uuid4().hex[:8]}",
        "cycleId": cycle_id,
        "reviewer": {
            "agentId": "agent-critic-01",
            "role": "critic",
            "displayName": "Senior Systems Critic",
            "model": "claude-3-5-sonnet"
        },
        "decision": decision,
        "comments": comments,
        "findings": findings,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

    # If changes requested, compute textgrad feedback
    textgrad_prompt = None
    loss = 0.0
    if decision != "approve":
        tg_res = feedback_engine.compute_feedback_gradient(
            current_code=diff,
            critic_comments=comments,
            findings=findings
        )
        textgrad_prompt = tg_res["refinement_prompt"]
        loss = tg_res["gradient_loss"]

    history = state.get("history", [])
    history.append({
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "role": "critic",
        "action": "review_verdict",
        "decision": decision,
        "findingsCount": len(findings)
    })

    return {
        "critic_verdict": verdict,
        "critic_findings": findings,
        "textgrad_prompt": textgrad_prompt,
        "textgrad_loss": loss,
        "current_role": "critic",
        "status": "reviewed",
        "history": history
    }
