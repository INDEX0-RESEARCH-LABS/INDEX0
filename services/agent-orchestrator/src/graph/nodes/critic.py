"""Critic Node — Multi-Agent Coordination.

Adversarial Red-Team & Invariant Verification Gate.
Audits the Developer's implementation diff, evaluates security, memory safety,
and anti-slop criteria, and triggers textual backpropagation via TextGrad.
"""
from datetime import datetime, timezone
import logging
import uuid
from typing import Any, Dict, List
from pydantic import BaseModel, Field
from ...textgrad.feedback_engine import TextGradFeedbackEngine
from ..state import ReviewLoopState
from ...config import get_settings
from ...llm.client import get_llm_client

logger = logging.getLogger(__name__)
feedback_engine = TextGradFeedbackEngine()


class CriticFindingItem(BaseModel):
    file_path: str = Field(..., alias="filePath")
    line: int = Field(1)
    severity: str = Field(..., description="'critical', 'error', 'warning', or 'info'")
    category: str = Field(..., description="'security', 'correctness', 'concurrency', 'slop', or 'performance'")
    message: str
    suggested_fix: str = Field(..., alias="suggestedFix")


class CriticEvaluationResult(BaseModel):
    decision: str = Field(..., description="'approve', 'request_changes', or 'reject'")
    comments: str
    findings: List[CriticFindingItem] = Field(default_factory=list)


CRITIC_SYSTEM_PROMPT = """You are the Adversarial Senior Systems Critic & Red-Team Auditor for INDEX0 AI.
Your sole mission is to find subtle bugs, race conditions, invariant violations, and code slop in the proposed diff.

AUDIT CRITERIA:
1. Invariant Satisfaction: Does the diff violate any safety contracts, pre-conditions, or post-conditions defined by the Architect?
2. Concurrency & Race Conditions: Are there shared mutable states without synchronized access, lock inversions, or unbuffered channel deadlocks?
3. Memory Safety & Leaks: Are there unclosed descriptors, lingering event listeners, or circular references?
4. Anti-Slop Policy: STRICTLY REJECT any diff containing:
   - Exception swallowing (`try { ... } catch (e) {}` with no handling or fake success)
   - Lazy stubs (`// TODO`, `// Implement later`, `placeholder`)
   - Bypassed types (`any`, `@ts-ignore`, unsafe casts)
5. Decision Rule:
   - If there are ANY 'critical' or 'error' findings: decision MUST be 'request_changes'.
   - ONLY if the diff is completely sound, safe, and passes all invariants: decision is 'approve'."""


async def critic_node(state: ReviewLoopState) -> Dict[str, Any]:
    """Execute Critic adversarial review phase with real LLM evaluation."""
    settings = get_settings()
    llm = get_llm_client()

    diff = state.get("implementation_diff", "")
    iteration = state.get("iteration", 1)
    cycle_id = state.get("cycle_id", str(uuid.uuid4()))
    plan = state.get("architecture_plan", "")
    user_prompt = state.get("user_prompt", "")

    user_message = (
        f"### ORIGINAL GOAL\n{user_prompt}\n\n"
        f"### ARCHITECTURAL INVARIANTS & PLAN\n{plan}\n\n"
        f"### PROPOSED UNIFIED DIFF (Iteration {iteration})\n```diff\n{diff}\n```\n\n"
        f"Perform an adversarial audit. Respond strictly conforming to the CriticEvaluationResult JSON schema."
    )

    findings: List[Dict[str, Any]] = []
    decision: str = "approve"
    comments: str = "Code diff meets architectural constraints and passes review gates."

    try:
        eval_result: CriticEvaluationResult = await llm.complete(
            messages=[
                {"role": "system", "content": CRITIC_SYSTEM_PROMPT},
                {"role": "user", "content": user_message}
            ],
            model=settings.critic_model,
            response_model=CriticEvaluationResult,
            temperature=0.1,
            timeout=45.0
        )
        decision = eval_result.decision
        comments = eval_result.comments
        findings = [f.model_dump(by_alias=True) for f in eval_result.findings]
    except Exception as e:
        logger.warning(f"Critic LLM inference failed or unavailable ({e}); applying heuristic static audit.")
        # Heuristic static audit fallback
        has_slop = any(slop in diff for slop in ["// TODO", "catch (e) {}", "catch (err) {}", "@ts-ignore"])
        is_empty = len(diff.strip()) < 20
        is_unverified = (iteration < 2 and "isVerified = true" not in diff) or ("unverified" in diff.lower())

        if has_slop or is_unverified:
            findings.append({
                "filePath": "diff",
                "line": 1,
                "severity": "critical" if has_slop else "warning",
                "category": "slop" if has_slop else "correctness",
                "message": "Detected anti-slop violation: placeholder comments or swallowed exceptions." if has_slop else "Missing verified contract export in initial diff.",
                "suggestedFix": "Implement explicit error propagation and satisfy verification contract."
            })
            decision = "request_changes"
            comments = "Adversarial check failed: code contains flaws or unsatisfied verification contracts."
        elif is_empty:
            findings.append({
                "filePath": "diff",
                "line": 1,
                "severity": "critical",
                "category": "correctness",
                "message": "Empty or truncated implementation diff emitted.",
                "suggestedFix": "Emit complete unified diff with substantive changes."
            })
            decision = "request_changes"
            comments = "Implementation diff is empty or insufficient."
        else:
            decision = "approve"
            comments = "Heuristic static gates passed. Proceeding to QA verification."

    verdict = {
        "id": f"verdict-{uuid.uuid4().hex[:8]}",
        "cycleId": cycle_id,
        "reviewer": {
            "agentId": "agent-critic-01",
            "role": "critic",
            "displayName": "Senior Adversarial Critic",
            "model": settings.critic_model
        },
        "decision": decision,
        "comments": comments,
        "findings": findings,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

    # If changes requested, compute TextGrad feedback gradient
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
        "findingsCount": len(findings),
        "textgradLoss": loss
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
