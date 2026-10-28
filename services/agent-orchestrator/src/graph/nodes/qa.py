"""QA Node — Multi-Agent Coordination.

Empirical Laboratory & Sandbox Verification Gate.
Executes test suites, SAST scans, and runtime checks in isolated sandboxes.
"""
from datetime import datetime, timezone
import logging
import re
import uuid
from typing import Any, Dict
import httpx
from ..state import ReviewLoopState
from ...config import get_settings

logger = logging.getLogger(__name__)

# A verification command must be able to fail. The previous chain ended in
# '|| echo "Tests verified successfully."', which forced exit code 0 and made
# this gate report a pass no matter what the suite did.
TEST_CMD = "npm test 2>&1 || pytest -q 2>&1"

_PASSED_PATTERNS = (re.compile(r"(\d+)\s+passed\b", re.I), re.compile(r"\bpass (\d+)\b", re.I))
_FAILED_PATTERNS = (re.compile(r"(\d+)\s+failed\b", re.I), re.compile(r"\bfail (\d+)\b", re.I))


def _max_count(patterns, text: str) -> int:
    return max((int(n) for p in patterns for n in p.findall(text)), default=0)


def observed_test_counts(output: str) -> tuple:
    """Passing/failing counts the runner actually printed. (0, 0) = unreported."""
    text = output or ""
    return _max_count(_PASSED_PATTERNS, text), _max_count(_FAILED_PATTERNS, text)


async def execute_in_sandbox(sandbox_url: str, command: str, timeout_ms: int = 30000) -> Dict[str, Any]:
    """Execute bash command in sandbox-manager microVM container."""
    req_payload = {
        "id": f"qa-exec-{uuid.uuid4().hex[:8]}",
        "code": command,
        "language": "bash",
        "timeoutMs": timeout_ms
    }

    # Normalize endpoint URL
    base = sandbox_url.rstrip("/")
    endpoint = f"{base}/execute"

    async with httpx.AsyncClient(timeout=timeout_ms / 1000.0 + 5.0) as client:
        resp = await client.post(endpoint, json=req_payload)
        resp.raise_for_status()
        body = resp.json()
        return body.get("data", body)


async def qa_node(state: ReviewLoopState) -> Dict[str, Any]:
    """Execute QA automated verification phase."""
    settings = get_settings()
    iteration = state.get("iteration", 1)
    diff = state.get("implementation_diff", "")
    task_id = state.get("task_id", "unknown")

    qa_results: Dict[str, Any]
    try:
        sandbox_res = await execute_in_sandbox(settings.sandbox_manager_url, TEST_CMD)
        exit_code = sandbox_res.get("exitCode")
        if not isinstance(exit_code, int):
            # No exit code means the run cannot be judged; treat it as unverified.
            raise ValueError(f"sandbox response carried no exitCode: {sandbox_res!r}")
        stdout = sandbox_res.get("stdout") or ""
        stderr = sandbox_res.get("stderr") or ""
        tests_passed, tests_failed = observed_test_counts(f"{stdout}\n{stderr}")
        passed = exit_code == 0 and "FAIL" not in stdout

        qa_results = {
            "passed": passed,
            "status": "passed" if passed else "failed",
            "exitCode": exit_code,
            "tests_run": tests_passed + tests_failed,
            "tests_passed": tests_passed,
            "tests_failed": tests_failed,
            "duration_ms": int(sandbox_res.get("durationMs") or 0),
            "testOutput": (stdout or stderr).strip() or "Sandbox returned no output.",
            "stdout": stdout,
            "stderr": stderr,
            # No SAST tool is wired into this node; unknown is not zero.
            "sastFindings": None,
            "sandboxMode": "live_microvm",
        }
    except Exception as e:
        logger.info(f"Sandbox manager unavailable at {settings.sandbox_manager_url} ({e}); no tests executed.")
        # Fail closed: without a sandbox nothing was verified. Report the static
        # brace check for what it is instead of inventing 5 passing tests and a
        # 128ms runtime.
        balanced = diff.count("{") == diff.count("}") if "{" in diff else True
        qa_results = {
            "passed": False,
            "status": "failed",
            "exitCode": None,
            "tests_run": 0,
            "tests_passed": 0,
            "tests_failed": 0,
            "duration_ms": 0,
            "testOutput": (
                f"Sandbox unavailable at {settings.sandbox_manager_url} ({e}). "
                f"No tests were executed; only a brace-balance check ran "
                f"({'balanced' if balanced else 'unbalanced'})."
            ),
            "stdout": "",
            "stderr": str(e),
            "sastFindings": None,
            "sandboxMode": "unverified",
        }

    history = state.get("history", [])
    history.append({
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "role": "qa",
        "action": "test_result",
        "status": qa_results["status"],
        "passed": qa_results["passed"],
        "durationMs": qa_results.get("duration_ms", 0)
    })

    return {
        "qa_results": qa_results,
        "current_role": "qa",
        "status": "qa_verified" if qa_results["passed"] else "qa_failed",
        "is_complete": True,
        "final_verdict": "approved" if qa_results["passed"] else "rejected",
        "history": history
    }
