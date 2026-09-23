from dataclasses import dataclass

from index0_agent.events.event import Event


@dataclass
class Observation(Event):
    content: str
