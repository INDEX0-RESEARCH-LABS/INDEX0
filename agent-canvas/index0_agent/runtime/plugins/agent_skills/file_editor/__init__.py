"""File editor plugin — re-exports the EditTool singleton from index0_agent.aci.

The implementation of the EditTool class can be found at: index0_agent/aci/editor.py.
"""

from index0_agent.aci.editor import file_editor

__all__ = ['file_editor']
