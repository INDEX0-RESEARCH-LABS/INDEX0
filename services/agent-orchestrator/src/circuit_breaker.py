"""Agent Circuit Breaker & Runaway Protection Engine for INDEX0 AI.

Enforces:
1. Blast Radius File Limiting (Max files touched per task).
2. Semantic Progress Gating (AST / Token diff change < 2% aborts non-converging loops).
3. Wall-Clock Timeout Protection (Hard cap on task duration).
4. Token Burn & Economic Budget Guards.
"""
from dataclasses import dataclass, field
import difflib
import time
import logging
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)


class CircuitBreakerException(Exception):
    """Raised when an autonomous agent violates safety, convergence, or blast-radius limits."""
    def __init__(self, reason: str, metric: str, current_value: Any, threshold: Any):
        super().__init__(f"Circuit Breaker Triggered [{metric}]: {reason} (Current: {current_value}, Limit: {threshold})")
        self.reason = reason
        self.metric = metric
        self.current_value = current_value
        self.threshold = threshold


@dataclass
class CircuitBreakerConfig:
    max_files_modified: int = 15
    min_semantic_progress_ratio: float = 0.02  # 2% minimum progress between turns
    max_task_wall_clock_seconds: float = 600.0 # 10 minutes max total task time
    max_total_tokens_per_task: int = 1_000_000 # 1M tokens cap per task
    max_cost_usd_per_task: float = 5.00        # $5.00 cost cap per task
    consecutive_stagnant_turns_allowed: int = 2


@dataclass
class CircuitBreakerState:
    task_start_time: float = field(default_factory=time.time)
    previous_diff_hashes: List[str] = field(default_factory=list)
    previous_code_snapshots: List[str] = field(default_factory=list)
    stagnant_turn_count: int = 0
    total_tokens_burned: int = 0
    estimated_cost_usd: float = 0.0


class AgentCircuitBreaker:
    """Monitors and protects the repository against non-deterministic agent loop runaway."""

    def __init__(self, config: Optional[CircuitBreakerConfig] = None):
        self.config = config or CircuitBreakerConfig()
        self.state = CircuitBreakerState()

    def reset(self, start_time: Optional[float] = None) -> None:
        """Reset circuit breaker tracking for a new task."""
        self.state = CircuitBreakerState(task_start_time=start_time or time.time())

    def check_blast_radius(self, modified_files: List[str]) -> None:
        """Enforce maximum files modified per PR/task to prevent widespread unintended edits."""
        count = len(modified_files)
        if count > self.config.max_files_modified:
            logger.error(f"[CircuitBreaker] Blast radius exceeded: {count} files modified (Limit: {self.config.max_files_modified})")
            raise CircuitBreakerException(
                reason=f"Agent attempted to modify {count} files, exceeding blast radius safety boundary",
                metric="max_files_modified",
                current_value=count,
                threshold=self.config.max_files_modified
            )

    def check_wall_clock(self, current_time: Optional[float] = None) -> None:
        """Enforce global wall-clock timeout to prevent infinite background hangs."""
        now = current_time or time.time()
        elapsed = now - self.state.task_start_time
        if elapsed > self.config.max_task_wall_clock_seconds:
            logger.error(f"[CircuitBreaker] Hard wall-clock timeout exceeded: {elapsed:.1f}s (Limit: {self.config.max_task_wall_clock_seconds}s)")
            raise CircuitBreakerException(
                reason="Task exceeded maximum allowed wall-clock execution time",
                metric="wall_clock_seconds",
                current_value=round(elapsed, 2),
                threshold=self.config.max_task_wall_clock_seconds
            )

    def check_semantic_progress(self, current_code: str) -> float:
        """Measure semantic progress against prior iterations.
        
        Aborts if consecutive turns produce < 2% semantic change (oscillation or stagnation).
        """
        if not self.state.previous_code_snapshots:
            self.state.previous_code_snapshots.append(current_code)
            return 1.0

        previous_code = self.state.previous_code_snapshots[-1]
        matcher = difflib.SequenceMatcher(None, previous_code, current_code)
        similarity = matcher.ratio()
        semantic_delta = 1.0 - similarity

        logger.info(f"[CircuitBreaker] Semantic delta from previous iteration: {semantic_delta * 100:.2f}%")

        if semantic_delta < self.config.min_semantic_progress_ratio:
            self.state.stagnant_turn_count += 1
            logger.warning(
                f"[CircuitBreaker] Stagnant turn detected ({self.state.stagnant_turn_count}/{self.config.consecutive_stagnant_turns_allowed}). "
                f"Delta: {semantic_delta * 100:.2f}% (Minimum: {self.config.min_semantic_progress_ratio * 100:.1f}%)"
            )
            if self.state.stagnant_turn_count >= self.config.consecutive_stagnant_turns_allowed:
                raise CircuitBreakerException(
                    reason="Agent code loop failed to converge (< 2% progress across consecutive turns)",
                    metric="min_semantic_progress_ratio",
                    current_value=round(semantic_delta, 4),
                    threshold=self.config.min_semantic_progress_ratio
                )
        else:
            self.state.stagnant_turn_count = 0

        self.state.previous_code_snapshots.append(current_code)
        return semantic_delta

    def record_token_burn(self, prompt_tokens: int, completion_tokens: int, cost_per_1k: float = 0.003) -> None:
        """Track cumulative token consumption and enforce financial budget caps."""
        tokens = prompt_tokens + completion_tokens
        self.state.total_tokens_burned += tokens
        added_cost = (tokens / 1000.0) * cost_per_1k
        self.state.estimated_cost_usd += added_cost

        if self.state.total_tokens_burned > self.config.max_total_tokens_per_task:
            raise CircuitBreakerException(
                reason="Task exceeded maximum allowed token budget cap",
                metric="max_total_tokens",
                current_value=self.state.total_tokens_burned,
                threshold=self.config.max_total_tokens_per_task
            )

        if self.state.estimated_cost_usd > self.config.max_cost_usd_per_task:
            raise CircuitBreakerException(
                reason="Task exceeded maximum allowed spend budget ($5.00 limit)",
                metric="max_cost_usd",
                current_value=round(self.state.estimated_cost_usd, 3),
                threshold=self.config.max_cost_usd_per_task
            )

    def evaluate_step(
        self,
        modified_files: Optional[List[str]] = None,
        current_code: Optional[str] = None,
        prompt_tokens: int = 0,
        completion_tokens: int = 0
    ) -> Dict[str, Any]:
        """Convenience method to execute all circuit breaker checks for a single review turn."""
        self.check_wall_clock()

        if modified_files is not None:
            self.check_blast_radius(modified_files)

        semantic_delta = 1.0
        if current_code is not None:
            semantic_delta = self.check_semantic_progress(current_code)

        if prompt_tokens > 0 or completion_tokens > 0:
            self.record_token_burn(prompt_tokens, completion_tokens)

        return {
            "status": "healthy",
            "semantic_delta": round(semantic_delta, 4),
            "stagnant_turns": self.state.stagnant_turn_count,
            "total_tokens_burned": self.state.total_tokens_burned,
            "estimated_cost_usd": round(self.state.estimated_cost_usd, 4),
            "elapsed_seconds": round(time.time() - self.state.task_start_time, 2)
        }
