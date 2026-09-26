"""Unit tests for MCTS Multiverse Search Engine."""
import pytest
from src.graph.mcts.tree import MCTSNode
from src.graph.mcts.engine import MCTSEngine
from src.main import app
from fastapi.testclient import TestClient

client = TestClient(app)


def test_mcts_node_ucb1_and_tree():
    root = MCTSNode("root", "Root", "Spec")
    child1 = MCTSNode("h1", "Hypothesis Alpha", "Strategy 1")
    child2 = MCTSNode("h2", "Hypothesis Beta", "Strategy 2")

    root.add_child(child1)
    root.add_child(child2)

    assert len(root.children) == 2
    assert child1.parent == root

    # Initial unvisited UCB1 score should be inf
    assert child1.ucb1_score() == float("inf")

    child1.visits = 5
    child1.total_value = 4.0
    root.visits = 10

    # Average value: 4.0 / 5 = 0.8
    assert child1.average_value == 0.8
    assert child1.ucb1_score() > 0.8


@pytest.mark.asyncio
async def test_mcts_engine_execution():
    engine = MCTSEngine()
    initial_state = {
        "cycle_id": "mcts-test-01",
        "task_id": "task-cache-contention",
        "user_prompt": "Eliminate cache lock contention under 50k req/sec",
        "context_files": ["src/cache.ts"],
        "max_iterations": 3,
        "history": []
    }

    result = await engine.execute_mcts(initial_state)

    assert result["status"] == "completed"
    assert result["isComplete"] is True
    assert result["totalBranchesExplored"] >= 2
    assert "winningHypothesis" in result
    assert "paretoRanking" in result
    assert len(result["paretoRanking"]) >= 2
    assert result["winningDiff"] is not None

    winner = result["winningHypothesis"]
    assert winner["paretoScore"] >= 0.0
    assert "correctness" in winner["metrics"]


def test_fastapi_mcts_endpoint():
    payload = {
        "taskId": "task-test-mcts-api",
        "userPrompt": "Refactor distributed queue to lock-free ring buffer",
        "contextFiles": ["src/queue.ts"],
        "maxIterations": 2
    }
    response = client.post("/cycles/mcts/start", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert "cycleId" in data
    assert data["status"] == "completed"
    assert "winningHypothesis" in data
    assert "paretoRanking" in data
    assert len(data["paretoRanking"]) >= 2
