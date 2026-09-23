from dotenv import load_dotenv

from index0_agent.agenthub.micro.agent import MicroAgent
from index0_agent.agenthub.micro.registry import all_microagents
from index0_agent.controller.agent import Agent

load_dotenv()


try:
    from index0_agent.agenthub import browsing_agent
except ImportError:
    browsing_agent = None  # type: ignore

from index0_agent.agenthub import (  # noqa: E402
    codeact_agent,
    delegator_agent,
    dummy_agent,
    planner_agent,
)

__all__ = [
    'codeact_agent',
    'planner_agent',
    'delegator_agent',
    'dummy_agent',
    'browsing_agent',
]

for agent in all_microagents.values():
    name = agent['name']
    prompt = agent['prompt']

    anon_class = type(
        name,
        (MicroAgent,),
        {
            'prompt': prompt,
            'agent_definition': agent,
        },
    )

    Agent.register(name, anon_class)
