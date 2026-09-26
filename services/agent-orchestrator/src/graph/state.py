"""State definition for the 4-Tier Review Loop state graph."""
from typing import Any, Dict, List, Optional
from typing_extensions import TypedDict


class ReviewLoopState(TypedDict, total=False):
    cycle_id: str
    task_id: str
    user_prompt: str
    context_files: List[str]
    repository_root: str

    # Node artifacts
    architecture_plan: Optional[str]
    architect_spec: Optional[Dict[str, Any]]
    active_hypothesis: Optional[Dict[str, Any]]
    implementation_diff: Optional[str]
    generated_code: Dict[str, str]

    # Review & QA verdicts
    critic_verdict: Optional[Dict[str, Any]]
    critic_findings: List[Dict[str, Any]]
    qa_results: Optional[Dict[str, Any]]

    # Loop controls & TextGrad
    iteration: int
    max_iterations: int
    textgrad_loss: float
    textgrad_prompt: Optional[str]

    # Status tracking
    current_role: str
    status: str
    is_complete: bool
    final_verdict: Optional[str]
    history: List[Dict[str, Any]]
