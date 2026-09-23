"""FastAPI Application for INDEX0 Agent Orchestrator."""
from datetime import datetime, timezone
import uuid
from typing import Any, Dict
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .graph.review_loop import ReviewLoopEngine
from .graph.state import ReviewLoopState
from .models import CycleStartRequest, CycleStatusResponse
from .textgrad.feedback_engine import TextGradFeedbackEngine

settings = get_settings()
engine = ReviewLoopEngine()
feedback_engine = TextGradFeedbackEngine()

# In-memory storage for active cycles (in production, backed by Redis/PostgreSQL)
cycles_store: Dict[str, ReviewLoopState] = {}

app = FastAPI(
    title="INDEX0 Agent Orchestrator",
    description="Multi-Agent Coordination & 4-Tier Review Loop Microservice",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "agent-orchestrator",
        "version": "0.1.0",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@app.post("/cycles/start")
async def start_cycle(req: CycleStartRequest) -> Dict[str, Any]:
    cycle_id = f"cycle-{uuid.uuid4().hex[:12]}"
    initial_state: ReviewLoopState = {
        "cycle_id": cycle_id,
        "task_id": req.task_id,
        "user_prompt": req.user_prompt,
        "repository_root": req.repository_root or ".",
        "context_files": req.context_files,
        "iteration": 0,
        "max_iterations": req.max_iterations,
        "status": "started",
        "is_complete": False,
        "history": []
    }

    # Execute the cycle via the review loop engine
    final_state = await engine.execute_cycle(initial_state)
    cycles_store[cycle_id] = final_state

    return {
        "cycleId": cycle_id,
        "taskId": req.task_id,
        "status": final_state.get("status", "completed"),
        "isComplete": final_state.get("is_complete", False),
        "iteration": final_state.get("iteration", 1),
        "architecturePlan": final_state.get("architecture_plan"),
        "implementationDiff": final_state.get("implementation_diff"),
        "criticVerdict": final_state.get("critic_verdict"),
        "qaResults": final_state.get("qa_results"),
        "history": final_state.get("history", [])
    }


@app.get("/cycles/{cycle_id}")
async def get_cycle(cycle_id: str) -> Dict[str, Any]:
    state = cycles_store.get(cycle_id)
    if not state:
        raise HTTPException(status_code=404, detail=f"Cycle not found: {cycle_id}")

    return {
        "cycleId": cycle_id,
        "taskId": state.get("task_id"),
        "status": state.get("status"),
        "isComplete": state.get("is_complete", False),
        "iteration": state.get("iteration", 0),
        "currentRole": state.get("current_role"),
        "architecturePlan": state.get("architecture_plan"),
        "implementationDiff": state.get("implementation_diff"),
        "criticVerdict": state.get("critic_verdict"),
        "qaResults": state.get("qa_results"),
        "history": state.get("history", [])
    }


@app.post("/feedback/textgrad")
async def compute_feedback(payload: Dict[str, Any]):
    """Direct endpoint to test textual gradient computation."""
    current_code = payload.get("code", "")
    comments = payload.get("comments", "")
    findings = payload.get("findings", [])
    qa_errors = payload.get("qa_errors")

    gradient = feedback_engine.compute_feedback_gradient(
        current_code=current_code,
        critic_comments=comments,
        findings=findings,
        qa_errors=qa_errors
    )
    return gradient
