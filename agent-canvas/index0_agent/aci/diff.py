"""Unified diff generation utility.

Replaces `openhands_aci.utils.diff.get_diff` with a pure-stdlib implementation
using Python's built-in `difflib.unified_diff`.
"""

import difflib


def get_diff(old_contents: str, new_contents: str, filepath: str = '') -> str:
    """Generate a unified diff between old and new file contents.

    Args:
        old_contents: The original file content as a string.
        new_contents: The modified file content as a string.
        filepath: The file path used as the diff header label.

    Returns:
        A unified diff string. Returns empty string if contents are identical.
    """
    old_lines = old_contents.splitlines(keepends=True)
    new_lines = new_contents.splitlines(keepends=True)

    # Ensure final newline for clean diff output
    if old_lines and not old_lines[-1].endswith('\n'):
        old_lines[-1] += '\n'
    if new_lines and not new_lines[-1].endswith('\n'):
        new_lines[-1] += '\n'

    diff_lines = difflib.unified_diff(
        old_lines,
        new_lines,
        fromfile=f'a/{filepath}' if filepath else 'a/file',
        tofile=f'b/{filepath}' if filepath else 'b/file',
        lineterm='',
    )

    result = '\n'.join(diff_lines)
    return result
