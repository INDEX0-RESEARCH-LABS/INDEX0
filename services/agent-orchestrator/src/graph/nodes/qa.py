"""QA Node — Multi-Agent Coordination.

Empirical Laboratory & Sandbox Verification Gate.
Executes test suites, SAST scans, and runtime checks in isolated sandboxes.
"""
from datetime import datetime, timezone
import base64
import logging
import os
from pathlib import Path
import re
import shlex
import uuid
from typing import Any, Dict
import httpx
from ..state import ReviewLoopState
from ...config import get_settings

logger = logging.getLogger(__name__)

# Where the read-only repo mount (SANDBOX_WORKSPACE_PATH) lands inside the
# container, and where the candidate patch is applied. /src is mounted :ro so a
# bad diff can never corrupt the tree under verification.
SRC_MOUNT = "/src"
WORKSPACE = "/tmp/qa-workspace"
PATCH_FILE = "/tmp/candidate.patch"

# A verification command must be able to fail. The previous chain ended in
# '|| echo "Tests verified successfully."', which forced exit code 0 and made
# this gate report a pass no matter what the suite did.
DEFAULT_TEST_CMD = "npm test"

_PASSED_PATTERNS = (re.compile(r"(\d+)\s+passed\b", re.I), re.compile(r"\bpass (\d+)\b", re.I))
_FAILED_PATTERNS = (re.compile(r"(\d+)\s+failed\b", re.I), re.compile(r"\bfail (\d+)\b", re.I))


def _max_count(patterns, text: str) -> int:
    return max((int(n) for p in patterns for n in p.findall(text)), default=0)


def observed_test_counts(output: str) -> tuple:
    """Passing/failing counts the runner actually printed. (0, 0) = unreported."""
    text = output or ""
    return _max_count(_PASSED_PATTERNS, text), _max_count(_FAILED_PATTERNS, text)


def _write_file_steps(relative: str, content: str) -> list:
    """Shell steps that materialise one file inside the workspace copy."""
    parts = Path(relative).parts
    if not parts or relative.startswith("/") or ".." in parts or ":" in relative:
        logger.warning(f"Skipping unsafe path from developer output: {relative}")
        return []
    target = shlex.quote(relative)
    payload = base64.b64encode(content.encode("utf-8")).decode("ascii")
    return [
        f'mkdir -p "$(dirname {target})"',
        f"printf %s '{payload}' | base64 -d > {target}",
    ]


def _is_test_path(relative: str) -> bool:
    """True for files that belong to the test suite the gate is supposed to trust.

    The candidate must never be able to edit the very assertions that decide
    whether it passed: that turns verification into theatre.
    """
    parts = [p.lower() for p in Path(relative).parts]
    if not parts:
        return False
    name = parts[-1]
    return (
        any(p in {"test", "tests", "__tests__", "spec", "specs"} for p in parts[:-1])
        or name.startswith("test_")
        or name.endswith("_test.py")
        or ".test." in name
        or ".spec." in name
    )


def _test_paths_in_diff(diff: str) -> list:
    """Paths the raw-diff fallback would touch, filtered to test files."""
    paths = []
    for line in (diff or "").splitlines():
        if line.startswith(("+++ b/", "--- a/")):
            path = line[6:].strip()
            if path != "/dev/null" and _is_test_path(path) and path not in paths:
                paths.append(path)
    return paths


def verification_command(
    diff: str,
    test_cmd: str = DEFAULT_TEST_CMD,
    files: Dict[str, str] = None,
) -> str:
    """Build the QA shell command: copy the repo, install the candidate code, run the suite.

    Whole-file output from the developer is written directly (no hunk
    arithmetic); a raw diff is used only as a fallback. Every step is joined
    with '&&', so an empty candidate, a failed write, or a failing suite all
    surface a non-zero exit code.

    Candidate edits to test files are dropped (and restored in the diff path):
    the suite that decides the verdict is the repository's own, as it existed
    before the cycle.
    """
    steps = [
        f"rm -rf {WORKSPACE}",
        f"cp -a {SRC_MOUNT} {WORKSPACE}",
        f"cd {WORKSPACE}",
    ]

    write_steps = []
    for relative, content in (files or {}).items():
        if _is_test_path(relative):
            logger.warning(f"Ignoring candidate edit to a test file: {relative}")
            continue
        write_steps.extend(_write_file_steps(relative, content))

    if write_steps:
        steps.extend(write_steps)
    else:
        patch_b64 = base64.b64encode((diff or "").encode("utf-8")).decode("ascii")
        steps.extend([
            f"printf %s '{patch_b64}' | base64 -d > {PATCH_FILE}",
            f"(git apply --recount --whitespace=nowarn {PATCH_FILE} || patch -p1 --forward --batch < {PATCH_FILE})",
        ])
        for test_path in _test_paths_in_diff(diff):
            quoted = shlex.quote(test_path)
            steps.append(f"cp -a {SRC_MOUNT}/{quoted} ./{quoted}")

    steps.append(shlex.join(test_cmd.split()))
    return " && ".join(steps)


async def execute_in_sandbox(
    sandbox_url: str,
    command: str,
    timeout_ms: int = 30000,
    workspace_path: str = "",
) -> Dict[str, Any]:
    """Execute bash command in sandbox-manager microVM container."""
    req_payload = {
        "id": f"qa-exec-{uuid.uuid4().hex[:8]}",
        "code": command,
        "language": "bash",
        "timeoutMs": timeout_ms,
    }
    if workspace_path:
        # Mount the repository this cycle was started against, not a global default.
        req_payload["environmentVariables"] = {"SANDBOX_WORKSPACE_PATH": workspace_path}

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
    diff = state.get("implementation_diff", "") or ""
    files = state.get("generated_code") or {}
    task_id = state.get("task_id", "unknown")
    repository_root = state.get("repository_root") or ""
    command = verification_command(diff, files=files)

    qa_results: Dict[str, Any]
    try:
        sandbox_res = await execute_in_sandbox(
            settings.sandbox_manager_url,
            command,
            timeout_ms=120000,
            # Relative roots resolve against the sandbox-manager process, not the
            # repo, so only an absolute path may select the mount.
            workspace_path=repository_root if os.path.isabs(repository_root) else "",
        )
        exit_code = sandbox_res.get("exitCode")
        if not isinstance(exit_code, int):
            # No exit code means the run cannot be judged; treat it as unverified.
            raise ValueError(f"sandbox response carried no exitCode: {sandbox_res!r}")
        stdout = sandbox_res.get("stdout") or ""
        stderr = sandbox_res.get("stderr") or ""
        tests_passed, tests_failed = observed_test_counts(f"{stdout}\n{stderr}")
        # Exit code is authoritative: the command chain applies the diff and runs
        # the suite, so a non-zero code means the patch or the suite failed.
        passed = exit_code == 0 and tests_failed == 0

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
            "command": command,
            "diffLines": len(diff.splitlines()),
            "candidateFiles": sorted(files),
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
            "command": command,
            "diffLines": len(diff.splitlines()),
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
