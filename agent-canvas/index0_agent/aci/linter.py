"""Linting interface for edited files.

Replaces `openhands_aci.linter.DefaultLinter` and `openhands_aci.linter.LintResult`.
Adapted from Aider (Apache 2.0 License) — see https://github.com/paul-gauthier/aider.
"""

import os
import subprocess
import tempfile
from dataclasses import dataclass, field
from pathlib import Path


@dataclass
class LintResult:
    """Represents a single lint error found in a file."""
    file: str
    line: int
    column: int
    message: str
    rule: str = ''
    severity: str = 'error'

    def visualize(self) -> str:
        """Return a human-readable representation of this lint error."""
        loc = f'{self.file}:{self.line}:{self.column}'
        rule_str = f' [{self.rule}]' if self.rule else ''
        return f'{loc}: {self.severity}: {self.message}{rule_str}'


class DefaultLinter:
    """Default linter implementation supporting multiple languages.

    Attempts to use flake8 for Python files and falls back to basic
    syntax checking for other file types.
    """

    PYTHON_EXTENSIONS = {'.py'}
    JS_TS_EXTENSIONS = {'.js', '.jsx', '.ts', '.tsx'}

    def lint(self, filepath: str) -> list[LintResult]:
        """Lint a single file and return any errors found."""
        ext = os.path.splitext(filepath)[1].lower()

        if ext in self.PYTHON_EXTENSIONS:
            return self._lint_python(filepath)
        if ext in self.JS_TS_EXTENSIONS:
            return self._lint_js_ts(filepath)
        return []

    def lint_file_diff(
        self, original_filepath: str, updated_filepath: str
    ) -> list[LintResult]:
        """Lint only the differences between an original and updated file.

        Returns lint errors that appear in the updated file but not the original.
        """
        original_errors = {
            (r.line, r.message) for r in self.lint(original_filepath)
        }
        updated_errors = self.lint(updated_filepath)

        # Only return new errors (not pre-existing in original)
        new_errors = [
            e for e in updated_errors
            if (e.line, e.message) not in original_errors
        ]
        return new_errors

    def _lint_python(self, filepath: str) -> list[LintResult]:
        """Lint a Python file using flake8 if available, else compile check."""
        results: list[LintResult] = []

        # Try flake8 first
        try:
            proc = subprocess.run(
                ['python', '-m', 'flake8', '--max-line-length=120', '--format=default', filepath],
                capture_output=True,
                text=True,
                timeout=30,
            )
            for line in proc.stdout.strip().splitlines():
                parts = line.split(':', 3)
                if len(parts) >= 4:
                    try:
                        results.append(LintResult(
                            file=parts[0].strip(),
                            line=int(parts[1].strip()),
                            column=int(parts[2].strip()),
                            message=parts[3].strip(),
                        ))
                    except (ValueError, IndexError):
                        continue
            return results
        except (FileNotFoundError, subprocess.TimeoutExpired):
            pass

        # Fallback: compile check
        try:
            with open(filepath, 'r') as f:
                source = f.read()
            compile(source, filepath, 'exec')
        except SyntaxError as e:
            results.append(LintResult(
                file=filepath,
                line=e.lineno or 0,
                column=e.offset or 0,
                message=str(e.msg),
                severity='error',
            ))
        return results

    def _lint_js_ts(self, filepath: str) -> list[LintResult]:
        """Basic syntax check for JS/TS files using node --check where applicable."""
        # Only .js files can be checked with node --check
        if not filepath.endswith('.js'):
            return []

        results: list[LintResult] = []
        try:
            proc = subprocess.run(
                ['node', '--check', filepath],
                capture_output=True,
                text=True,
                timeout=15,
            )
            if proc.returncode != 0:
                for line in proc.stderr.strip().splitlines():
                    results.append(LintResult(
                        file=filepath,
                        line=0,
                        column=0,
                        message=line.strip(),
                        severity='error',
                    ))
        except (FileNotFoundError, subprocess.TimeoutExpired):
            pass
        return results
