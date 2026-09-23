from dataclasses import dataclass

from index0_agent.core.schema import ActionType
from index0_agent.events.action.action import Action


@dataclass
class NullAction(Action):
    """An action that does nothing."""

    action: str = ActionType.NULL

    @property
    def message(self) -> str:
        return 'No action'
