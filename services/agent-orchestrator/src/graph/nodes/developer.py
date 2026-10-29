"""Developer Node — Multi-Agent Coordination.

Implements the architecture plan, satisfies formal invariants,
and refines code based on TextGrad backpropagation feedback.
"""
from datetime import datetime, timezone
import difflib
import logging
from pathlib import Path
import re
from typing import Any, Dict
from ..state import ReviewLoopState
from ...config import get_settings
from ...llm.client import get_llm_client

logger = logging.getLogger(__name__)

MAX_CONTEXT_FILES = 5
MAX_CONTEXT_CHARS_PER_FILE = 4000


def _read_context_files(repository_root: str, context_files) -> str:
    """Load the referenced file bodies so the developer edits real code.

    Paths are confined to repository_root: a context_files entry can never read
    outside the workspace the cycle was started against.
    """
    if not repository_root or not context_files:
        return ""

    root = Path(repository_root).resolve()
    blocks = []
    for relative in list(context_files)[:MAX_CONTEXT_FILES]:
        try:
            path = (root / relative).resolve()
        except OSError:
            continue
        if not path.is_relative_to(root) or not path.is_file():
            logger.warning(f"Skipping context file outside repository root: {relative}")
            continue
        try:
            text = path.read_text(encoding="utf-8", errors="replace")
        except OSError as e:
            logger.warning(f"Could not read context file {relative}: {e}")
            continue
        truncated = len(text) > MAX_CONTEXT_CHARS_PER_FILE
        body = text[:MAX_CONTEXT_CHARS_PER_FILE]
        if truncated:
            body += "\n... [truncated]"
        blocks.append(f"### {relative}\n```\n{body}\n```")
    return "\n\n".join(blocks)


DEVELOPER_SYSTEM_PROMPT = """You are the Principal Systems Developer for INDEX0 AI.
Your role is to translate formal architectural specifications and algorithmic hypotheses into
clean, high-performance, production-grade code implementations.

RULES:
1. Strict Invariant Adherence: You must satisfy all pre-conditions, post-conditions, and invariants.
2. TextGrad Optimization: If TextGrad directives are provided, you MUST strictly eliminate the identified errors and data races while preserving all passing behaviors.
3. Output Format: Emit EVERY file you change as a complete file, in this exact shape:
### FILE: path/to/file.ext
```lang
<the entire file, not a fragment, not a diff>
```
   Rules for this format:
   - The path is relative to the repository root and must be one you were given.
   - Emit whole files. Never emit `...`, elisions, or unchanged-context markers.
   - Emit every file the objective requires, even if only one line changes.
   - Do not emit a diff. Do not emit any prose before or after the FILE blocks.
4. High-Performance Engineering: Avoid redundant allocations, prevent lock contention, and ensure clean type definitions.
5. Minimal Scope: Change only what the objective requires. Do not add features, guards, or
   refactors the objective did not ask for — reviewers reject scope creep.
Do not use placeholders, stubs, or mock comments."""

# '### FILE: path' followed by a fenced block holding the whole file.
_FILE_BLOCK = re.compile(
    r"^\s*#*\s*FILE:\s*`?([A-Za-z0-9_./-]+)`?\s*$\s*```[^\n]*\n(.*?)\n?```",
    re.MULTILINE | re.DOTALL,
)


def _extract_files(text: str) -> Dict[str, str]:
    """Parse whole-file blocks out of an LLM response: {relative path: content}."""
    files: Dict[str, str] = {}
    for path, body in _FILE_BLOCK.findall(text or ""):
        files[path] = body if body.endswith("\n") else body + "\n"
    return files


def build_unified_diff(repository_root: str, generated: Dict[str, str]) -> str:
    """Derive a reviewable unified diff from whole-file output.

    The model returns complete files; we compute the diff with difflib so the
    critic and the UI never see malformed model-authored hunk headers.
    """
    root = Path(repository_root or ".").resolve()
    chunks = []
    for relative, new_text in generated.items():
        target = (root / relative).resolve()
        if not target.is_relative_to(root):
            logger.warning(f"Refusing to diff path outside repository root: {relative}")
            continue
        try:
            old_text = target.read_text(encoding="utf-8") if target.is_file() else ""
        except OSError:
            old_text = ""
        body = "".join(difflib.unified_diff(
            old_text.splitlines(keepends=True),
            new_text.splitlines(keepends=True),
            fromfile=f"a/{relative}",
            tofile=f"b/{relative}",
        ))
        if body:
            chunks.append(f"diff --git a/{relative} b/{relative}\n{body}")
    return "\n".join(chunks)



def _extract_diff(text: str) -> str:
    """Extract unified diff content from LLM markdown response."""
    diff_pattern = r"```(?:diff)?\s*(diff --git[\s\S]*?)\s*```"
    match = re.search(diff_pattern, text)
    if match:
        return match.group(1).strip()

    # Fallback to any diff block
    alt_pattern = r"```(?:diff)?\s*([---|\+\+\+][\s\S]*?)\s*```"
    alt_match = re.search(alt_pattern, text)
    if alt_match:
        return alt_match.group(1).strip()

    return text.strip()


async def developer_node(state: ReviewLoopState) -> Dict[str, Any]:
    """Execute Developer implementation phase with real LLM synthesis."""
    settings = get_settings()
    llm = get_llm_client()

    plan = state.get("architecture_plan", "")
    spec = state.get("architect_spec", {})
    active_hypothesis = state.get("active_hypothesis", {})
    iteration = state.get("iteration", 0) + 1
    user_prompt = state.get("user_prompt", "")
    context_files = state.get("context_files", [])
    repository_root = state.get("repository_root", "")
    textgrad_prompt = state.get("textgrad_prompt")

    user_content = [
        f"### USER OBJECTIVE\n{user_prompt}\n",
        f"### ARCHITECTURAL PLAN (Iteration {iteration})\n{plan}\n",
    ]

    if active_hypothesis:
        user_content.append(
            f"### SELECTED HYPOTHESIS\n"
            f"Name: {active_hypothesis.get('name')}\n"
            f"Strategy: {active_hypothesis.get('implementation_strategy')}\n"
        )

    if context_files:
        user_content.append(f"### TARGET CONTEXT FILES\n{', '.join(context_files)}\n")

    file_bodies = _read_context_files(repository_root, context_files)
    if file_bodies:
        user_content.append(
            f"### CURRENT FILE CONTENTS\n{file_bodies}\n\n"
            "Return each changed file in full using the `### FILE: <path>` format. "
            "Do not return a diff."
        )

    if textgrad_prompt:
        user_content.append(
            f"### PRIOR ITERATION FEEDBACK (TEXTGRAD GRADIENT DIRECTIVES)\n"
            f"{textgrad_prompt}\n"
            f"CRITICAL: Eliminate these defects completely in your updated files."
        )

    user_message = "\n".join(user_content)

    generated_code: Dict[str, str] = {}
    implementation_diff = ""
    try:
        raw_response = await llm.complete(
            messages=[
                {"role": "system", "content": DEVELOPER_SYSTEM_PROMPT},
                {"role": "user", "content": user_message}
            ],
            model=settings.developer_model,
            temperature=0.1,  # Low temperature for precise code generation
            timeout=90.0
        )
        generated_code = _extract_files(raw_response)
        if generated_code:
            implementation_diff = build_unified_diff(repository_root, generated_code)
        else:
            # Legacy/insufficient format: keep whatever diff the model produced so
            # QA can still attempt it, and let the gate report the truth.
            implementation_diff = _extract_diff(raw_response)
    except Exception as e:
        logger.warning(f"Developer LLM inference failed or unavailable ({e}); no code was generated.")
        implementation_diff = ""

    history = state.get("history", [])
    history.append({
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "role": "developer",
        "action": "implementation",
        "iteration": iteration,
        "summary": f"Generated code diff for iteration {iteration} ({len(implementation_diff.splitlines())} lines)",
        "diffLines": len(implementation_diff.splitlines())
    })

    return {
        "iteration": iteration,
        "implementation_diff": implementation_diff,
        "generated_code": generated_code,
        "current_role": "developer",
        "status": "implemented",
        "history": history
    }
