"""TextGrad Feedback Engine for Textual Backpropagation.

Provides prompt and implementation refinement by propagating critique signals
(test failures, linter errors, critic feedback) back to the developer prompt.
"""
from typing import Any, Dict, List, Optional
import logging

logger = logging.getLogger(__name__)


class TextGradFeedbackEngine:
    """Computes textual gradient updates to refine code generation across review cycles."""

    def __init__(self, learning_rate: float = 0.5):
        self.learning_rate = learning_rate
        self._has_native_textgrad = False
        try:
            import textgrad  # noqa: F401
            self._has_native_textgrad = True
            logger.info("Native TextGrad library detected and initialized.")
        except ImportError:
            logger.info("Native TextGrad not available. Using heuristic backpropagation engine.")

    def compute_feedback_gradient(
        self,
        current_code: str,
        critic_comments: str,
        findings: List[Dict[str, Any]],
        qa_errors: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Compute textual feedback gradient to guide the next developer iteration."""
        error_signals: List[str] = []

        # 1. Process Critic findings
        for finding in findings:
            severity = finding.get("severity", "warning")
            category = finding.get("category", "general")
            msg = finding.get("message", "")
            fix = finding.get("suggestedFix") or finding.get("suggested_fix")

            signal = f"[{severity.upper()}] ({category}) {msg}"
            if fix:
                signal += f" -> Recommendation: {fix}"
            error_signals.append(signal)

        # 2. Process QA runtime/test errors
        if qa_errors:
            for err in qa_errors:
                error_signals.append(f"[QA_FAILURE] {err}")

        # 3. Synthesize gradient directive
        if not error_signals and not critic_comments:
            return {
                "gradient_loss": 0.0,
                "needs_refinement": False,
                "refinement_prompt": "",
                "focused_issues": []
            }

        # Calculate a normalized loss based on severity count
        critical_count = sum(1 for f in findings if f.get("severity") in ("critical", "error"))
        loss = min(1.0, 0.2 * len(findings) + 0.3 * critical_count + (0.4 if qa_errors else 0.0))

        # Format high-leverage textual gradient prompt
        guidance = [
            "### TEXTGRAD BACKPROPAGATION GRADIENT: TARGETED CORRECTION DIRECTIVES",
            f"Current Review Loss: {loss:.2f} (Target: < 0.05)",
            "The previous implementation did not satisfy verification gates. Focus precisely on these failure modes:",
        ]

        if critic_comments:
            guidance.append(f"- Critic Executive Summary: {critic_comments}")

        for i, sig in enumerate(error_signals, 1):
            guidance.append(f"{i}. {sig}")

        guidance.append(
            "\nConstraint: Maintain all passing behaviors while strictly eliminating the above issues."
        )

        return {
            "gradient_loss": loss,
            "needs_refinement": loss > 0.05,
            "refinement_prompt": "\n".join(guidance),
            "focused_issues": error_signals
        }
