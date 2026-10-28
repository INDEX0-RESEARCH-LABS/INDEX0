"""FastAPI Application for INDEX0 Agent Orchestrator."""
import asyncio
from datetime import datetime, timezone
import uuid
from typing import Any, Dict
from fastapi import FastAPI, HTTPException
from fastapi.responses import PlainTextResponse
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .graph.review_loop import ReviewLoopEngine
from .graph.state import ReviewLoopState
from .models import CycleStartRequest, CycleStatusResponse
from .textgrad.feedback_engine import TextGradFeedbackEngine
from .reengineering import (
    CrownJewelExtractor,
    CodeModernizer,
    ReEngineerRequest,
    ElevatedCodeResult
)

settings = get_settings()
engine = ReviewLoopEngine()
feedback_engine = TextGradFeedbackEngine()
extractor = CrownJewelExtractor()
modernizer = CodeModernizer()

# In-memory storage for active cycles (in production, backed by Redis/PostgreSQL)
cycles_store: Dict[str, ReviewLoopState] = {}

# Fire-and-forget telemetry tasks must be referenced until they finish,
# otherwise CPython may garbage-collect the task mid-flight.
_background_tasks: set = set()


def _spawn(coro):
    task = asyncio.create_task(coro)
    _background_tasks.add(task)
    task.add_done_callback(_background_tasks.discard)
    return task

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

    # Stream audit + execution telemetry into ClickHouse without blocking the
    # response (each insert has its own 1.5s timeout and may be unreachable).
    from .telemetry import get_clickhouse_client
    ch = get_clickhouse_client()
    _spawn(ch.log_audit_event(
        action="cycle_completed",
        resource_id=cycle_id,
        metadata={
            "task_id": req.task_id,
            "status": final_state.get("status", "completed"),
            "iteration": final_state.get("iteration", 1),
            "critic_verdict": final_state.get("critic_verdict", {}).get("decision", "unknown")
        }
    ))
    _spawn(ch.log_execution_metrics(
        run_id=cycle_id,
        model=settings.developer_model,
        # Unknown values stay 0: token counts are only recorded when the graph
        # actually reports them, never reconstructed from a plausible guess.
        duration_ms=int(final_state.get("qa_results", {}).get("duration_ms") or 0),
        prompt_tokens=int(final_state.get("prompt_tokens") or 0),
        completion_tokens=int(final_state.get("completion_tokens") or 0),
        status=final_state.get("status", "completed"),
        step_count=final_state.get("iteration", 1)
    ))

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


@app.post("/cycles/mcts/start")
async def start_mcts_cycle(req: CycleStartRequest) -> Dict[str, Any]:
    cycle_id = f"mcts-{uuid.uuid4().hex[:12]}"
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

    mcts_result = await engine.execute_mcts_cycle(initial_state)
    cycles_store[cycle_id] = mcts_result.get("finalState", initial_state)

    return {
        "cycleId": cycle_id,
        **mcts_result
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


@app.post("/reengineer/start", response_model=ElevatedCodeResult)
async def start_reengineering(req: ReEngineerRequest) -> ElevatedCodeResult:
    """Dissects target repository, isolates Crown Jewel algorithms, and elevates them into modern primitives."""
    spec = await extractor.extract_crown_jewels(req.repo_url, req.goal)
    result = await modernizer.elevate_codebase(spec, req.goal, req.target_framework)
    return result


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


@app.get("/metrics", response_class=PlainTextResponse)
async def prometheus_metrics():
    """Prometheus SRE metrics exposition endpoint."""
    total_cycles = len(cycles_store)
    active_cycles = sum(1 for c in cycles_store.values() if not c.get("is_complete", False))
    completed_cycles = sum(1 for c in cycles_store.values() if c.get("is_complete", False))
    tripped_circuits = sum(1 for c in cycles_store.values() if c.get("circuit_breaker_tripped", False))

    lines = [
        "# HELP index0_orchestrator_cycles_total Total number of review cycles initiated",
        "# TYPE index0_orchestrator_cycles_total counter",
        f"index0_orchestrator_cycles_total {total_cycles}",
        "# HELP index0_orchestrator_active_cycles Current active in-flight cycles",
        "# TYPE index0_orchestrator_active_cycles gauge",
        f"index0_orchestrator_active_cycles {active_cycles}",
        "# HELP index0_orchestrator_completed_cycles Total completed cycles",
        "# TYPE index0_orchestrator_completed_cycles counter",
        f"index0_orchestrator_completed_cycles {completed_cycles}",
        "# HELP index0_orchestrator_circuit_breaker_trips_total Total circuit breaker trips",
        "# TYPE index0_orchestrator_circuit_breaker_trips_total counter",
        f"index0_orchestrator_circuit_breaker_trips_total {tripped_circuits}",
    ]
    return PlainTextResponse("\n".join(lines) + "\n", media_type="text/plain; version=0.0.4")

