"""MCTS Node and Tree Data Structures — INDEX0 Multiverse Search."""
import math
import uuid
from typing import Any, Dict, List, Optional
from ..state import ReviewLoopState


class MCTSNode:
    """Represents an algorithmic hypothesis node in the Monte Carlo Tree."""

    def __init__(
        self,
        hypothesis_id: str,
        hypothesis_name: str,
        strategy: str,
        parent: Optional["MCTSNode"] = None,
        state: Optional[ReviewLoopState] = None
    ):
        self.node_id = f"node-{uuid.uuid4().hex[:8]}"
        self.hypothesis_id = hypothesis_id
        self.hypothesis_name = hypothesis_name
        self.strategy = strategy
        self.parent = parent
        self.children: List[MCTSNode] = []
        self.state: Optional[ReviewLoopState] = state

        # MCTS Statistics
        self.visits: int = 0
        self.total_value: float = 0.0
        self.is_terminal: bool = False
        self.pruned: bool = False

        # Multidimensional Pareto evaluation metrics
        self.metrics: Dict[str, float] = {
            "correctness": 0.0,
            "safety": 0.0,
            "performance": 0.0,
            "pareto_score": 0.0
        }

    @property
    def average_value(self) -> float:
        if self.visits == 0:
            return 0.0
        return self.total_value / self.visits

    def ucb1_score(self, exploration_constant: float = 1.414) -> float:
        """Computes Upper Confidence Bound for Trees (UCT)."""
        if self.visits == 0:
            return float("inf")
        if not self.parent or self.parent.visits == 0:
            return self.average_value
        return self.average_value + exploration_constant * math.sqrt(
            math.log(self.parent.visits) / self.visits
        )

    def add_child(self, child: "MCTSNode") -> "MCTSNode":
        child.parent = self
        self.children.append(child)
        return child

    def to_dict(self) -> Dict[str, Any]:
        return {
            "nodeId": self.node_id,
            "hypothesisId": self.hypothesis_id,
            "name": self.hypothesis_name,
            "strategy": self.strategy,
            "visits": self.visits,
            "paretoScore": self.metrics.get("pareto_score", 0.0),
            "metrics": self.metrics,
            "pruned": self.pruned,
            "isTerminal": self.is_terminal
        }
