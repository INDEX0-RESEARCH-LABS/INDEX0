"""MCTS Multiverse Search Engine — INDEX0 Multiverse Search.

Orchestrates multi-hypothesis rollouts across isolated Git branches,
evaluating competing solutions on a multi-dimensional Pareto frontier.
"""
from datetime import datetime, timezone
import logging
from typing import Any, Dict, List, Optional
from .tree import MCTSNode
from ..nodes import architect_node, developer_node, critic_node, qa_node
from ..state import ReviewLoopState

logger = logging.getLogger(__name__)


class MCTSEngine:
    """Monte Carlo Tree Search Engine for exploring parallel algorithmic hypotheses."""

    def __init__(self, max_rollouts_per_branch: int = 1):
        self.max_rollouts = max_rollouts_per_branch

    def _compute_pareto_score(self, state: ReviewLoopState) -> Dict[str, float]:
        """Calculates multi-dimensional Pareto fitness score for a branch rollout."""
        qa = state.get("qa_results") or {}
        critic = state.get("critic_verdict") or {}
        loss = state.get("textgrad_loss", 0.0)

        passed_qa = qa.get("passed", False)
        tests_passed = qa.get("tests_passed", 0)
        tests_run = max(1, qa.get("tests_run", 1))
        correctness_ratio = tests_passed / float(tests_run)

        decision = critic.get("decision", "request_changes")
        critic_approved = decision == "approve"

        # Concurrency safety & error check
        has_sanitizer_race = "data race" in str(qa.get("testOutput", "")).lower()

        if has_sanitizer_race or not passed_qa:
            return {
                "correctness": 0.0,
                "safety": 0.0,
                "performance": 0.0,
                "pareto_score": 0.0
            }

        safety_score = 1.0 if critic_approved else 0.5
        perf_score = max(0.0, 1.0 - min(1.0, qa.get("duration_ms", 150.0) / 1000.0))

        # Composite weighted Pareto score
        pareto = (0.45 * correctness_ratio) + (0.35 * safety_score) + (0.20 * perf_score) - (0.2 * loss)
        pareto = max(0.0, min(1.0, pareto))

        return {
            "correctness": round(correctness_ratio, 3),
            "safety": round(safety_score, 3),
            "performance": round(perf_score, 3),
            "pareto_score": round(pareto, 3)
        }

    async def execute_mcts(self, initial_state: ReviewLoopState) -> Dict[str, Any]:
        """Execute full MCTS multiverse exploration across all hypotheses."""
        task_id = initial_state.get("task_id", "task-mcts")
        root = MCTSNode(
            hypothesis_id="root",
            hypothesis_name="Problem Specification",
            strategy="Architect Invariant Decomposition",
            state=initial_state
        )

        # 1. ARCHITECT STAGE: Deduce invariants & formulate candidate hypotheses
        arch_res = await architect_node(initial_state)
        arch_state = dict(initial_state)
        arch_state.update(arch_res)
        root.state = arch_state

        spec = arch_state.get("architect_spec") or {}
        hypotheses = spec.get("hypotheses", [])

        if not hypotheses:
            # Fallback single-path execution if zero hypotheses generated
            hypotheses = [{
                "hypothesis_id": "hyp-default",
                "name": "Standard Direct Implementation",
                "tradeoffs": "Single path fallback",
                "implementation_strategy": "Surgical patch"
            }]

        # 2. EXPANSION: Create MCTS branch nodes for each hypothesis
        branch_nodes: List[MCTSNode] = []
        for hyp in hypotheses:
            branch = MCTSNode(
                hypothesis_id=hyp.get("hypothesis_id", "hyp"),
                hypothesis_name=hyp.get("name", "Hypothesis"),
                strategy=hyp.get("implementation_strategy", "Strategy"),
                parent=root
            )
            root.add_child(branch)
            branch_nodes.append(branch)

        # 3. SIMULATION / ROLLOUT: Run Developer -> Critic -> QA on each branch
        for branch in branch_nodes:
            logger.info(f"Simulating MCTS hypothesis branch: {branch.hypothesis_name} ({branch.hypothesis_id})")

            # Initialize branch state with selected hypothesis
            branch_state = dict(arch_state)
            branch_state["active_hypothesis"] = {
                "hypothesis_id": branch.hypothesis_id,
                "name": branch.hypothesis_name,
                "implementation_strategy": branch.strategy
            }
            branch_state["iteration"] = 0

            # Step 1: Developer synthesizes diff for this hypothesis
            dev_res = await developer_node(branch_state)
            branch_state.update(dev_res)

            # Step 2: Critic audits the branch diff
            crit_res = await critic_node(branch_state)
            branch_state.update(crit_res)

            # Step 3: QA executes tests and telemetry
            qa_res = await qa_node(branch_state)
            branch_state.update(qa_res)

            # 4. EVALUATION: Compute Pareto score for this hypothesis world
            metrics = self._compute_pareto_score(branch_state)
            branch.metrics = metrics
            branch.visits += 1
            branch.total_value += metrics["pareto_score"]
            branch.is_terminal = True
            branch.state = branch_state

            # Backpropagate to root
            root.visits += 1
            root.total_value += metrics["pareto_score"]

        # 5. SELECTION: Rank branches on Pareto frontier and select winning hypothesis
        ranked_branches = sorted(
            branch_nodes,
            key=lambda b: b.metrics.get("pareto_score", 0.0),
            reverse=True
        )

        winner = ranked_branches[0]
        # Mark all other branches as pruned
        for b in ranked_branches[1:]:
            b.pruned = True

        logger.info(
            f"MCTS Selected Winner: {winner.hypothesis_name} (Pareto Score: {winner.metrics['pareto_score']})"
        )

        winning_state = winner.state or arch_state

        history = winning_state.get("history", [])
        history.append({
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "role": "mcts_engine",
            "action": "pareto_selection",
            "winner": winner.hypothesis_name,
            "winnerScore": winner.metrics.get("pareto_score", 0.0),
            "branchesExplored": len(branch_nodes),
            "branchesPruned": len(branch_nodes) - 1
        })
        winning_state["history"] = history

        return {
            "taskId": task_id,
            "status": "completed",
            "isComplete": True,
            "winningHypothesis": winner.to_dict(),
            "paretoRanking": [b.to_dict() for b in ranked_branches],
            "totalBranchesExplored": len(branch_nodes),
            "winningDiff": winning_state.get("implementation_diff"),
            "architecturePlan": winning_state.get("architecture_plan"),
            "qaResults": winning_state.get("qa_results"),
            "finalState": winning_state
        }
