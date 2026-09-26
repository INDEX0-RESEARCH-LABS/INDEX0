"""File editor singleton.

Replaces `openhands_aci.editor.file_editor`.

The actual file editing logic lives in `index0_agent.runtime.utils.edit`.
This module provides the `file_editor` callable that the runtime plugin
system expects to find.
"""

import os
import re
from typing import Optional


class EditTool:
    """Sovereign file editor tool for the INDEX0 agent runtime.

    Provides view, create, str_replace, insert, and undo_edit operations
    on files within the workspace.
    """

    _file_history: dict[str, list[str]]

    def __init__(self):
        self._file_history = {}

    def __call__(
        self,
        command: str,
        path: str,
        file_text: Optional[str] = None,
        view_range: Optional[list[int]] = None,
        old_str: Optional[str] = None,
        new_str: Optional[str] = None,
        insert_line: Optional[int] = None,
    ) -> str:
        """Execute a file editor command.

        Args:
            command: One of 'view', 'create', 'str_replace', 'insert', 'undo_edit'.
            path: Absolute path to the file.
            file_text: Content for 'create' command.
            view_range: [start, end] line range for 'view' command (1-indexed).
            old_str: String to find for 'str_replace'.
            new_str: Replacement string for 'str_replace' or content for 'insert'.
            insert_line: Line number for 'insert' command (1-indexed).

        Returns:
            Result message string.
        """
        path = os.path.expanduser(path)

        if command == 'view':
            return self._view(path, view_range)
        elif command == 'create':
            return self._create(path, file_text or '')
        elif command == 'str_replace':
            return self._str_replace(path, old_str or '', new_str or '')
        elif command == 'insert':
            return self._insert(path, insert_line or 0, new_str or '')
        elif command == 'undo_edit':
            return self._undo_edit(path)
        else:
            return f'Unknown command: {command}'

    def _view(self, path: str, view_range: Optional[list[int]] = None) -> str:
        if os.path.isdir(path):
            entries = sorted(os.listdir(path))
            return '\n'.join(entries) if entries else '(empty directory)'

        if not os.path.isfile(path):
            return f'Error: File not found: {path}'

        with open(path, 'r', encoding='utf-8', errors='replace') as f:
            lines = f.readlines()

        if view_range:
            start = max(1, view_range[0]) - 1
            end = min(len(lines), view_range[1]) if len(view_range) > 1 else len(lines)
            lines = lines[start:end]
            start_line = start + 1
        else:
            start_line = 1

        numbered = []
        for i, line in enumerate(lines, start=start_line):
            numbered.append(f'{i:6}\t{line.rstrip()}')
        return '\n'.join(numbered)

    def _create(self, path: str, content: str) -> str:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        return f'File created successfully at: {path}'

    def _str_replace(self, path: str, old_str: str, new_str: str) -> str:
        if not os.path.isfile(path):
            return f'Error: File not found: {path}'

        with open(path, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()

        if old_str not in content:
            return f'Error: `old_str` not found in {path}. No changes made.'

        occurrences = content.count(old_str)
        if occurrences > 1:
            return (
                f'Error: `old_str` found {occurrences} times in {path}. '
                f'Please make the `old_str` more specific to match exactly one occurrence.'
            )

        # Save history for undo
        self._file_history.setdefault(path, []).append(content)

        new_content = content.replace(old_str, new_str, 1)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)

        return f'The file {path} has been edited. Review the changes.'

    def _insert(self, path: str, insert_line: int, new_str: str) -> str:
        if not os.path.isfile(path):
            return f'Error: File not found: {path}'

        with open(path, 'r', encoding='utf-8', errors='replace') as f:
            lines = f.readlines()

        # Save history for undo
        self._file_history.setdefault(path, []).append(''.join(lines))

        insert_idx = max(0, min(insert_line, len(lines)))
        new_lines = new_str.split('\n')
        for i, line in enumerate(new_lines):
            lines.insert(insert_idx + i, line + '\n')

        with open(path, 'w', encoding='utf-8') as f:
            f.writelines(lines)

        return f'The file {path} has been edited. Review the changes.'

    def _undo_edit(self, path: str) -> str:
        if path not in self._file_history or not self._file_history[path]:
            return f'Error: No edit history found for {path}.'

        previous_content = self._file_history[path].pop()
        with open(path, 'w', encoding='utf-8') as f:
            f.write(previous_content)

        return f'Last edit to {path} undone successfully.'


# Global singleton instance — this is what the runtime plugin imports
file_editor = EditTool()
