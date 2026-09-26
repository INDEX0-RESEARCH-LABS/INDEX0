"""4-Tier Review Loop State Machine & LangGraph definition.

Coordinates: Architect -> Developer -> Critic -> (Approve ? QA : Developer)
"""
from typing import Any, Callable, Dict, Literal
import logging
from .nodes import architect_node, developer_node, critic_node, qa_node
from .state import ReviewLoopState

logger = logging.getLogger(__name__)


def should_continue_review(state: ReviewLoopState) -> Literal["qa", "developer", "end"]:
    """Conditional edge routing based on Critic review verdict."""
    verdict = state.get("critic_verdict", {})
    decision = verdict.get("decision", "approve")
    iteration = state.get("iteration", 1)
    max_iterations = state.get("max_iterations", 5)

    if decision == "approve":
        return "qa"
    elif iteration >= max_iterations:
        logger.warning(f"Max review iterations reached ({max_iterations}). Ending loop.")
        return "end"
    else:
        return "developer"


class ReviewLoopEngine:
    """Multi-Agent Review Loop Engine supporting both LangGraph and native execution."""

    def __init__(self):
        self._langgraph_app = None
        self._init_langgraph()

    def _init_langgraph(self):
        try:
            from langgraph.graph import StateGraph, END
            workflow = StateGraph(ReviewLoopState)

            workflow.add_node("architect", architect_node)
            workflow.add_node("developer", developer_node)
            workflow.add_node("critic", critic_node)
            workflow.add_node("qa", qa_node)

            workflow.set_entry_point("architect")
            workflow.add_edge("architect", "developer")
            workflow.add_edge("developer", "critic")

            workflow.add_conditional_edges(
                "critic",
                should_continue_review,
                {
                    "qa": "qa",
                    "developer": "developer",
                    "end": END
                }
            )
            workflow.add_edge("qa", END)
            self._langgraph_app = workflow.compile()
            logger.info("LangGraph review loop successfully compiled.")
        except ImportError:
            logger.info("LangGraph not installed. Native asynchronous state runner will be used.")

    async def execute_cycle(self, initial_state: ReviewLoopState) -> ReviewLoopState:
        """Execute a full review cycle until completion or max iterations."""
        if self._langgraph_app is not None:
            result = await self._langgraph_app.ainvoke(initial_state)
            return result

        # Native Async State Machine Runner
        state = dict(initial_state)
        state.setdefault("history", [])
        state.setdefault("iteration", 0)

        # 1. Architect phase
        arch_res = await architect_node(state)
        state.update(arch_res)

        # 2. Iteration loop (Developer <-> Critic)
        max_iter = state.get("max_iterations", 5)
        while state.get("iteration", 0) < max_iter:
            # Developer implementation
            dev_res = await developer_node(state)
            state.update(dev_res)

            # Critic evaluation
            crit_res = await critic_node(state)
            state.update(crit_res)

            route = should_continue_review(state)
            if route == "qa":
                qa_res = await qa_node(state)
                state.update(qa_res)
                break
            elif route == "end":
                state["status"] = "max_iterations_reached"
                state["is_complete"] = True
                state["final_verdict"] = "rejected"
                break
            # route == "developer" -> continues while loop

        return state

    async def execute_mcts_cycle(self, initial_state: ReviewLoopState) -> Dict[str, Any]:
        """Execute multi-hypothesis MCTS search with Pareto ranking."""
        from .mcts.engine import MCTSEngine
        mcts = MCTSEngine()
        return await mcts.execute_mcts(initial_state)


    async def step_cycle(self, state: ReviewLoopState, target_node: str) -> ReviewLoopState:
        """Execute a single step/node transition manually."""
        handlers: Dict[str, Callable] = {
            "architect": architect_node,
            "developer": developer_node,
            "critic": critic_node,
            "qa": qa_node
        }
        handler = handlers.get(target_node)
        if not handler:
            raise ValueError(f"Unknown node: {target_node}")

        update = await handler(state)
        new_state = dict(state)
        new_state.update(update)
        return new_state
