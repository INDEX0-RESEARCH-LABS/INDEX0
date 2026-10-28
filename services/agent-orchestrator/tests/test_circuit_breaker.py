"""Tests for Agent Circuit Breaker & Runaway Protection."""
import pytest
import time
from src.circuit_breaker import (
    AgentCircuitBreaker,
    CircuitBreakerConfig,
    CircuitBreakerException
)


def test_circuit_breaker_blast_radius_limit():
    """Verify that attempting to touch more than max_files_modified triggers an exception."""
    config = CircuitBreakerConfig(max_files_modified=3)
    breaker = AgentCircuitBreaker(config=config)

    # 3 files allowed
    breaker.check_blast_radius(["src/a.ts", "src/b.ts", "src/c.ts"])

    # 4 files violates safety boundary
    with pytest.raises(CircuitBreakerException) as exc_info:
        breaker.check_blast_radius(["src/a.ts", "src/b.ts", "src/c.ts", "src/d.ts"])

    assert "max_files_modified" in str(exc_info.value)
    assert exc_info.value.metric == "max_files_modified"


def test_circuit_breaker_semantic_progress_stagnation():
    """Verify that consecutive turns with < 2% progress trip the circuit breaker."""
    config = CircuitBreakerConfig(
        min_semantic_progress_ratio=0.05, # 5% for test
        consecutive_stagnant_turns_allowed=2
    )
    breaker = AgentCircuitBreaker(config=config)

    base_code = "function calculate() {\n  return 42;\n}"
    
    # First turn sets baseline
    delta1 = breaker.check_semantic_progress(base_code)
    assert delta1 == 1.0

    # Slight whitespace change (< 5% delta) - Turn 1 stagnant
    almost_same_1 = "function calculate() {\n  return 42; \n}"
    delta2 = breaker.check_semantic_progress(almost_same_1)
    assert delta2 < 0.05
    assert breaker.state.stagnant_turn_count == 1

    # Another tiny change - Turn 2 stagnant -> Trips circuit breaker!
    almost_same_2 = "function calculate() {\n  return 42;\n  \n}"
    with pytest.raises(CircuitBreakerException) as exc_info:
        breaker.check_semantic_progress(almost_same_2)

    assert "min_semantic_progress_ratio" in str(exc_info.value)


def test_circuit_breaker_wall_clock_timeout():
    """Verify that exceeding task wall clock trips the timeout."""
    config = CircuitBreakerConfig(max_task_wall_clock_seconds=1.0)
    breaker = AgentCircuitBreaker(config=config)
    
    # Simulate start time 2 seconds in the past
    breaker.state.task_start_time = time.time() - 2.0

    with pytest.raises(CircuitBreakerException) as exc_info:
        breaker.check_wall_clock()

    assert "wall_clock_seconds" in str(exc_info.value)


def test_circuit_breaker_token_budget_cap():
    """Verify that exceeding token or spend budget caps trips the circuit breaker."""
    config = CircuitBreakerConfig(max_total_tokens_per_task=1000, max_cost_usd_per_task=0.01)
    breaker = AgentCircuitBreaker(config=config)

    breaker.record_token_burn(200, 200)
    assert breaker.state.total_tokens_burned == 400

    # Exceed 1000 tokens
    with pytest.raises(CircuitBreakerException) as exc_info:
        breaker.record_token_burn(400, 400)

    assert "max_total_tokens" in str(exc_info.value)


def test_circuit_breaker_evaluate_step_healthy():
    """Verify evaluate_step returns healthy telemetry when within bounds."""
    breaker = AgentCircuitBreaker()
    metrics = breaker.evaluate_step(
        modified_files=["src/main.ts", "src/utils.ts"],
        current_code="const x = 100;",
        prompt_tokens=50,
        completion_tokens=25
    )

    assert metrics["status"] == "healthy"
    assert metrics["total_tokens_burned"] == 75
    assert metrics["stagnant_turns"] == 0
