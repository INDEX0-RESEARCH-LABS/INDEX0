"""INDEX0 Agent Code Intelligence (ACI) — Sovereign utility module.

Replaces the external `openhands-aci` pip package with vendored implementations
of the 3 functions actually used in the index0_agent runtime:
  - get_diff: unified diff generation between old/new file contents
  - file_editor: EditTool singleton for file editing operations
  - DefaultLinter / LintResult: linting interface for edited files

License: Apache 2.0 — INDEX0 AI Research Labs.
"""

from index0_agent.aci.diff import get_diff
from index0_agent.aci.linter import DefaultLinter, LintResult
from index0_agent.aci.editor import file_editor

__all__ = ['get_diff', 'DefaultLinter', 'LintResult', 'file_editor']
